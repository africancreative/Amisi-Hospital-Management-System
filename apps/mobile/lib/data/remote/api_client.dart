import 'package:dio/dio.dart';
import 'package:amisi_mobile/data/local/database.dart';
import 'dart:convert';
import 'package:crypto/crypto.dart';

/**
 * HealthOS API Client
 * Secure communication with the Hospital Edge Node.
 */
class ApiClient {
  final Dio dio;
  final String baseUrl;
  final String sharedSecret;

  ApiClient({
    required this.baseUrl,
    required this.sharedSecret,
  }) : dio = Dio(BaseOptions(
          baseUrl: baseUrl,
          connectTimeout: const Duration(seconds: 10),
          receiveTimeout: const Duration(seconds: 10),
        )) {
    // Add logging and auth interceptors here
    dio.interceptors.add(LogInterceptor(responseBody: true));
  }

  /**
   * PUSH: Send local journals to the server
   */
  Future<List<String>> pushJournals(List<SyncJournalData> journals) async {
    final batch = journals.map((j) {
      // 1. Sign the specific mutation
      final message = "${j.entityType}:${j.entityId}:${j.action}:${j.payload}";
      final hmac = Hmac(sha256, utf8.encode(sharedSecret));
      final signature = hmac.convert(utf8.encode(message)).toString();

      return {
        'id': j.id.toString(),
        'entityType': j.entityType,
        'entityId': j.entityId,
        'action': j.action,
        'payload': json.decode(j.payload),
        'signature': signature,
        'timestamp': j.timestamp.toIso8601String(),
      };
    }).toList();

    try {
      final response = await dio.post('/api/sync', data: {'batch': batch});
      if (response.statusCode == 200) {
        return List<String>.from(response.data['acceptedIds']);
      }
    } catch (e) {
      print("[API Client] Push failed: $e");
    }
    return [];
  }

  /**
   * PULL: Fetch server deltas
   */
  Future<List<dynamic>> pullDeltas(String lastSequence) async {
    try {
      final response = await dio.get('/api/sync', queryParameters: {'lastSequence': lastSequence});
      if (response.statusCode == 200) {
        return response.data['deltas'];
      }
    } catch (e) {
      print("[API Client] Pull failed: $e");
    }
    return [];
  }
}
