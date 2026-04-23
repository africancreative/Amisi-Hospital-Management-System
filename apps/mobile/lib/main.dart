import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'services/auth.dart';
import 'services/tenant.dart';
import 'services/connectivity.dart';
import 'services/database_service.dart';
import 'services/sync_service.dart';
import 'screens/auth/login_screen.dart';
import 'screens/dashboard/dashboard_screen.dart';
import 'screens/patients/patient_list_screen.dart';
import 'screens/billing/billing_list_screen.dart';
import 'screens/chat/chat_list_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Services
  final dbService = DatabaseService();
  await dbService.initialize();
  
  final connectivity = ConnectivityService();
  await connectivity.initialize();
  
  final syncService = SyncService();
  syncService.start();

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider.value(value: AuthState()),
        ChangeNotifierProvider.value(value: TenantService()),
        ChangeNotifierProvider.value(value: connectivity),
      ],
      child: const AmisiApp(),
    ),
  );
}

class AmisiApp extends StatelessWidget {
  const AmisiApp({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthState>(context);

    return MaterialApp(
      title: 'AmisiMedOS Mobile',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        fontFamily: 'Inter',
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF2563EB),
          brightness: Brightness.dark,
          surface: const Color(0xFF0F172A),
        ),
      ),
      initialRoute: auth.isAuthenticated ? '/dashboard' : '/login',
      routes: {
        '/login': (context) => const LoginScreen(),
        '/dashboard': (context) => const DashboardScreen(),
        '/patients': (context) => const PatientListScreen(),
        '/billing': (context) => const BillingListScreen(),
        '/chat': (context) => const ChatListScreen(),
        // Placeholder routes for other modules
        '/pharmacy': (context) => _buildPlaceholder(context, 'PHARMACY'),
        '/lab': (context) => _buildPlaceholder(context, 'LABORATORY'),
        '/ipd': (context) => _buildPlaceholder(context, 'INPATIENT'),
        '/inventory': (context) => _buildPlaceholder(context, 'INVENTORY'),
      },
    );
  }

  Widget _buildPlaceholder(BuildContext context, String title) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(backgroundColor: Colors.transparent, elevation: 0),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.construction, size: 64, color: Colors.amber),
            const SizedBox(height: 24),
            Text(
              '$title MODULE',
              style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900, letterSpacing: 2),
            ),
            const SizedBox(height: 8),
            Text(
              'IMPLEMENTATION IN PROGRESS',
              style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 10, fontWeight: FontWeight.bold),
            ),
          ],
        ),
      ),
    );
  }
}
