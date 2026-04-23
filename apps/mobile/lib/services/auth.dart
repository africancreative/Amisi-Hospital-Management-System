import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';

// enum ConnectionStatus moved to connectivity.dart

class ServerConfig {
  static const String cloudBaseUrl = 'https://amisimedos.amisigenuine.com';
  static const String defaultLocalIp = '192.168.100.24';
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
      // Global health endpoint with slug as parameter or path
      '$cloudBaseUrl/api/tenant/license?slug=$slug',
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
