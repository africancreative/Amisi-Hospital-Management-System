import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/auth.dart';
import '../../services/tenant.dart';
import '../../services/connectivity.dart';
import 'package:lucide_icons/lucide_icons.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _slugController = TextEditingController();
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;
  String? _error;

  Future<void> _handleLogin() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final auth = Provider.of<AuthState>(context, listen: false);
      final tenant = Provider.of<TenantService>(context, listen: false);
      final connectivity = Provider.of<ConnectivityService>(context, listen: false);

      // 1. Fetch Branding/Tenant Info
      await tenant.loadBranding(_slugController.text.trim());
      if (tenant.branding == null) {
        throw Exception('Hospital not found');
      }

      // 2. Configure Connectivity for this tenant
      connectivity.configure(_slugController.text.trim());
      await connectivity.check();

      // 3. Mock Auth (In a real app, call /api/auth/login)
      auth.login(
        hospitalSlug: _slugController.text.trim(),
        hospitalName: tenant.branding!.name,
        userId: 'u-123',
        userRole: 'DOCTOR',
        userName: _usernameController.text.trim(),
      );

      if (mounted) {
        Navigator.pushReplacementNamed(context, '/dashboard');
      }
    } catch (e) {
      setState(() {
        _error = e.toString().replaceAll('Exception: ', '');
      });
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: Stack(
        children: [
          // Background accents
          Positioned(
            top: -100,
            right: -100,
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFF2563EB).withOpacity(0.1),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(32.0),
            child: Center(
              child: SingleChildScrollView(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Container(
                      height: 120,
                      decoration: const BoxDecoration(
                        image: DecorationImage(
                          image: AssetImage('assets/logo.png'),
                          fit: BoxFit.contain,
                        ),
                      ),
                    ),
                    const SizedBox(height: 48),
                    _buildTextField(
                      controller: _slugController,
                      label: 'HOSPITAL ID / SLUG',
                      icon: LucideIcons.building2,
                    ),
                    const SizedBox(height: 16),
                    _buildTextField(
                      controller: _usernameController,
                      label: 'USERNAME',
                      icon: LucideIcons.user,
                    ),
                    const SizedBox(height: 16),
                    _buildTextField(
                      controller: _passwordController,
                      label: 'SECURITY PIN',
                      icon: LucideIcons.lock,
                      isPassword: true,
                    ),
                    const SizedBox(height: 32),
                    if (_error != null)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 16),
                        child: Text(
                          _error!,
                          textAlign: TextAlign.center,
                          style: const TextStyle(color: Color(0xFFE11D48), fontWeight: FontWeight.bold),
                        ),
                      ),
                    ElevatedButton(
                      onPressed: _isLoading ? null : _handleLogin,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF2563EB),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 20),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        elevation: 0,
                      ),
                      child: _isLoading
                          ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                          : const Text('AUTHORIZE ACCESS', style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: 1)),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    bool isPassword = false,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      child: TextField(
        controller: controller,
        obscureText: isPassword,
        style: const TextStyle(color: Colors.white),
        decoration: InputDecoration(
          labelText: label,
          labelStyle: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1),
          prefixIcon: Icon(icon, color: const Color(0xFF2563EB), size: 20),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        ),
      ),
    );
  }
}
