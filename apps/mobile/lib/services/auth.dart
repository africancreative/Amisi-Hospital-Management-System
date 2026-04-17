import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';

enum ConnectionStatus { online, offline, degraded, unknown }

class ServerConfig {
  static const String cloudBaseUrl = 'https://amisimedos.amisigenuine.com';
  static const String defaultLocalIp = '192.168.100.21';
  static const int defaultLocalPort = 3000;

  String? _localServerIp;
  int _localServerPort = defaultLocalPort;

  String get localServerIp => _localServerIp ?? defaultLocalIp;
  int get localServerPort => _localServerPort;

  void setLocalServer({required String ip, required int port}) {
    _localServerIp = ip;
    _localServerPort = port;
  }

  String getHospitalUrl(String slug, {bool useLocal = false}) {
    if (useLocal) {
      return 'http://$localServerIp:$localServerPort/$slug';
    }
    return '$cloudBaseUrl/$slug';
  }

  List<String> getHealthEndpoints(String slug) {
    return [
      '$cloudBaseUrl/$slug/api/health',
      'http://$localServerIp:$localServerPort/$slug/api/health',
    ];
  }
}

class AuthState extends ChangeNotifier {
  static final AuthState _instance = AuthState._internal();
  factory AuthState() => _instance;
  AuthState._internal();

  String? _hospitalSlug;
  String? _hospitalName;
  String? _userId;
  String? _userRole;
  String? _userName;
  bool _isAuthenticated = false;

  String? get hospitalSlug => _hospitalSlug;
  String? get hospitalName => _hospitalName;
  String? get userId => _userId;
  String? get userRole => _userRole;
  String? get userName => _userName;
  bool get isAuthenticated => _isAuthenticated;

  void login({
    required String hospitalSlug,
    required String hospitalName,
    required String userId,
    required String userRole,
    required String userName,
  }) {
    _hospitalSlug = hospitalSlug;
    _hospitalName = hospitalName;
    _userId = userId;
    _userRole = userRole;
    _userName = userName;
    _isAuthenticated = true;
    notifyListeners();
  }

  void logout() {
    _hospitalSlug = null;
    _hospitalName = null;
    _userId = null;
    _userRole = null;
    _userName = null;
    _isAuthenticated = false;
    notifyListeners();
  }
}

class ConnectivityService extends ChangeNotifier {
  static final ConnectivityService _instance = ConnectivityService._internal();
  factory ConnectivityService() => _instance;
  ConnectivityService._internal();

  ConnectionStatus _status = ConnectionStatus.unknown;
  String _currentEndpoint = '';
  String _activeUrl = '';
  List<String> _endpoints = [];
  Timer? _checkTimer;
  bool _isInitialized = false;
  bool _useLocal = false;

  ConnectionStatus get status => _status;
  String get currentEndpoint => _currentEndpoint;
  String get activeUrl => _activeUrl;
  bool get useLocal => _useLocal;
  bool get isOnline =>
      _status == ConnectionStatus.online ||
      _status == ConnectionStatus.degraded;
  bool get isOffline => _status == ConnectionStatus.offline;

  void configureEndpoints(
    String hospitalSlug, {
    String? localServerIp,
    int localPort = 3000,
  }) {
    final cloudEndpoint =
        '${ServerConfig.cloudBaseUrl}/$hospitalSlug/api/health';
    final localIp = localServerIp ?? ServerConfig.defaultLocalIp;
    final localEndpoint = 'http://$localIp:$localPort/$hospitalSlug/api/health';

    _endpoints = [cloudEndpoint, localEndpoint];
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

  @override
  void notifyListeners() {
    super.notifyListeners();
  }

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
          _useLocal = endpoint.contains('192.168');
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

class ApiService {
  final String baseUrl;

  ApiService({required this.baseUrl});

  Future<Map<String, dynamic>?> login(String email, String password) async {
    try {
      final client = HttpClient();
      final request = await client.postUrl(
        Uri.parse('$baseUrl/api/auth/login'),
      );
      request.headers.set('Content-Type', 'application/json');
      request.write(jsonEncode({'email': email, 'password': password}));

      final response = await request.close();
      final body = await response.transform(utf8.decoder).join();

      if (response.statusCode == 200) {
        final data = jsonDecode(body) as Map<String, dynamic>;
        return data;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  Future<bool> checkHealth() async {
    try {
      final client = HttpClient();
      client.connectionTimeout = const Duration(seconds: 5);
      final request = await client.getUrl(Uri.parse('$baseUrl/api/health'));
      final response = await request.close();
      await response.drain<List<int>>();
      return response.statusCode == 200;
    } catch (_) {
      return false;
    }
  }
}
