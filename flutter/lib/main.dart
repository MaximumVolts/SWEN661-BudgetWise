import 'package:flutter/material.dart';
import 'package:Pace/screens/welcome/signin.dart';
import 'package:Pace/screens/welcome/onboarding.dart';
import 'package:Pace/screens/welcome/connectplaid.dart';
import 'package:Pace/screens/budgets/budgets.dart';
import 'package:Pace/screens/budgets/budgetsdetail.dart';
import 'package:Pace/screens/budgets/recurringbills.dart';
import 'package:Pace/screens/budgets/transactiondetail.dart';
import 'package:Pace/screens/budgets/transactions.dart';
import 'package:Pace/screens/budgets/upcomingbills.dart';
import 'package:Pace/screens/dashboard/accounts.dart';
import 'package:Pace/screens/dashboard/cashflow.dart';
import 'package:Pace/screens/dashboard/dashboard.dart';
import 'package:Pace/screens/dashboard/notifications.dart';
import 'package:Pace/screens/dashboard/savingsgoals.dart';
import 'package:Pace/screens/dashboard/settings.dart';
import 'package:Pace/screens/dashboard/spendingtrends.dart';
import 'package:Pace/screens/dashboard/trendscore.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Pace',
      //theme: ThemeData(
      //  colorScheme: .fromSeed(seedColor: Colors.deepPurple),
      //),
      home: const SignInScreen(),
    );
  }
}
