import 'dart:convert';
import 'dart:io';
import 'dart:async';
import 'package:flutter/foundation.dart';

enum ConnectionStatus { online, offline, degraded, unknown }

class ConnectivityService extends ChangeNotifier {
  static final ConnectivityService _instance = ConnectivityService._internal();
  factory ConnectivityService() => _instance;
  ConnectivityService._internal();

  ConnectionStatus _status = ConnectionStatus.unknown;
  String _currentEndpoint = '';
  List<String> _endpoints = [];
  Timer? _checkTimer;
  bool _isInitialized = false;

  ConnectionStatus get status => _status;
  String get currentEndpoint => _currentEndpoint;
  bool get isOnline =>
      _status == ConnectionStatus.online ||
      _status == ConnectionStatus.degraded;
  bool get isOffline => _status == ConnectionStatus.offline;

  void configure({List<String>? localEndpoints, String? cloudEndpoint}) {
    _endpoints = [
      ...?localEndpoints,
      cloudEndpoint ?? 'https://api.amisigenuine.com/api/health',
    ];
  }

  Future<void> initialize() async {
    if (_isInitialized) return;
    _isInitialized = true;

    await check();
    _checkTimer = Timer.periodic(const Duration(seconds: 10), (_) => check());
  }

  @override
  void dispose() {
    _checkTimer?.cancel();
    super.dispose();
  }

  void notifyListeners() {}

  Future<void> check() async {
    for (final endpoint in _endpoints) {
      try {
        final start = DateTime.now();
        final response = await _fetch(endpoint);
        final latency = DateTime.now().difference(start).inMilliseconds;

        if (response) {
          _status = latency > 5000
              ? ConnectionStatus.degraded
              : ConnectionStatus.online;
          _currentEndpoint = endpoint;
          notifyListeners();
          return;
        }
      } catch (_) {
        continue;
      }
    }

    _status = ConnectionStatus.offline;
    _currentEndpoint = '';
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

  void setOffline() {
    _status = ConnectionStatus.offline;
    notifyListeners();
  }

  void setOnline() {
    _status = ConnectionStatus.online;
    notifyListeners();
  }
}

class NetworkRouter {
  final ConnectivityService _connectivity;
  String? _localEndpoint;
  String? _cloudEndpoint;

  NetworkRouter({
    ConnectivityService? connectivity,
    String? localEndpoint,
    String? cloudEndpoint,
  }) : _connectivity = connectivity ?? ConnectivityService(),
       _localEndpoint = localEndpoint,
       _cloudEndpoint = cloudEndpoint;

  String get currentEndpoint {
    if (_connectivity.isOnline && _localEndpoint != null) {
      return _localEndpoint!;
    }
    return _cloudEndpoint ?? _localEndpoint ?? '';
  }

  bool get useLocal => _connectivity.isOnline && _localEndpoint != null;

  Future<dynamic> get(String path, {Map<String, String>? headers}) async {
    final url = '$currentEndpoint$path';
    try {
      final response = await _httpGet(url, headers: headers);
      return response;
    } catch (e) {
      if (useLocal && _cloudEndpoint != null) {
        final cloudUrl = '$_cloudEndpoint$path';
        return await _httpGet(cloudUrl, headers: headers);
      }
      rethrow;
    }
  }

  Future<dynamic> post(
    String path, {
    dynamic body,
    Map<String, String>? headers,
  }) async {
    final url = '$currentEndpoint$path';
    try {
      final response = await _httpPost(url, body: body, headers: headers);
      return response;
    } catch (e) {
      if (useLocal && _cloudEndpoint != null) {
        final cloudUrl = '$_cloudEndpoint$path';
        return await _httpPost(cloudUrl, body: body, headers: headers);
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
    throw HttpException('Request failed: ${response.statusCode}');
  }
}

class HttpException implements Exception {
  final String message;
  HttpException(this.message);
  @override
  String toString() => message;
}
