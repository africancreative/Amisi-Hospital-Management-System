import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../services/patient_service.dart';
import '../clinical/rounds_screen.dart';
import '../clinical/mar_screen.dart';

class PatientDetailScreen extends StatelessWidget {
  final Patient patient;

  const PatientDetailScreen({super.key, required this.patient});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text(patient.fullName.toUpperCase(), style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w900, letterSpacing: 2)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Patient Header Card
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF2563EB), Color(0xFF1E40AF)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(32),
                boxShadow: [
                  BoxShadow(color: const Color(0xFF2563EB).withValues(alpha: 0.3), blurRadius: 20, offset: const Offset(0, 10))
                ],
              ),
              child: Column(
                children: [
                  Row(
                    children: [
                      Container(
                        width: 64,
                        height: 64,
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: const Icon(LucideIcons.user, color: Colors.white, size: 32),
                      ),
                      const SizedBox(width: 20),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              patient.fullName.toUpperCase(),
                              style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w900, fontStyle: FontStyle.italic),
                            ),
                            Text(
                              'MRN: ${patient.mrn}',
                              style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _buildInfoBadge('AGE', '42Y', LucideIcons.calendar),
                      _buildInfoBadge('GENDER', 'MALE', LucideIcons.user),
                      _buildInfoBadge('BLOOD', 'A+', LucideIcons.droplets),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 40),
            const Text(
              'CLINICAL ACTIONS',
              style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w900, letterSpacing: 2, fontStyle: FontStyle.italic),
            ),
            const SizedBox(height: 20),

            _buildActionCard(
              context,
              'WARD ROUNDS',
              'Record physical exam and daily progress',
              LucideIcons.clipboardList,
              const Color(0xFF2563EB),
              () => Navigator.push(context, MaterialPageRoute(builder: (context) => RoundsScreen(patient: patient))),
            ),
            const SizedBox(height: 16),
            _buildActionCard(
              context,
              'MAR (MEDICATIONS)',
              'Administer and track patient prescriptions',
              LucideIcons.pill,
              const Color(0xFF10B981),
              () => Navigator.push(context, MaterialPageRoute(builder: (context) => MARScreen(patient: patient))),
            ),
            const SizedBox(height: 16),
            _buildActionCard(
              context,
              'VITAL SIGNS',
              'Log blood pressure, heart rate, temp',
              LucideIcons.activity,
              Colors.amber,
              () {},
            ),

            const SizedBox(height: 40),
            const Text(
              'PATIENT TIMELINE',
              style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w900, letterSpacing: 2, fontStyle: FontStyle.italic),
            ),
            const SizedBox(height: 20),
            _buildTimelineItem('ADMISSION', 'Admitted to Male Ward, Bed 12', '2h ago'),
            _buildTimelineItem('MEDICATION', 'Panadol 500mg given by Nurse Sarah', '4h ago'),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoBadge(String label, String value, IconData icon) {
    return Column(
      children: [
        Icon(icon, color: Colors.white.withValues(alpha: 0.5), size: 16),
        const SizedBox(height: 4),
        Text(value, style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
        Text(label, style: TextStyle(color: Colors.white.withValues(alpha: 0.5), fontSize: 8, fontWeight: FontWeight.bold)),
      ],
    );
  }

  Widget _buildActionCard(BuildContext context, String title, String subtitle, IconData icon, Color color, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.05),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Icon(icon, color: color, size: 24),
            ),
            const SizedBox(width: 20),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 14, letterSpacing: 1)),
                  const SizedBox(height: 4),
                  Text(subtitle, style: TextStyle(color: Colors.white.withValues(alpha: 0.5), fontSize: 11)),
                ],
              ),
            ),
            Icon(LucideIcons.chevronRight, color: Colors.white.withValues(alpha: 0.2), size: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildTimelineItem(String title, String desc, String time) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.only(left: 16, bottom: 16),
      decoration: const BoxDecoration(
        border: Border(left: BorderSide(color: Color(0xFF2563EB), width: 2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(title, style: const TextStyle(color: Color(0xFF2563EB), fontWeight: FontWeight.w900, fontSize: 10, letterSpacing: 1)),
              Text(time, style: TextStyle(color: Colors.white.withValues(alpha: 0.3), fontSize: 10)),
            ],
          ),
          const SizedBox(height: 4),
          Text(desc, style: const TextStyle(color: Colors.white, fontSize: 13)),
        ],
      ),
    );
  }
}
