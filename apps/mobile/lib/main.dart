import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'services/auth.dart';
import 'services/connectivity.dart';
import 'services/database_service.dart';
import 'services/sync_service.dart';
import 'services/tenant.dart';
import 'screens/auth/setup_screen.dart';
import 'screens/auth/login_screen.dart';
import 'screens/dashboard/dashboard_screen.dart';
import 'screens/patients/patient_list_screen.dart';
import 'screens/billing/billing_list_screen.dart';
import 'screens/chat/chat_list_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // 1. Initialize local SQLite (offline cache)
  final dbService = DatabaseService();
  await dbService.initialize();

  // 2. Initialize auth state (loads persisted setup + session)
  final auth = AuthState();
  await auth.initialize();

  // 3. Initialize connectivity and configure if setup already done
  final connectivity = ConnectivityService();
  final setup = await ServerConfig.loadSetup();
  if (setup != null) {
    connectivity.configure(
      setup['slug'] as String,
      localIp:  setup['localIp'] as String,
      localPort: setup['localPort'] as int,
    );
  }
  await connectivity.initialize();

  // 4. Start real-time sync (only if tenant is configured)
  final syncService = SyncService();
  if (setup != null && auth.isAuthenticated) {
    syncService.start();
  }

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider.value(value: auth),
        ChangeNotifierProvider.value(value: TenantService()),
        ChangeNotifierProvider.value(value: connectivity),
      ],
      child: AmisiApp(syncService: syncService),
    ),
  );
}

class AmisiApp extends StatelessWidget {
  final SyncService syncService;
  const AmisiApp({super.key, required this.syncService});

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthState>(context);

    // ── Boot routing ──────────────────────────────────────────────────────
    // 1. No setup done  → /setup (first-run wizard)
    // 2. Setup done, not logged in → /login
    // 3. Fully authenticated → /dashboard
    String initialRoute;
    if (!auth.setupComplete) {
      initialRoute = '/setup';
    } else if (!auth.isAuthenticated) {
      initialRoute = '/login';
    } else {
      initialRoute = '/dashboard';
    }

    return MaterialApp(
      title: 'AmisiMedOS Mobile',
      debugShowCheckedModeBanner: false,
      theme: _buildTheme(),
      initialRoute: initialRoute,
      routes: {
        '/setup':     (_) => const SetupScreen(),
        '/login':     (_) => const LoginScreen(),
        '/dashboard': (_) => const DashboardScreen(),
        '/patients':  (_) => const PatientListScreen(),
        '/billing':   (_) => const BillingListScreen(),
        '/chat':      (_) => const ChatListScreen(),
        '/pharmacy':  (_) => _placeholder('PHARMACY'),
        '/lab':       (_) => _placeholder('LABORATORY'),
        '/ipd':       (_) => _placeholder('INPATIENT'),
        '/inventory': (_) => _placeholder('INVENTORY'),
        '/hr':        (_) => _placeholder('HR'),
        '/settings':  (_) => _placeholder('SETTINGS'),
      },
      // Global navigator observer can be added for analytics
    );
  }

  Widget _placeholder(String title) => Scaffold(
    backgroundColor: const Color(0xFF0A0F1E),
    appBar: AppBar(backgroundColor: Colors.transparent, elevation: 0),
    body: Center(child: Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const Icon(Icons.construction, size: 56, color: Colors.amber),
        const SizedBox(height: 20),
        Text(title, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900, letterSpacing: 2)),
        const SizedBox(height: 8),
        const Text('COMING SOON', style: TextStyle(color: Colors.white38, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 2)),
      ],
    )),
  );

  ThemeData _buildTheme() => ThemeData(
    useMaterial3: true,
    fontFamily: 'Inter',
    colorScheme: ColorScheme.fromSeed(
      seedColor: const Color(0xFF2563EB),
      brightness: Brightness.dark,
      surface: const Color(0xFF0A0F1E),
    ),
    scaffoldBackgroundColor: const Color(0xFF0A0F1E),
    appBarTheme: const AppBarTheme(
      backgroundColor: Colors.transparent,
      elevation: 0,
      iconTheme: IconThemeData(color: Colors.white70),
      titleTextStyle: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 16, letterSpacing: 0.5),
    ),
  );
}
