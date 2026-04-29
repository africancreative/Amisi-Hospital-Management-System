import 'connectivity.dart';
import 'sync_service.dart';

class Invoice {
  final String id;
  final String status;
  final double totalAmount;
  final double paidAmount;
  final String? patientName;
  final String createdAt;

  Invoice({
    required this.id,
    required this.status,
    required this.totalAmount,
    required this.paidAmount,
    this.patientName,
    required this.createdAt,
  });

  factory Invoice.fromJson(Map<String, dynamic> json) => Invoice(
    id: json['id'],
    status: json['status'],
    totalAmount: (json['totalAmount'] as num).toDouble(),
    paidAmount: (json['paidAmount'] as num).toDouble(),
    patientName: json['patient'] != null
        ? '${json['patient']['firstName']} ${json['patient']['lastName']}'
        : null,
    createdAt: json['createdAt'],
  );
}

class BillingService {
  final NetworkRouter _router = NetworkRouter();

  Future<List<Invoice>> getOpenInvoices() async {
    try {
      final response = await _router.get(
        '/api/trpc/billing.getOpenInvoices?batch=1',
      );

      if (response != null && response is List && response.isNotEmpty) {
        final items = response[0]['result']['data'] as List;
        return items.map((item) => Invoice.fromJson(item)).toList();
      }
      return [];
    } catch (e) {
      print('[BillingService] Fetch failed: $e');
      return [];
    }
  }

  Future<void> createBillItem({
    required String visitId,
    required String patientId,
    required String description,
    required double quantity,
    required double unitPrice,
    required String category,
  }) async {
    final syncService = SyncService();
    await syncService.recordBillItem(
      patientId: patientId,
      visitId: visitId,
      data: {
        "description": description,
        "quantity": quantity,
        "unitPrice": unitPrice,
        "category": category,
        "taxRate": 0,
        "discountAmount": 0,
        "isExempt": false,
      },
    );
  }

  Future<void> recordPayment({
    required String invoiceId,
    required double amount,
    required String method,
  }) async {
    try {
      await _router.post(
        '/api/trpc/billing.recordPayment?batch=1',
        body: {
          "0": {
            "invoiceId": invoiceId,
            "amount": amount,
            "method": method,
            "currency": "USD",
            "autoAllocate": true,
          },
        },
      );
    } catch (e) {
      print('[BillingService] Payment recording failed: $e');
      rethrow;
    }
  }
}
