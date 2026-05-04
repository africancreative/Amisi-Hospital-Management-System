import 'dart:convert';
import 'dart:io';
import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'auth.dart';

enum ConnectionStatus { online, offline, degraded, unknown }

// ─── Connectivity service (LAN-first → cloud fallback) ────────────────────
class ConnectivityService extends ChangeNotifier {
  static final ConnectivityService _instance = ConnectivityService._internal();
  factory ConnectivityService() => _instance;
  ConnectivityService._internal();

  ConnectionStatus _status = ConnectionStatus.unknown;
  String _currentEndpoint = '';
  bool _useLocal = false;
  final List<String> _healthEndpoints = [];
  final _connectivity = Connectivity();
  StreamSubscription<List<ConnectivityResult>>? _subscription;

  ConnectionStatus get status => _status;
  String get currentEndpoint => _currentEndpoint;
  bool get useLocal => _useLocal;
  bool get isOnline =>
      _status == ConnectionStatus.online ||
      _status == ConnectionStatus.degraded;
  bool get isOffline => _status == ConnectionStatus.offline;

  /// True when only cloud is reachable (no LAN)
  bool get isCloudOnly => isOnline && !_useLocal;

  Future<void> initialize() async {
    _subscription = _connectivity.onConnectivityChanged.listen((_) => check());
    await check();
  }

  /// Call after setup with slug + saved local IP
  void configure(String slug, {String? localIp, int localPort = 3000}) {
    _healthEndpoints.clear();
    final effectiveIp = localIp ?? '192.168.100.24';
    // LAN endpoint tried first; cloud tried as fallback
    _healthEndpoints.addAll([
      'http://$effectiveIp:$localPort/api/health',
      '${ServerConfig.cloudBaseUrl}/api/health',
    ]);
  }

  @override
  void dispose() {
    _subscription?.cancel();
    super.dispose();
  }

  Future<void> check() async {
    for (final endpoint in _healthEndpoints) {
      try {
        final start = DateTime.now();
        final ok = await _fetch(endpoint);
        final latency = DateTime.now().difference(start).inMilliseconds;

        if (ok) {
          _status = latency > 5000
              ? ConnectionStatus.degraded
              : ConnectionStatus.online;
          _currentEndpoint = endpoint.replaceAll('/api/health', '');
          _useLocal = endpoint.contains('192.168') ||
              endpoint.contains('localhost') ||
              endpoint.contains('10.') ||
              endpoint.contains('10.0.2.2');
          notifyListeners();
          return;
        }
      } catch (_) {
        continue;
      }
    }
    _status = ConnectionStatus.offline;
    _currentEndpoint = '';
    _useLocal = false;
    notifyListeners();
  }

  Future<bool> _fetch(String url) async {
    try {
      final client = HttpClient()
        ..connectionTimeout = const Duration(seconds: 3);
      final req = await client.getUrl(Uri.parse(url));
      final resp = await req.close();
      await resp.drain<List<int>>();
      return resp.statusCode == 200;
    } catch (_) {
      return false;
    }
  }
}

// ─── Network router: auto LAN-first → cloud fallback + Bearer token ────────
class NetworkRouter {
  final ConnectivityService _connectivity = ConnectivityService();
  final AuthState _auth = AuthState();

  /// Best available base URL: LAN → cloud
  String get _base {
    if (_connectivity.isOnline && _connectivity.currentEndpoint.isNotEmpty) {
      return _connectivity.currentEndpoint;
    }
    // Fallback to cloud directly even when "offline" — internet may still be up
    return ServerConfig.cloudBaseUrl;
  }

  Map<String, String> _headers([Map<String, String>? extra]) {
    final h = Map<String, String>.from(extra ?? {});
    // Inject tenant slug for server-side routing
    if (_auth.hospitalSlug != null) h['x-tenant-slug'] = _auth.hospitalSlug!;
    // Inject JWT Bearer token for RBAC
    if (_auth.token != null) h['Authorization'] = 'Bearer ${_auth.token}';
    return h;
  }

  /// GET with LAN-first → cloud fallback
  Future<dynamic> get(String path, {Map<String, String>? headers}) async {
    final h = _headers(headers);
    try {
      return await _httpGet('$_base$path', headers: h);
    } catch (_) {
      // If LAN failed, retry against cloud
      if (_connectivity.useLocal) {
        return await _httpGet('${ServerConfig.cloudBaseUrl}$path', headers: h);
      }
      rethrow;
    }
  }

  /// POST with LAN-first → cloud fallback
  Future<dynamic> post(String path,
      {dynamic body, Map<String, String>? headers}) async {
    final h = _headers(headers);
    try {
      return await _httpPost('$_base$path', body: body, headers: h);
    } catch (_) {
      if (_connectivity.useLocal) {
        return await _httpPost('${ServerConfig.cloudBaseUrl}$path',
            body: body, headers: h);
      }
      rethrow;
    }
  }

  Future<dynamic> _httpGet(String url, {Map<String, String>? headers}) async {
    final client = HttpClient();
    final req = await client.getUrl(Uri.parse(url));
    headers?.forEach((k, v) => req.headers.set(k, v));
    final resp = await req.close();
    final body = await resp.transform(utf8.decoder).join();
    return _parse(resp, body);
  }

  Future<dynamic> _httpPost(String url,
      {dynamic body, Map<String, String>? headers}) async {
    final client = HttpClient();
    final req = await client.postUrl(Uri.parse(url));
    headers?.forEach((k, v) => req.headers.set(k, v));
    req.headers.set('Content-Type', 'application/json');
    if (body != null) req.write(jsonEncode(body));
    final resp = await req.close();
    final respBody = await resp.transform(utf8.decoder).join();
    return _parse(resp, respBody);
  }

  dynamic _parse(HttpClientResponse resp, String body) {
    if (resp.statusCode >= 200 && resp.statusCode < 300) {
      return body.isEmpty ? null : jsonDecode(body);
    }
    final err = body.isNotEmpty
        ? (jsonDecode(body)['error'] ?? body)
        : 'HTTP ${resp.statusCode}';
    throw HttpException('$err');
  }
}

class HttpException implements Exception {
  final String message;
  HttpException(this.message);
  @override
  String toString() => message;
}
