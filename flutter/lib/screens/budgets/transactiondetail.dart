import 'package:flutter/material.dart';

class TransactionDetailScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          Row(
            children: [
              Column(
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
              Text(
                "Transaction",
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.w400),
              ),
              Row(children: [
                    
                                ],
                            ),
              Column(
                children: [
                  Column(
                    children: [
                      Container(width: 18.996414184570312, height: 18.99609375),
                    ],
                  ),
                ],
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
                        width: 26.720001220703125,
                        height: 26.601600646972656,
                      ),
                    ],
                  ),
                ],
              ),
              Text(
                "Fresh Fields Grocery",
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
              ),
              Text(
                "−\$84.12",
                style: TextStyle(fontSize: 34, fontWeight: FontWeight.w400),
              ),
              Text(
                "Oct 17, 2026 · 6:42 PM",
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.w400),
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
                    "Posted",
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500),
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
                    "Category",
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
                  ),
                  Row(
                    children: [
                      Column(
                        children: [
                          Container(
                            width: 11.667600631713867,
                            height: 11.668999671936035,
                          ),
                        ],
                      ),
                      Text(
                        "Auto-categorized",
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w400,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              Text(
                "Wrong category? Pick another and Pace updates your budgets and charts.",
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w400),
              ),
              Row(
                children: [
                  Row(
                    children: [
                      Column(
                        children: [
                          Container(
                            width: 13.30720043182373,
                            height: 13.334400177001953,
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
                  Row(
                    children: [
                      Column(
                        children: [
                          Container(
                            width: 10.665599822998047,
                            height: 13.339200019836426,
                          ),
                        ],
                      ),
                      Text(
                        "Bills",
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w400,
                        ),
                      ),
                    ],
                  ),
                  Row(
                    children: [
                      Column(
                        children: [
                          Container(width: 13.334400177001953, height: 8),
                        ],
                      ),
                      Text(
                        "Transportation",
                        style: TextStyle(
                          fontSize: 14,
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
                          Container(width: 12, height: 13.334400177001953),
                        ],
                      ),
                      Text(
                        "Subscriptions",
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w400,
                        ),
                      ),
                    ],
                  ),
                  Row(
                    children: [
                      Column(
                        children: [
                          Container(width: 12, height: 13.330599784851074),
                        ],
                      ),
                      Text(
                        "Utilities",
                        style: TextStyle(
                          fontSize: 14,
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
                      Column(children: [Container(width: 12, height: 12)]),
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
                      Column(
                        children: [
                          Container(
                            width: 9.334400177001953,
                            height: 9.334400177001953,
                          ),
                        ],
                      ),
                      Text(
                        "New category",
                        style: TextStyle(
                          fontSize: 14,
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
                    "Account",
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.w400),
                  ),
                  Text(
                    "Platypus Credit Card ••3333",
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.w400),
                  ),
                ],
              ),
              Container(
                width: 320,
                height: 1,
                decoration: BoxDecoration(color: Color(0xffcbc8c1)),
              ),
              Row(
                children: [
                  Text(
                    "Status",
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.w400),
                  ),
                  Text(
                    "Posted Oct 18",
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.w400),
                  ),
                ],
              ),
              Container(
                width: 320,
                height: 1,
                decoration: BoxDecoration(color: Color(0xffcbc8c1)),
              ),
              Row(
                children: [
                  Text(
                    "Merchant",
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.w400),
                  ),
                  Text(
                    "Fresh Fields Grocery",
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.w400),
                  ),
                ],
              ),
              Container(
                width: 320,
                height: 1,
                decoration: BoxDecoration(color: Color(0xffcbc8c1)),
              ),
              Row(
                children: [
                  Text(
                    "Personal or shared",
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.w400),
                  ),
                  Row(
                    children: [
                      Row(
                        children: [
                          Column(
                            children: [
                              Container(
                                width: 9.332399368286133,
                                height: 6.416199684143066,
                              ),
                            ],
                          ),
                          Text(
                            "Personal",
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                      Row(
                        children: [
                          Text(
                            "Shared",
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
            ],
          ),
          Column(
            children: [
              Row(
                children: [
                  Text(
                    "Food budget · October",
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
                  ),
                  Column(children: [Container(width: 5, height: 10)]),
                ],
              ),
              Text(
                "\$362.18 of \$450",
                style: TextStyle(fontSize: 13, fontWeight: FontWeight.w400),
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
                          Container(
                            width: 11.675968170166016,
                            height: 10.508152961730957,
                          ),
                        ],
                      ),
                      Text(
                        "Near limit · 80% used",
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                  Text(
                    "\$87.82 left",
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
                            width: 14.665200233459473,
                            height: 18.341400146484375,
                          ),
                        ],
                      ),
                    ],
                  ),
                  Text(
                    "Transactions",
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
