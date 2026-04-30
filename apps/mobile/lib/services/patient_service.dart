import 'dart:convert';
import 'connectivity.dart';
import 'package:flutter/foundation.dart';

class Patient {
  final String id;
  final String mrn;
  final String firstName;
  final String lastName;
  final String? dob;
  final String? gender;
  final String? phone;

  Patient({
    required this.id,
    required this.mrn,
    required this.firstName,
    required this.lastName,
    this.dob,
    this.gender,
    this.phone,
  });

  factory Patient.fromJson(Map<String, dynamic> json) => Patient(
    id: json['id'],
    mrn: json['mrn'],
    firstName: json['firstName'],
    lastName: json['lastName'],
    dob: json['dob'],
    gender: json['gender'],
    phone: json['phone'],
  );

  String get fullName => '$firstName $lastName';
}

class PatientService {
  final NetworkRouter _router = NetworkRouter();

  Future<List<Patient>> searchPatients(String query) async {
    try {
      final response = await _router.get(
        '/api/trpc/patient.list?batch=1&input=${Uri.encodeComponent(jsonEncode({
          "0": {"search": query, "limit": 20}
        }))}',
      );

      if (response != null && response is List && response.isNotEmpty) {
        final result = response[0]['result']['data'];
        final items = result['items'] as List;
        return items.map((item) => Patient.fromJson(item)).toList();
      }
      return [];
    } catch (e) {
      debugPrint('[PatientService] Search failed: $e');
      return [];
    }
  }

  Future<Patient?> getPatientById(String id) async {
    try {
      final response = await _router.get(
        '/api/trpc/patient.getById?batch=1&input=${Uri.encodeComponent(jsonEncode({
          "0": id
        }))}',
      );

      if (response != null && response is List && response.isNotEmpty) {
        final result = response[0]['result']['data'];
        return Patient.fromJson(result);
      }
      return null;
    } catch (e) {
      debugPrint('[PatientService] Fetch failed: $e');
      return null;
    }
  }
}
