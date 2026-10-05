import 'package:flutter/material.dart';

class BudgetDetailScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          Row(
            children: [
              Text(
                "9:41",
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500),
              ),
              Row(
                children: [
                  Column(children: [SizedBox(width: 10, height: 10)]),
                  Column(children: [SizedBox(width: 10, height: 10)]),
                  Column(children: [SizedBox(width: 12, height: 12)]),
                ],
              ),
            ],
          ),
          Column(
            children: [
              Row(
                children: [
                  Column(children: [SizedBox(width: 20, height: 20)]),
                  Text(
                    "Food",
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.w500),
                  ),
                  Text(
                    "Edit",
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700),
                  ),
                ],
              ),
              Column(
                children: [
                  Column(
                    children: [
                      Row(
                        children: [
                          Column(
                            children: [
                              Text(
                                "Spent in October",
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w400,
                                ),
                              ),
                              Text(
                                "\$362.18",
                                style: TextStyle(
                                  fontSize: 28,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ),
                          Text(
                            "of \$450",
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w400,
                            ),
                          ),
                        ],
                      ),
                      Row(
                        children: [
                          Container(
                            width: 261,
                            height: 10,
                            decoration: BoxDecoration(color: Color(0xff5a6300)),
                          ),
                          SizedBox(width: 14.000005722045898, height: 0),
                          SizedBox(width: 14.000005722045898, height: 0),
                          SizedBox(width: 14.000005722045898, height: 0),
                          SizedBox(width: 14.000005722045898, height: 0),
                          SizedBox(width: 14.000005722045898, height: 0),
                          SizedBox(width: 14.000005722045898, height: 0),
                          SizedBox(width: 14.000005722045898, height: 0),
                          SizedBox(width: 14.000005722045898, height: 0),
                          SizedBox(width: 14.000005722045898, height: 0),
                          SizedBox(width: 14.000005722045898, height: 0),
                          SizedBox(width: 14.000005722045898, height: 0),
                          SizedBox(width: 14.000005722045898, height: 0),
                          SizedBox(width: 14.000005722045898, height: 0),
                          SizedBox(width: 14.000005722045898, height: 0),
                          SizedBox(width: 14.000005722045898, height: 0),
                          SizedBox(width: 14.000005722045898, height: 0),
                          SizedBox(width: 14.000005722045898, height: 0),
                          SizedBox(width: 14.000005722045898, height: 0),
                          SizedBox(width: 14.000005722045898, height: 0),
                          SizedBox(width: 14.000005722045898, height: 0),
                          SizedBox(width: 14.000005722045898, height: 0),
                          SizedBox(width: 14.000005722045898, height: 0),
                          SizedBox(width: 14.000005722045898, height: 0),
                          SizedBox(width: 14.000005722045898, height: 0),
                          SizedBox(width: 14.000005722045898, height: 0),
                          SizedBox(width: 14.000005722045898, height: 0),
                          SizedBox(width: 14.000005722045898, height: 0),
                          SizedBox(width: 14.000005722045898, height: 0),
                          SizedBox(width: 14.000005722045898, height: 0),
                          SizedBox(width: 14.000005722045898, height: 0),
                          SizedBox(width: 14.000005722045898, height: 0),
                          SizedBox(width: 14.000005722045898, height: 0),
                          SizedBox(width: 14.000005722045898, height: 0),
                          SizedBox(width: 14.000005722045898, height: 0),
                          SizedBox(width: 14.000005722045898, height: 0),
                          SizedBox(width: 14.000005722045898, height: 0),
                          SizedBox(width: 14.000005722045898, height: 0),
                          SizedBox(width: 14.000005722045898, height: 0),
                          SizedBox(width: 14.000005722045898, height: 0),
                          SizedBox(width: 14.000005722045898, height: 0),
                          SizedBox(width: 14.000005722045898, height: 0),
                          SizedBox(width: 14.000005722045898, height: 0),
                        ],
                      ),
                      Row(
                        children: [
                          Row(
                            children: [
                              Column(
                                children: [SizedBox(width: 12, height: 12)],
                              ),
                              Text(
                                "Near limit",
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                          Text(
                            "\$87.82 left",
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w400,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  Column(
                    children: [
                      Text(
                        "Pace",
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      Column(
                        children: [
                          Text(
                            "You're spending \$4.10 more per day than planned.",
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          Text(
                            "At this pace, you'll be \$42 over budget by October 31.",
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w400,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  Column(
                    children: [
                      Text(
                        "Recent transactions",
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      Column(
                        children: [
                          Column(
                            children: [
                              Row(
                                children: [
                                  Row(
                                    children: [
                                      Column(
                                        children: [
                                          SizedBox(width: 18, height: 18),
                                        ],
                                      ),
                                    ],
                                  ),
                                  Column(
                                    children: [
                                      Text(
                                        "Greenmarket Grocery",
                                        style: TextStyle(
                                          fontSize: 16,
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                                      Text(
                                        "Oct 13",
                                        style: TextStyle(
                                          fontSize: 13,
                                          fontWeight: FontWeight.w400,
                                        ),
                                      ),
                                    ],
                                  ),
                                  Text(
                                    "−\$82.40",
                                    style: TextStyle(
                                      fontSize: 15,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ],
                              ),
                              SizedBox(width: 720, height: 0),
                            ],
                          ),
                          Column(
                            children: [
                              Row(
                                children: [
                                  Row(
                                    children: [
                                      Column(
                                        children: [
                                          SizedBox(width: 18, height: 18),
                                        ],
                                      ),
                                    ],
                                  ),
                                  Column(
                                    children: [
                                      Text(
                                        "Harbor Cafe",
                                        style: TextStyle(
                                          fontSize: 16,
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                                      Text(
                                        "Oct 11",
                                        style: TextStyle(
                                          fontSize: 13,
                                          fontWeight: FontWeight.w400,
                                        ),
                                      ),
                                    ],
                                  ),
                                  Text(
                                    "−\$28.50",
                                    style: TextStyle(
                                      fontSize: 15,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ],
                              ),
                              SizedBox(width: 720, height: 0),
                            ],
                          ),
                          Column(
                            children: [
                              Row(
                                children: [
                                  Row(
                                    children: [
                                      Column(
                                        children: [
                                          SizedBox(width: 18, height: 18),
                                        ],
                                      ),
                                    ],
                                  ),
                                  Column(
                                    children: [
                                      Text(
                                        "Market Hall",
                                        style: TextStyle(
                                          fontSize: 16,
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                                      Text(
                                        "Oct 8",
                                        style: TextStyle(
                                          fontSize: 13,
                                          fontWeight: FontWeight.w400,
                                        ),
                                      ),
                                    ],
                                  ),
                                  Text(
                                    "−\$63.20",
                                    style: TextStyle(
                                      fontSize: 15,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
          Row(
            children: [
              Column(
                children: [
                  Column(
                    children: [
                      Column(
                        children: [
                          SizedBox(width: 16.5, height: 17.417400360107422),
                        ],
                      ),
                    ],
                  ),
                  Text(
                    "Home",
                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.w500),
                  ),
                ],
              ),
              Column(
                children: [
                  Column(
                    children: [
                      Column(
                        children: [
                          SizedBox(
                            width: 14.665200233459473,
                            height: 18.341400146484375,
                          ),
                        ],
                      ),
                    ],
                  ),
                  Text(
                    "Transactions",
                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.w500),
                  ),
                ],
              ),
              Column(
                children: [
                  Column(
                    children: [
                      Column(
                        children: [
                          SizedBox(
                            width: 18.332599639892578,
                            height: 18.332599639892578,
                          ),
                        ],
                      ),
                    ],
                  ),
                  Text(
                    "Spending",
                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.w500),
                  ),
                ],
              ),
              Column(
                children: [
                  Column(
                    children: [
                      Column(
                        children: [
                          SizedBox(width: 17.417400360107422, height: 16.5),
                        ],
                      ),
                    ],
                  ),
                  Text(
                    "Budgets",
                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700),
                  ),
                ],
              ),
              Column(
                children: [
                  Column(
                    children: [
                      Column(
                        children: [
                          SizedBox(width: 16.5, height: 18.334800720214844),
                        ],
                      ),
                    ],
                  ),
                  Text(
                    "Bills",
                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.w500),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}
