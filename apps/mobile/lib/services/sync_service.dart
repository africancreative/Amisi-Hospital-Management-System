import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'connectivity.dart';
import 'database_service.dart';
import 'auth.dart';

class SyncService extends ChangeNotifier {
  static final SyncService _instance = SyncService._internal();
  factory SyncService() => _instance;
  SyncService._internal();

  final _db = DatabaseService();
  final _connectivity = ConnectivityService();
  final _auth = AuthState();
  
  Timer? _syncTimer;
  bool _isSyncing = false;
  DateTime? _lastSyncTime;
  String _currentTask = '';

  bool get isSyncing => _isSyncing;
  DateTime? get lastSyncTime => _lastSyncTime;
  String get currentTask => _currentTask;

  void start() {
    // Initial sync
    syncAll();
    
    _syncTimer = Timer.periodic(const Duration(seconds: 45), (timer) {
      if (_connectivity.isOnline && !_isSyncing) {
        syncAll();
      }
    });
  }

  void stop() {
    _syncTimer?.cancel();
  }

  Future<void> syncAll() async {
    if (_isSyncing) return;
    _isSyncing = true;
    notifyListeners();

    try {
      _currentTask = 'Pushing local actions...';
      notifyListeners();
      await syncQueue();

      _currentTask = 'Pulling patient updates...';
      notifyListeners();
      await pullPatients();

      _lastSyncTime = DateTime.now();
    } catch (e) {
      debugPrint('[Sync] Global sync failed: $e');
    } finally {
      _isSyncing = false;
      _currentTask = '';
      notifyListeners();
    }
  }

  Future<void> pullPatients() async {
    try {
      final router = NetworkRouter();
      final response = await router.get('/api/patients/active?limit=100');
      if (response != null && response is List) {
        await _db.cachePatients(response);
        debugPrint('[Sync] Cached ${response.length} active patients.');
      }
    } catch (e) {
      debugPrint('[Sync] Failed to pull patients: $e');
    }
  }

  Future<void> syncQueue() async {
    final queue = await _db.getQueue();
    if (queue.isEmpty) return;

    final router = NetworkRouter();

    for (var item in queue) {
      final id = item['id'] as int;
      final actionType = item['action_type'] as String;
      final endpoint = item['endpoint'] as String;
      final payload = jsonDecode(item['payload'] as String);

      try {
        debugPrint('[Sync] Pushing $actionType ($id)...');
        // Add a requestId for idempotency on the server side
        payload['requestId'] = 'mobile_sync_$id'; 
        
        await router.post(endpoint, body: payload);
        await _db.removeFromQueue(id);
      } catch (e) {
        debugPrint('[Sync] Push failed for $id: $e');
        // If it's a 4xx error (not found/bad request), we might want to remove it
        // If it's a 5xx or network error, we keep it in queue
      }
    }
  }

  // Helper for Clinical Actions (integrated with UI)
  Future<void> performAction({
    required String actionType,
    required String endpoint,
    required Map<String, dynamic> payload,
  }) async {
    payload['timestamp'] = DateTime.now().toIso8601String();
    payload['doctorId'] = _auth.userId;

    if (_connectivity.isOnline) {
      try {
        await NetworkRouter().post(endpoint, body: payload);
        return;
      } catch (e) {
        debugPrint('[Sync] Direct push failed, falling back to local queue.');
      }
    }

    await _db.addToQueue(
      actionType: actionType,
      endpoint: endpoint,
      payload: payload,
    );
    notifyListeners();
  }
}
