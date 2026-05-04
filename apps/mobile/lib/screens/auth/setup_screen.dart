import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../services/auth.dart';
import '../../services/connectivity.dart';

/// First-run setup screen. Collects:
///  - Hospital slug (validated against cloud)
///  - Local server IP + port (optional, enables LAN mode)
/// After saving, navigates to LoginScreen for credential entry.
class SetupScreen extends StatefulWidget {
  const SetupScreen({super.key});

  @override
  State<SetupScreen> createState() => _SetupScreenState();
}

class _SetupScreenState extends State<SetupScreen> {
  final _slugController    = TextEditingController();
  final _ipController      = TextEditingController(text: '192.168.100.24');
  final _portController    = TextEditingController(text: '3000');

  bool    _isValidating  = false;
  String? _hospitalName;
  String? _error;
  int     _step          = 1; // 1 = slug, 2 = local network, 3 = done

  @override
  void dispose() {
    _slugController.dispose();
    _ipController.dispose();
    _portController.dispose();
    super.dispose();
  }

  /// Validate slug against Neon cloud
  Future<void> _validateSlug() async {
    final slug = _slugController.text.trim();
    if (slug.isEmpty) {
      setState(() => _error = 'Hospital ID is required');
      return;
    }
    setState(() { _isValidating = true; _error = null; });

    try {
      final router = NetworkRouter();
      final data   = await router.get('/api/tenant/license?slug=$slug');
      if (data == null || data['status'] == 'suspended') {
        throw Exception(data?['status'] == 'suspended'
            ? 'This hospital account is suspended. Contact support.'
            : 'Hospital not found. Check the ID and try again.');
      }
      setState(() {
        _hospitalName = data['name'] as String?;
        _step         = 2;
        _error        = null;
      });
    } catch (e) {
      setState(() => _error = e.toString().replaceAll('Exception: ', ''));
    } finally {
      setState(() => _isValidating = false);
    }
  }

