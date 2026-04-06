import 'package:amisi_mobile/data/local/database.dart';
import 'package:drift/drift.dart';
import 'dart:convert';

/**
 * HealthOS Patient Repository
 * Single source of truth for patient data on the mobile device.
 */
class PatientRepository {
  final AppDatabase db;

  PatientRepository({required this.db});

  /**
   * Fetches the reactive list of patients from the local database.
   */
  Stream<List<Patient>> watchPatients() => db.watchPatients();

  /**
   * Searches for patients locally based on name.
   */
  Future<List<Patient>> searchPatients(String query) async {
    return await (db.select(db.patients)
          ..where((t) => t.firstName.contains(query) | t.lastName.contains(query)))
        .get();
  }

  /**
   * Saves a new patient locally and records the mutation for sync.
   */
  Future<void> createPatient({
    required String firstName,
    required String lastName,
    required DateTime dob,
    String? gender,
  }) async {
    final patientId = 'patient_${DateTime.now().millisecondsSinceEpoch}';

    await db.transaction(() async {
      // 1. Save locally
      await db.savePatient(PatientsCompanion(
        id: Value(patientId),
        firstName: Value(firstName),
        lastName: Value(lastName),
        dob: Value(dob),
        gender: Value(gender),
      ));

      // 2. Record mutation journal for sync engine
      final payload = {
        'id': patientId,
        'firstName': firstName,
        'lastName': lastName,
        'dob': dob.toIso8601String(),
        'gender': gender,
      };

      await db.recordMutation(SyncJournalCompanion(
        entityType: const Value('Patient'),
        entityId: Value(patientId),
        action: const Value('CREATE'),
        payload: Value(json.encode(payload)),
      ));
    });
  }

  /**
   * Records clinical vitals for a patient.
   */
  Future<void> recordVitals({
    required String patientId,
    required String bloodPressure,
    required int heartRate,
    double? temperature,
  }) async {
    final vitalsId = 'vitals_${DateTime.now().millisecondsSinceEpoch}';

    await db.transaction(() async {
      // 1. Save locally
      await db.into(db.vitals).insert(VitalsCompanion(
            id: Value(vitalsId),
            patientId: Value(patientId),
            bloodPressure: Value(bloodPressure),
            heartRate: Value(heartRate),
            temperature: Value(temperature),
          ));

      // 2. Record mutation journal
      final payload = {
        'id': vitalsId,
        'patientId': patientId,
        'bloodPressure': bloodPressure,
        'heartRate': heartRate,
        'temperature': temperature,
      };

      await db.recordMutation(SyncJournalCompanion(
        entityType: const Value('Vitals'),
        entityId: Value(vitalsId),
        action: const Value('CREATE'),
        payload: Value(json.encode(payload)),
      ));
    });
  }
}
