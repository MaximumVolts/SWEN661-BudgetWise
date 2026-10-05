import 'package:flutter/material.dart';

class NotificationsScreen extends StatelessWidget {
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
                      SizedBox(width: 16.5, height: 18.329574584960938),
                    ],
                  ),
                ],
              ),
              Row(
                children: [
                  Text(
                    "Pace",
                    style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700),
                  ),
                ],
              ),
            ],
          ),
          Column(
            children: [
              Text(
                "Available balance",
                style: TextStyle(fontSize: 13, fontWeight: FontWeight.w400),
              ),
              Text(
                "\$2,739.05",
                style: TextStyle(fontSize: 36, fontWeight: FontWeight.w700),
              ),
            ],
          ),
          Column(
            children: [
              Row(
                children: [
                  Container(
                    width: 32,
                    height: 4,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(2),
                      color: Color(0xffcbc8c1),
                    ),
                  ),
                ],
              ),
              Row(
                children: [
                  Text(
                    "Notifications",
                    style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700),
                  ),
                  Row(
                    children: [
                      Text(
                        "Mark all read",
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      Column(
                        children: [
                          SizedBox(
                            width: 20.00160026550293,
                            height: 20.00160026550293,
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
                          SizedBox(
                            width: 11.998800277709961,
                            height: 8.24940013885498,
                          ),
                        ],
                      ),
                      Text(
                        "All · 3 new",
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
                        "Bills",
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
                        "Budgets",
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
                        "Goals",
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
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
                              SizedBox(
                                width: 20.00160026550293,
                                height: 20.00160026550293,
                              ),
                            ],
                          ),
                        ],
                      ),
                      Column(
                        children: [
                          Row(
                            children: [
                              Image.asset(
                                "assets/new-dot.png",
                                width: 8,
                                height: 8,
                              ),
                              Text(
                                "New · Bill overdue · 2h ago",
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w400,
                                ),
                              ),
                            ],
                          ),
                          Text(
                            "City Water & Sewer is overdue",
                            style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          Text(
                            "\$32.18 was due Oct 16.",
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w400,
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
                          Text(
                            "Mark as paid",
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
                            "View bill",
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
                      Column(
                        children: [
                          SizedBox(
                            width: 20.00160026550293,
                            height: 20.00160026550293,
                          ),
                        ],
                      ),
                    ],
                  ),
                  Column(
                    children: [
                      Row(
                        children: [
                          Image.asset(
                            "assets/new-dot-2.png",
                            width: 8,
                            height: 8,
                          ),
                          Text(
                            "New · Over budget · 5h ago",
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w400,
                            ),
                          ),
                        ],
                      ),
                      Text(
                        "Transportation is \$28.60 over",
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      Text(
                        "You've spent \$148.60 of your \$120 limit.",
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w400,
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
                            width: 20.015945434570312,
                            height: 18.01397705078125,
                          ),
                        ],
                      ),
                    ],
                  ),
                  Column(
                    children: [
                      Row(
                        children: [
                          Image.asset(
                            "assets/new-dot-3.png",
                            width: 8,
                            height: 8,
                          ),
                          Text(
                            "New · Near limit · Yesterday",
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w400,
                            ),
                          ),
                        ],
                      ),
                      Text(
                        "Food is near its limit",
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      Text(
                        "\$87.82 left for October.",
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w400,
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
                          SizedBox(width: 18, height: 20.00160026550293),
                        ],
                      ),
                    ],
                  ),
                  Column(
                    children: [
                      Text(
                        "Bill reminder · Yesterday",
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w400,
                        ),
                      ),
                      Text(
                        "Brightwave Internet is due in 3 days",
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      Text(
                        "\$65.00 on Oct 22. Autopay is on.",
                        style: TextStyle(
                          fontSize: 13,
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
                  Column(
                    children: [SizedBox(width: 15, height: 16.667999267578125)],
                  ),
                  Text(
                    "Syncing accounts... 2 of 3",
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.w400),
                  ),
                ],
              ),
              Row(
                children: [
                  Container(
                    width: 480,
                    height: 4,
                    decoration: BoxDecoration(color: Color(0xffe4ee6a)),
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
