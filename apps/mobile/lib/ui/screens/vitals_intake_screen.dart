import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:amisi_mobile/data/local/database.dart';
import 'package:amisi_mobile/data/repositories/patient_repository.dart';

/**
 * HealthOS Vitals Intake Screen
 * Bedside data entry for clinical vitals, designed for offline-first resilience.
 */
class VitalsIntakeScreen extends StatefulWidget {
  final Patient patient;

  const VitalsIntakeScreen({super.key, required this.patient});

  @override
  State<VitalsIntakeScreen> createState() => _VitalsIntakeScreenState();
}

class _VitalsIntakeScreenState extends State<VitalsIntakeScreen> {
  final _formKey = GlobalKey<FormState>();
  final _bpController = TextEditingController();
  final _hrController = TextEditingController();
  final _tempController = TextEditingController();

  bool _isSaving = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Record Vitals'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _buildHeader(),
              const SizedBox(height: 32),
              _buildVitalsInput(
                label: 'Blood Pressure',
                hint: 'e.g. 120/80',
                controller: _bpController,
                icon: Icons.heart_broken_outlined,
              ),
              const SizedBox(height: 16),
              _buildVitalsInput(
                label: 'Heart Rate (BPM)',
                hint: 'e.g. 72',
                controller: _hrController,
                icon: Icons.monitor_heart_outlined,
                keyboardType: TextInputType.number,
              ),
              const SizedBox(height: 16),
              _buildVitalsInput(
                label: 'Temperature (C)',
                hint: 'e.g. 36.6',
                controller: _tempController,
                icon: Icons.thermostat_outlined,
                keyboardType: TextInputType.number,
              ),
              const SizedBox(height: 48),
              _buildSaveButton(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.blue.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.blue.withOpacity(0.3)),
      ),
      child: Row(
        children: [
          const CircleAvatar(
            backgroundColor: Color(0xFF1A1A1A),
            child: Icon(Icons.person, color: Colors.blue),
          ),
          const SizedBox(width: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '${widget.patient.firstName} ${widget.patient.lastName}',
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
              ),
              const Text('Patient Record Active', style: TextStyle(color: Colors.blue, fontSize: 12)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildVitalsInput({
    required String label,
    required String hint,
    required TextEditingController controller,
    required IconData icon,
    TextInputType keyboardType = TextInputType.text,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.grey)),
        const SizedBox(height: 8),
        TextFormField(
          controller: controller,
          keyboardType: keyboardType,
          style: const TextStyle(fontSize: 18),
          decoration: InputDecoration(
            hintText: hint,
            prefixIcon: Icon(icon, size: 20),
            filled: true,
            fillColor: const Color(0xFF1A1A1A),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide.none,
            ),
          ),
          validator: (value) => value!.isEmpty ? 'Field required' : null,
        ),
      ],
    );
  }

  Widget _buildSaveButton() {
    return ElevatedButton(
      onPressed: _isSaving ? null : _saveVitals,
      style: ElevatedButton.styleFrom(
        backgroundColor: Colors.blue,
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(vertical: 16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
      child: _isSaving
          ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
          : const Text('Record Offline', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
    );
  }

  Future<void> _saveVitals() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSaving = true);
    final repository = context.read<PatientRepository>();

    try {
      await repository.recordVitals(
        patientId: widget.patient.id,
        bloodPressure: _bpController.text,
        heartRate: int.parse(_hrController.text),
        temperature: double.tryParse(_tempController.text),
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Vitals recorded offline. Syncing in background.'),
            backgroundColor: Colors.green,
            behavior: SnackBarBehavior.floating,
          ),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  void dispose() {
    _bpController.dispose();
    _hrController.dispose();
    _tempController.dispose();
    super.dispose();
  }
}
