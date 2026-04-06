import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:amisi_mobile/data/local/database.dart';
import 'package:amisi_mobile/data/repositories/patient_repository.dart';
import 'package:amisi_mobile/ui/screens/vitals_intake_screen.dart';

/**
 * HealthOS Patient List Screen
 * Provides an offline-first patient registry for clinic staff.
 */
class PatientListScreen extends StatefulWidget {
  const PatientListScreen({super.key});

  @override
  State<PatientListScreen> createState() => _PatientListScreenState();
}

class _PatientListScreenState extends State<PatientListScreen> {
  String _searchQuery = '';

  @override
  Widget build(BuildContext context) {
    final repository = context.watch<PatientRepository>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Clinical Mobility'),
        actions: [
          IconButton(
            icon: const Icon(Icons.sync_outlined),
            onPressed: () {
              // Trigger explicit sync if needed
            },
          ),
        ],
      ),
      body: Column(
        children: [
          _buildSearchBar(),
          Expanded(
            child: StreamBuilder<List<Patient>>(
              stream: repository.watchPatients(),
              builder: (context, snapshot) {
                if (!snapshot.hasData) {
                  return const Center(child: CircularProgressIndicator());
                }

                final patients = snapshot.data!
                    .where((p) =>
                        p.firstName.toLowerCase().contains(_searchQuery) ||
                        p.lastName.toLowerCase().contains(_searchQuery))
                    .toList();

                if (patients.isEmpty) {
                  return _buildEmptyState();
                }

                return ListView.builder(
                  itemCount: patients.length,
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  itemBuilder: (context, index) {
                    final patient = patients[index];
                    return _buildPatientCard(patient);
                  },
                );
              },
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // Add new patient offline
        },
        child: const Icon(Icons.person_add_outlined),
      ),
    );
  }

  Widget _buildSearchBar() {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: TextField(
        onChanged: (value) => setState(() => _searchQuery = value.toLowerCase()),
        decoration: InputDecoration(
          hintText: 'Search patients...',
          prefixIcon: const Icon(Icons.search),
          filled: true,
          fillColor: const Color(0xFF1A1A1A),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide.none,
          ),
        ),
      ),
    );
  }

  Widget _buildPatientCard(Patient patient) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      color: const Color(0xFF1A1A1A),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: ListTile(
        title: Text(
          '${patient.firstName} ${patient.lastName}',
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Text(
          'DoB: ${patient.dob.toLocal().toString().split(' ')[0]}',
          style: const TextStyle(color: Colors.grey),
        ),
        trailing: const Icon(Icons.chevron_right, color: Colors.blue),
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => VitalsIntakeScreen(patient: patient),
            ),
          );
        },
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.person_off_outlined, size: 64, color: Colors.grey[700]),
          const SizedBox(height: 16),
          Text(
            'No patients found offline',
            style: TextStyle(color: Colors.grey[600], fontSize: 16),
          ),
        ],
      ),
    );
  }
}