  Future<void> _saveAndContinue() async {
    setState(() { _isValidating = true; _error = null; });
    try {
      final auth = Provider.of<AuthState>(context, listen: false);
      final conn = Provider.of<ConnectivityService>(context, listen: false);

      await auth.completeSetup(
        slug:      _slugController.text.trim(),
        localIp:  _ipController.text.trim(),
        localPort: int.tryParse(_portController.text.trim()) ?? 3000,
      );

      // Configure connectivity with saved LAN details
      conn.configure(
        _slugController.text.trim(),
        localIp:  _ipController.text.trim(),
        localPort: int.tryParse(_portController.text.trim()) ?? 3000,
      );
      await conn.check();

      if (mounted) Navigator.pushReplacementNamed(context, '/login');
    } catch (e) {
      setState(() => _error = 'Setup failed: $e');
    } finally {
      setState(() => _isValidating = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0F1E),
      body: Stack(children: [
        // Ambient glow
        Positioned(top: -120, right: -120, child: _glow(const Color(0xFF2563EB))),
        Positioned(bottom: -80, left: -80,  child: _glow(const Color(0xFF7C3AED))),

        SafeArea(child: Center(child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 48),
          child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [

            // Logo
            SizedBox(height: 72, child: Image.asset('assets/logo.png', fit: BoxFit.contain)),
            const SizedBox(height: 32),

            // Step indicator
            _StepIndicator(current: _step, total: 2),
            const SizedBox(height: 32),

            // Card
            Container(
              padding: const EdgeInsets.all(28),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.03),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: Colors.white.withValues(alpha: 0.06)),
              ),
              child: _step == 1 ? _buildStep1() : _buildStep2(),
            ),

            if (_error != null) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                decoration: BoxDecoration(
                  color: const Color(0xFFE11D48).withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFE11D48).withValues(alpha: 0.2)),
                ),
                child: Row(children: [
                  const Icon(LucideIcons.alertCircle, color: Color(0xFFE11D48), size: 16),
                  const SizedBox(width: 8),
                  Expanded(child: Text(_error!, style: const TextStyle(color: Color(0xFFE11D48), fontSize: 13))),
                ]),
              ),
            ],
          ]),
        ))),
      ]),
    );
  }

  Widget _buildStep1() => Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
    const Text('HOSPITAL SETUP', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900, letterSpacing: 1)),
    const SizedBox(height: 4),
    Text('Enter your hospital ID to get started.', style: TextStyle(color: Colors.white.withValues(alpha: 0.5), fontSize: 13)),
    const SizedBox(height: 24),
    _input(controller: _slugController, label: 'HOSPITAL ID', hint: 'e.g. amisi-demo', icon: LucideIcons.building2),
    const SizedBox(height: 24),
    SizedBox(width: double.infinity, child: ElevatedButton(
      onPressed: _isValidating ? null : _validateSlug,
      style: ElevatedButton.styleFrom(
        backgroundColor: const Color(0xFF2563EB),
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(vertical: 18),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        elevation: 0,
      ),
      child: _isValidating
          ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
          : const Text('VERIFY HOSPITAL', style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: 1)),
    )),
  ]);

  Widget _buildStep2() => Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
    Row(children: [
      const Icon(LucideIcons.checkCircle2, color: Color(0xFF22C55E), size: 18),
      const SizedBox(width: 8),
      Expanded(child: Text(_hospitalName ?? 'Hospital verified', style: const TextStyle(color: Color(0xFF22C55E), fontWeight: FontWeight.bold))),
    ]),
    const SizedBox(height: 20),
    const Text('LOCAL NETWORK (OPTIONAL)', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w900, letterSpacing: 1)),
    const SizedBox(height: 4),
    Text('For LAN / offline mode enter your server IP. Leave blank to use cloud only.',
        style: TextStyle(color: Colors.white.withValues(alpha: 0.5), fontSize: 13)),
    const SizedBox(height: 20),
    _input(controller: _ipController,   label: 'SERVER IP',   hint: '192.168.x.x', icon: LucideIcons.network),
    const SizedBox(height: 12),
    _input(controller: _portController, label: 'PORT',        hint: '3000',        icon: LucideIcons.plug),
    const SizedBox(height: 24),
    Row(children: [
      Expanded(child: OutlinedButton(
        onPressed: () => setState(() { _step = 1; }),
        style: OutlinedButton.styleFrom(
          foregroundColor: Colors.white54,
          side: BorderSide(color: Colors.white.withValues(alpha: 0.1)),
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        ),
        child: const Text('BACK'),
      )),
      const SizedBox(width: 12),
      Expanded(flex: 2, child: ElevatedButton(
        onPressed: _isValidating ? null : _saveAndContinue,
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFF2563EB),
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          elevation: 0,
        ),
        child: _isValidating
            ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
            : const Text('COMPLETE SETUP', style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: 0.5)),
      )),
    ]),
  ]);

  Widget _input({required TextEditingController controller, required String label, required String hint, required IconData icon}) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.04),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
      ),
      child: TextField(
        controller: controller,
        style: const TextStyle(color: Colors.white),
        decoration: InputDecoration(
          labelText: label,
          hintText: hint,
          hintStyle: TextStyle(color: Colors.white.withValues(alpha: 0.25), fontSize: 13),
          labelStyle: TextStyle(color: Colors.white.withValues(alpha: 0.45), fontSize: 11, fontWeight: FontWeight.w900, letterSpacing: 1),
          prefixIcon: Icon(icon, color: const Color(0xFF2563EB), size: 18),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        ),
      ),
    );
  }

  Widget _glow(Color color) => Container(
    width: 300, height: 300,
    decoration: BoxDecoration(shape: BoxShape.circle, color: color.withValues(alpha: 0.08)),
  );
}

// ─── Step indicator ───────────────────────────────────────────────────────
class _StepIndicator extends StatelessWidget {
  final int current, total;
  const _StepIndicator({required this.current, required this.total});

  @override
  Widget build(BuildContext context) {
    return Row(mainAxisAlignment: MainAxisAlignment.center, children: [
      for (int i = 1; i <= total; i++) ...[
        if (i > 1) Container(height: 1, width: 32, color: i <= current ? const Color(0xFF2563EB) : Colors.white12),
        Container(
          width: 28, height: 28,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: i <= current ? const Color(0xFF2563EB) : Colors.transparent,
            border: Border.all(color: i <= current ? const Color(0xFF2563EB) : Colors.white24),
          ),
          child: Center(child: Text('$i', style: TextStyle(
            color: i <= current ? Colors.white : Colors.white38,
            fontSize: 12, fontWeight: FontWeight.bold,
          ))),
        ),
      ]
    ]);
  }
}
