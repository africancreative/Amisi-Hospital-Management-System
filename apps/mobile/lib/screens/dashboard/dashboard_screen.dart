import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_theme.dart';
import '../../components/sync_status_widget.dart';
import '../../services/sync_service.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 20),
              _buildHeader(),
              const SizedBox(height: 24),
              const SyncStatusWidget(),
              const SizedBox(height: 32),
              _buildStatsRow(),
              const SizedBox(height: 32),
              const Text(
                'Clinical Workspace',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 16),
              _buildActionGrid(),
              const SizedBox(height: 32),
              _buildRecentActivityHeader(),
              const SizedBox(height: 16),
              _buildRecentActivityList(),
              const SizedBox(height: 100),
            ],
          ),
        ),
      ),
      bottomNavigationBar: _buildBottomNavBar(),
    );
  }

  Widget _buildHeader() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Monday, May 11',
              style: TextStyle(color: AppTheme.textGray, fontSize: 14),
            ),
            const Text(
              'Hello, Dr. Amisi',
              style: TextStyle(
                color: Colors.white,
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        Row(
          children: [
            _buildIconButton(LucideIcons.search),
            const SizedBox(width: 12),
            _buildIconButton(LucideIcons.bell, hasBadge: true),
          ],
        ),
      ],
    ).animate().fadeIn(duration: 400.ms).slideX(begin: -0.1);
  }

  Widget _buildIconButton(IconData icon, {bool hasBadge = false}) {
    return Container(
      width: 44,
      height: 44,
      decoration: BoxDecoration(
        color: AppTheme.cardDark,
        shape: BoxShape.circle,
        border: Border.all(color: const Color(0xFF1F2937)),
      ),
      child: Stack(
        alignment: Center,
        children: [
          Icon(icon, size: 20, color: AppTheme.textGray),
          if (hasBadge)
            Positioned(
              top: 10,
              right: 12,
              child: Container(
                width: 8,
                height: 8,
                decoration: const BoxDecoration(
                  color: AppTheme.errorRed,
                  shape: BoxShape.circle,
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildStatsRow() {
    return Row(
      children: [
        Expanded(
          child: _buildStatCard(
            'Active Queue',
            '12',
            LucideIcons.activity,
            AppTheme.primaryBlue,
            trend: '+2 from 1h ago',
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: _buildStatCard(
            'Appointments',
            '08',
            LucideIcons.calendar,
            const Color(0xFF1F2937),
            subtext: 'Next: 14:30 PM',
          ),
        ),
      ],
    ).animate().fadeIn(delay: 200.ms).slideY(begin: 0.1);
  }

  Widget _buildStatCard(String title, String value, IconData icon, Color color, {String? trend, String? subtext}) {
    final isPrimary = color == AppTheme.primaryBlue;
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(24),
        border: isPrimary ? null : Border.all(color: const Color(0xFF1F2937)),
        boxShadow: isPrimary ? [
          BoxShadow(
            color: color.withOpacity(0.3),
            blurRadius: 20,
            offset: const Offset(0, 8),
          )
        ] : null,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: isPrimary ? Colors.white : AppTheme.primaryBlue, size: 24),
          const SizedBox(height: 12),
          Text(
            title,
            style: TextStyle(
              color: isPrimary ? Colors.white.withOpacity(0.8) : AppTheme.textGray,
              fontSize: 14,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 32,
              fontWeight: FontWeight.bold,
            ),
          ),
          if (trend != null) ...[
            const SizedBox(height: 8),
            Row(
              children: [
                const Icon(LucideIcons.trendingUp, size: 12, color: Colors.white),
                const SizedBox(width: 4),
                Text(
                  trend,
                  style: TextStyle(color: Colors.white.withOpacity(0.6), fontSize: 10),
                ),
              ],
            ),
          ],
          if (subtext != null) ...[
            const SizedBox(height: 8),
            Text(
              subtext,
              style: const TextStyle(color: Color(0xFF4B5563), fontSize: 10, fontWeight: FontWeight.bold),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildActionGrid() {
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 4,
      mainAxisSpacing: 16,
      crossAxisSpacing: 16,
      children: [
        _buildActionItem(LucideIcons.users, 'Patients', Colors.blue),
        _buildActionItem(LucideIcons.clipboardList, 'EMR', Colors.green),
        _buildActionItem(LucideIcons.messageSquare, 'Consults', Colors.purple),
        _buildActionItem(LucideIcons.calendar, 'Schedule', Colors.orange),
      ],
    ).animate().fadeIn(delay: 400.ms);
  }

  Widget _buildActionItem(IconData icon, String label, Color color) {
    return Column(
      children: [
        Container(
          width: 56,
          height: 56,
          decoration: BoxDecoration(
            color: AppTheme.cardDark,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFF1F2937)),
          ),
          child: Icon(icon, color: color, size: 24),
        ),
        const SizedBox(height: 8),
        Text(
          label,
          style: TextStyle(color: AppTheme.textGray, fontSize: 10, fontWeight: FontWeight.w500),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  Widget _buildRecentActivityHeader() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        const Text(
          'Recent Patients',
          style: TextStyle(
            color: Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        TextButton(
          onPressed: () {},
          child: const Text('See All', style: TextStyle(color: AppTheme.primaryBlue, fontWeight: FontWeight.bold)),
        ),
      ],
    );
  }

  Widget _buildRecentActivityList() {
    return Column(
      children: [
        _buildPatientCard('John Doe', 'PT-4501', 'Triaged', '10m ago'),
        _buildPatientCard('Sarah Wilson', 'PT-4502', 'In Treatment', '25m ago'),
        _buildPatientCard('Robert Smith', 'PT-4498', 'Waiting', '45m ago'),
      ],
    ).animate().fadeIn(delay: 600.ms).slideY(begin: 0.1);
  }

  Widget _buildPatientCard(String name, String id, String status, String time) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.cardDark,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFF1F2937)),
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: const Color(0xFF1F2937),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Center(
              child: Text(
                name[0],
                style: TextStyle(color: AppTheme.textGray, fontWeight: FontWeight.bold),
              ),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                Text(id, style: TextStyle(color: AppTheme.textGray, fontSize: 12)),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: AppTheme.successGreen.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppTheme.successGreen.withOpacity(0.2)),
                ),
                child: Text(
                  status.toUpperCase(),
                  style: const TextStyle(color: AppTheme.successGreen, fontSize: 10, fontWeight: FontWeight.bold),
                ),
              ),
              const SizedBox(height: 4),
              Text(time, style: const TextStyle(color: Color(0xFF4B5563), fontSize: 10)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildBottomNavBar() {
    return Container(
      height: 90,
      decoration: const BoxDecoration(
        color: AppTheme.backgroundDark,
        border: Border(top: BorderSide(color: Color(0xFF161B2C))),
      ),
      child: Stack(
        alignment: Alignment.topCenter,
        children: [
          Padding(
            padding: const EdgeInsets.only(top: 10),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildNavItem(LucideIcons.layoutDashboard, 'Home', true),
                _buildNavItem(LucideIcons.users, 'Patients', false),
                const SizedBox(width: 60),
                _buildNavItem(LucideIcons.messageSquare, 'Chat', false),
                _buildNavItem(LucideIcons.settings, 'Settings', false),
              ],
            ),
          ),
          Positioned(
            top: -20,
            child: GestureDetector(
              onTap: () => _showQuickAction(context),
              child: Container(
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  color: AppTheme.primaryBlue,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: AppTheme.primaryBlue.withOpacity(0.4),
                      blurRadius: 20,
                      offset: const Offset(0, 8),
                    )
                  ],
                  border: Border.all(color: AppTheme.backgroundDark, width: 4),
                ),
                child: const Icon(LucideIcons.plus, color: Colors.white, size: 32),
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showQuickAction(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppTheme.backgroundDark,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
      ),
      builder: (context) => Container(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: const Color(0xFF1F2937),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              'Quick Vitals Entry',
              style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 32),
            _buildVitalsInput('Blood Pressure', '120/80', LucideIcons.activity),
            const SizedBox(height: 16),
            _buildVitalsInput('Temperature', '36.5°C', LucideIcons.thermometer),
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  // Example of using the SyncService for a failsafe action
                  Provider.of<SyncService>(context, listen: false).performAction(
                    actionType: 'VITALS',
                    endpoint: '/api/clinical/vitals',
                    payload: {
                      'patientId': 'selected-patient-id',
                      'bp': '120/80',
                      'temp': '36.5',
                    },
                  );
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Vitals recorded (Syncing...)')),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryBlue,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                child: const Text('Record Vitals', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              ),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildVitalsInput(String label, String hint, IconData icon) {
    return TextField(
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        prefixIcon: Icon(icon, size: 20),
      ),
    );
  }

  Widget _buildNavItem(IconData icon, String label, bool isActive) {
// ...
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, color: isActive ? AppTheme.primaryBlue : AppTheme.textGray, size: 24),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            color: isActive ? AppTheme.primaryBlue : AppTheme.textGray,
            fontSize: 10,
            fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ],
    );
  }
}
