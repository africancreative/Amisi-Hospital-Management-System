import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/theme/app_theme.dart';
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

  final dbService = DatabaseService();
  await dbService.initialize();

  final auth = AuthState();
  await auth.initialize();

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
        ChangeNotifierProvider.value(value: syncService),
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
      theme: AppTheme.darkTheme,
      initialRoute: initialRoute,
      routes: {
        '/setup':     (_) => const SetupScreen(),
        '/login':     (_) => const LoginScreen(),
        '/dashboard': (_) => const DashboardScreen(),
        '/patients':  (_) => const PatientListScreen(),
        '/billing':   (_) => const BillingListScreen(),
        '/chat':      (_) => const ChatListScreen(),
      },
    );
  }
}
