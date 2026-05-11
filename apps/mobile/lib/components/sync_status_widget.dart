import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../services/connectivity.dart';
import '../services/sync_service.dart';
import '../core/theme/app_theme.dart';

class SyncStatusWidget extends StatelessWidget {
  const SyncStatusWidget({super.key});

  @override
  Widget build(BuildContext context) {
    final connectivity = Provider.of<ConnectivityService>(context);
    final syncService = Provider.of<SyncService>(context);

    final bool isOnline = connectivity.isOnline;
    final bool isSyncing = syncService.isSyncing;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: AppTheme.cardDark,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFF1F2937)),
      ),
      child: Row(
        children: [
          _buildStatusDot(isOnline),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  isOnline ? 'Network: Online' : 'Network: Offline',
                  style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                ),
                Text(
                  isSyncing 
                    ? syncService.currentTask
                    : 'Last sync: ${syncService.lastSyncTime != null ? _formatTime(syncService.lastSyncTime!) : 'Never'}',
                  style: const TextStyle(color: AppTheme.textGray, fontSize: 10),
                ),
              ],
            ),
          ),
          if (isSyncing)
            const SizedBox(
              width: 16,
              height: 16,
              child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.primaryBlue),
            )
          else
            IconButton(
              onPressed: isOnline ? () => syncService.syncAll() : null,
              icon: Icon(
                LucideIcons.refreshCw, 
                size: 16, 
                color: isOnline ? AppTheme.primaryBlue : Color(0xFF374151)
              ),
              padding: EdgeInsets.zero,
              constraints: const BoxConstraints(),
            ),
        ],
      ),
    );
  }

  Widget _buildStatusDot(bool isOnline) {
    return Container(
      width: 8,
      height: 8,
      decoration: BoxDecoration(
        color: isOnline ? AppTheme.successGreen : AppTheme.errorRed,
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(
            color: (isOnline ? AppTheme.successGreen : AppTheme.errorRed).withOpacity(0.4),
            blurRadius: 4,
            spreadRadius: 1,
          )
        ],
      ),
    );
  }

  String _formatTime(DateTime dt) {
    return '${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
  }
}
