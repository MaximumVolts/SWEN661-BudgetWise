import 'package:flutter/material.dart';

class DashboardScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          Row(
            children: [
              Column(
                children: [
                  Container(width: 17.9127197265625, height: 19.96414566040039),
                ],
              ),
              Text(
                "Sun, Oct 18",
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
              ),
              Row(
                children: [
                  Column(
                    children: [
                      Column(
                        children: [
                          Container(width: 18, height: 20.00160026550293),
                        ],
                      ),
                      Column(
                        children: [
                          Text(
                            "2",
                            style: TextStyle(
                              fontSize: 9,
                              fontWeight: FontWeight.w700,
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
              Row(
                children: [
                  Column(
                    children: [
                      Column(
                        children: [
                          Container(
                            width: 11.998800277709961,
                            height: 15.006600379943848,
                          ),
                        ],
                      ),
                    ],
                  ),
                  Column(
                    children: [
                      Text(
                        "Review transactions",
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      Text(
                        "7 new since Friday · see where your money's going",
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w400,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              Column(children: [Container(width: 5, height: 10)]),
            ],
          ),
          Column(
            children: [
              Column(
                children: [
                  Row(
                    children: [
                      Text(
                        "Current spend this month",
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w400,
                        ),
                      ),
                      Row(
                        children: [
                          Column(
                            children: [
                              Container(
                                width: 13.334400177001953,
                                height: 6.665599822998047,
                              ),
                            ],
                          ),
                          Column(
                            children: [
                              Text(
                                "\$143.65 above",
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              Text(
                                "Sep 1–18",
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w400,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ],
                  ),
                  Text(
                    "\$2,462",
                    style: TextStyle(fontSize: 34, fontWeight: FontWeight.w400),
                  ),
                ],
              ),
              Column(
                children: [
                  Image.asset(
                    "assets/October area fill.png",
                    width: 236,
                    height: 153,
                  ),
                  Image.asset(
                    "assets/October actual line.png",
                    width: 236,
                    height: 153,
                  ),
                  Image.asset(
                    "assets/September projection.png",
                    width: 106,
                    height: 22,
                  ),
                  Container(width: 342, height: 0),
                  Image.asset(
                    "assets/Current spend marker.png",
                    width: 12,
                    height: 12,
                  ),
                ],
              ),
              Row(
                children: [
                  Row(
                    children: [
                      Row(
                        children: [
                          Container(
                            width: 16,
                            height: 3,
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(2),
                              color: Color(0xffe4ee6a),
                            ),
                          ),
                          Text(
                            "October",
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w400,
                            ),
                          ),
                        ],
                      ),
                      Row(
                        children: [
                          Text(
                            "September",
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w400,
                            ),
                          ),
                          Image.asset(
                            "assets/September dashed legend.png",
                            width: 16,
                            height: 0,
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
                      Column(
                        children: [
                          Container(
                            width: 15.001199722290039,
                            height: 10.501199722290039,
                          ),
                        ],
                      ),
                      Text(
                        "Payday in 12 days",
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w400,
                        ),
                      ),
                    ],
                  ),
                  Column(
                    children: [
                      Container(
                        width: 15.001199722290039,
                        height: 15.001199722290039,
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
          Row(
            children: [
              Image.asset("assets/Ellipse.png", width: 8, height: 8),
              Image.asset("assets/Ellipse.png", width: 8, height: 8),
              Image.asset("assets/Ellipse.png", width: 8, height: 8),
            ],
          ),
          Column(
            children: [
              Row(
                children: [
                  Text(
                    "ACCOUNTS",
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700),
                  ),
                  Text(
                    "Add account",
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500),
                  ),
                ],
              ),
              Row(
                children: [
                  Row(
                    children: [
                      Column(
                        children: [
                          Container(width: 11.668000221252441, height: 15),
                        ],
                      ),
                      Text(
                        "Checking",
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w400,
                        ),
                      ),
                    ],
                  ),
                  Row(
                    children: [
                      Text(
                        "\$3,248.60",
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      Column(children: [Container(width: 9, height: 4.5)]),
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
                          Container(
                            width: 16.667999267578125,
                            height: 11.668000221252441,
                          ),
                        ],
                      ),
                      Column(
                        children: [
                          Text(
                            "Card balance",
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w400,
                            ),
                          ),
                          Row(
                            children: [
                              Image.asset(
                                "assets/Ellipse.png",
                                width: 10,
                                height: 10,
                              ),
                              Text(
                                "Needs attention",
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
                  Row(
                    children: [
                      Text(
                        "\$412.37",
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      Column(children: [Container(width: 9, height: 4.5)]),
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
                          Container(width: 15.833333015441895, height: 15),
                        ],
                      ),
                      Column(
                        children: [
                          Text(
                            "Available balance",
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w400,
                            ),
                          ),
                          Text(
                            "After bills due before payday",
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w400,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  Row(
                    children: [
                      Text(
                        "\$2,739.05",
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      Column(
                        children: [
                          Container(
                            width: 15.001199722290039,
                            height: 15.001199722290039,
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
                      Column(children: [Container(width: 15, height: 15)]),
                      Text(
                        "Savings",
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w400,
                        ),
                      ),
                    ],
                  ),
                  Row(
                    children: [
                      Text(
                        "\$6,120.00",
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      Column(children: [Container(width: 9, height: 4.5)]),
                    ],
                  ),
                ],
              ),
              Row(
                children: [
                  Column(
                    children: [
                      Container(width: 10.5, height: 11.667600631713867),
                    ],
                  ),
                  Text(
                    "5 minutes ago ·",
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.w400),
                  ),
                  Text(
                    "Sync now",
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.w500),
                  ),
                ],
              ),
            ],
          ),
          Column(
            children: [
              Row(
                children: [
                  Text(
                    "RECENT TRANSACTIONS",
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700),
                  ),
                ],
              ),
              Row(
                children: [
                  Row(
                    children: [
                      Column(
                        children: [
                          Column(
                            children: [Container(width: 14.25, height: 14.25)],
                          ),
                        ],
                      ),
                      Column(
                        children: [
                          Text(
                            "Juniper Coffee",
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          Text(
                            "October 18 · Pending",
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w400,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  Text(
                    "\$6.45",
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
                  ),
                ],
              ),
              Row(
                children: [
                  Row(
                    children: [
                      Column(
                        children: [
                          Column(
                            children: [
                              Container(
                                width: 15.030000686645508,
                                height: 14.963399887084961,
                              ),
                            ],
                          ),
                        ],
                      ),
                      Column(
                        children: [
                          Text(
                            "Fresh Fields Grocery",
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          Text(
                            "October 17",
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w400,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  Text(
                    "\$84.12",
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
                  ),
                ],
              ),
              Row(
                children: [
                  Row(
                    children: [
                      Column(
                        children: [
                          Column(
                            children: [
                              Container(width: 15.001199722290039, height: 9),
                            ],
                          ),
                        ],
                      ),
                      Column(
                        children: [
                          Text(
                            "CityRide",
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          Text(
                            "October 17",
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w400,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  Text(
                    "\$23.80",
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
                  ),
                ],
              ),
              Row(
                children: [
                  Row(
                    children: [
                      Column(
                        children: [
                          Column(
                            children: [
                              Container(
                                width: 15.000015258789062,
                                height: 15.000015258789062,
                              ),
                            ],
                          ),
                        ],
                      ),
                      Column(
                        children: [
                          Text(
                            "Ardent Systems payroll",
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          Text(
                            "October 16 · Income",
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w400,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  Text(
                    "+\$2,145.00",
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
                  ),
                ],
              ),
              Column(
                children: [
                  Text(
                    "See more",
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500),
                  ),
                ],
              ),
            ],
          ),
          Column(
            children: [
              Row(
                children: [
                  Text(
                    "YOUR BUDGET",
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700),
                  ),
                  Text(
                    "See budget",
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500),
                  ),
                ],
              ),
              Column(
                children: [
                  Row(
                    children: [
                      Text(
                        "October",
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w400,
                        ),
                      ),
                      Text(
                        "\$2,462.05 of \$3,200",
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w400,
                        ),
                      ),
                    ],
                  ),
                  Text(
                    "\$737.95 left to spend",
                    style: TextStyle(fontSize: 26, fontWeight: FontWeight.w400),
                  ),
                  Row(
                    children: [
                      Container(
                        width: 240,
                        height: 8,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(4),
                          color: Color(0xff1a1a18),
                        ),
                      ),
                    ],
                  ),
                  Row(
                    children: [
                      Column(
                        children: [
                          Container(
                            width: 11.666679382324219,
                            height: 11.666679382324219,
                          ),
                        ],
                      ),
                      Text(
                        "Under budget · 77% used",
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
                  Row(
                    children: [
                      Row(
                        children: [
                          Column(
                            children: [
                              Column(
                                children: [
                                  Container(
                                    width: 12,
                                    height: 13.334400177001953,
                                  ),
                                ],
                              ),
                            ],
                          ),
                          Text(
                            "Transportation",
                            style: TextStyle(
                              fontSize: 13,
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
                  Row(
                    children: [
                      Container(
                        width: 330,
                        height: 6,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(3),
                          color: Color(0xffb3261e),
                        ),
                      ),
                    ],
                  ),
                  Row(
                    children: [
                      Column(
                        children: [
                          Container(
                            width: 10.000800132751465,
                            height: 10.000800132751465,
                          ),
                        ],
                      ),
                      Text(
                        "Over budget",
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
                  Row(
                    children: [
                      Row(
                        children: [
                          Column(
                            children: [
                              Column(
                                children: [
                                  Container(
                                    width: 13.30720043182373,
                                    height: 13.334400177001953,
                                  ),
                                ],
                              ),
                            ],
                          ),
                          Text(
                            "Food",
                            style: TextStyle(
                              fontSize: 13,
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
                      Container(
                        width: 240,
                        height: 6,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(3),
                          color: Color(0xffe4ee6a),
                        ),
                      ),
                    ],
                  ),
                  Row(
                    children: [
                      Column(
                        children: [
                          Container(
                            width: 10.007972717285156,
                            height: 9.006988525390625,
                          ),
                        ],
                      ),
                      Text(
                        "Near limit",
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
          Column(
            children: [
              Row(
                children: [
                  Text(
                    "UPCOMING BILLS",
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700),
                  ),
                  Text(
                    "See all bills",
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500),
                  ),
                ],
              ),
              Row(
                children: [
                  Row(
                    children: [
                      Column(
                        children: [
                          Column(
                            children: [
                              Container(
                                width: 10.501199722290039,
                                height: 14.250598907470703,
                              ),
                            ],
                          ),
                        ],
                      ),
                      Column(
                        children: [
                          Text(
                            "City Water & Sewer",
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          Row(
                            children: [
                              Image.asset(
                                "assets/Ellipse.png",
                                width: 8,
                                height: 8,
                              ),
                              Text(
                                "Overdue · was due Oct 16",
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
                  Text(
                    "\$32.18",
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
                  ),
                ],
              ),
              Row(
                children: [
                  Row(
                    children: [
                      Column(
                        children: [
                          Column(
                            children: [
                              Container(
                                width: 15.001199722290039,
                                height: 11.25,
                              ),
                            ],
                          ),
                        ],
                      ),
                      Column(
                        children: [
                          Text(
                            "Brightwave Internet",
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          Row(
                            children: [
                              Column(
                                children: [
                                  Container(
                                    width: 9,
                                    height: 10.000800132751465,
                                  ),
                                ],
                              ),
                              Text(
                                "Scheduled · Oct 22",
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
                  Text(
                    "\$65.00",
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
                  ),
                ],
              ),
              Row(
                children: [
                  Row(
                    children: [
                      Column(
                        children: [
                          Column(
                            children: [
                              Container(
                                width: 15.001199722290039,
                                height: 10.501199722290039,
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
                              fontSize: 13,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          Row(
                            children: [
                              Column(
                                children: [
                                  Container(
                                    width: 10.000800132751465,
                                    height: 10.000800132751465,
                                  ),
                                ],
                              ),
                              Text(
                                "Pending · Oct 25",
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
                  Text(
                    "\$412.37",
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
                  ),
                ],
              ),
            ],
          ),
          Column(
            children: [
              Row(
                children: [
                  Text(
                    "TRENDS FOR YOU",
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700),
                  ),
                  Text(
                    "See all trends",
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500),
                  ),
                ],
              ),
              Column(
                children: [
                  Row(
                    children: [
                      Column(
                        children: [
                          Container(
                            width: 11.667600631713867,
                            height: 5.832399845123291,
                          ),
                        ],
                      ),
                      Text(
                        "Rising",
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                  Text(
                    "Food spending is going up",
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                  ),
                  Text(
                    "At this pace you'll spend about \$620 on food in October, more than your \$450 budget.",
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w400),
                  ),
                  Column(
                    children: [
                      Text(
                        "View transactions",
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                  Text(
                    "From Plaid TrendScore",
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.w400),
                  ),
                ],
              ),
            ],
          ),
          Column(
            children: [
              Text(
                "MORE TOOLS",
                style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700),
              ),
              Row(
                children: [
                  Row(
                    children: [
                      Column(
                        children: [
                          Column(children: [Container(width: 15, height: 15)]),
                        ],
                      ),
                      Column(
                        children: [
                          Text(
                            "Recurring & Subscriptions",
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          Text(
                            "\$359.64 a year in subscriptions",
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w400,
                            ),
                          ),
                        ],
                      ),
                      Column(children: [Container(width: 4.5, height: 9)]),
                    ],
                  ),
                  Row(
                    children: [
                      Column(
                        children: [
                          Column(
                            children: [
                              Container(
                                width: 13.331999778747559,
                                height: 16.667999267578125,
                              ),
                            ],
                          ),
                        ],
                      ),
                      Column(
                        children: [
                          Text(
                            "Savings Goals",
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          Text(
                            "Emergency fund is 61% there",
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w400,
                            ),
                          ),
                        ],
                      ),
                      Column(children: [Container(width: 4.5, height: 9)]),
                    ],
                  ),
                  Row(
                    children: [
                      Column(
                        children: [
                          Column(
                            children: [
                              Container(
                                width: 16.667999267578125,
                                height: 8.331999778747559,
                              ),
                            ],
                          ),
                        ],
                      ),
                      Column(
                        children: [
                          Text(
                            "Cash Flow Projection",
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          Text(
                            "\$4,034.08 projected by Nov 17",
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w400,
                            ),
                          ),
                        ],
                      ),
                      Column(children: [Container(width: 4.5, height: 9)]),
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
                          Container(width: 16.5, height: 17.417400360107422),
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
                          Container(
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
                          Container(
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
                          Container(width: 17.417400360107422, height: 16.5),
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
                          Container(width: 16.5, height: 18.334800720214844),
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
