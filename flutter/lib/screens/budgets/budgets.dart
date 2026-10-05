import 'package:flutter/material.dart';

class BudgetsScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          Column(
            children: [
              Row(
                children: [
                  Text(
                    "Budgets",
                    style: TextStyle(fontSize: 22, fontWeight: FontWeight.w400),
                  ),
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
              Row(
                children: [
                  Row(
                    children: [
                      Column(
                        children: [
                          Column(children: [SizedBox(width: 5, height: 10)]),
                        ],
                      ),
                      Column(
                        children: [
                          Text(
                            "October 2026",
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                      Column(
                        children: [
                          Column(children: [SizedBox(width: 5, height: 10)]),
                        ],
                      ),
                    ],
                  ),
                  Row(
                    children: [
                      Column(
                        children: [
                          Text(
                            "Weekly",
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                      Row(
                        children: [
                          Column(
                            children: [
                              SizedBox(
                                width: 10.665599822998047,
                                height: 7.332799911499023,
                              ),
                            ],
                          ),
                          Text(
                            "Monthly",
                            style: TextStyle(
                              fontSize: 13,
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
                  Column(
                    children: [
                      Column(
                        children: [
                          Text(
                            "Remaining this month",
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          Text(
                            "\$737.95",
                            style: TextStyle(
                              fontSize: 36,
                              fontWeight: FontWeight.w400,
                            ),
                          ),
                          Row(
                            children: [
                              Container(
                                width: 225,
                                height: 6,
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(3),
                                  color: Color(0xff1a1a18),
                                ),
                              ),
                            ],
                          ),
                          Row(
                            children: [
                              Column(
                                children: [
                                  Text(
                                    "Total budget",
                                    style: TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w400,
                                    ),
                                  ),
                                  Text(
                                    "\$3,200.00",
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
                                    "Spent",
                                    style: TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w400,
                                    ),
                                  ),
                                  Text(
                                    "\$2,462.05",
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
                                    "Used",
                                    style: TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w400,
                                    ),
                                  ),
                                  Text(
                                    "77%",
                                    style: TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                          SizedBox(width: 300, height: 0),
                          Row(
                            children: [
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
                                    "1 over budget",
                                    style: TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ],
                              ),
                              Row(
                                children: [
                                  Column(
                                    children: [
                                      SizedBox(
                                        width: 11.675968170166016,
                                        height: 10.508152961730957,
                                      ),
                                    ],
                                  ),
                                  Text(
                                    "1 near limit",
                                    style: TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ],
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
                                    "4 under budget",
                                    style: TextStyle(
                                      fontSize: 11,
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
                              Container(
                                width: 28,
                                height: 6,
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(3),
                                  color: Color(0xff1a1a18),
                                ),
                              ),
                              Text(
                                "Solid: under",
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w400,
                                ),
                              ),
                            ],
                          ),
                          Row(
                            children: [
                              Row(
                                children: [
                                  Container(
                                    width: 5,
                                    height: 6,
                                    decoration: BoxDecoration(
                                      color: Color(0xffe4ee6a),
                                    ),
                                  ),
                                  Container(
                                    width: 5,
                                    height: 6,
                                    decoration: BoxDecoration(
                                      color: Color(0xff5a6300),
                                    ),
                                  ),
                                  Container(
                                    width: 5,
                                    height: 6,
                                    decoration: BoxDecoration(
                                      color: Color(0xffe4ee6a),
                                    ),
                                  ),
                                  Container(
                                    width: 5,
                                    height: 6,
                                    decoration: BoxDecoration(
                                      color: Color(0xff5a6300),
                                    ),
                                  ),
                                  Container(
                                    width: 8,
                                    height: 6,
                                    decoration: BoxDecoration(
                                      color: Color(0xffe4ee6a),
                                    ),
                                  ),
                                ],
                              ),
                              Text(
                                "Striped: near limit",
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w400,
                                ),
                              ),
                            ],
                          ),
                          Row(
                            children: [
                              Row(
                                children: [
                                  Image.asset(
                                    "assets/Ellipse.png",
                                    width: 5,
                                    height: 5,
                                  ),
                                  Image.asset(
                                    "assets/Ellipse.png",
                                    width: 5,
                                    height: 5,
                                  ),
                                  Image.asset(
                                    "assets/Ellipse.png",
                                    width: 5,
                                    height: 5,
                                  ),
                                  Image.asset(
                                    "assets/Ellipse.png",
                                    width: 5,
                                    height: 5,
                                  ),
                                ],
                              ),
                              Text(
                                "Hatched: over",
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w400,
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
                      Text(
                        "Categories",
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
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
                                          Column(
                                            children: [
                                              SizedBox(
                                                width: 16.667999267578125,
                                                height: 13.331999778747559,
                                              ),
                                            ],
                                          ),
                                        ],
                                      ),
                                      Text(
                                        "Transportation",
                                        style: TextStyle(
                                          fontSize: 14,
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                                    ],
                                  ),
                                  Text(
                                    "\$28.60 over",
                                    style: TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ],
                              ),
                              Row(children: [Row(children: [
                    
                                                                        ],
                                                                    )]),
                              Row(
                                children: [
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
                                        "Over budget",
                                        style: TextStyle(
                                          fontSize: 11,
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                                    ],
                                  ),
                                  Text(
                                    "\$148.60 of \$120",
                                    style: TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w400,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                          SizedBox(width: 364, height: 0),
                          Column(
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
                                                width: 16.634000778198242,
                                                height: 16.667999267578125,
                                              ),
                                            ],
                                          ),
                                        ],
                                      ),
                                      Text(
                                        "Food",
                                        style: TextStyle(
                                          fontSize: 14,
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                                    ],
                                  ),
                                  Text(
                                    "\$87.82 left",
                                    style: TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ],
                              ),
                              Row(
                                children: [
                                  Row(
                                    children: [
                                      Container(
                                        width: 24,
                                        height: 6,
                                        decoration: BoxDecoration(
                                          color: Color(0xff5a6300),
                                        ),
                                      ),
                                      Container(
                                        width: 12,
                                        height: 6,
                                        decoration: BoxDecoration(
                                          color: Color(0xffe4ee6a),
                                        ),
                                      ),
                                      Container(
                                        width: 24,
                                        height: 6,
                                        decoration: BoxDecoration(
                                          color: Color(0xff5a6300),
                                        ),
                                      ),
                                      Container(
                                        width: 12,
                                        height: 6,
                                        decoration: BoxDecoration(
                                          color: Color(0xffe4ee6a),
                                        ),
                                      ),
                                      Container(
                                        width: 24,
                                        height: 6,
                                        decoration: BoxDecoration(
                                          color: Color(0xff5a6300),
                                        ),
                                      ),
                                      Container(
                                        width: 12,
                                        height: 6,
                                        decoration: BoxDecoration(
                                          color: Color(0xffe4ee6a),
                                        ),
                                      ),
                                      Container(
                                        width: 24,
                                        height: 6,
                                        decoration: BoxDecoration(
                                          color: Color(0xff5a6300),
                                        ),
                                      ),
                                      Container(
                                        width: 12,
                                        height: 6,
                                        decoration: BoxDecoration(
                                          color: Color(0xffe4ee6a),
                                        ),
                                      ),
                                      Container(
                                        width: 24,
                                        height: 6,
                                        decoration: BoxDecoration(
                                          color: Color(0xff5a6300),
                                        ),
                                      ),
                                      Container(
                                        width: 12,
                                        height: 6,
                                        decoration: BoxDecoration(
                                          color: Color(0xffe4ee6a),
                                        ),
                                      ),
                                      Container(
                                        width: 24,
                                        height: 6,
                                        decoration: BoxDecoration(
                                          color: Color(0xff5a6300),
                                        ),
                                      ),
                                      Container(
                                        width: 12,
                                        height: 6,
                                        decoration: BoxDecoration(
                                          color: Color(0xffe4ee6a),
                                        ),
                                      ),
                                      Container(
                                        width: 24,
                                        height: 6,
                                        decoration: BoxDecoration(
                                          color: Color(0xff5a6300),
                                        ),
                                      ),
                                      Container(
                                        width: 12,
                                        height: 6,
                                        decoration: BoxDecoration(
                                          color: Color(0xffe4ee6a),
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                              Row(
                                children: [
                                  Row(
                                    children: [
                                      Column(
                                        children: [
                                          SizedBox(
                                            width: 11.675968170166016,
                                            height: 10.508152961730957,
                                          ),
                                        ],
                                      ),
                                      Text(
                                        "Near limit",
                                        style: TextStyle(
                                          fontSize: 11,
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                                    ],
                                  ),
                                  Text(
                                    "\$362.18 of \$450",
                                    style: TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w400,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                          SizedBox(width: 364, height: 0),
                          Column(
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
                                                width: 13.331999778747559,
                                                height: 16.673999786376953,
                                              ),
                                            ],
                                          ),
                                        ],
                                      ),
                                      Text(
                                        "Bills",
                                        style: TextStyle(
                                          fontSize: 14,
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                                    ],
                                  ),
                                  Text(
                                    "\$465.00 left",
                                    style: TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ],
                              ),
                              Row(
                                children: [
                                  Container(
                                    width: 160,
                                    height: 6,
                                    decoration: BoxDecoration(
                                      borderRadius: BorderRadius.circular(3),
                                      color: Color(0xff1a1a18),
                                    ),
                                  ),
                                ],
                              ),
                              Row(
                                children: [
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
                                        "Under budget",
                                        style: TextStyle(
                                          fontSize: 11,
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                                    ],
                                  ),
                                  Text(
                                    "\$1,535.00 of \$2,000",
                                    style: TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w400,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                          SizedBox(width: 364, height: 0),
                          Column(
                            children: [
                              Row(
                                children: [
                                  Row(
                                    children: [
                                      Column(
                                        children: [
                                          Column(
                                            children: [
                                              SizedBox(width: 15, height: 15),
                                            ],
                                          ),
                                        ],
                                      ),
                                      Text(
                                        "Savings",
                                        style: TextStyle(
                                          fontSize: 14,
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                                    ],
                                  ),
                                  Text(
                                    "\$100.00 left",
                                    style: TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ],
                              ),
                              Row(
                                children: [
                                  Container(
                                    width: 220,
                                    height: 6,
                                    decoration: BoxDecoration(
                                      borderRadius: BorderRadius.circular(3),
                                      color: Color(0xff1a1a18),
                                    ),
                                  ),
                                ],
                              ),
                              Row(
                                children: [
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
                                        "Under budget",
                                        style: TextStyle(
                                          fontSize: 11,
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                                    ],
                                  ),
                                  Text(
                                    "\$300.00 of \$400",
                                    style: TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w400,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                          SizedBox(width: 364, height: 0),
                          Column(
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
                                                width: 15,
                                                height: 16.663249969482422,
                                              ),
                                            ],
                                          ),
                                        ],
                                      ),
                                      Text(
                                        "Utilities",
                                        style: TextStyle(
                                          fontSize: 14,
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                                    ],
                                  ),
                                  Text(
                                    "\$65.70 left",
                                    style: TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ],
                              ),
                              Row(
                                children: [
                                  Container(
                                    width: 252,
                                    height: 6,
                                    decoration: BoxDecoration(
                                      borderRadius: BorderRadius.circular(3),
                                      color: Color(0xff1a1a18),
                                    ),
                                  ),
                                ],
                              ),
                              Row(
                                children: [
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
                                        "Under budget",
                                        style: TextStyle(
                                          fontSize: 11,
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                                    ],
                                  ),
                                  Text(
                                    "\$84.30 of \$150",
                                    style: TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w400,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                          SizedBox(width: 364, height: 0),
                          Column(
                            children: [
                              Row(
                                children: [
                                  Row(
                                    children: [
                                      Column(
                                        children: [
                                          Column(
                                            children: [
                                              SizedBox(width: 15, height: 15),
                                            ],
                                          ),
                                        ],
                                      ),
                                      Text(
                                        "Subscriptions",
                                        style: TextStyle(
                                          fontSize: 14,
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                                    ],
                                  ),
                                  Text(
                                    "\$48.03 left",
                                    style: TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ],
                              ),
                              Row(
                                children: [
                                  Container(
                                    width: 268,
                                    height: 6,
                                    decoration: BoxDecoration(
                                      borderRadius: BorderRadius.circular(3),
                                      color: Color(0xff1a1a18),
                                    ),
                                  ),
                                ],
                              ),
                              Row(
                                children: [
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
                                        "Under budget",
                                        style: TextStyle(
                                          fontSize: 11,
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                                    ],
                                  ),
                                  Text(
                                    "\$31.97 of \$80",
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
