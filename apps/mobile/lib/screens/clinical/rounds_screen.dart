import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../services/patient_service.dart';
import '../../services/sync_service.dart';

class RoundsScreen extends StatefulWidget {
  final Patient patient;

  const RoundsScreen({super.key, required this.patient});

  @override
  State<RoundsScreen> createState() => _RoundsScreenState();
}

class _RoundsScreenState extends State<RoundsScreen> {
  final _syncService = SyncService();
  final _notesController = TextEditingController();
  final _planController = TextEditingController();
  String _stability = 'STABLE';
  bool _isSaving = false;

  Future<void> _saveRounds() async {
    setState(() => _isSaving = true);

    await _syncService.recordRounds(
      patientId: widget.patient.id,
      data: {
        'stability': _stability,
        'clinicalNotes': _notesController.text,
        'plan': _planController.text,
      },
    );

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('WARD ROUNDS RECORDED SUCCESSFULLY'),
          backgroundColor: Color(0xFF10B981),
        ),
      );
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text('WARD ROUNDS', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w900, letterSpacing: 2)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildStabilitySelector(),
            const SizedBox(height: 32),
            _buildInputField('CLINICAL NOTES', 'Observe for any new symptoms...', _notesController, 5),
            const SizedBox(height: 24),
            _buildInputField('PLAN / TREATMENT', 'Next steps for this patient...', _planController, 3),
            const SizedBox(height: 40),
            SizedBox(
              width: double.infinity,
              height: 64,
              child: ElevatedButton(
                onPressed: _isSaving ? null : _saveRounds,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF2563EB),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                  elevation: 0,
                ),
                child: _isSaving
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text('SUBMIT CLINICAL ROUND', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, letterSpacing: 1)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStabilitySelector() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('PATIENT STABILITY', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 2)),
        const SizedBox(height: 16),
        Row(
          children: [
            _buildStabilityOption('STABLE', const Color(0xFF10B981)),
            const SizedBox(width: 12),
            _buildStabilityOption('GUARDED', Colors.amber),
            const SizedBox(width: 12),
            _buildStabilityOption('CRITICAL', Colors.red),
          ],
        ),
      ],
    );
  }

  Widget _buildStabilityOption(String label, Color color) {
    final isSelected = _stability == label;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _stability = label),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 16),
          decoration: BoxDecoration(
            color: isSelected ? color.withOpacity(0.1) : Colors.white.withOpacity(0.05),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: isSelected ? color : Colors.white.withOpacity(0.1)),
          ),
          child: Center(
            child: Text(
              label,
              style: TextStyle(color: isSelected ? color : Colors.white.withOpacity(0.5), fontWeight: FontWeight.bold, fontSize: 11),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildInputField(String label, String hint, TextEditingController controller, int lines) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 2)),
        const SizedBox(height: 16),
        Container(
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.05),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: Colors.white.withOpacity(0.1)),
          ),
          child: TextField(
            controller: controller,
            maxLines: lines,
            style: const TextStyle(color: Colors.white),
            decoration: InputDecoration(
              hintText: hint,
              hintStyle: TextStyle(color: Colors.white.withOpacity(0.2)),
              border: InputBorder.none,
              contentPadding: const EdgeInsets.all(20),
            ),
          ),
        ),
      ],
    );
  }
}
