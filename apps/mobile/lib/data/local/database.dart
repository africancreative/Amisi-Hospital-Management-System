import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;
import 'dart:io';

part 'database.g.dart';

/**
 * HealthOS Clinical Tables
 */

class Patients extends Table {
  TextColumn get id => text()();
  TextColumn get firstName => text().named('first_name')();
  TextColumn get lastName => text().named('last_name')();
  DateTimeColumn get dob => dateTime()();
  TextColumn get gender => text().nullable()();
  
  IntColumn get version => integer().withDefault(const Constant(1))();
  BoolColumn get isSynced => boolean().withDefault(const Constant(false))();
  
  @override
  Set<Column> get primaryKey => {id};
}

class Vitals extends Table {
  TextColumn get id => text()();
  TextColumn get patientId => text().named('patient_id').references(Patients, #id)();
  TextColumn get encounterId => text().named('encounter_id').nullable()();
  
  TextColumn get bloodPressure => text().nullable().named('blood_pressure')();
  IntColumn get heartRate => integer().nullable().named('heart_rate')();
  RealColumn get temperature => real().nullable()();
  
  DateTimeColumn get createdAt => dateTime().withDefault(currentDateAndTime)();
  
  @override
  Set<Column> get primaryKey => {id};
}

class SyncJournal extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get entityType => text().named('entity_type')();
  TextColumn get entityId => text().named('entity_id')();
  TextColumn get action => text()(); // CREATE, UPDATE, DELETE
  TextColumn get payload => text()(); // JSON String
  DateTimeColumn get timestamp => dateTime().withDefault(currentDateAndTime)();
  BoolColumn get isSynced => boolean().withDefault(const Constant(false))();
}

/**
 * Amisi HealthOS Local Database
 */
@DriftDatabase(tables: [Patients, Vitals, SyncJournal])
class AppDatabase extends _$AppDatabase {
  AppDatabase() : super(_openConnection());

  @override
  int get schemaVersion => 1;

  // DAO methods
  Future<List<Patient>> get allPatients => select(patients).get();
  Stream<List<Patient>> watchPatients() => select(patients).watch();
  
  Future<int> savePatient(PatientsCompanion entry) => into(patients).insertOnConflictUpdate(entry);
  
  Future<int> recordMutation(SyncJournalCompanion entry) => into(syncJournal).insert(entry);
}

LazyDatabase _openConnection() {
  return LazyDatabase(() async {
    final dbFolder = await getApplicationDocumentsDirectory();
    final file = File(p.join(dbFolder.path, 'amisi_healthos.sqlite'));
    return NativeDatabase(file);
  });
}
