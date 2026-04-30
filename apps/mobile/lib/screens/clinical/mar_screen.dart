import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../services/patient_service.dart';
import '../../services/sync_service.dart';

class MARScreen extends StatefulWidget {
  final Patient patient;

  const MARScreen({super.key, required this.patient});

  @override
  State<MARScreen> createState() => _MARScreenState();
}

class _MARScreenState extends State<MARScreen> {
  final _syncService = SyncService();

  final List<Map<String, dynamic>> _prescriptions = [
    {'name': 'Paracetamol', 'dosage': '1g', 'frequency': 'TID', 'status': 'PENDING'},
    {'name': 'Amoxicillin', 'dosage': '500mg', 'frequency': 'BID', 'status': 'GIVEN'},
    {'name': 'Ceftriaxone', 'dosage': '1g', 'frequency': 'OD', 'status': 'PENDING'},
  ];

  Future<void> _administerMed(int index) async {
    final med = _prescriptions[index];
    if (med['status'] == 'GIVEN') return;

    await _syncService.recordMAR(
      patientId: widget.patient.id,
      data: {
        'medicationName': med['name'],
        'dosage': med['dosage'],
        'route': 'ORAL',
        'status': 'GIVEN',
      },
    );

    setState(() {
      _prescriptions[index]['status'] = 'GIVEN';
    });

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('${med['name'].toUpperCase()} ADMINISTERED'),
          backgroundColor: const Color(0xFF10B981),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text('MEDICATION ADMINISTRATION', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w900, letterSpacing: 2)),
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(24),
        itemCount: _prescriptions.length,
        itemBuilder: (context, index) {
          final med = _prescriptions[index];
          final isGiven = med['status'] == 'GIVEN';

          return Container(
            margin: const EdgeInsets.only(bottom: 16),
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: isGiven ? const Color(0xFF10B981).withValues(alpha: 0.05) : Colors.white.withValues(alpha: 0.05),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: isGiven ? const Color(0xFF10B981).withValues(alpha: 0.3) : Colors.white.withValues(alpha: 0.1)),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: isGiven ? const Color(0xFF10B981).withValues(alpha: 0.1) : Colors.blue.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Icon(LucideIcons.pill, color: isGiven ? const Color(0xFF10B981) : Colors.blue, size: 24),
                ),
                const SizedBox(width: 20),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(med['name'].toUpperCase(), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 14)),
                      const SizedBox(height: 4),
                      Text('${med['dosage']} • ${med['frequency']}', style: TextStyle(color: Colors.white.withValues(alpha: 0.5), fontSize: 11)),
                    ],
                  ),
                ),
                ElevatedButton(
                  onPressed: isGiven ? null : () => _administerMed(index),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: isGiven ? Colors.transparent : const Color(0xFF2563EB),
                    elevation: 0,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  ),
                  child: Text(
                    isGiven ? 'GIVEN' : 'GIVE',
                    style: TextStyle(
                      color: isGiven ? const Color(0xFF10B981) : Colors.white,
                      fontWeight: FontWeight.w900,
                      fontSize: 10,
                      letterSpacing: 1,
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
