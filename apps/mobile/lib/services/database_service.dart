import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import 'dart:convert';

class DatabaseService {
  static final DatabaseService _instance = DatabaseService._internal();
  factory DatabaseService() => _instance;
  DatabaseService._internal();

  Database? _database;

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDatabase();
    return _database!;
  }

  Future<void> initialize() async {
    await database;
  }

  Future<Database> _initDatabase() async {
    String path = join(await getDatabasesPath(), 'amisi_med_os.db');
    return await openDatabase(
      path,
      version: 1,
      onCreate: _onCreate,
    );
  }

  Future<void> _onCreate(Database db, int version) async {
    // Sync Queue for offline actions
    await db.execute('''
      CREATE TABLE sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action_type TEXT NOT NULL,
        endpoint TEXT NOT NULL,
        payload TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        retry_count INTEGER DEFAULT 0
      )
    ''');

    // Patients Cache
    await db.execute('''
      CREATE TABLE patients_cache (
        id TEXT PRIMARY KEY,
        mrn TEXT NOT NULL,
        full_name TEXT NOT NULL,
        ward TEXT,
        bed TEXT,
        data TEXT NOT NULL,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    ''');

    // Clinical Records (Rounds/MAR) for offline viewing
    await db.execute('''
      CREATE TABLE clinical_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id TEXT NOT NULL,
        record_type TEXT NOT NULL,
        data TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    ''');
  }

  // --- Sync Queue Operations ---

  Future<void> addToQueue({
    required String actionType,
    required String endpoint,
    required Map<String, dynamic> payload,
  }) async {
    final db = await database;
    await db.insert('sync_queue', {
      'action_type': actionType,
      'endpoint': endpoint,
      'payload': jsonEncode(payload),
    });
  }

  Future<List<Map<String, dynamic>>> getQueue() async {
    final db = await database;
    return await db.query('sync_queue', orderBy: 'timestamp ASC');
  }

  Future<void> removeFromQueue(int id) async {
    final db = await database;
    await db.delete('sync_queue', where: 'id = ?', whereArgs: [id]);
  }

  // --- Patient Cache Operations ---

  Future<void> cachePatients(List<dynamic> patients) async {
    final db = await database;
    final batch = db.batch();
    for (var p in patients) {
      batch.insert('patients_cache', {
        'id': p['id'],
        'mrn': p['mrn'] ?? '',
        'full_name': '${p['firstName']} ${p['lastName']}',
        'ward': p['ward']?['name'] ?? '',
        'bed': p['bed']?['number'] ?? '',
        'data': jsonEncode(p),
        'last_updated': DateTime.now().toIso8601String(),
      }, conflictAlgorithm: ConflictAlgorithm.replace);
    }
    await batch.commit(noResult: true);
  }

  Future<List<Map<String, dynamic>>> getCachedPatients() async {
    final db = await database;
    final result = await db.query('patients_cache');
    return result.map((p) => jsonDecode(p['data'] as String) as Map<String, dynamic>).toList();
  }
}
