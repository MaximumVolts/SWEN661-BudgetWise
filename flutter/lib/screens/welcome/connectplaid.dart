import 'package:flutter/material.dart';

class ConnectPlaid extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          Column(
            children: [
              Row(
                children: [
                  Container(
                    width: 190,
                    height: 3,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(2),
                      color: Color(0xff1a1a1a),
                    ),
                  ),
                  Container(
                    width: 190,
                    height: 3,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(2),
                      color: Color(0xff1a1a1a),
                    ),
                  ),
                  Container(
                    width: 190,
                    height: 3,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(2),
                      color: Color(0xff1a1a1a),
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
                          Container(
                            width: 14.00160026550293,
                            height: 14.00160026550293,
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
                          Container(
                            width: 18.66666603088379,
                            height: 9.333333015441895,
                          ),
                          Container(
                            width: 5.833333492279053,
                            height: 5.833333492279053,
                          ),
                          Container(
                            width: 3.7333343029022217,
                            height: 3.7333343029022217,
                          ),
                          Container(width: 14, height: 0),
                        ],
                      ),
                    ],
                  ),
                  Row(
                    children: [
                      Column(children: [Container(width: 18, height: 18)]),
                    ],
                  ),
                  Column(
                    children: [
                      Column(
                        children: [
                          Container(width: 21, height: 23.335201263427734),
                        ],
                      ),
                    ],
                  ),
                  Row(
                    children: [
                      Column(children: [Container(width: 18, height: 18)]),
                    ],
                  ),
                  Column(
                    children: [
                      Column(
                        children: [
                          Container(width: 16.335201263427734, height: 21),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
              Column(
                children: [
                  Text(
                    "STEP 3 OF 3",
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500),
                  ),
                ],
              ),
              Column(
                children: [
                  Text(
                    "Connect your bank with Plaid",
                    style: TextStyle(fontSize: 36, fontWeight: FontWeight.w400),
                  ),
                ],
              ),
              Column(
                children: [
                  Text(
                    "Pace uses Plaid to securely link your checking, savings and credit accounts. Transactions import automatically, so you never have to type them in.",
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w400),
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
                                    width: 18.334800720214844,
                                    height: 18.334800720214844,
                                  ),
                                ],
                              ),
                            ],
                          ),
                          Column(
                            children: [
                              Text(
                                "Pace never sees your bank login",
                                style: TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                              Text(
                                "You sign in through Plaid. Pace never stores your username or password.",
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w400,
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
                              Column(
                                children: [
                                  Container(
                                    width: 18.334260940551758,
                                    height: 12.83220386505127,
                                  ),
                                ],
                              ),
                            ],
                          ),
                          Column(
                            children: [
                              Text(
                                "Read-only access",
                                style: TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                              Text(
                                "Pace sees balances and transactions. It can't move your money.",
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
                      Row(
                        children: [
                          Column(
                            children: [
                              Column(
                                children: [
                                  Container(
                                    width: 16.5,
                                    height: 18.334800720214844,
                                  ),
                                ],
                              ),
                            ],
                          ),
                          Column(
                            children: [
                              Text(
                                "Encrypted in transit and at rest",
                                style: TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                              Text(
                                "Your financial data is protected wherever it's sent or stored.",
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w400,
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
                              Column(
                                children: [
                                  Container(
                                    width: 18.334800720214844,
                                    height: 18.334800720214844,
                                  ),
                                ],
                              ),
                            ],
                          ),
                          Column(
                            children: [
                              Text(
                                "Disconnect anytime",
                                style: TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                              Text(
                                "Remove an account in Settings and syncing stops right away.",
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
                ],
              ),
              Row(
                children: [
                  Column(
                    children: [
                      Column(
                        children: [
                          Container(
                            width: 9.332399368286133,
                            height: 6.416199684143066,
                          ),
                        ],
                      ),
                    ],
                  ),
                  Text(
                    "I agree to let Pace access my account data through Plaid.",
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w400),
                  ),
                ],
              ),
              Row(
                children: [
                  Column(
                    children: [
                      Container(
                        width: 18.22967529296875,
                        height: 18.211763381958008,
                      ),
                    ],
                  ),
                  Text(
                    "Connect with Plaid",
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
                  ),
                ],
              ),
              Column(
                children: [
                  Text(
                    "Not now",
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.w500),
                  ),
                ],
              ),
              Row(
                children: [
                  Column(
                    children: [
                      Container(
                        width: 11.993988990783691,
                        height: 11.993988990783691,
                      ),
                    ],
                  ),
                  Text(
                    "Demo uses the Plaid sandbox. No real bank data.",
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.w400),
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
