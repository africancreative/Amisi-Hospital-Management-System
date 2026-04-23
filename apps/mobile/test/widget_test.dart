import 'package:flutter_test/flutter_test.dart';

import 'package:amisimedos_mobile/main.dart';

void main() {
  testWidgets('AmisiMedOS app launches', (WidgetTester tester) async {
    await tester.pumpWidget(const AmisiApp());

    expect(find.text('AMISIMEDOS'), findsOneWidget);
    expect(find.text('ENTERPRISE HEALTHCARE NODE'), findsOneWidget);
  });
}
