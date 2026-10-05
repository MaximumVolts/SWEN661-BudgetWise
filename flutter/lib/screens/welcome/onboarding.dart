import 'package:flutter/material.dart';

class OnBoardingScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Row(
        children: [
          Column(
            children: [
              Container(width: 14.00160026550293, height: 14.00160026550293),
            ],
          ),
          Row(
            children: [
              Container(
                width: 180,
                height: 4,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(2),
                  color: Color(0xff1a1a1a),
                ),
              ),
              Container(
                width: 180,
                height: 4,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(2),
                  color: Color(0xff1a1a1a),
                ),
              ),
              Container(
                width: 180,
                height: 4,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(2),
                  color: Color(0xffcbc8c1),
                ),
              ),
            ],
          ),
          Text(
            "Skip",
            style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
          ),
        ],
      ),
    );
  }
}
