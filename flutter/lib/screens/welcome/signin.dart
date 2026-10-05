import 'package:flutter/material.dart';

class SignInScreen extends StatelessWidget {
  const SignInScreen({super.key});
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          Column(
            children: [
              Row(
                children: [
                  Column(
                    children: [
                      Column(
                        children: [
                          Container(width: 16, height: 8),
                          Container(width: 5, height: 5),
                          Container(
                            width: 3.200000762939453,
                            height: 3.200000762939453,
                          ),
                          Container(width: 12, height: 0),
                        ],
                      ),
                    ],
                  ),
                  Text(
                    "Pace",
                    style: TextStyle(fontSize: 22, fontWeight: FontWeight.w500),
                  ),
                ],
              ),
              Column(children: [
],
),
              Text(
                "Your money, at your pace.",
                style: TextStyle(fontSize: 40, fontWeight: FontWeight.w700),
              ),
              Column(children: [
],
),
              Text(
                "Connect your accounts once, and Pace automatically keeps track of your spending, budgets, and bills.",
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w400),
              ),
              Column(children: [
],
),
              Column(
                children: [
                  Column(
                    children: [
                      Text(
                        "von.lycaon@email.com",
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w400,
                        ),
                      ),
                    ],
                  ),
                  Container(
                    width: 35,
                    height: 2,
                    decoration: BoxDecoration(color: Color(0xfffbfaf7)),
                  ),
                  Text(
                    "Email",
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w400),
                  ),
                ],
              ),
              Column(children: [
],
),
              Column(
                children: [
                  Container(
                    width: 60,
                    height: 2,
                    decoration: BoxDecoration(color: Color(0xfffbfaf7)),
                  ),
                  Row(
                    children: [
                      Text(
                        "············",
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w400,
                        ),
                      ),
                      Column(
                        children: [
                          Container(
                            width: 20.00101089477539,
                            height: 13.998767852783203,
                          ),
                        ],
                      ),
                    ],
                  ),
                  Text(
                    "Password",
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w400),
                  ),
                ],
              ),
              Column(children: [
],
),
              Row(
                children: [
                  Text(
                    "Forgot password?",
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
                  ),
                ],
              ),
              Column(children: [
],
),
              Row(
                children: [
                  Text(
                    "Sign in",
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
                  ),
                ],
              ),
              Column(children: [
],
),
              Row(
                children: [
                  Container(
                    width: 261.5,
                    height: 1,
                    decoration: BoxDecoration(color: Color(0xffcbc8c1)),
                  ),
                  Text(
                    "or",
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.w400),
                  ),
                  Container(
                    width: 261.5,
                    height: 1,
                    decoration: BoxDecoration(color: Color(0xffcbc8c1)),
                  ),
                ],
              ),
              Column(children: [
],
),
              Row(
                children: [
                  Row(
                    children: [
                      Text(
                        "Continue with Google",
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                  Row(
                    children: [
                      Text(
                        "Continue with Apple",
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              Column(children: [
],
),
              Row(
                children: [
                  Text(
                    "New to Pace?",
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.w400),
                  ),
                  Text(
                    "Create account",
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
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
