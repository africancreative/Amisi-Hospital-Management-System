import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../core/theme/app_theme.dart';

class SetupScreen extends StatefulWidget {
  const SetupScreen({super.key});

  @override
  State<SetupScreen> createState() => _SetupScreenState();
}

class _SetupScreenState extends State<SetupScreen> {
  final _slugController = TextEditingController();
  final _ipController = TextEditingController();
  bool _isLoading = false;

  void _handleSetup() async {
    if (_slugController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Hospital Slug is required')),
      );
      return;
    }
    setState(() => _isLoading = true);
    await Future.delayed(const Duration(seconds: 2));
    if (mounted) {
      Navigator.pushReplacementNamed(context, '/login');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(32),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 40),
              const Icon(LucideIcons.hospital, size: 56, color: AppTheme.primaryBlue),
              const SizedBox(height: 24),
              const Text(
                'Welcome to\nAmisiMedOS',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                  height: 1.2,
                ),
              ),
              const SizedBox(height: 12),
              const Text(
                'Initialize your clinical node connection.',
                style: TextStyle(color: AppTheme.textGray, fontSize: 18),
              ),
              const SizedBox(height: 48),
              _buildFieldLabel('Hospital Slug'),
              TextField(
                controller: _slugController,
                decoration: const InputDecoration(
                  hintText: 'e.g. amisi-general',
                  prefixIcon: Icon(LucideIcons.globe, size: 20),
                ),
              ),
              const SizedBox(height: 24),
              _buildFieldLabel('Local Node IP (Optional)'),
              TextField(
                controller: _ipController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  hintText: '192.168.1.100',
                  prefixIcon: Icon(LucideIcons.database, size: 20),
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Enable high-speed local sync in LAN mode.',
                style: TextStyle(color: Color(0xFF4B5563), fontSize: 12),
              ),
              const SizedBox(height: 48),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _handleSetup,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryBlue,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 20),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20),
                    ),
                    elevation: 8,
                    shadowColor: AppTheme.primaryBlue.withOpacity(0.4),
                  ),
                  child: _isLoading 
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text('Continue', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                ),
              ),
              const SizedBox(height: 32),
              const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(LucideIcons.shieldCheck, size: 16, color: AppTheme.successGreen),
                  SizedBox(width: 8),
                  Text(
                    'HIPAA Compliant & Secured',
                    style: TextStyle(color: Color(0xFF4B5563), fontSize: 12),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFieldLabel(String label) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8, left: 4),
      child: Text(
        label,
        style: const TextStyle(
          color: Colors.white70,
          fontSize: 14,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}
