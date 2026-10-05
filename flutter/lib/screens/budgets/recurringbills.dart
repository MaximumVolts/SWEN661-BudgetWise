import 'package:flutter/material.dart';

class RecurringBillsScreen extends StatelessWidget {
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
                  Text(
                    "Bills",
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.w500),
                  ),
                  Column(children: [SizedBox(width: 20, height: 20)]),
                ],
              ),
              Column(
                children: [
                  Row(
                    children: [
                      Row(
                        children: [
                          Text(
                            "Upcoming",
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                      Row(
                        children: [
                          Text(
                            "Recurring",
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  Row(
                    children: [
                      Column(
                        children: [
                          Text(
                            "Monthly",
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w400,
                            ),
                          ),
                          Text(
                            "\$57.98",
                            style: TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                      Column(
                        children: [
                          Text(
                            "Yearly",
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w400,
                            ),
                          ),
                          Text(
                            "\$695.76",
                            style: TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  Text(
                    "Recurring & subscriptions",
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700),
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
                                    children: [SizedBox(width: 18, height: 18)],
                                  ),
                                ],
                              ),
                              Column(
                                children: [
                                  Text(
                                    "CloudVault Storage",
                                    style: TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                  Text(
                                    "\$2.99 monthly · next Oct 29 \$35.88 a year",
                                    style: TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w400,
                                    ),
                                  ),
                                ],
                              ),
                              Row(
                                children: [
                                  Column(
                                    children: [SizedBox(width: 12, height: 12)],
                                  ),
                                  Text(
                                    "Active",
                                    style: TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ],
                              ),
                              Column(
                                children: [
                                  SizedBox(
                                    width: 1.6679999828338623,
                                    height: 13.331999778747559,
                                  ),
                                ],
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
                                    children: [SizedBox(width: 18, height: 18)],
                                  ),
                                ],
                              ),
                              Column(
                                children: [
                                  Text(
                                    "StreamBox",
                                    style: TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                  Text(
                                    "\$15.99 monthly · next Nov 14 \$191.88 a year",
                                    style: TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w400,
                                    ),
                                  ),
                                ],
                              ),
                              Row(
                                children: [
                                  Column(
                                    children: [SizedBox(width: 12, height: 12)],
                                  ),
                                  Text(
                                    "Active",
                                    style: TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ],
                              ),
                              Column(
                                children: [
                                  SizedBox(
                                    width: 1.6679999828338623,
                                    height: 13.331999778747559,
                                  ),
                                ],
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
                                    children: [SizedBox(width: 18, height: 18)],
                                  ),
                                ],
                              ),
                              Column(
                                children: [
                                  Text(
                                    "Pulse Fitness",
                                    style: TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                  Text(
                                    "\$39.00 monthly · paused Sep 30 \$0 a year while paused",
                                    style: TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w400,
                                    ),
                                  ),
                                ],
                              ),
                              Row(
                                children: [
                                  Column(
                                    children: [SizedBox(width: 12, height: 12)],
                                  ),
                                  Text(
                                    "Paused",
                                    style: TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ],
                              ),
                              Column(
                                children: [
                                  SizedBox(
                                    width: 1.6679999828338623,
                                    height: 13.331999778747559,
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ],
                      ),
                    ],
                  ),
                  Column(
                    children: [
                      Text(
                        "Subscription insight",
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      Text(
                        "Your recurring costs are \$15.99 higher than last month.",
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w400,
                        ),
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
                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.w500),
                  ),
                ],
              ),
              Column(
                children: [
                  Row(
                    children: [
                      Column(children: [SizedBox(width: 18, height: 18)]),
                    ],
                  ),
                  Text(
                    "Bills",
                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700),
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
