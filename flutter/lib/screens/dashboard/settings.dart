import 'package:flutter/material.dart';

class SettingsScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          Row(
            children: [
              Text(
                "Settings",
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.w500),
              ),
              Column(
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
                          Text(
                            "VL",
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                      Column(
                        children: [
                          Text(
                            "Von Lycaon",
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          Text(
                            "von.lycaon@email.com",
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w400,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  Column(children: [SizedBox(width: 5, height: 10)]),
                ],
              ),
              Column(
                children: [
                  Text(
                    "Accounts & data",
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500),
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
                                      SizedBox(
                                        width: 14.665199279785156,
                                        height: 16.5,
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                              Column(
                                children: [
                                  Text(
                                    "Connected accounts",
                                    style: TextStyle(
                                      fontSize: 15,
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
                                        "1 needs attention",
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
                          Row(
                            children: [
                              Text(
                                "3",
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w400,
                                ),
                              ),
                              Column(
                                children: [SizedBox(width: 5, height: 10)],
                              ),
                            ],
                          ),
                        ],
                      ),
                      Container(
                        width: 720,
                        height: 1,
                        decoration: BoxDecoration(color: Color(0xffcbc8c1)),
                      ),
                      Row(
                        children: [
                          Row(
                            children: [
                              Column(
                                children: [
                                  Column(
                                    children: [
                                      SizedBox(width: 16.5, height: 16.5),
                                    ],
                                  ),
                                ],
                              ),
                              Text(
                                "Budget categories",
                                style: TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w400,
                                ),
                              ),
                            ],
                          ),
                          Column(children: [SizedBox(width: 5, height: 10)]),
                        ],
                      ),
                      Container(
                        width: 720,
                        height: 1,
                        decoration: BoxDecoration(color: Color(0xffcbc8c1)),
                      ),
                      Row(
                        children: [
                          Row(
                            children: [
                              Column(
                                children: [
                                  Column(
                                    children: [
                                      SizedBox(width: 16.5, height: 16.5),
                                    ],
                                  ),
                                ],
                              ),
                              Column(
                                children: [
                                  Text(
                                    "Statement export",
                                    style: TextStyle(
                                      fontSize: 15,
                                      fontWeight: FontWeight.w400,
                                    ),
                                  ),
                                  Text(
                                    "PDF or CSV",
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w400,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                          Column(children: [SizedBox(width: 5, height: 10)]),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
              Column(
                children: [
                  Text(
                    "Accessibility & display",
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500),
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
                                      SizedBox(
                                        width: 18.334800720214844,
                                        height: 18.334800720214844,
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                              Text(
                                "Theme",
                                style: TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w400,
                                ),
                              ),
                            ],
                          ),
                          Row(
                            children: [
                              Text(
                                "Light",
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w400,
                                ),
                              ),
                              Column(
                                children: [SizedBox(width: 5, height: 10)],
                              ),
                            ],
                          ),
                        ],
                      ),
                      Container(
                        width: 720,
                        height: 1,
                        decoration: BoxDecoration(color: Color(0xffcbc8c1)),
                      ),
                      Row(
                        children: [
                          Row(
                            children: [
                              Column(
                                children: [
                                  Column(
                                    children: [
                                      SizedBox(
                                        width: 18.334800720214844,
                                        height: 18.334800720214844,
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                              Text(
                                "High contrast",
                                style: TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w400,
                                ),
                              ),
                            ],
                          ),
                          Row(children: [Column(children: [
                    
                                                                ],
                                                            )]),
                        ],
                      ),
                      Container(
                        width: 720,
                        height: 1,
                        decoration: BoxDecoration(color: Color(0xffcbc8c1)),
                      ),
                      Row(
                        children: [
                          Row(
                            children: [
                              Column(
                                children: [
                                  Column(
                                    children: [
                                      SizedBox(
                                        width: 18.266599655151367,
                                        height: 18.334800720214844,
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                              Column(
                                children: [
                                  Text(
                                    "Chart patterns and icons",
                                    style: TextStyle(
                                      fontSize: 15,
                                      fontWeight: FontWeight.w400,
                                    ),
                                  ),
                                  Text(
                                    "Show status without relying on color",
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w400,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                          Row(
                            children: [
                              Row(children: [
                    
                                                                ],
                                                            ),
                              Column(children: [
                    
                                                                ],
                                                            ),
                            ],
                          ),
                        ],
                      ),
                      Container(
                        width: 720,
                        height: 1,
                        decoration: BoxDecoration(color: Color(0xffcbc8c1)),
                      ),
                      Row(
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
                              Text(
                                "Show values on charts",
                                style: TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w400,
                                ),
                              ),
                            ],
                          ),
                          Row(
                            children: [
                              Row(children: [
                    
                                                                ],
                                                            ),
                              Column(children: [
                    
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
              Column(
                children: [
                  Text(
                    "Notifications",
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500),
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
                                      SizedBox(
                                        width: 16.5,
                                        height: 18.334800720214844,
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                              Text(
                                "Bill reminders",
                                style: TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w400,
                                ),
                              ),
                            ],
                          ),
                          Row(
                            children: [
                              Text(
                                "3 days before",
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w400,
                                ),
                              ),
                              Column(
                                children: [SizedBox(width: 5, height: 10)],
                              ),
                            ],
                          ),
                        ],
                      ),
                      Container(
                        width: 720,
                        height: 1,
                        decoration: BoxDecoration(color: Color(0xffcbc8c1)),
                      ),
                      Row(
                        children: [
                          Row(
                            children: [
                              Column(
                                children: [
                                  Column(
                                    children: [
                                      SizedBox(
                                        width: 16.5,
                                        height: 18.334800720214844,
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                              Text(
                                "Budget alerts",
                                style: TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w400,
                                ),
                              ),
                            ],
                          ),
                          Row(
                            children: [
                              Row(children: [
                    
                                                                ],
                                                            ),
                              Column(children: [
                    
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
              Column(
                children: [
                  Text(
                    "Account",
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500),
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
                                      SizedBox(
                                        width: 16.5,
                                        height: 18.334800720214844,
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                              Text(
                                "Password & security",
                                style: TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w400,
                                ),
                              ),
                            ],
                          ),
                          Column(children: [SizedBox(width: 5, height: 10)]),
                        ],
                      ),
                      Container(
                        width: 720,
                        height: 1,
                        decoration: BoxDecoration(color: Color(0xffcbc8c1)),
                      ),
                      Row(
                        children: [
                          Row(
                            children: [
                              Column(
                                children: [
                                  Column(
                                    children: [
                                      SizedBox(
                                        width: 18.334800720214844,
                                        height: 18.334800720214844,
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                              Text(
                                "Terms of Use",
                                style: TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w400,
                                ),
                              ),
                            ],
                          ),
                          Column(children: [SizedBox(width: 15, height: 15)]),
                        ],
                      ),
                      Container(
                        width: 720,
                        height: 1,
                        decoration: BoxDecoration(color: Color(0xffcbc8c1)),
                      ),
                      Row(
                        children: [
                          Row(
                            children: [
                              Column(
                                children: [
                                  Column(
                                    children: [
                                      SizedBox(
                                        width: 14.665199279785156,
                                        height: 18.336999893188477,
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                              Text(
                                "Privacy Policy",
                                style: TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w400,
                                ),
                              ),
                            ],
                          ),
                          Column(children: [SizedBox(width: 15, height: 15)]),
                        ],
                      ),
                      Container(
                        width: 720,
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
                          Text(
                            "Sign out",
                            style: TextStyle(
                              fontSize: 15,
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
                  Text(
                    "Delete account",
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.w400),
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
                              SizedBox(width: 16.5, height: 18.329574584960938),
                            ],
                          ),
                        ],
                      ),
                      Text(
                        "Pace",
                        style: TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                  Text(
                    "PROTOTYPE · PLAID SANDBOX",
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.w400),
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
