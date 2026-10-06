import 'package:flutter/material.dart';
import 'package:flutter_svg_provider/flutter_svg_provider.dart';

class ConnectPlaid extends StatelessWidget {
  const ConnectPlaid({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
    width: 768,
    height: 1100,
    clipBehavior: Clip.antiAlias,
    decoration: BoxDecoration(color: const Color(0xFFFBFAF7)),
    child: Stack(
        children: [
            Positioned(
                left: 0,
                top: 0,
                child: Container(
                    width: 768,
                    height: 1100,
                    padding: const EdgeInsets.only(bottom: 48),
                    child: Column(
                        mainAxisSize: MainAxisSize.min,
                        mainAxisAlignment: MainAxisAlignment.start,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                            Container(
                                width: 768,
                                height: 44,
                                padding: const EdgeInsets.only(
                                    top: 12,
                                    left: 48,
                                    right: 48,
                                    bottom: 8,
                                ),
                                child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    crossAxisAlignment: CrossAxisAlignment.center,
                                    spacing: 8,
                                    children: [
                                        Container(
                                            width: 190,
                                            height: 3,
                                            decoration: ShapeDecoration(
                                                color: const Color(0xFF1A1A1A),
                                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(2)),
                                            ),
                                        ),
                                        Container(
                                            width: 190,
                                            height: 3,
                                            decoration: ShapeDecoration(
                                                color: const Color(0xFF1A1A1A),
                                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(2)),
                                            ),
                                        ),
                                        Container(
                                            width: 190,
                                            height: 3,
                                            decoration: ShapeDecoration(
                                                color: const Color(0xFF1A1A1A),
                                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(2)),
                                            ),
                                        ),
                                    ],
                                ),
                            ),
                            Container(
                                width: 768,
                                height: 44,
                                padding: const EdgeInsets.symmetric(horizontal: 24),
                                child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    mainAxisAlignment: MainAxisAlignment.start,
                                    crossAxisAlignment: CrossAxisAlignment.center,
                                    children: [
                                        Container(
                                            width: 48,
                                            height: 48,
                                            child: Row(
                                                mainAxisSize: MainAxisSize.min,
                                                mainAxisAlignment: MainAxisAlignment.center,
                                                crossAxisAlignment: CrossAxisAlignment.center,
                                                children: [
                                                    Container(
                                                        width: 24,
                                                        height: 24,
                                                        clipBehavior: Clip.antiAlias,
                                                        decoration: BoxDecoration(image: DecorationImage(
                                      image: Svg(
                                        'assets/left-arrow.svg',
                                      )
                                      ),),
                                                        child: Stack(),
                                                    ),
                                                ],
                                            ),
                                        ),
                                    ],
                                ),
                            ),
                            Container(
                                width: 768,
                                padding: const EdgeInsets.only(top: 24),
                                child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    crossAxisAlignment: CrossAxisAlignment.center,
                                    children: [
                                        Container(
                                            width: 56,
                                            height: 56,
                                            decoration: ShapeDecoration(
                                                color: const Color(0xFFE4EE6A),
                                                shape: RoundedRectangleBorder(
                                                    borderRadius: BorderRadius.circular(28),
                                                ),
                                            ),
                                            child: Column(
                                                mainAxisSize: MainAxisSize.min,
                                                mainAxisAlignment: MainAxisAlignment.center,
                                                crossAxisAlignment: CrossAxisAlignment.center,
                                                children: [
                                                    Container(
                                                        width: 28,
                                                        height: 28,
                                                        clipBehavior: Clip.antiAlias,
                                                        decoration: BoxDecoration(image: DecorationImage(
                                      image: Svg(
                                        'assets/pace.svg',
                                      )
                                      ),),
                                                        child: Stack(),
                                                    ),
                                                ],
                                            ),
                                        ),
                                        Container(
                                            width: 32,
                                            height: 2,
                                            child: Row(
                                                mainAxisSize: MainAxisSize.min,
                                                mainAxisAlignment: MainAxisAlignment.start,
                                                crossAxisAlignment: CrossAxisAlignment.center,
                                                children: [
                                                    Container(
                                                        width: 24,
                                                        height: 24,
                                                        clipBehavior: Clip.antiAlias,
                                                        decoration: BoxDecoration(image: DecorationImage(
                                      image: Svg(
                                        'assets/refresh-ccw.svg',
                                      )
                                      ),),
                                                        child: Stack(),
                                                    ),
                                                ],
                                            ),
                                        ),
                                        Container(
                                            width: 56,
                                            height: 56,
                                            decoration: ShapeDecoration(
                                                color: const Color(0xFF1A1A1A),
                                                shape: RoundedRectangleBorder(
                                                    borderRadius: BorderRadius.circular(28),
                                                ),
                                            ),
                                            child: Column(
                                                mainAxisSize: MainAxisSize.min,
                                                mainAxisAlignment: MainAxisAlignment.center,
                                                crossAxisAlignment: CrossAxisAlignment.center,
                                                children: [
                                                    Container(
                                                        width: 28,
                                                        height: 28,
                                                        clipBehavior: Clip.antiAlias,
                                                        decoration: BoxDecoration(image: DecorationImage(
                                      image: Svg(
                                        'assets/lock.svg',
                                      )
                                      ),),
                                                        child: Stack(),
                                                    ),
                                                ],
                                            ),
                                        ),
                                        Container(
                                            width: 32,
                                            height: 24,
                                            child: Row(
                                                mainAxisSize: MainAxisSize.min,
                                                mainAxisAlignment: MainAxisAlignment.center,
                                                crossAxisAlignment: CrossAxisAlignment.center,
                                                children: [
                                                    Container(
                                                        width: 24,
                                                        height: 24,
                                                        clipBehavior: Clip.antiAlias,
                                                        decoration: BoxDecoration(image: DecorationImage(
                                      image: Svg(
                                        'assets/refresh-ccw.svg',
                                      )
                                      ),),
                                                        child: Stack(),
                                                    ),
                                                ],
                                            ),
                                        ),
                                        Container(
                                            width: 56,
                                            height: 56,
                                            decoration: ShapeDecoration(
                                                color: const Color(0xFFFBFAF7),
                                                shape: RoundedRectangleBorder(
                                                    side: BorderSide(
                                                        width: 1,
                                                        color: const Color(0xFFCBC8C1),
                                                    ),
                                                    borderRadius: BorderRadius.circular(28),
                                                ),
                                            ),
                                            child: Column(
                                                mainAxisSize: MainAxisSize.min,
                                                mainAxisAlignment: MainAxisAlignment.center,
                                                crossAxisAlignment: CrossAxisAlignment.center,
                                                children: [
                                                    Container(
                                                        width: 28,
                                                        height: 28,
                                                        clipBehavior: Clip.antiAlias,
                                                        decoration: BoxDecoration(image: DecorationImage(
                                      image: Svg(
                                        'assets/user.svg',
                                      )
                                      ),),
                                                        child: Stack(),
                                                    ),
                                                ],
                                            ),
                                        ),
                                    ],
                                ),
                            ),
                            Container(
                                width: 768,
                                padding: const EdgeInsets.only(top: 32, left: 48, right: 48),
                                child: Column(
                                    mainAxisSize: MainAxisSize.min,
                                    mainAxisAlignment: MainAxisAlignment.start,
                                    crossAxisAlignment: CrossAxisAlignment.center,
                                    children: [
                                        SizedBox(
                                            width: 672,
                                            child: Text(
                                                'STEP 3 OF 3',
                                                textAlign: TextAlign.center,
                                                style: TextStyle(
                                                    color: const Color(0xFF4A4843) /* color-text-secondary */,
                                                    fontSize: 12,
                                                    fontFamily: 'Roboto',
                                                    fontWeight: FontWeight.w500,
                                                ),
                                            ),
                                        ),
                                    ],
                                ),
                            ),
                            Container(
                                width: 768,
                                padding: const EdgeInsets.only(top: 8, left: 48, right: 48),
                                child: Column(
                                    mainAxisSize: MainAxisSize.min,
                                    mainAxisAlignment: MainAxisAlignment.start,
                                    crossAxisAlignment: CrossAxisAlignment.center,
                                    children: [
                                        SizedBox(
                                            width: 672,
                                            child: Text(
                                                'Connect your bank with Plaid',
                                                textAlign: TextAlign.center,
                                                style: TextStyle(
                                                    color: const Color(0xFF1A1A1A) /* color-text-primary */,
                                                    fontSize: 36,
                                                    fontFamily: 'Roboto',
                                                    fontWeight: FontWeight.w400,
                                                ),
                                            ),
                                        ),
                                    ],
                                ),
                            ),
                            Container(
                                width: 768,
                                padding: const EdgeInsets.only(top: 12, left: 80, right: 80),
                                child: Column(
                                    mainAxisSize: MainAxisSize.min,
                                    mainAxisAlignment: MainAxisAlignment.start,
                                    crossAxisAlignment: CrossAxisAlignment.center,
                                    children: [
                                        SizedBox(
                                            width: 608,
                                            child: Text(
                                                'Pace uses Plaid to securely link your checking, savings and credit accounts. Transactions import automatically, so you never have to type them in.',
                                                textAlign: TextAlign.center,
                                                style: TextStyle(
                                                    color: const Color(0xFF4A4843) /* color-text-secondary */,
                                                    fontSize: 16,
                                                    fontFamily: 'Roboto',
                                                    fontWeight: FontWeight.w400,
                                                    height: 1.50,
                                                ),
                                            ),
                                        ),
                                    ],
                                ),
                            ),
                            Container(
                                width: 660,
                                padding: const EdgeInsets.all(28),
                                decoration: ShapeDecoration(
                                    color: Colors.white,
                                    shape: RoundedRectangleBorder(
                                        side: BorderSide(
                                            width: 1,
                                            color: const Color(0xFFCBC8C1),
                                        ),
                                        borderRadius: BorderRadius.circular(16),
                                    ),
                                ),
                                child: Column(
                                    mainAxisSize: MainAxisSize.min,
                                    mainAxisAlignment: MainAxisAlignment.start,
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    spacing: 24,
                                    children: [
                                        Container(
                                            width: double.infinity,
                                            child: Row(
                                                mainAxisSize: MainAxisSize.min,
                                                mainAxisAlignment: MainAxisAlignment.start,
                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                spacing: 24,
                                                children: [
                                                    Expanded(
                                                        child: Row(
                                                            mainAxisSize: MainAxisSize.min,
                                                            mainAxisAlignment: MainAxisAlignment.start,
                                                            crossAxisAlignment: CrossAxisAlignment.start,
                                                            spacing: 14,
                                                            children: [
                                                                Container(
                                                                    width: 40,
                                                                    height: 40,
                                                                    decoration: ShapeDecoration(
                                                                        color: const Color(0xFFECEAE4),
                                                                        shape: RoundedRectangleBorder(
                                                                            borderRadius: BorderRadius.circular(20),
                                                                        ),
                                                                    ),
                                                                    child: Column(
                                                                        mainAxisSize: MainAxisSize.min,
                                                                        mainAxisAlignment: MainAxisAlignment.center,
                                                                        crossAxisAlignment: CrossAxisAlignment.center,
                                                                        children: [
                                                                            Container(
                                                                                width: 22,
                                                                                height: 22,
                                                                                clipBehavior: Clip.antiAlias,
                                                                                decoration: BoxDecoration(image: DecorationImage(
                                      image: Svg(
                                        'assets/circle-x.svg',
                                      )
                                      ),),
                                                                                child: Stack(),
                                                                            ),
                                                                        ],
                                                                    ),
                                                                ),
                                                                Expanded(
                                                                    child: Column(
                                                                        mainAxisSize: MainAxisSize.min,
                                                                        mainAxisAlignment: MainAxisAlignment.start,
                                                                        crossAxisAlignment: CrossAxisAlignment.start,
                                                                        spacing: 4,
                                                                        children: [
                                                                            SizedBox(
                                                                                width: 236,
                                                                                child: Text(
                                                                                    'Pace never sees your bank login',
                                                                                    style: TextStyle(
                                                                                        color: const Color(0xFF1A1A1A) /* color-text-primary */,
                                                                                        fontSize: 15,
                                                                                        fontFamily: 'Roboto',
                                                                                        fontWeight: FontWeight.w700,
                                                                                    ),
                                                                                ),
                                                                            ),
                                                                            SizedBox(
                                                                                width: 236,
                                                                                child: Text(
                                                                                    'You sign in through Plaid. Pace never stores your username or password.',
                                                                                    style: TextStyle(
                                                                                        color: const Color(0xFF4A4843) /* color-text-secondary */,
                                                                                        fontSize: 16,
                                                                                        fontFamily: 'Roboto',
                                                                                        fontWeight: FontWeight.w400,
                                                                                        height: 1.50,
                                                                                    ),
                                                                                ),
                                                                            ),
                                                                        ],
                                                                    ),
                                                                ),
                                                            ],
                                                        ),
                                                    ),
                                                    Expanded(
                                                        child: Row(
                                                            mainAxisSize: MainAxisSize.min,
                                                            mainAxisAlignment: MainAxisAlignment.start,
                                                            crossAxisAlignment: CrossAxisAlignment.start,
                                                            spacing: 14,
                                                            children: [
                                                                Container(
                                                                    width: 40,
                                                                    height: 40,
                                                                    decoration: ShapeDecoration(
                                                                        color: const Color(0xFFECEAE4),
                                                                        shape: RoundedRectangleBorder(
                                                                            borderRadius: BorderRadius.circular(20),
                                                                        ),
                                                                    ),
                                                                    child: Column(
                                                                        mainAxisSize: MainAxisSize.min,
                                                                        mainAxisAlignment: MainAxisAlignment.center,
                                                                        crossAxisAlignment: CrossAxisAlignment.center,
                                                                        children: [
                                                                            Container(
                                                                                width: 22,
                                                                                height: 22,
                                                                                clipBehavior: Clip.antiAlias,
                                                                                decoration: BoxDecoration(image: DecorationImage(
                                      image: Svg(
                                        'assets/eye.svg',
                                      )
                                      ),),
                                                                                child: Stack(),
                                                                            ),
                                                                        ],
                                                                    ),
                                                                ),
                                                                Expanded(
                                                                    child: Column(
                                                                        mainAxisSize: MainAxisSize.min,
                                                                        mainAxisAlignment: MainAxisAlignment.start,
                                                                        crossAxisAlignment: CrossAxisAlignment.start,
                                                                        spacing: 4,
                                                                        children: [
                                                                            SizedBox(
                                                                                width: 236,
                                                                                child: Text(
                                                                                    'Read-only access',
                                                                                    style: TextStyle(
                                                                                        color: const Color(0xFF1A1A1A) /* color-text-primary */,
                                                                                        fontSize: 15,
                                                                                        fontFamily: 'Roboto',
                                                                                        fontWeight: FontWeight.w700,
                                                                                    ),
                                                                                ),
                                                                            ),
                                                                            SizedBox(
                                                                                width: 236,
                                                                                child: Text(
                                                                                    'Pace sees balances and transactions. It can\'t move your money.',
                                                                                    style: TextStyle(
                                                                                        color: const Color(0xFF4A4843) /* color-text-secondary */,
                                                                                        fontSize: 16,
                                                                                        fontFamily: 'Roboto',
                                                                                        fontWeight: FontWeight.w400,
                                                                                        height: 1.50,
                                                                                    ),
                                                                                ),
                                                                            ),
                                                                        ],
                                                                    ),
                                                                ),
                                                            ],
                                                        ),
                                                    ),
                                                ],
                                            ),
                                        ),
                                        Container(
                                            width: double.infinity,
                                            child: Row(
                                                mainAxisSize: MainAxisSize.min,
                                                mainAxisAlignment: MainAxisAlignment.start,
                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                spacing: 24,
                                                children: [
                                                    Expanded(
                                                        child: Row(
                                                            mainAxisSize: MainAxisSize.min,
                                                            mainAxisAlignment: MainAxisAlignment.start,
                                                            crossAxisAlignment: CrossAxisAlignment.start,
                                                            spacing: 14,
                                                            children: [
                                                                Container(
                                                                    width: 40,
                                                                    height: 40,
                                                                    decoration: ShapeDecoration(
                                                                        color: const Color(0xFFECEAE4),
                                                                        shape: RoundedRectangleBorder(
                                                                            borderRadius: BorderRadius.circular(20),
                                                                        ),
                                                                    ),
                                                                    child: Column(
                                                                        mainAxisSize: MainAxisSize.min,
                                                                        mainAxisAlignment: MainAxisAlignment.center,
                                                                        crossAxisAlignment: CrossAxisAlignment.center,
                                                                        children: [
                                                                            Container(
                                                                                width: 22,
                                                                                height: 22,
                                                                                clipBehavior: Clip.antiAlias,
                                                                                decoration: BoxDecoration(image: DecorationImage(
                                      image: Svg(
                                        'assets/lock.svg',
                                      )
                                      ),),
                                                                                child: Stack(),
                                                                            ),
                                                                        ],
                                                                    ),
                                                                ),
                                                                Expanded(
                                                                    child: Column(
                                                                        mainAxisSize: MainAxisSize.min,
                                                                        mainAxisAlignment: MainAxisAlignment.start,
                                                                        crossAxisAlignment: CrossAxisAlignment.start,
                                                                        spacing: 4,
                                                                        children: [
                                                                            SizedBox(
                                                                                width: 236,
                                                                                child: Text(
                                                                                    'Encrypted in transit and at rest',
                                                                                    style: TextStyle(
                                                                                        color: const Color(0xFF1A1A1A) /* color-text-primary */,
                                                                                        fontSize: 15,
                                                                                        fontFamily: 'Roboto',
                                                                                        fontWeight: FontWeight.w700,
                                                                                    ),
                                                                                ),
                                                                            ),
                                                                            SizedBox(
                                                                                width: 236,
                                                                                child: Text(
                                                                                    'Your financial data is protected wherever it\'s sent or stored.',
                                                                                    style: TextStyle(
                                                                                        color: const Color(0xFF4A4843) /* color-text-secondary */,
                                                                                        fontSize: 16,
                                                                                        fontFamily: 'Roboto',
                                                                                        fontWeight: FontWeight.w400,
                                                                                        height: 1.50,
                                                                                    ),
                                                                                ),
                                                                            ),
                                                                        ],
                                                                    ),
                                                                ),
                                                            ],
                                                        ),
                                                    ),
                                                    Expanded(
                                                        child: Row(
                                                            mainAxisSize: MainAxisSize.min,
                                                            mainAxisAlignment: MainAxisAlignment.start,
                                                            crossAxisAlignment: CrossAxisAlignment.start,
                                                            spacing: 14,
                                                            children: [
                                                                Container(
                                                                    width: 40,
                                                                    height: 40,
                                                                    decoration: ShapeDecoration(
                                                                        color: const Color(0xFFECEAE4),
                                                                        shape: RoundedRectangleBorder(
                                                                            borderRadius: BorderRadius.circular(20),
                                                                        ),
                                                                    ),
                                                                    child: Column(
                                                                        mainAxisSize: MainAxisSize.min,
                                                                        mainAxisAlignment: MainAxisAlignment.center,
                                                                        crossAxisAlignment: CrossAxisAlignment.center,
                                                                        children: [
                                                                            Container(
                                                                                width: 22,
                                                                                height: 22,
                                                                                clipBehavior: Clip.antiAlias,
                                                                                decoration: BoxDecoration(image: DecorationImage(
                                      image: Svg(
                                        'assets/link-2-off.svg',
                                      )
                                      ),),
                                                                                child: Stack(),
                                                                            ),
                                                                        ],
                                                                    ),
                                                                ),
                                                                Expanded(
                                                                    child: Column(
                                                                        mainAxisSize: MainAxisSize.min,
                                                                        mainAxisAlignment: MainAxisAlignment.start,
                                                                        crossAxisAlignment: CrossAxisAlignment.start,
                                                                        spacing: 4,
                                                                        children: [
                                                                            SizedBox(
                                                                                width: 236,
                                                                                child: Text(
                                                                                    'Disconnect anytime',
                                                                                    style: TextStyle(
                                                                                        color: const Color(0xFF1A1A1A) /* color-text-primary */,
                                                                                        fontSize: 15,
                                                                                        fontFamily: 'Roboto',
                                                                                        fontWeight: FontWeight.w700,
                                                                                    ),
                                                                                ),
                                                                            ),
                                                                            SizedBox(
                                                                                width: 236,
                                                                                child: Text(
                                                                                    'Remove an account in Settings and syncing stops right away.',
                                                                                    style: TextStyle(
                                                                                        color: const Color(0xFF4A4843) /* color-text-secondary */,
                                                                                        fontSize: 16,
                                                                                        fontFamily: 'Roboto',
                                                                                        fontWeight: FontWeight.w400,
                                                                                        height: 1.50,
                                                                                    ),
                                                                                ),
                                                                            ),
                                                                        ],
                                                                    ),
                                                                ),
                                                            ],
                                                        ),
                                                    ),
                                                ],
                                            ),
                                        ),
                                    ],
                                ),
                            ),
                            Container(
                                width: 768,
                                padding: const EdgeInsets.only(top: 28, left: 54, right: 54),
                                child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    mainAxisAlignment: MainAxisAlignment.start,
                                    crossAxisAlignment: CrossAxisAlignment.center,
                                    spacing: 12,
                                    children: [
                                        Container(
                                            width: 20,
                                            height: 20,
                                            decoration: ShapeDecoration(
                                                color: const Color(0xFF1A1A1A),
                                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(3)),
                                            ),
                                            child: Column(
                                                mainAxisSize: MainAxisSize.min,
                                                mainAxisAlignment: MainAxisAlignment.center,
                                                crossAxisAlignment: CrossAxisAlignment.center,
                                                children: [
                                                    Container(
                                                        width: 14,
                                                        height: 14,
                                                        clipBehavior: Clip.antiAlias,
                                                        decoration: BoxDecoration(image: DecorationImage(
                                      image: Svg(
                                        'assets/check.svg',
                                      )
                                      ),),
                                                        child: Stack(),
                                                    ),
                                                ],
                                            ),
                                        ),
                                        SizedBox(
                                            width: 628,
                                            child: Text(
                                                'I agree to let Pace access my account data through Plaid.',
                                                style: TextStyle(
                                                    color: const Color(0xFF1A1A1A) /* color-text-primary */,
                                                    fontSize: 16,
                                                    fontFamily: 'Roboto',
                                                    fontWeight: FontWeight.w400,
                                                    height: 1.50,
                                                ),
                                            ),
                                        ),
                                    ],
                                ),
                            ),
                            Container(
                                width: 660,
                                height: 56,
                                padding: const EdgeInsets.symmetric(horizontal: 24),
                                decoration: ShapeDecoration(
                                    color: const Color(0xFF1A1A1A),
                                    shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(28),
                                    ),
                                ),
                                child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    crossAxisAlignment: CrossAxisAlignment.center,
                                    spacing: 10,
                                    children: [
                                        Container(
                                            width: 22,
                                            height: 22,
                                            clipBehavior: Clip.antiAlias,
                                            decoration: BoxDecoration(image: DecorationImage(
                                      image: Svg(
                                        'assets/link.svg',
                                      )
                                      ),),
                                            child: Stack(),
                                        ),
                                        Text(
                                            'Connect with Plaid',
                                            style: TextStyle(
                                                color: Colors.white,
                                                fontSize: 16,
                                                fontFamily: 'Roboto',
                                                fontWeight: FontWeight.w500,
                                            ),
                                        ),
                                    ],
                                ),
                            ),
                            Container(
                                width: 768,
                                padding: const EdgeInsets.only(top: 16),
                                child: Column(
                                    mainAxisSize: MainAxisSize.min,
                                    mainAxisAlignment: MainAxisAlignment.start,
                                    crossAxisAlignment: CrossAxisAlignment.center,
                                    children: [
                                        Text(
                                            'Not now',
                                            textAlign: TextAlign.center,
                                            style: TextStyle(
                                                color: const Color(0xFF1A1A1A) /* color-text-primary */,
                                                fontSize: 15,
                                                fontFamily: 'Roboto',
                                                fontWeight: FontWeight.w500,
                                            ),
                                        ),
                                    ],
                                ),
                            ),
                            Container(
                                width: 768,
                                padding: const EdgeInsets.only(top: 20, left: 48, right: 48),
                                child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    crossAxisAlignment: CrossAxisAlignment.center,
                                    spacing: 8,
                                    children: [
                                        Container(
                                            width: 16,
                                            height: 16,
                                            clipBehavior: Clip.antiAlias,
                                            decoration: BoxDecoration(image: DecorationImage(
                                      image: Svg(
                                        'assets/atom.svg',
                                      )
                                      ),),
                                            child: Stack(),
                                        ),
                                        Text(
                                            'Demo uses the Plaid sandbox. No real bank data.',
                                            textAlign: TextAlign.center,
                                            style: TextStyle(
                                                color: const Color(0xFF4A4843) /* color-text-secondary */,
                                                fontSize: 13,
                                                fontFamily: 'Roboto',
                                                fontWeight: FontWeight.w400,
                                            ),
                                        ),
                                    ],
                                ),
                            ),
                        ],
                    ),
                ),
            ),
        ],
    ),
));
  }
}
