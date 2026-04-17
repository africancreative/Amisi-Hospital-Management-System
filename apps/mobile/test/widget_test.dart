import 'package:flutter_test/flutter_test.dart';

import 'package:amisimedos_mobile/main.dart';

void main() {
  testWidgets('AmisiMedOS app launches', (WidgetTester tester) async {
    await tester.pumpWidget(const AmisiMedOSApp());

    expect(find.text('AmisiMedOS'), findsOneWidget);
    expect(find.text('Hospital Management System'), findsOneWidget);
  });
}
