import 'dart:convert';
import 'connectivity.dart';
import 'package:flutter/foundation.dart';

class InventoryItem {
  final String id;
  final String name;
  final int quantity;
  final int minLevel;
  final String category;

  InventoryItem({
    required this.id,
    required this.name,
    required this.quantity,
    required this.minLevel,
    required this.category,
  });

  factory InventoryItem.fromJson(Map<String, dynamic> json) => InventoryItem(
    id: json['id'],
    name: json['name'],
    quantity: json['quantity'] as int,
    minLevel: json['minLevel'] as int,
    category: json['category'],
  );
}

class Prescription {
  final String id;
  final String patientName;
  final String status;
  final List<dynamic> items;

  Prescription({
    required this.id,
    required this.patientName,
    required this.status,
    required this.items,
  });

  factory Prescription.fromJson(Map<String, dynamic> json) => Prescription(
    id: json['id'],
    patientName: '${json['patient']['firstName']} ${json['patient']['lastName']}',
    status: json['status'],
    items: json['items'] as List,
  );
}

class PharmacyService {
  final NetworkRouter _router = NetworkRouter();

  Future<List<InventoryItem>> getInventory(String? search) async {
    try {
      final response = await _router.get(
        '/api/trpc/pharmacy.getInventoryItems?batch=1&input=${Uri.encodeComponent(jsonEncode({
          "0": {"search": search}
        }))}',
      );

      if (response != null && response is List && response.isNotEmpty) {
        final items = response[0]['result']['data'] as List;
        return items.map((item) => InventoryItem.fromJson(item)).toList();
      }
      return [];
    } catch (e) {
      debugPrint('[PharmacyService] Inventory fetch failed: $e');
      return [];
    }
  }

  Future<List<Prescription>> getPendingPrescriptions() async {
    try {
      final response = await _router.get(
        '/api/trpc/pharmacy.getPendingPrescriptions?batch=1',
      );

      if (response != null && response is List && response.isNotEmpty) {
        final items = response[0]['result']['data'] as List;
        return items.map((item) => Prescription.fromJson(item)).toList();
      }
      return [];
    } catch (e) {
      debugPrint('[PharmacyService] Prescription fetch failed: $e');
      return [];
    }
  }

  Future<void> adjustStock({
    required String itemId,
    required String type,
    required int quantity,
    String? reason,
  }) async {
    try {
      await _router.post(
        '/api/trpc/pharmacy.adjustStock?batch=1',
        body: {
          "0": {
            "itemId": itemId,
            "type": type,
            "quantity": quantity,
            "reason": reason
          }
        },
      );
    } catch (e) {
      debugPrint('[PharmacyService] Stock adjustment failed: $e');
      rethrow;
    }
  }
}
