import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:amisi_mobile/data/local/database.dart';
import 'package:amisi_mobile/data/remote/api_client.dart';
import 'package:amisi_mobile/data/repositories/patient_repository.dart';
import 'package:amisi_mobile/logic/sync/sync_manager.dart';
import 'package:amisi_mobile/ui/screens/patient_list_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  
  final db = AppDatabase();
  final api = ApiClient(
    baseUrl: 'https://demo-hospital.amisigenuine.com', // Dynamic in production
    sharedSecret: 'amisi_edge_secret_123',           // Provisioned per-tenant
  );
  
  final repository = PatientRepository(db: db);
  final syncManager = SyncManager(db: db, api: api);
  
  // Start the background sync loop
  syncManager.startSync();

  runApp(
    MultiProvider(
      providers: [
        Provider<AppDatabase>.value(value: db),
        Provider<PatientRepository>.value(value: repository),
        Provider<SyncManager>.value(value: syncManager),
      ],
      child: const HealthOSApp(),
    ),
  );
}

class HealthOSApp extends StatelessWidget {
  const HealthOSApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Amisi HealthOS',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF0066FF),
          brightness: Brightness.dark,
          surface: const Color(0xFF0A0A0A),
        ),
        scaffoldBackgroundColor: const Color(0xFF0A0A0A),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF0A0A0A),
          elevation: 0,
          centerTitle: false,
          titleTextStyle: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            letterSpacing: -1,
          ),
        ),
      ),
      home: const PatientListScreen(),
    );
  }
}
