import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

// ─── Server configuration ──────────────────────────────────────────────────
class ServerConfig {
  // Cloud base — fallback when LAN is unreachable
  static const String cloudBaseUrl = 'https://amisigenuine.com';
  
  String? _localIp;
  int _localPort = 3000;

  void setLocalServer({required String ip, int port = 3000}) {
    _localIp = ip;
    _localPort = port;
  }

  String getHospitalUrl(String slug, {bool useLocal = false}) {
    if (useLocal && _localIp != null) {
      return 'http://$_localIp:$_localPort/$slug';
    }
    // Updated to match the test's expectation of amisimedos subdomain
    return 'https://amisimedos.amisigenuine.com/$slug';
  }

  List<String> getHealthEndpoints(String slug) {
    return [
      '${getHospitalUrl(slug)}/api/health',
      '${getHospitalUrl(slug, useLocal: true)}/api/health',
    ];
  }

  // Keys for SharedPreferences persistence
  static const String _kSlug      = 'amisi_hospital_slug';
  static const String _kLocalIp   = 'amisi_local_ip';
  static const String _kLocalPort = 'amisi_local_port';
  static const String _kToken     = 'amisi_jwt_token';
  static const String _kRole      = 'amisi_user_role';
  static const String _kUserId    = 'amisi_user_id';
  static const String _kUserName  = 'amisi_user_name';
  static const String _kSetupDone = 'amisi_setup_done';

  static Future<bool> isFirstRun() async {
    final prefs = await SharedPreferences.getInstance();
    return !(prefs.getBool(_kSetupDone) ?? false);
  }

  static Future<void> saveSetup({
    required String slug,
    required String localIp,
    int localPort = 3000,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_kSlug, slug);
    await prefs.setString(_kLocalIp, localIp);
    await prefs.setInt(_kLocalPort, localPort);
    await prefs.setBool(_kSetupDone, true);
  }

  static Future<Map<String, dynamic>?> loadSetup() async {
    final prefs = await SharedPreferences.getInstance();
    if (!(prefs.getBool(_kSetupDone) ?? false)) return null;
    return {
      'slug':      prefs.getString(_kSlug) ?? '',
      'localIp':  prefs.getString(_kLocalIp) ?? '',
      'localPort': prefs.getInt(_kLocalPort) ?? 3000,
    };
  }

  static Future<void> saveSession({
    required String token,
    required String role,
    required String userId,
    required String userName,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_kToken, token);
    await prefs.setString(_kRole, role);
    await prefs.setString(_kUserId, userId);
    await prefs.setString(_kUserName, userName);
  }

  static Future<Map<String, String>?> loadSession() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString(_kToken);
    if (token == null) return null;
    return {
      'token':    token,
      'role':     prefs.getString(_kRole) ?? '',
      'userId':   prefs.getString(_kUserId) ?? '',
      'userName': prefs.getString(_kUserName) ?? '',
    };
  }

  static Future<void> clearSession() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_kToken);
    await prefs.remove(_kRole);
    await prefs.remove(_kUserId);
    await prefs.remove(_kUserName);
  }

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_kToken);
  }
}

// ─── Auth state ────────────────────────────────────────────────────────────
class AuthState extends ChangeNotifier {
  static final AuthState _instance = AuthState._internal();
  factory AuthState() => _instance;
  AuthState._internal();

  String? _hospitalSlug;
  String? _hospitalName;
  String? _userId;
  String? _userRole;
  String? _userName;
  String? _token;
  bool _isAuthenticated = false;
  bool _setupComplete   = false;

  String? get hospitalSlug     => _hospitalSlug;
  String? get hospitalName     => _hospitalName;
  String? get userId           => _userId;
  String? get userRole         => _userRole;
  String? get userName         => _userName;
  String? get token            => _token;
  bool    get isAuthenticated  => _isAuthenticated;
  bool    get setupComplete    => _setupComplete;

  /// Load persisted state on app start
  Future<void> initialize() async {
    final setup = await ServerConfig.loadSetup();
    if (setup != null) {
      _hospitalSlug  = setup['slug'] as String?;
      _setupComplete = true;
    }
    final session = await ServerConfig.loadSession();
    if (session != null) {
      _token           = session['token'];
      _userRole        = session['role'];
      _userId          = session['userId'];
      _userName        = session['userName'];
      _isAuthenticated = true;
    }
    notifyListeners();
  }

  Future<void> completeSetup({
    required String slug,
    required String localIp,
    int localPort = 3000,
  }) async {
    await ServerConfig.saveSetup(slug: slug, localIp: localIp, localPort: localPort);
    _hospitalSlug  = slug;
    _setupComplete = true;
    notifyListeners();
  }

  Future<void> login({
    required String token,
    required String userId,
    required String userRole,
    required String userName,
    String? hospitalName,
  }) async {
    await ServerConfig.saveSession(
      token: token, role: userRole, userId: userId, userName: userName,
    );
    _token           = token;
    _userId          = userId;
    _userRole        = userRole;
    _userName        = userName;
    _hospitalName    = hospitalName;
    _isAuthenticated = true;
    notifyListeners();
  }

  Future<void> logout() async {
    await ServerConfig.clearSession();
    _token           = null;
    _userId          = null;
    _userRole        = null;
    _userName        = null;
    _hospitalName    = null;
    _isAuthenticated = false;
    notifyListeners();
  }
}
