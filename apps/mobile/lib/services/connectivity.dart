import 'dart:convert';
import 'dart:io';
import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'auth.dart';

enum ConnectionStatus { online, offline, degraded, unknown }

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

  Future<void> initialize() async {
    _subscription = _connectivity.onConnectivityChanged.listen((results) {
      check();
    });
    await check();
  }

  void configure(String slug, {String? localIp, int localPort = 3000}) {
    _healthEndpoints.clear();
    final config = ServerConfig();
    if (localIp != null) {
        config.setLocalServer(ip: localIp, port: localPort);
    }
    _healthEndpoints.addAll(config.getHealthEndpoints(slug));
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
        final response = await _fetch(endpoint);
        final latency = DateTime.now().difference(start).inMilliseconds;

        if (response) {
          _status = latency > 5000
              ? ConnectionStatus.degraded
              : ConnectionStatus.online;
          _currentEndpoint = endpoint.replaceAll('/api/health', '');
          _useLocal = endpoint.contains('192.168') || endpoint.contains('localhost') || endpoint.contains('10.0.2.2');
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
      final client = HttpClient();
      client.connectionTimeout = const Duration(seconds: 3);
      final request = await client.getUrl(Uri.parse(url));
      final response = await request.close();
      await response.drain<List<int>>();
      return response.statusCode == 200;
    } catch (_) {
      return false;
    }
  }
}

class NetworkRouter {
  final ConnectivityService _connectivity = ConnectivityService();
  final AuthState _auth = AuthState();

  String get currentEndpoint {
    if (_connectivity.isOnline && _connectivity.currentEndpoint.isNotEmpty) {
      return _connectivity.currentEndpoint;
    }
    return ServerConfig.cloudBaseUrl;
  }

  Map<String, String> _injectHeaders(Map<String, String>? headers) {
    final h = Map<String, String>.from(headers ?? {});
    if (_auth.hospitalSlug != null) {
      h['x-tenant-slug'] = _auth.hospitalSlug!;
    }
    return h;
  }

  Future<dynamic> get(String path, {Map<String, String>? headers}) async {
    final h = _injectHeaders(headers);
    final url = '$currentEndpoint$path';
    try {
      return await _httpGet(url, headers: h);
    } catch (e) {
      if (_connectivity.useLocal) {
        final cloudUrl = '${ServerConfig.cloudBaseUrl}$path';
        return await _httpGet(cloudUrl, headers: h);
      }
      rethrow;
    }
  }

  Future<dynamic> post(
    String path, {
    dynamic body,
    Map<String, String>? headers,
  }) async {
    final h = _injectHeaders(headers);
    final url = '$currentEndpoint$path';
    try {
      return await _httpPost(url, body: body, headers: h);
    } catch (e) {
      if (_connectivity.useLocal) {
        final cloudUrl = '${ServerConfig.cloudBaseUrl}$path';
        return await _httpPost(cloudUrl, body: body, headers: h);
      }
      rethrow;
    }
  }

  Future<dynamic> _httpGet(String url, {Map<String, String>? headers}) async {
    final client = HttpClient();
    final request = await client.getUrl(Uri.parse(url));
    headers?.forEach((k, v) => request.headers.set(k, v));
    final response = await request.close();
    final body = await response.transform(utf8.decoder).join();
    return _parseResponse(response, body);
  }

  Future<dynamic> _httpPost(
    String url, {
    dynamic body,
    Map<String, String>? headers,
  }) async {
    final client = HttpClient();
    final request = await client.postUrl(Uri.parse(url));
    headers?.forEach((k, v) => request.headers.set(k, v));
    request.headers.set('Content-Type', 'application/json');
    if (body != null) {
      request.write(jsonEncode(body));
    }
    final response = await request.close();
    final respBody = await response.transform(utf8.decoder).join();
    return _parseResponse(response, respBody);
  }

  dynamic _parseResponse(HttpClientResponse response, String body) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      if (body.isEmpty) return null;
      return jsonDecode(body);
    }
    throw HttpException('Request failed: ${response.statusCode} - $body');
  }
}

class HttpException implements Exception {
  final String message;
  HttpException(this.message);
  @override
  String toString() => message;
}
