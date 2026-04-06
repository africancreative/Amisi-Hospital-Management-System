import 'package:amisi_mobile/data/local/database.dart';
import 'package:amisi_mobile/data/remote/api_client.dart';
import 'package:drift/drift.dart';
import 'dart:convert';
import 'dart:async';

/**
 * HealthOS Sync Manager
 * Managing bi-directional sync orchestration for mobile devices.
 */
class SyncManager {
  final AppDatabase db;
  final ApiClient api;
  Timer? _syncTimer;

  SyncManager({required this.db, required this.api});

  /**
   * Starts the periodic background sync cycle.
   */
  void startSync() {
    _syncTimer = Timer.periodic(const Duration(seconds: 15), (timer) {
      performSync();
    });
  }

  void stopSync() {
    _syncTimer?.cancel();
  }

  /**
   * Main Sync Cycle: Push -> Pull
   */
  Future<void> performSync() async {
    try {
      // 1. PUSH local unsynced mutations
      final unsynced = await (db.select(db.syncJournal)
            ..where((t) => t.isSynced.equals(false)))
          .get();

      if (unsynced.isNotEmpty) {
        final acceptedIds = await api.pushJournals(unsynced);
        if (acceptedIds.isNotEmpty) {
          // Mark as synced locally
          await (db.update(db.syncJournal)
                ..where((t) => t.id.isIn(acceptedIds.map(int.parse))))
              .write(const SyncJournalCompanion(isSynced: Value(true)));
        }
      }

      // 2. PULL server deltas
      final lastSyncEvent = await (db.select(db.syncJournal)
            ..orderBy([(t) => OrderingTerm(expression: t.timestamp, mode: OrderingMode.desc)])
            ..limit(1))
          .getSingleOrNull();

      final lastSequence = lastSyncEvent?.id.toString() ?? "0";
      final deltas = await api.pullDeltas(lastSequence);

      if (deltas.isNotEmpty) {
        await reconcileDeltas(deltas);
      }
    } catch (e) {
      print("[Sync Manager] Cycle Error: $e");
    }
  }

  /**
   * Reconciles incoming deltas with the local Drift database.
   */
  Future<void> reconcileDeltas(List<dynamic> deltas) async {
    await db.transaction(() async {
      for (final delta in deltas) {
        final entityType = delta['entityType'];
        final payload = delta['payload'] as Map<String, dynamic>;
        
        if (entityType == 'Patient') {
          await db.into(db.patients).insertOnConflictUpdate(
            PatientsCompanion.fromJson(payload),
          );
        } else if (entityType == 'Vitals') {
          await db.into(db.vitals).insertOnConflictUpdate(
            VitalsCompanion.fromJson(payload),
          );
        }

        // Record incoming journal entry locally for sequence tracking
        await db.into(db.syncJournal).insert(SyncJournalCompanion(
          entityType: Value(entityType),
          entityId: Value(delta['entityId']),
          action: Value(delta['action']),
          payload: Value(json.encode(payload)),
          isSynced: const Value(true),
        ));
      }
    });
  }
}
