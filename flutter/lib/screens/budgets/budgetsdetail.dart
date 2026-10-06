import 'package:flutter/material.dart';

class BudgetDetailScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: ConstrainedBox(
        constraints: BoxConstraints(minHeight: 844),
        child: Container(
          width: 768,
          height: 1024,
          clipBehavior: Clip.antiAlias,
          decoration: BoxDecoration(color: const Color(0xFFFBFAF7)),
          child: Stack(
            children: [
              Container(
                width: double.infinity,
                height: 28,
                padding: const EdgeInsets.symmetric(horizontal: 20),
                clipBehavior: Clip.antiAlias,
                decoration: BoxDecoration(),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Text(
                      '9:41',
                      style: TextStyle(
                        color: const Color(0xFF1A1A1A) /* color-text-primary */,
                        fontSize: 12,
                        fontFamily: 'Roboto',
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    Container(
                      clipBehavior: Clip.antiAlias,
                      decoration: BoxDecoration(),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        mainAxisAlignment: MainAxisAlignment.start,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        spacing: 5,
                        children: [
                          Container(
                            width: 14,
                            height: 14,
                            clipBehavior: Clip.antiAlias,
                            decoration: BoxDecoration(),
                            child: Stack(),
                          ),
                          Container(
                            width: 14,
                            height: 14,
                            clipBehavior: Clip.antiAlias,
                            decoration: BoxDecoration(),
                            child: Stack(),
                          ),
                          Container(
                            width: 16,
                            height: 16,
                            clipBehavior: Clip.antiAlias,
                            decoration: BoxDecoration(),
                            child: Stack(),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: Container(
                  width: double.infinity,
                  clipBehavior: Clip.antiAlias,
                  decoration: BoxDecoration(),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    mainAxisAlignment: MainAxisAlignment.start,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        width: double.infinity,
                        height: 64,
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        clipBehavior: Clip.antiAlias,
                        decoration: BoxDecoration(),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          mainAxisAlignment: MainAxisAlignment.start,
                          crossAxisAlignment: CrossAxisAlignment.center,
                          spacing: 12,
                          children: [
                            Container(
                              width: 24,
                              height: 24,
                              clipBehavior: Clip.antiAlias,
                              decoration: BoxDecoration(),
                              child: Stack(),
                            ),
                            SizedBox(
                              width: 663,
                              child: Text(
                                'Food',
                                style: TextStyle(
                                  color: const Color(
                                    0xFF1A1A1A,
                                  ) /* color-text-primary */,
                                  fontSize: 20,
                                  fontFamily: 'Roboto',
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ),
                            Text(
                              'Edit',
                              style: TextStyle(
                                color: const Color(
                                  0xFF1A1A1A,
                                ) /* color-text-primary */,
                                fontSize: 14,
                                fontFamily: 'Roboto',
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Expanded(
                        child: Container(
                          width: double.infinity,
                          padding: const EdgeInsets.only(
                            top: 8,
                            left: 16,
                            right: 16,
                            bottom: 24,
                          ),
                          clipBehavior: Clip.antiAlias,
                          decoration: BoxDecoration(),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            mainAxisAlignment: MainAxisAlignment.start,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            spacing: 20,
                            children: [
                              Container(
                                width: double.infinity,
                                padding: const EdgeInsets.all(16),
                                clipBehavior: Clip.antiAlias,
                                decoration: ShapeDecoration(
                                  color: const Color(0xFFECEAE4),
                                  shape: RoundedRectangleBorder(
                                    side: BorderSide(
                                      width: 1,
                                      color: const Color(0xFFCBC8C1),
                                    ),
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                ),
                                child: Column(
                                  mainAxisSize: MainAxisSize.min,
                                  mainAxisAlignment: MainAxisAlignment.start,
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  spacing: 12,
                                  children: [
                                    Container(
                                      width: double.infinity,
                                      clipBehavior: Clip.antiAlias,
                                      decoration: BoxDecoration(),
                                      child: Row(
                                        mainAxisSize: MainAxisSize.min,
                                        mainAxisAlignment:
                                            MainAxisAlignment.spaceBetween,
                                        crossAxisAlignment:
                                            CrossAxisAlignment.end,
                                        children: [
                                          Container(
                                            clipBehavior: Clip.antiAlias,
                                            decoration: BoxDecoration(),
                                            child: Column(
                                              mainAxisSize: MainAxisSize.min,
                                              mainAxisAlignment:
                                                  MainAxisAlignment.start,
                                              crossAxisAlignment:
                                                  CrossAxisAlignment.start,
                                              spacing: 3,
                                              children: [
                                                Text(
                                                  'Spent in October',
                                                  style: TextStyle(
                                                    color: const Color(
                                                      0xFF4A4843,
                                                    ) /* color-text-secondary */,
                                                    fontSize: 13,
                                                    fontFamily: 'Roboto',
                                                    fontWeight: FontWeight.w400,
                                                  ),
                                                ),
                                                Text(
                                                  '\$362.18',
                                                  style: TextStyle(
                                                    color: const Color(
                                                      0xFF1A1A1A,
                                                    ) /* color-text-primary */,
                                                    fontSize: 28,
                                                    fontFamily: 'Roboto',
                                                    fontWeight: FontWeight.w500,
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                          Text(
                                            'of \$450',
                                            style: TextStyle(
                                              color: const Color(
                                                0xFF4A4843,
                                              ) /* color-text-secondary */,
                                              fontSize: 14,
                                              fontFamily: 'Roboto',
                                              fontWeight: FontWeight.w400,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    Container(
                                      width: double.infinity,
                                      height: 10,
                                      clipBehavior: Clip.antiAlias,
                                      decoration: ShapeDecoration(
                                        color: const Color(0xFFECEAE4),
                                        shape: RoundedRectangleBorder(
                                          borderRadius: BorderRadius.circular(
                                            100,
                                          ),
                                        ),
                                      ),
                                      child: Stack(
                                        children: [
                                          Positioned(
                                            left: 0,
                                            top: -2,
                                            child: Container(
                                              width: 261,
                                              height: 10,
                                              decoration: BoxDecoration(
                                                color: const Color(0xFF5A6300),
                                              ),
                                            ),
                                          ),
                                          /*
                                                                        Positioned(left: 1021.06, top: 2051.12),
                                                                        Positioned(left: 1029.06, top: 2051.12),
                                                                        Positioned(left: 1037.06, top: 2051.12),
                                                                        Positioned(left: 1045.06, top: 2051.12),
                                                                        Positioned(left: 1053.06, top: 2051.12),
                                                                        Positioned(left: 1061.06, top: 2051.12),
                                                                        Positioned(left: 1069.06, top: 2051.12),
                                                                        Positioned(left: 1077.06, top: 2051.12),
                                                                        Positioned(left: 1085.06, top: 2051.12),
                                                                        Positioned(left: 1093.06, top: 2051.12),
                                                                        Positioned(left: 1101.06, top: 2051.12),
                                                                        Positioned(left: 1109.06, top: 2051.12),
                                                                        Positioned(left: 1117.06, top: 2051.12),
                                                                        Positioned(left: 1125.06, top: 2051.12),
                                                                        Positioned(left: 1133.06, top: 2051.12),
                                                                        Positioned(left: 1141.06, top: 2051.12),
                                                                        Positioned(left: 1149.06, top: 2051.12),
                                                                        Positioned(left: 1157.06, top: 2051.12),
                                                                        Positioned(left: 1165.06, top: 2051.12),
                                                                        Positioned(left: 1173.06, top: 2051.12),
                                                                        Positioned(left: 1181.06, top: 2051.12),
                                                                        Positioned(left: 1189.06, top: 2051.12),
                                                                        Positioned(left: 1197.06, top: 2051.12),
                                                                        Positioned(left: 1205.06, top: 2051.12),
                                                                        Positioned(left: 1213.06, top: 2051.12),
                                                                        Positioned(left: 1221.06, top: 2051.12),
                                                                        Positioned(left: 1229.06, top: 2051.12),
                                                                        Positioned(left: 1237.06, top: 2051.12),
                                                                        Positioned(left: 1245.06, top: 2051.12),
                                                                        Positioned(left: 1253.06, top: 2051.12),
                                                                        Positioned(left: 1261.06, top: 2051.12),
                                                                        Positioned(left: 1269.06, top: 2051.12),
                                                                        Positioned(left: 1277.06, top: 2051.12),
                                                                        Positioned(left: 1285.06, top: 2051.12),
                                                                        Positioned(left: 1293.06, top: 2051.12),
                                                                        Positioned(left: 1301.06, top: 2051.12),
                                                                        Positioned(left: 1309.06, top: 2051.12),
                                                                        Positioned(left: 1317.06, top: 2051.12),
                                                                        Positioned(left: 1325.06, top: 2051.12),
                                                                        Positioned(left: 1333.06, top: 2051.12),
                                                                        Positioned(left: 1341.06, top: 2051.12),
                                                                        Positioned(left: 1349.06, top: 2051.12),*/
                                        ],
                                      ),
                                    ),
                                    Container(
                                      width: double.infinity,
                                      clipBehavior: Clip.antiAlias,
                                      decoration: BoxDecoration(),
                                      child: Row(
                                        mainAxisSize: MainAxisSize.min,
                                        mainAxisAlignment:
                                            MainAxisAlignment.spaceBetween,
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Container(
                                            clipBehavior: Clip.antiAlias,
                                            decoration: BoxDecoration(),
                                            child: Row(
                                              mainAxisSize: MainAxisSize.min,
                                              mainAxisAlignment:
                                                  MainAxisAlignment.start,
                                              crossAxisAlignment:
                                                  CrossAxisAlignment.center,
                                              spacing: 6,
                                              children: [
                                                Container(
                                                  width: 16,
                                                  height: 16,
                                                  clipBehavior: Clip.antiAlias,
                                                  decoration: BoxDecoration(),
                                                  child: Stack(),
                                                ),
                                                Text(
                                                  'Near limit',
                                                  style: TextStyle(
                                                    color: const Color(
                                                      0xFF5A6300,
                                                    ) /* color-state-warning */,
                                                    fontSize: 13,
                                                    fontFamily: 'Roboto',
                                                    fontWeight: FontWeight.w600,
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                          Text(
                                            '\$87.82 left',
                                            style: TextStyle(
                                              color: const Color(
                                                0xFF1A1A1A,
                                              ) /* color-text-primary */,
                                              fontSize: 14,
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
                              Container(
                                width: double.infinity,
                                clipBehavior: Clip.antiAlias,
                                decoration: BoxDecoration(),
                                child: Column(
                                  mainAxisSize: MainAxisSize.min,
                                  mainAxisAlignment: MainAxisAlignment.start,
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  spacing: 8,
                                  children: [
                                    SizedBox(
                                      width: 736,
                                      child: Text(
                                        'PACE',
                                        style: TextStyle(
                                          color: const Color(
                                            0xFF1A1A1A,
                                          ) /* color-text-primary */,
                                          fontSize: 13,
                                          fontFamily: 'Roboto',
                                          fontWeight: FontWeight.w700,
                                        ),
                                      ),
                                    ),
                                    Container(
                                      width: double.infinity,
                                      padding: const EdgeInsets.all(16),
                                      clipBehavior: Clip.antiAlias,
                                      decoration: ShapeDecoration(
                                        color: Colors.white,
                                        shape: RoundedRectangleBorder(
                                          side: BorderSide(
                                            width: 1,
                                            color: const Color(0xFFCBC8C1),
                                          ),
                                          borderRadius: BorderRadius.circular(
                                            20,
                                          ),
                                        ),
                                      ),
                                      child: Column(
                                        mainAxisSize: MainAxisSize.min,
                                        mainAxisAlignment:
                                            MainAxisAlignment.start,
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        spacing: 8,
                                        children: [
                                          SizedBox(
                                            width: 704,
                                            child: Text(
                                              'You\'re spending \$4.10 more per day than planned.',
                                              style: TextStyle(
                                                color: const Color(
                                                  0xFF1A1A1A,
                                                ) /* color-text-primary */,
                                                fontSize: 16,
                                                fontFamily: 'Roboto',
                                                fontWeight: FontWeight.w500,
                                                height: 1.50,
                                              ),
                                            ),
                                          ),
                                          SizedBox(
                                            width: 704,
                                            child: Text(
                                              'At this pace, you\'ll be \$42 over budget by October 31.',
                                              style: TextStyle(
                                                color: const Color(
                                                  0xFF4A4843,
                                                ) /* color-text-secondary */,
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
                              Container(
                                width: double.infinity,
                                clipBehavior: Clip.antiAlias,
                                decoration: BoxDecoration(),
                                child: Column(
                                  mainAxisSize: MainAxisSize.min,
                                  mainAxisAlignment: MainAxisAlignment.start,
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  spacing: 8,
                                  children: [
                                    SizedBox(
                                      width: 736,
                                      child: Text(
                                        'RECENT TRANSACTIONS',
                                        style: TextStyle(
                                          color: const Color(
                                            0xFF1A1A1A,
                                          ) /* color-text-primary */,
                                          fontSize: 13,
                                          fontFamily: 'Roboto',
                                          fontWeight: FontWeight.w700,
                                        ),
                                      ),
                                    ),
                                    Container(
                                      width: double.infinity,
                                      padding: const EdgeInsets.all(8),
                                      clipBehavior: Clip.antiAlias,
                                      decoration: ShapeDecoration(
                                        color: Colors.white,
                                        shape: RoundedRectangleBorder(
                                          side: BorderSide(
                                            width: 1,
                                            color: const Color(0xFFCBC8C1),
                                          ),
                                          borderRadius: BorderRadius.circular(
                                            20,
                                          ),
                                        ),
                                      ),
                                      child: Column(
                                        mainAxisSize: MainAxisSize.min,
                                        mainAxisAlignment:
                                            MainAxisAlignment.start,
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Container(
                                            width: double.infinity,
                                            clipBehavior: Clip.antiAlias,
                                            decoration: BoxDecoration(),
                                            child: Column(
                                              mainAxisSize: MainAxisSize.min,
                                              mainAxisAlignment:
                                                  MainAxisAlignment.start,
                                              crossAxisAlignment:
                                                  CrossAxisAlignment.start,
                                              children: [
                                                ConstrainedBox(
                                                  constraints: BoxConstraints(
                                                    minHeight: 68,
                                                  ),
                                                  child: Container(
                                                    width: double.infinity,
                                                    padding:
                                                        const EdgeInsets.symmetric(
                                                          vertical: 10,
                                                        ),
                                                    clipBehavior:
                                                        Clip.antiAlias,
                                                    decoration: BoxDecoration(),
                                                    child: Row(
                                                      mainAxisSize:
                                                          MainAxisSize.min,
                                                      mainAxisAlignment:
                                                          MainAxisAlignment
                                                              .start,
                                                      crossAxisAlignment:
                                                          CrossAxisAlignment
                                                              .center,
                                                      spacing: 16,
                                                      children: [
                                                        Container(
                                                          width: 42,
                                                          height: 42,
                                                          clipBehavior:
                                                              Clip.antiAlias,
                                                          decoration: ShapeDecoration(
                                                            color: const Color(
                                                              0xFFF4F2ED,
                                                            ),
                                                            shape: RoundedRectangleBorder(
                                                              borderRadius:
                                                                  BorderRadius.circular(
                                                                    100,
                                                                  ),
                                                            ),
                                                          ),
                                                          child: Row(
                                                            mainAxisSize:
                                                                MainAxisSize
                                                                    .min,
                                                            mainAxisAlignment:
                                                                MainAxisAlignment
                                                                    .center,
                                                            crossAxisAlignment:
                                                                CrossAxisAlignment
                                                                    .center,
                                                            children: [
                                                              Container(
                                                                width: 22,
                                                                height: 22,
                                                                clipBehavior: Clip
                                                                    .antiAlias,
                                                                decoration:
                                                                    BoxDecoration(),
                                                                child: Stack(),
                                                              ),
                                                            ],
                                                          ),
                                                        ),
                                                        Expanded(
                                                          child: Container(
                                                            clipBehavior:
                                                                Clip.antiAlias,
                                                            decoration:
                                                                BoxDecoration(),
                                                            child: Column(
                                                              mainAxisSize:
                                                                  MainAxisSize
                                                                      .min,
                                                              mainAxisAlignment:
                                                                  MainAxisAlignment
                                                                      .start,
                                                              crossAxisAlignment:
                                                                  CrossAxisAlignment
                                                                      .start,
                                                              spacing: 2,
                                                              children: [
                                                                SizedBox(
                                                                  width: 590,
                                                                  child: Text(
                                                                    'Greenmarket Grocery',
                                                                    style: TextStyle(
                                                                      color: const Color(
                                                                        0xFF1A1A1A,
                                                                      ) /* color-text-primary */,
                                                                      fontSize:
                                                                          16,
                                                                      fontFamily: 'Roboto',
                                                                      fontWeight:
                                                                          FontWeight
                                                                              .w500,
                                                                      height:
                                                                          1.30,
                                                                    ),
                                                                  ),
                                                                ),
                                                                SizedBox(
                                                                  width: 590,
                                                                  child: Text(
                                                                    'Oct 13',
                                                                    style: TextStyle(
                                                                      color: const Color(
                                                                        0xFF4A4843,
                                                                      ) /* color-text-secondary */,
                                                                      fontSize:
                                                                          13,
                                                                      fontFamily: 'Roboto',
                                                                      fontWeight:
                                                                          FontWeight
                                                                              .w400,
                                                                      height:
                                                                          1.35,
                                                                    ),
                                                                  ),
                                                                ),
                                                              ],
                                                            ),
                                                          ),
                                                        ),
                                                        Text(
                                                          '−\$82.40',
                                                          textAlign:
                                                              TextAlign.right,
                                                          style: TextStyle(
                                                            color: const Color(
                                                              0xFF1A1A1A,
                                                            ) /* color-text-primary */,
                                                            fontSize: 15,
                                                            fontFamily:
                                                                'Roboto',
                                                            fontWeight:
                                                                FontWeight.w600,
                                                          ),
                                                        ),
                                                      ],
                                                    ),
                                                  ),
                                                ),
                                                Container(
                                                  width: double.infinity,
                                                  decoration: ShapeDecoration(
                                                    shape:
                                                        RoundedRectangleBorder(
                                                          side: BorderSide(
                                                            width: 1,
                                                            color: const Color(
                                                              0xFFCBC8C1,
                                                            ),
                                                          ),
                                                        ),
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                          Container(
                                            width: double.infinity,
                                            clipBehavior: Clip.antiAlias,
                                            decoration: BoxDecoration(),
                                            child: Column(
                                              mainAxisSize: MainAxisSize.min,
                                              mainAxisAlignment:
                                                  MainAxisAlignment.start,
                                              crossAxisAlignment:
                                                  CrossAxisAlignment.start,
                                              children: [
                                                ConstrainedBox(
                                                  constraints: BoxConstraints(
                                                    minHeight: 68,
                                                  ),
                                                  child: Container(
                                                    width: double.infinity,
                                                    padding:
                                                        const EdgeInsets.symmetric(
                                                          vertical: 10,
                                                        ),
                                                    clipBehavior:
                                                        Clip.antiAlias,
                                                    decoration: BoxDecoration(),
                                                    child: Row(
                                                      mainAxisSize:
                                                          MainAxisSize.min,
                                                      mainAxisAlignment:
                                                          MainAxisAlignment
                                                              .start,
                                                      crossAxisAlignment:
                                                          CrossAxisAlignment
                                                              .center,
                                                      spacing: 16,
                                                      children: [
                                                        Container(
                                                          width: 42,
                                                          height: 42,
                                                          clipBehavior:
                                                              Clip.antiAlias,
                                                          decoration: ShapeDecoration(
                                                            color: const Color(
                                                              0xFFF4F2ED,
                                                            ),
                                                            shape: RoundedRectangleBorder(
                                                              borderRadius:
                                                                  BorderRadius.circular(
                                                                    100,
                                                                  ),
                                                            ),
                                                          ),
                                                          child: Row(
                                                            mainAxisSize:
                                                                MainAxisSize
                                                                    .min,
                                                            mainAxisAlignment:
                                                                MainAxisAlignment
                                                                    .center,
                                                            crossAxisAlignment:
                                                                CrossAxisAlignment
                                                                    .center,
                                                            children: [
                                                              Container(
                                                                width: 22,
                                                                height: 22,
                                                                clipBehavior: Clip
                                                                    .antiAlias,
                                                                decoration:
                                                                    BoxDecoration(),
                                                                child: Stack(),
                                                              ),
                                                            ],
                                                          ),
                                                        ),
                                                        Expanded(
                                                          child: Container(
                                                            clipBehavior:
                                                                Clip.antiAlias,
                                                            decoration:
                                                                BoxDecoration(),
                                                            child: Column(
                                                              mainAxisSize:
                                                                  MainAxisSize
                                                                      .min,
                                                              mainAxisAlignment:
                                                                  MainAxisAlignment
                                                                      .start,
                                                              crossAxisAlignment:
                                                                  CrossAxisAlignment
                                                                      .start,
                                                              spacing: 2,
                                                              children: [
                                                                SizedBox(
                                                                  width: 590,
                                                                  child: Text(
                                                                    'Harbor Cafe',
                                                                    style: TextStyle(
                                                                      color: const Color(
                                                                        0xFF1A1A1A,
                                                                      ) /* color-text-primary */,
                                                                      fontSize:
                                                                          16,
                                                                      fontFamily: 'Roboto',
                                                                      fontWeight:
                                                                          FontWeight
                                                                              .w500,
                                                                      height:
                                                                          1.30,
                                                                    ),
                                                                  ),
                                                                ),
                                                                SizedBox(
                                                                  width: 590,
                                                                  child: Text(
                                                                    'Oct 11',
                                                                    style: TextStyle(
                                                                      color: const Color(
                                                                        0xFF4A4843,
                                                                      ) /* color-text-secondary */,
                                                                      fontSize:
                                                                          13,
                                                                      fontFamily: 'Roboto',
                                                                      fontWeight:
                                                                          FontWeight
                                                                              .w400,
                                                                      height:
                                                                          1.35,
                                                                    ),
                                                                  ),
                                                                ),
                                                              ],
                                                            ),
                                                          ),
                                                        ),
                                                        Text(
                                                          '−\$28.50',
                                                          textAlign:
                                                              TextAlign.right,
                                                          style: TextStyle(
                                                            color: const Color(
                                                              0xFF1A1A1A,
                                                            ) /* color-text-primary */,
                                                            fontSize: 15,
                                                            fontFamily:
                                                                'Roboto',
                                                            fontWeight:
                                                                FontWeight.w600,
                                                          ),
                                                        ),
                                                      ],
                                                    ),
                                                  ),
                                                ),
                                                Container(
                                                  width: double.infinity,
                                                  decoration: ShapeDecoration(
                                                    shape:
                                                        RoundedRectangleBorder(
                                                          side: BorderSide(
                                                            width: 1,
                                                            color: const Color(
                                                              0xFFCBC8C1,
                                                            ),
                                                          ),
                                                        ),
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                          Container(
                                            width: double.infinity,
                                            clipBehavior: Clip.antiAlias,
                                            decoration: BoxDecoration(),
                                            child: Column(
                                              mainAxisSize: MainAxisSize.min,
                                              mainAxisAlignment:
                                                  MainAxisAlignment.start,
                                              crossAxisAlignment:
                                                  CrossAxisAlignment.start,
                                              children: [
                                                ConstrainedBox(
                                                  constraints: BoxConstraints(
                                                    minHeight: 68,
                                                  ),
                                                  child: Container(
                                                    width: double.infinity,
                                                    padding:
                                                        const EdgeInsets.symmetric(
                                                          vertical: 10,
                                                        ),
                                                    clipBehavior:
                                                        Clip.antiAlias,
                                                    decoration: BoxDecoration(),
                                                    child: Row(
                                                      mainAxisSize:
                                                          MainAxisSize.min,
                                                      mainAxisAlignment:
                                                          MainAxisAlignment
                                                              .start,
                                                      crossAxisAlignment:
                                                          CrossAxisAlignment
                                                              .center,
                                                      spacing: 16,
                                                      children: [
                                                        Container(
                                                          width: 42,
                                                          height: 42,
                                                          clipBehavior:
                                                              Clip.antiAlias,
                                                          decoration: ShapeDecoration(
                                                            color: const Color(
                                                              0xFFF4F2ED,
                                                            ),
                                                            shape: RoundedRectangleBorder(
                                                              borderRadius:
                                                                  BorderRadius.circular(
                                                                    100,
                                                                  ),
                                                            ),
                                                          ),
                                                          child: Row(
                                                            mainAxisSize:
                                                                MainAxisSize
                                                                    .min,
                                                            mainAxisAlignment:
                                                                MainAxisAlignment
                                                                    .center,
                                                            crossAxisAlignment:
                                                                CrossAxisAlignment
                                                                    .center,
                                                            children: [
                                                              Container(
                                                                width: 22,
                                                                height: 22,
                                                                clipBehavior: Clip
                                                                    .antiAlias,
                                                                decoration:
                                                                    BoxDecoration(),
                                                                child: Stack(),
                                                              ),
                                                            ],
                                                          ),
                                                        ),
                                                        Expanded(
                                                          child: Container(
                                                            clipBehavior:
                                                                Clip.antiAlias,
                                                            decoration:
                                                                BoxDecoration(),
                                                            child: Column(
                                                              mainAxisSize:
                                                                  MainAxisSize
                                                                      .min,
                                                              mainAxisAlignment:
                                                                  MainAxisAlignment
                                                                      .start,
                                                              crossAxisAlignment:
                                                                  CrossAxisAlignment
                                                                      .start,
                                                              spacing: 2,
                                                              children: [
                                                                SizedBox(
                                                                  width: 590,
                                                                  child: Text(
                                                                    'Market Hall',
                                                                    style: TextStyle(
                                                                      color: const Color(
                                                                        0xFF1A1A1A,
                                                                      ) /* color-text-primary */,
                                                                      fontSize:
                                                                          16,
                                                                      fontFamily: 'Roboto',
                                                                      fontWeight:
                                                                          FontWeight
                                                                              .w500,
                                                                      height:
                                                                          1.30,
                                                                    ),
                                                                  ),
                                                                ),
                                                                SizedBox(
                                                                  width: 590,
                                                                  child: Text(
                                                                    'Oct 8',
                                                                    style: TextStyle(
                                                                      color: const Color(
                                                                        0xFF4A4843,
                                                                      ) /* color-text-secondary */,
                                                                      fontSize:
                                                                          13,
                                                                      fontFamily: 'Roboto',
                                                                      fontWeight:
                                                                          FontWeight
                                                                              .w400,
                                                                      height:
                                                                          1.35,
                                                                    ),
                                                                  ),
                                                                ),
                                                              ],
                                                            ),
                                                          ),
                                                        ),
                                                        Text(
                                                          '−\$63.20',
                                                          textAlign:
                                                              TextAlign.right,
                                                          style: TextStyle(
                                                            color: const Color(
                                                              0xFF1A1A1A,
                                                            ) /* color-text-primary */,
                                                            fontSize: 15,
                                                            fontFamily:
                                                                'Roboto',
                                                            fontWeight:
                                                                FontWeight.w600,
                                                          ),
                                                        ),
                                                      ],
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
                      ),
                    ],
                  ),
                ),
              ),
              Positioned(
                left: 0,
                top: 944,
                child: Container(
                  width: 768,
                  height: 80,
                  padding: const EdgeInsets.all(8),
                  clipBehavior: Clip.antiAlias,
                  decoration: ShapeDecoration(
                    color: const Color(0xFFF2F0EA),
                    shape: RoundedRectangleBorder(
                      side: BorderSide(
                        width: 1,
                        color: const Color(0xFFCBC8C1),
                      ),
                    ),
                    shadows: [
                      BoxShadow(
                        color: Color(0x14000000),
                        blurRadius: 8,
                        offset: Offset(0, -2),
                        spreadRadius: 0,
                      ),
                    ],
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    mainAxisAlignment: MainAxisAlignment.start,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      Expanded(
                        child: Container(
                          height: 64,
                          clipBehavior: Clip.antiAlias,
                          decoration: BoxDecoration(),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            mainAxisAlignment: MainAxisAlignment.center,
                            crossAxisAlignment: CrossAxisAlignment.center,
                            spacing: 3,
                            children: [
                              Container(
                                width: 60,
                                height: 32,
                                clipBehavior: Clip.antiAlias,
                                decoration: ShapeDecoration(
                                  color: Colors.white.withValues(alpha: 0),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(100),
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
                                      decoration: BoxDecoration(),
                                      child: Stack(),
                                    ),
                                  ],
                                ),
                              ),
                              SizedBox(
                                width: 150.40,
                                child: Text(
                                  'Home',
                                  textAlign: TextAlign.center,
                                  style: TextStyle(
                                    color: const Color(
                                      0xFF4A4843,
                                    ) /* color-text-secondary */,
                                    fontSize: 10,
                                    fontFamily: 'Roboto',
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      Expanded(
                        child: Container(
                          height: 64,
                          clipBehavior: Clip.antiAlias,
                          decoration: BoxDecoration(),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            mainAxisAlignment: MainAxisAlignment.center,
                            crossAxisAlignment: CrossAxisAlignment.center,
                            spacing: 3,
                            children: [
                              Container(
                                width: 60,
                                height: 32,
                                clipBehavior: Clip.antiAlias,
                                decoration: ShapeDecoration(
                                  color: Colors.white.withValues(alpha: 0),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(100),
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
                                      decoration: BoxDecoration(),
                                      child: Stack(),
                                    ),
                                  ],
                                ),
                              ),
                              SizedBox(
                                width: 150.40,
                                child: Text(
                                  'Transactions',
                                  textAlign: TextAlign.center,
                                  style: TextStyle(
                                    color: const Color(
                                      0xFF4A4843,
                                    ) /* color-text-secondary */,
                                    fontSize: 10,
                                    fontFamily: 'Roboto',
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      Expanded(
                        child: Container(
                          height: 64,
                          clipBehavior: Clip.antiAlias,
                          decoration: BoxDecoration(),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            mainAxisAlignment: MainAxisAlignment.center,
                            crossAxisAlignment: CrossAxisAlignment.center,
                            spacing: 3,
                            children: [
                              Container(
                                width: 60,
                                height: 32,
                                clipBehavior: Clip.antiAlias,
                                decoration: ShapeDecoration(
                                  color: Colors.white.withValues(alpha: 0),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(100),
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
                                      decoration: BoxDecoration(),
                                      child: Stack(),
                                    ),
                                  ],
                                ),
                              ),
                              SizedBox(
                                width: 150.40,
                                child: Text(
                                  'Spending',
                                  textAlign: TextAlign.center,
                                  style: TextStyle(
                                    color: const Color(
                                      0xFF4A4843,
                                    ) /* color-text-secondary */,
                                    fontSize: 10,
                                    fontFamily: 'Roboto',
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      Expanded(
                        child: Container(
                          height: 64,
                          clipBehavior: Clip.antiAlias,
                          decoration: BoxDecoration(),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            mainAxisAlignment: MainAxisAlignment.center,
                            crossAxisAlignment: CrossAxisAlignment.center,
                            spacing: 3,
                            children: [
                              Container(
                                width: 60,
                                height: 32,
                                clipBehavior: Clip.antiAlias,
                                decoration: ShapeDecoration(
                                  color: const Color(
                                    0xFF2B2E00,
                                  ) /* color-accent-on-container */,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(100),
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
                                      decoration: BoxDecoration(),
                                      child: Stack(),
                                    ),
                                  ],
                                ),
                              ),
                              SizedBox(
                                width: 150.40,
                                child: Text(
                                  'Budgets',
                                  textAlign: TextAlign.center,
                                  style: TextStyle(
                                    color: const Color(
                                      0xFF1A1A1A,
                                    ) /* color-text-primary */,
                                    fontSize: 10,
                                    fontFamily: 'Roboto',
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      Expanded(
                        child: Container(
                          height: 64,
                          clipBehavior: Clip.antiAlias,
                          decoration: BoxDecoration(),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            mainAxisAlignment: MainAxisAlignment.center,
                            crossAxisAlignment: CrossAxisAlignment.center,
                            spacing: 3,
                            children: [
                              Container(
                                width: 60,
                                height: 32,
                                clipBehavior: Clip.antiAlias,
                                decoration: ShapeDecoration(
                                  color: Colors.white.withValues(alpha: 0),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(100),
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
                                      decoration: BoxDecoration(),
                                      child: Stack(),
                                    ),
                                  ],
                                ),
                              ),
                              SizedBox(
                                width: 150.40,
                                child: Text(
                                  'Bills',
                                  textAlign: TextAlign.center,
                                  style: TextStyle(
                                    color: const Color(
                                      0xFF4A4843,
                                    ) /* color-text-secondary */,
                                    fontSize: 10,
                                    fontFamily: 'Roboto',
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
