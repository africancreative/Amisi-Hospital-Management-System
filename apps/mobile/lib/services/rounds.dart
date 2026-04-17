import 'connectivity.dart';

class RoundsService {
  final NetworkRouter _router;

  RoundsService(this._router);

  Future<List<Ward>> getWards() async {
    final data = await _router.get('/api/wards');
    return (data as List)
        .map((w) => Ward.fromJson(w as Map<String, dynamic>))
        .toList();
  }

  Future<List<Patient>> getWardPatients(String wardId) async {
    final data = await _router.get('/api/wards/$wardId/patients');
    return (data as List)
        .map((p) => Patient.fromJson(p as Map<String, dynamic>))
        .toList();
  }

  Future<List<Patient>> getMyRounds(String nurseId) async {
    final data = await _router.get('/api/rounds/nurse/$nurseId');
    return (data as List)
        .map((p) => Patient.fromJson(p as Map<String, dynamic>))
        .toList();
  }

  Future<void> startRound(String nurseId, String wardId) async {
    await _router.post(
      '/api/rounds/start',
      body: <String, dynamic>{
        'nurseId': nurseId,
        'wardId': wardId,
        'startedAt': DateTime.now().toIso8601String(),
      },
    );
  }

  Future<void> completeRound(
    String nurseId,
    String patientId,
    RoundSummary summary,
  ) async {
    await _router.post(
      '/api/rounds/complete',
      body: <String, dynamic>{
        'nurseId': nurseId,
        'patientId': patientId,
        'summary': summary.toJson(),
        'completedAt': DateTime.now().toIso8601String(),
      },
    );
  }

  Future<void> addVital(
    String patientId,
    VitalSigns vitals,
    String recordedBy,
  ) async {
    await _router.post(
      '/api/vitals',
      body: <String, dynamic>{
        'patientId': patientId,
        ...vitals.toJson(),
        'recordedBy': recordedBy,
        'timestamp': DateTime.now().toIso8601String(),
      },
    );
  }

  Future<void> addNote(
    String patientId,
    String content,
    String authorId,
    String authorName,
  ) async {
    await _router.post(
      '/api/clinical-notes',
      body: <String, dynamic>{
        'patientId': patientId,
        'content': content,
        'authorId': authorId,
        'authorName': authorName,
        'type': 'NURSING',
      },
    );
  }
}

class Ward {
  final String id;
  final String name;
  final String type;
  final int bedCount;
  final int occupiedBeds;

  Ward({
    required this.id,
    required this.name,
    required this.type,
    required this.bedCount,
    required this.occupiedBeds,
  });

  factory Ward.fromJson(Map<String, dynamic> json) => Ward(
    id: json['id'] as String,
    name: json['name'] as String,
    type: json['type'] as String,
    bedCount: json['bedCount'] as int? ?? 0,
    occupiedBeds: json['occupiedBeds'] as int? ?? 0,
  );
}

class Patient {
  final String id;
  final String mrn;
  final String firstName;
  final String lastName;
  final String? roomBed;
  final String? diagnosis;
  final List<String> allergies;
  final String status;

  Patient({
    required this.id,
    required this.mrn,
    required this.firstName,
    required this.lastName,
    this.roomBed,
    this.diagnosis,
    this.allergies = const [],
    this.status = 'STABLE',
  });

  factory Patient.fromJson(Map<String, dynamic> json) => Patient(
    id: json['id'] as String,
    mrn: json['mrn'] as String,
    firstName: json['firstName'] as String,
    lastName: json['lastName'] as String,
    roomBed: json['roomBed'] as String?,
    diagnosis: json['diagnosis'] as String?,
    allergies: List<String>.from(json['allergies'] ?? []),
    status: json['status'] as String? ?? 'STABLE',
  );

  String get fullName => '$firstName $lastName';
}

class VitalSigns {
  final int? heartRate;
  final int? bloodPressureSystolic;
  final int? bloodPressureDiastolic;
  final int? temperature;
  final int? respiratoryRate;
  final int? spO2;

  VitalSigns({
    this.heartRate,
    this.bloodPressureSystolic,
    this.bloodPressureDiastolic,
    this.temperature,
    this.respiratoryRate,
    this.spO2,
  });

  Map<String, dynamic> toJson() => <String, dynamic>{
    if (heartRate != null) 'heartRate': heartRate,
    if (bloodPressureSystolic != null)
      'bloodPressureSystolic': bloodPressureSystolic,
    if (bloodPressureDiastolic != null)
      'bloodPressureDiastolic': bloodPressureDiastolic,
    if (temperature != null) 'temperature': temperature,
    if (respiratoryRate != null) 'respiratoryRate': respiratoryRate,
    if (spO2 != null) 'spO2': spO2,
  };
}

class RoundSummary {
  final String summary;
  final List<String> interventions;
  final bool needsDoctorReview;

  RoundSummary({
    required this.summary,
    this.interventions = const [],
    this.needsDoctorReview = false,
  });

  Map<String, dynamic> toJson() => <String, dynamic>{
    'summary': summary,
    'interventions': interventions,
    'needsDoctorReview': needsDoctorReview,
  };
}
