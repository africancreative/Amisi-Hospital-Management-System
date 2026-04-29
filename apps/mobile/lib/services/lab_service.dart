import 'connectivity.dart';

class LabOrder {
  final String id;
  final String patientName;
  final String testPanelId;
  final String status;
  final String orderedAt;

  LabOrder({
    required this.id,
    required this.patientName,
    required this.testPanelId,
    required this.status,
    required this.orderedAt,
  });

  factory LabOrder.fromJson(Map<String, dynamic> json) => LabOrder(
    id: json['id'],
    patientName:
        '${json['patient']['firstName']} ${json['patient']['lastName']}',
    testPanelId: json['testPanelId'],
    status: json['status'],
    orderedAt: json['orderedAt'],
  );
}

class LabService {
  final NetworkRouter _router = NetworkRouter();

  Future<List<LabOrder>> getActiveOrders() async {
    try {
      final response = await _router.get(
        '/api/trpc/lab.getActiveOrders?batch=1',
      );

      if (response != null && response is List && response.isNotEmpty) {
        final items = response[0]['result']['data'] as List;
        return items.map((item) => LabOrder.fromJson(item)).toList();
      }
      return [];
    } catch (e) {
      print('[LabService] Order fetch failed: $e');
      return [];
    }
  }

  Future<void> collectSample({
    required String orderId,
    required String specimenType,
    required String barcode,
    required String collectedById,
  }) async {
    try {
      await _router.post(
        '/api/trpc/lab.collectSample?batch=1',
        body: {
          "0": {
            "orderId": orderId,
            "specimenType": specimenType,
            "barcode": barcode,
            "collectedById": collectedById,
          },
        },
      );
    } catch (e) {
      print('[LabService] Sample collection failed: $e');
      rethrow;
    }
  }

  Future<void> recordResults({
    required String orderId,
    required List<Map<String, dynamic>> results,
  }) async {
    try {
      await _router.post(
        '/api/trpc/lab.recordResults?batch=1',
        body: {
          "0": {"orderId": orderId, "results": results},
        },
      );
    } catch (e) {
      print('[LabService] Result recording failed: $e');
      rethrow;
    }
  }
}
