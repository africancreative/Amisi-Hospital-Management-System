import 'package:flutter/material.dart';
import '../../services/billing_service.dart';
import 'package:lucide_icons/lucide_icons.dart';

class BillingListScreen extends StatefulWidget {
  const BillingListScreen({super.key});

  @override
  State<BillingListScreen> createState() => _BillingListScreenState();
}

class _BillingListScreenState extends State<BillingListScreen> {
  final _billingService = BillingService();
  List<Invoice> _invoices = [];
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _loadInvoices();
  }

  Future<void> _loadInvoices() async {
    setState(() => _isLoading = true);
    final results = await _billingService.getOpenInvoices();
    setState(() {
      _invoices = results;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text('OPEN INVOICES', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w900, letterSpacing: 2)),
        centerTitle: true,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF2563EB)))
          : _invoices.isEmpty
              ? Center(child: Text('NO OPEN INVOICES', style: TextStyle(color: Colors.white.withOpacity(0.5), letterSpacing: 1)))
              : ListView.builder(
                  padding: const EdgeInsets.all(24),
                  itemCount: _invoices.length,
                  itemBuilder: (context, index) {
                    final inv = _invoices[index];
                    return _buildInvoiceCard(inv);
                  },
                ),
    );
  }

  Widget _buildInvoiceCard(Invoice inv) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    inv.patientName?.toUpperCase() ?? 'UNKNOWN PATIENT',
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'INV: ${inv.id.substring(0, 8)}',
                    style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: inv.status == 'PARTIAL' ? Colors.amber.withOpacity(0.1) : const Color(0xFFE11D48).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  inv.status,
                  style: TextStyle(
                    color: inv.status == 'PARTIAL' ? Colors.amber : const Color(0xFFE11D48),
                    fontSize: 10,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildAmountInfo('Total Due', '\$${inv.totalAmount.toStringAsFixed(2)}', Colors.white),
              _buildAmountInfo('Balance', '\$${(inv.totalAmount - inv.paidAmount).toStringAsFixed(2)}', Colors.amber),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildAmountInfo(String label, String value, Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label.toUpperCase(),
          style: TextStyle(color: Colors.white.withOpacity(0.3), fontSize: 9, fontWeight: FontWeight.bold, letterSpacing: 1),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: TextStyle(color: color, fontSize: 18, fontWeight: FontWeight.w900),
        ),
      ],
    );
  }
}
