import 'dart:io';
import 'package:flutter_test/flutter_test.dart';
import 'package:amisimedos_mobile/services/auth.dart';
import 'package:amisimedos_mobile/services/connectivity.dart';

// A simple mock for HttpClientResponse
class FakeHttpClientResponse implements HttpClientResponse {
  @override
  final int statusCode;
  FakeHttpClientResponse(this.statusCode);
  @override
  @override
  Future<E> drain<E>([E? futureValue]) async => futureValue as E;
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

// A simple mock for HttpClientRequest
class FakeHttpClientRequest implements HttpClientRequest {
  final String url;
  final Map<String, int> responses;
  FakeHttpClientRequest(this.url, this.responses);
  
  @override
  Future<HttpClientResponse> close() async {
    int code = responses[url] ?? 404;
    if (code == 0) {
      throw const SocketException("Connection refused");
    }
    return FakeHttpClientResponse(code);
  }
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

// A simple mock for HttpClient
class FakeHttpClient implements HttpClient {
  final Map<String, int> responses;
  FakeHttpClient(this.responses);

  @override
  set connectionTimeout(Duration? timeout) {}
  
  @override
  Future<HttpClientRequest> getUrl(Uri url) async {
    return FakeHttpClientRequest(url.toString(), responses);
  }
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

// HttpOverrides to inject our fake client
class FakeHttpOverrides extends HttpOverrides {
  final Map<String, int> responses;
  FakeHttpOverrides(this.responses);

  @override
  HttpClient createHttpClient(SecurityContext? context) {
    return FakeHttpClient(responses);
  }
}

void main() {
  group('Connectivity Failsafe Tests', () {
    test('ServerConfig generates correct endpoints', () {
      final config = ServerConfig();
      config.setLocalServer(ip: '10.0.2.2', port: 3000);
      
      final cloudUrl = config.getHospitalUrl('test-clinic');
      final localUrl = config.getHospitalUrl('test-clinic', useLocal: true);
      
      expect(cloudUrl, 'https://amisimedos.amisigenuine.com/test-clinic');
      expect(localUrl, 'http://10.0.2.2:3000/test-clinic');
      
      final healthEndpoints = config.getHealthEndpoints('test-clinic');
      expect(healthEndpoints.length, 2);
      expect(healthEndpoints[0], 'https://amisimedos.amisigenuine.com/test-clinic/api/health');
      expect(healthEndpoints[1], 'http://10.0.2.2:3000/test-clinic/api/health');
    });

    test('ConnectivityService connects to cloud if available', () async {
      HttpOverrides.global = FakeHttpOverrides({
        'https://amisimedos.amisigenuine.com/st-jude/api/health': 200,
        'http://192.168.100.21:3000/st-jude/api/health': 0, // Simulate timeout/down
      });

      final service = ConnectivityService();
      service.configure('st-jude');
      
      await service.check();
      
      expect(service.status, ConnectionStatus.online);
      expect(service.isOnline, true);
      expect(service.currentEndpoint, 'https://amisimedos.amisigenuine.com/st-jude/api/health');
      expect(service.useLocal, false);
    });

    test('ConnectivityService connects to local fallback if cloud is down', () async {
      HttpOverrides.global = FakeHttpOverrides({
        'https://amisimedos.amisigenuine.com/st-jude/api/health': 0, // Simulate Cloud outage
        'http://192.168.100.21:3000/st-jude/api/health': 200, 
      });

      final service = ConnectivityService();
      service.configure('st-jude');
      
      await service.check();
      
      expect(service.status, ConnectionStatus.online);
      expect(service.isOnline, true);
      expect(service.currentEndpoint, 'http://192.168.100.21:3000/st-jude/api/health');
      expect(service.useLocal, true);
    });

    test('ConnectivityService sets status to offline if both endpoints fail', () async {
      HttpOverrides.global = FakeHttpOverrides({
        'https://amisimedos.amisigenuine.com/st-jude/api/health': 0, 
        'http://192.168.100.21:3000/st-jude/api/health': 0, 
      });

      final service = ConnectivityService();
      service.configure('st-jude');
      
      await service.check();
      
      expect(service.status, ConnectionStatus.offline);
      expect(service.isOnline, false);
      expect(service.currentEndpoint, '');
      expect(service.useLocal, false);
    });
  });
}
