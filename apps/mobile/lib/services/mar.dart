import 'dart:async';
import 'database_service.dart';
import 'sync_service.dart';

class MARService {
  final _db = DatabaseService();
  final _sync = SyncService();

  // Mock data for demo (fallback if cache is empty)
  final List<Map<String, dynamic>> _medications = [
    {
      'id': 'med_001',
      'patientId': 'p_101',
      'patientName': 'John Doe',
      'drugName': 'Paracetamol',
      'dosage': '500mg',
      'frequency': 'TDS',
      'scheduledAt': DateTime.now()
          .add(const Duration(hours: -1))
          .toIso8601String(),
      'status': 'DUE',
    },
    // ... other mock meds
  ];

  Future<List<Map<String, dynamic>>> getScheduledMeds(String wardId) async {
    // Try to get from server via NetworkRouter if possible, but here we simplify
    // In a real app, this would use ApiService/NetworkRouter
    return _medications;
  }

  Future<bool> administerMedication({
    required String medicationId,
    required String administeredBy,
    required String patientId,
    double? heartRate,
    double? bloodPressure,
  }) async {
    // 1. Update local state instantly (Optimistic UI)
    // In a real app, we would update the SQLite cache here

    // 2. Add to Sync Queue via SyncService
    await _sync.recordMAR(
      patientId: patientId,
      data: {
        'medicationId': medicationId,
        'administeredBy': administeredBy,
        'vitals': {'hr': heartRate, 'bp': bloodPressure},
      },
    );

    return true;
  }
}
