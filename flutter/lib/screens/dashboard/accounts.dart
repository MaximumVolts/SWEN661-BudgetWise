import 'package:flutter/material.dart';

class AccountsScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          Row(
            children: [
              Row(
                children: [
                  Column(
                    children: [
                      Column(
                        children: [
                          SizedBox(
                            width: 14.00160026550293,
                            height: 14.00160026550293,
                          ),
                        ],
                      ),
                    ],
                  ),
                  Text(
                    "Accounts",
                    style: TextStyle(fontSize: 22, fontWeight: FontWeight.w400),
                  ),
                ],
              ),
              Row(
                children: [
                  Column(
                    children: [
                      Column(
                        children: [
                          SizedBox(
                            width: 20.00160026550293,
                            height: 17.107200622558594,
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
                  Text(
                    "Cash",
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w400),
                  ),
                  Text(
                    "\$9,368.60",
                    style: TextStyle(fontSize: 28, fontWeight: FontWeight.w400),
                  ),
                  Text(
                    "2 accounts",
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w400),
                  ),
                ],
              ),
              Container(
                width: 1,
                height: 100,
                decoration: BoxDecoration(color: Color(0xffcbc8c1)),
              ),
              Column(
                children: [
                  Text(
                    "Credit owed",
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w400),
                  ),
                  Text(
                    "\$412.37",
                    style: TextStyle(fontSize: 28, fontWeight: FontWeight.w400),
                  ),
                  Text(
                    "1 account",
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w400),
                  ),
                ],
              ),
            ],
          ),
          Row(
            children: [
              Column(
                children: [
                  SizedBox(
                    width: 16.667999267578125,
                    height: 16.667999267578125,
                  ),
                ],
              ),
              Column(
                children: [
                  Text(
                    "First Platypus Bank needs you to sign in again",
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700),
                  ),
                  Text(
                    "Showing data from Oct 15. Reconnect to resume syncing. Nothing you've added is lost.",
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w400),
                  ),
                ],
              ),
              Row(
                children: [
                  Column(
                    children: [
                      Text(
                        "Not now",
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                  Column(
                    children: [
                      Text(
                        "Reconnect",
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
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
              Row(
                children: [
                  Text(
                    "Checking & savings",
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                  ),
                  Text(
                    "Tartan Bank",
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.w400),
                  ),
                ],
              ),
              Row(
                children: [
                  Text(
                    "Credit",
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                  ),
                  Text(
                    "First Platypus Bank",
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.w400),
                  ),
                ],
              ),
            ],
          ),
          Row(
            children: [
              Column(
                children: [
                  Row(
                    children: [
                      Column(
                        children: [
                          Column(
                            children: [
                              SizedBox(
                                width: 12.834800720214844,
                                height: 16.5,
                              ),
                            ],
                          ),
                        ],
                      ),
                      Column(
                        children: [
                          Text(
                            "Everyday Checking",
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          Text(
                            "Checking ••0000",
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w400,
                            ),
                          ),
                          Row(
                            children: [
                              Column(
                                children: [
                                  SizedBox(
                                    width: 11.666679382324219,
                                    height: 11.666679382324219,
                                  ),
                                ],
                              ),
                              Text(
                                "Connected · synced 5 min ago",
                                style: TextStyle(
                                  fontSize: 11,
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
                            "\$3,248.60",
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  Container(
                    width: 312,
                    height: 1,
                    decoration: BoxDecoration(color: Color(0xffcbc8c1)),
                  ),
                  Container(
                    width: 344,
                    height: 1,
                    decoration: BoxDecoration(color: Color(0xffcbc8c1)),
                  ),
                  Row(
                    children: [
                      Column(
                        children: [
                          Column(
                            children: [SizedBox(width: 16.5, height: 16.5)],
                          ),
                        ],
                      ),
                      Column(
                        children: [
                          Text(
                            "Rainy Day Savings",
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          Text(
                            "Savings ••1111",
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w400,
                            ),
                          ),
                          Row(
                            children: [
                              Column(
                                children: [
                                  SizedBox(
                                    width: 11.666679382324219,
                                    height: 11.666679382324219,
                                  ),
                                ],
                              ),
                              Text(
                                "Connected · synced 5 min ago",
                                style: TextStyle(
                                  fontSize: 11,
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
                            "\$6,120.00",
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
              Column(
                children: [
                  Row(
                    children: [
                      Column(
                        children: [
                          Column(
                            children: [
                              SizedBox(
                                width: 18.334800720214844,
                                height: 12.834800720214844,
                              ),
                            ],
                          ),
                        ],
                      ),
                      Column(
                        children: [
                          Text(
                            "Platypus Credit Card",
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          Text(
                            "Credit ••3333",
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w400,
                            ),
                          ),
                          Row(
                            children: [
                              Column(
                                children: [
                                  SizedBox(
                                    width: 11.667600631713867,
                                    height: 11.667600631713867,
                                  ),
                                ],
                              ),
                              Text(
                                "Needs attention · last synced Oct 15",
                                style: TextStyle(
                                  fontSize: 11,
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
                            "\$412.37",
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          Text(
                            "owed",
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w400,
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
          Row(
            children: [
              Column(
                children: [
                  SizedBox(
                    width: 14.00160026550293,
                    height: 14.00160026550293,
                  ),
                ],
              ),
              Text(
                "Add account",
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
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
