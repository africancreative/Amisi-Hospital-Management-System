import 'package:flutter_test/flutter_test.dart';

import 'package:amisimedos_mobile/main.dart';
import 'package:amisimedos_mobile/services/sync_service.dart';

void main() {
  testWidgets('AmisiMedOS app launches', (WidgetTester tester) async {
    await tester.pumpWidget(AmisiApp(syncService: SyncService()));

    expect(find.text('AMISIMEDOS'), findsOneWidget);
    expect(find.text('ENTERPRISE HEALTHCARE NODE'), findsOneWidget);
  });
}
