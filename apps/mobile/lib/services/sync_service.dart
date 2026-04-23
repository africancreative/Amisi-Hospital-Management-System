import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'connectivity.dart';
import 'database_service.dart';
import 'auth.dart';
import 'dart:io';

class SyncService {
  static final SyncService _instance = SyncService._internal();
  factory SyncService() => _instance;
  SyncService._internal();

  final _db = DatabaseService();
  final _connectivity = ConnectivityService();
  final _auth = AuthState();
  Timer? _syncTimer;
  bool _isSyncing = false;

  void start() {
    _syncTimer = Timer.periodic(const Duration(seconds: 30), (timer) {
      if (_connectivity.isOnline && !_isSyncing) {
        syncQueue();
      }
    });
  }

  void stop() {
    _syncTimer?.cancel();
  }

  Future<void> syncQueue() async {
    if (_isSyncing) return;
    _isSyncing = true;
    debugPrint('[Sync] Starting background synchronization...');

    try {
      final queue = await _db.getQueue();
      if (queue.isEmpty) {
        _isSyncing = false;
        return;
      }

      final router = NetworkRouter(); // Uses current active endpoint

      for (var item in queue) {
        final id = item['id'] as int;
        final actionType = item['action_type'] as String;
        final endpoint = item['endpoint'] as String;
        final payload = jsonDecode(item['payload'] as String);

        try {
          debugPrint('[Sync] Processing item $id: $actionType');
          await router.post(endpoint, body: payload);
          await _db.removeFromQueue(id);
          debugPrint('[Sync] Item $id synced successfully.');
        } catch (e) {
          debugPrint('[Sync] Item $id failed: $e');
          // Optional: increment retry count
        }
      }
    } finally {
      _isSyncing = false;
    }
  }

  // Clinical Actions
  Future<void> recordRounds({
    required String patientId,
    required Map<String, dynamic> data,
  }) async {
    const endpoint = '/api/clinical/rounds';
    final payload = {
      'patientId': patientId,
      'doctorId': _auth.userId,
      ...data,
      'timestamp': DateTime.now().toIso8601String(),
    };

    if (_connectivity.isOnline) {
      try {
        await NetworkRouter().post(endpoint, body: payload);
        return;
      } catch (e) {
        debugPrint('[Sync] Online push failed, queueing instead.');
      }
    }

    await _db.addToQueue(
      actionType: 'ROUNDS',
      endpoint: endpoint,
      payload: payload,
    );
  }

  Future<void> recordMAR({
    required String patientId,
    required Map<String, dynamic> data,
  }) async {
    const endpoint = '/api/clinical/mar';
    final payload = {
      'patientId': patientId,
      'administeredBy': _auth.userId,
      ...data,
      'timestamp': DateTime.now().toIso8601String(),
    };

    if (_connectivity.isOnline) {
      try {
        await NetworkRouter().post(endpoint, body: payload);
        return;
      } catch (e) {
        debugPrint('[Sync] Online push failed, queueing instead.');
      }
    }

    await _db.addToQueue(
      actionType: 'MAR',
      endpoint: endpoint,
      payload: payload,
    );
  }
}
