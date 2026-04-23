import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'auth.dart';
import 'connectivity.dart';

class TenantBranding {
  final String name;
  final String? logoUrl;
  final String primaryColor;
  final String secondaryColor;
  final String? trialEndsAt;
  final String status;

  TenantBranding({
    required this.name,
    this.logoUrl,
    required this.primaryColor,
    required this.secondaryColor,
    this.trialEndsAt,
    required this.status,
  });

  factory TenantBranding.fromJson(Map<String, dynamic> json) => TenantBranding(
    name: json['name'] as String,
    logoUrl: json['logoUrl'] as String?,
    primaryColor: json['primaryColor'] as String? ?? '#2563EB',
    secondaryColor: json['secondaryColor'] as String? ?? '#0F172A',
    trialEndsAt: json['trialEndsAt'] as String?,
    status: json['status'] as String? ?? 'active',
  );
}

class TenantService extends ChangeNotifier {
  static final TenantService _instance = TenantService._internal();
  factory TenantService() => _instance;
  TenantService._internal();

  TenantBranding? _branding;
  TenantBranding? get branding => _branding;

  Future<void> loadBranding(String slug) async {
    final router = NetworkRouter();
    try {
      // Fetch from the license endpoint
      final data = await router.get('/api/tenant/license?slug=$slug');
      if (data != null) {
        _branding = TenantBranding.fromJson(data);
        notifyListeners();
      }
    } catch (e) {
      debugPrint('[TenantService] Failed to load branding: $e');
    }
  }

  bool get isSuspended => _branding?.status == 'suspended';
  bool get isDemoExpired {
    if (_branding?.trialEndsAt == null) return false;
    final expiry = DateTime.parse(_branding!.trialEndsAt!);
    return DateTime.now().isAfter(expiry);
  }
}
