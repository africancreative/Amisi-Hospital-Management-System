class RoundsService {
  final NetworkRouter _router;

  RoundsService(this._router);

  Future<List<Ward>> getWards() async {
    final data = await _router.get('/api/wards');
    return (data as List).map((w) => Ward.fromJson(w)).toList();
  }

  Future<List<Patient>> getWardPatients(String wardId) async {
    final data = await _router.get('/api/wards/$wardId/patients');
    return (data as List).map((p) => Patient.fromJson(p)).toList();
  }

  Future<List<Patient>> getMyRounds(String nurseId) async {
    final data = await _router.get('/api/rounds/nurse/$nurseId');
    return (data as List).map((p) => Patient.fromJson(p)).toList();
  }

  Future<void> startRound(String nurseId, String wardId) async {
    await _router.post(
      '/api/rounds/start',
      body: {nurseId, wardId, startedAt: DateTime.now().toIso8601String()},
    );
  }

  Future<void> completeRound(
    String nurseId,
    String patientId,
    RoundSummary summary,
  ) async {
    await _router.post(
      '/api/rounds/complete',
      body: {
        nurseId,
        patientId,
        summary: summary.toJson(),
        completedAt: DateTime.now().toIso8601String(),
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
      body: {
        patientId,
        ...vitals.toJson(),
        recordedBy,
        timestamp: DateTime.now().toIso8601String(),
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
      body: {patientId, content, authorId, authorName, type: 'NURSING'},
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
    id: json['id'],
    name: json['name'],
    type: json['type'],
    bedCount: json['bedCount'] ?? 0,
    occupiedBeds: json['occupiedBeds'] ?? 0,
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
    id: json['id'],
    mrn: json['mrn'],
    firstName: json['firstName'],
    lastName: json['lastName'],
    roomBed: json['roomBed'],
    diagnosis: json['diagnosis'],
    allergies: List<String>.from(json['allergies'] ?? []),
    status: json['status'] ?? 'STABLE',
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

  Map<String, dynamic> toJson() => {
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

  Map<String, dynamic> toJson() => {
    'summary': summary,
    'interventions': interventions,
    'needsDoctorReview': needsDoctorReview,
  };
}
