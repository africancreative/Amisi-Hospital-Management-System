import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../services/auth.dart';
import '../../services/connectivity.dart';

/// Credential login — only email + password needed after first-run setup.
/// Hospital slug is loaded from SharedPreferences (saved during SetupScreen).
/// Calls POST /api/auth/login, receives JWT + role, persists session.
class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});
  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> with SingleTickerProviderStateMixin {
  final _emailCtrl    = TextEditingController();
  final _passwordCtrl = TextEditingController();
  bool  _isLoading    = false;
  bool  _obscure      = true;
  String? _error;

  late AnimationController _anim;
  late Animation<double>   _fadeIn;

  @override
  void initState() {
    super.initState();
    _anim   = AnimationController(vsync: this, duration: const Duration(milliseconds: 800));
    _fadeIn = CurvedAnimation(parent: _anim, curve: Curves.easeOut);
    _anim.forward();
  }

  @override
  void dispose() {
    _anim.dispose();
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    super.dispose();
  }

  Future<void> _login() async {
    final email    = _emailCtrl.text.trim();
    final password = _passwordCtrl.text;
    if (email.isEmpty || password.isEmpty) {
      setState(() => _error = 'Email and password are required');
      return;
    }

    setState(() { _isLoading = true; _error = null; });

    try {
      final auth = Provider.of<AuthState>(context, listen: false);
      final conn = Provider.of<ConnectivityService>(context, listen: false);

      // Ensure connectivity is checked before login
      await conn.check();

      // Real POST to /api/auth/login (LAN-first, cloud fallback)
      final router = NetworkRouter();
      final data   = await router.post('/api/auth/login', body: {
        'email':    email,
        'password': password,
        'slug':     auth.hospitalSlug,
      });

      if (data == null || data['token'] == null) {
        throw Exception('No token received from server');
      }

      final user = data['user'] as Map<String, dynamic>;

      // Configure connectivity for this tenant + persist session
      conn.configure(auth.hospitalSlug ?? '', localIp: ''); // uses saved IP
      await auth.login(
        token:        data['token'] as String,
        userId:       user['id']   as String,
        userRole:     user['role'] as String,
        userName:     user['name'] as String,
        hospitalName: user['slug'] as String?,
      );

      if (mounted) Navigator.pushReplacementNamed(context, '/dashboard');
    } on HttpException catch (e) {
      setState(() => _error = e.message);
    } catch (e) {
      setState(() => _error = e.toString().replaceAll('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthState>(context);

    return Scaffold(
      backgroundColor: const Color(0xFF0A0F1E),
      body: Stack(children: [
        // Ambient glows
        Positioned(top: -100, right: -100,
          child: Container(width: 350, height: 350,
            decoration: BoxDecoration(shape: BoxShape.circle,
              color: const Color(0xFF2563EB).withValues(alpha: 0.07)))),
        Positioned(bottom: -60, left: -60,
          child: Container(width: 250, height: 250,
            decoration: BoxDecoration(shape: BoxShape.circle,
              color: const Color(0xFF7C3AED).withValues(alpha: 0.06)))),

        SafeArea(child: Center(child: FadeTransition(opacity: _fadeIn,
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 48),
            child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [

              // Logo
              SizedBox(height: 80, child: Image.asset('assets/logo.png', fit: BoxFit.contain)),
              const SizedBox(height: 40),

              // Hospital badge
              if (auth.hospitalSlug != null)
                Container(
                  margin: const EdgeInsets.only(bottom: 24),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    color: const Color(0xFF2563EB).withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(30),
                    border: Border.all(color: const Color(0xFF2563EB).withValues(alpha: 0.25)),
                  ),
                  child: Row(mainAxisSize: MainAxisSize.min, children: [
                    const Icon(LucideIcons.building2, color: Color(0xFF60A5FA), size: 14),
                    const SizedBox(width: 8),
                    Text(auth.hospitalSlug!.toUpperCase(),
                      style: const TextStyle(color: Color(0xFF60A5FA), fontSize: 11, fontWeight: FontWeight.w900, letterSpacing: 1.5)),
                  ]),
                ),

              // Card
              Container(
                padding: const EdgeInsets.all(28),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.025),
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: Colors.white.withValues(alpha: 0.06)),
                ),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  const Text('STAFF LOGIN', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w900, letterSpacing: 1)),
                  const SizedBox(height: 4),
                  Text('Enter your credentials to access the system',
                    style: TextStyle(color: Colors.white.withValues(alpha: 0.45), fontSize: 13)),
                  const SizedBox(height: 28),

                  _field(controller: _emailCtrl,    label: 'EMAIL',    icon: LucideIcons.mail, hint: 'staff@hospital.demo'),
                  const SizedBox(height: 14),
                  _passwordField(),
                  const SizedBox(height: 28),

                  // Error
                  if (_error != null) ...[
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      margin: const EdgeInsets.only(bottom: 16),
                      decoration: BoxDecoration(
                        color: const Color(0xFFE11D48).withValues(alpha: 0.08),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFE11D48).withValues(alpha: 0.2)),
                      ),
                      child: Row(children: [
                        const Icon(LucideIcons.alertCircle, color: Color(0xFFE11D48), size: 15),
                        const SizedBox(width: 8),
                        Expanded(child: Text(_error!, style: const TextStyle(color: Color(0xFFE11D48), fontSize: 13))),
                      ]),
                    ),
                  ],

                  // Login button
                  SizedBox(width: double.infinity, child: ElevatedButton(
                    onPressed: _isLoading ? null : _login,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF2563EB),
                      foregroundColor: Colors.white,
                      disabledBackgroundColor: const Color(0xFF2563EB).withValues(alpha: 0.5),
                      padding: const EdgeInsets.symmetric(vertical: 18),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      elevation: 0,
                    ),
                    child: _isLoading
                        ? const SizedBox(height: 20, width: 20,
                            child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                        : const Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                            Icon(LucideIcons.shieldCheck, size: 16),
                            SizedBox(width: 8),
                            Text('AUTHORIZE ACCESS', style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: 1)),
                          ]),
                  )),
                ]),
              ),

              // Change hospital (re-run setup)
              const SizedBox(height: 20),
              TextButton.icon(
                onPressed: () => _showChangeHospitalDialog(context),
                icon: const Icon(LucideIcons.refreshCw, size: 14, color: Colors.white30),
                label: const Text('Change hospital', style: TextStyle(color: Colors.white30, fontSize: 12)),
              ),

              // Connection status
              const SizedBox(height: 12),
              _ConnectionBadge(),
            ]),
          ),
        ))),
      ]),
    );
  }

  Widget _field({required TextEditingController controller, required String label, required IconData icon, String? hint}) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.04),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
      ),
      child: TextField(
        controller: controller,
        keyboardType: TextInputType.emailAddress,
        style: const TextStyle(color: Colors.white, fontSize: 15),
        decoration: InputDecoration(
          labelText: label,
          hintText: hint,
          hintStyle: TextStyle(color: Colors.white.withValues(alpha: 0.2), fontSize: 13),
          labelStyle: TextStyle(color: Colors.white.withValues(alpha: 0.4), fontSize: 11, fontWeight: FontWeight.w900, letterSpacing: 1),
          prefixIcon: Icon(icon, color: const Color(0xFF2563EB), size: 18),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        ),
      ),
    );
  }

  Widget _passwordField() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.04),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
      ),
      child: TextField(
        controller: _passwordCtrl,
        obscureText: _obscure,
        style: const TextStyle(color: Colors.white, fontSize: 15),
        decoration: InputDecoration(
          labelText: 'PASSWORD',
          labelStyle: TextStyle(color: Colors.white.withValues(alpha: 0.4), fontSize: 11, fontWeight: FontWeight.w900, letterSpacing: 1),
          prefixIcon: const Icon(LucideIcons.lock, color: Color(0xFF2563EB), size: 18),
          suffixIcon: IconButton(
            icon: Icon(_obscure ? LucideIcons.eyeOff : LucideIcons.eye, color: Colors.white30, size: 18),
            onPressed: () => setState(() => _obscure = !_obscure),
          ),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        ),
      ),
    );
  }

  void _showChangeHospitalDialog(BuildContext context) {
    showDialog(context: context, builder: (_) => AlertDialog(
      backgroundColor: const Color(0xFF0F172A),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      title: const Text('Change Hospital?', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      content: Text('This will clear your current setup and take you back to the setup wizard.',
        style: TextStyle(color: Colors.white.withValues(alpha: 0.6), fontSize: 14)),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context), child: const Text('CANCEL', style: TextStyle(color: Colors.white38))),
        ElevatedButton(
          onPressed: () async {
            final prefs = await SharedPreferences.getInstance();
            await prefs.clear();
            if (context.mounted) Navigator.pushReplacementNamed(context, '/setup');
          },
          style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFE11D48), foregroundColor: Colors.white),
          child: const Text('RESET', style: TextStyle(fontWeight: FontWeight.bold)),
        ),
      ],
    ));
  }
}

// ─── Connection status badge ──────────────────────────────────────────────
class _ConnectionBadge extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final conn = Provider.of<ConnectivityService>(context);
    final (color, label, icon) = switch (conn.status) {
      ConnectionStatus.online   => conn.useLocal
          ? (const Color(0xFF22C55E), 'LAN Connected',   LucideIcons.wifi)
          : (const Color(0xFF60A5FA), 'Cloud Connected', LucideIcons.cloud)
      ,
      ConnectionStatus.degraded => (const Color(0xFFF59E0B), 'Slow Connection', LucideIcons.wifiOff),
      ConnectionStatus.offline  => (const Color(0xFFE11D48), 'Offline',          LucideIcons.wifiOff),
      _                         => (Colors.white38,           'Checking…',        LucideIcons.loader),
    };
    return Row(mainAxisAlignment: MainAxisAlignment.center, children: [
      Container(width: 6, height: 6, decoration: BoxDecoration(shape: BoxShape.circle, color: color)),
      const SizedBox(width: 6),
      Icon(icon, color: color, size: 13),
      const SizedBox(width: 4),
      Text(label, style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.w600)),
    ]);
  }
}
