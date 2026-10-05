import 'package:flutter/material.dart';

class CashFlowProjectionScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(body:Column(
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
                                        )
                                        ],
                                    )
                                ],
                            ),
                Text(
                            "Cash Flow Projection",
                            style: TextStyle(
                                fontSize: 22,
                                fontWeight: FontWeight.w400,
                            )
                        )
                        ],
                    ),
        Row(
                        children: [
                                    Row(
                                children: [
                                            Row(
                                        children: [
                                                    Column(
                                                children: [
                                                            SizedBox(
                                                width: 10.665599822998047,
                                                height: 7.332799911499023,
                                                )
                                                ],
                                            ),
                                Text(
                                            "30 days",
                                            style: TextStyle(
                                                fontSize: 13,
                                                fontWeight: FontWeight.w500,
                                            )
                                        )
                                        ],
                                    ),
                        SizedBox(
                                width: 40,
                                height: 0,
                                ),
                        Row(
                                        children: [
                                                    Text(
                                            "60 days",
                                            style: TextStyle(
                                                fontSize: 13,
                                                fontWeight: FontWeight.w500,
                                            )
                                        )
                                        ],
                                    ),
                        SizedBox(
                                width: 40,
                                height: 0,
                                ),
                        Row(
                                        children: [
                                                    Text(
                                            "90 days",
                                            style: TextStyle(
                                                fontSize: 13,
                                                fontWeight: FontWeight.w500,
                                            )
                                        )
                                        ],
                                    )
                                ],
                            ),
                Text(
                            "Income",
                            style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w400,
                            )
                        ),
                Row(
                                children: [
                                            Text(
                                    "Low",
                                    style: TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w500,
                                    )
                                )
                                ],
                            ),
                Row(
                                children: [
                                            Column(
                                        children: [
                                                    SizedBox(
                                        width: 10.665599822998047,
                                        height: 7.332799911499023,
                                        )
                                        ],
                                    ),
                        Text(
                                    "Expected",
                                    style: TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w500,
                                    )
                                )
                                ],
                            ),
                Row(
                                children: [
                                            Text(
                                    "High",
                                    style: TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w500,
                                    )
                                )
                                ],
                            )
                        ],
                    ),
        Column(
                        children: [
                                    Text(
                            "Projected cash on Nov 17",
                            style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w400,
                            )
                        ),
                Text(
                            "\$4,034.08",
                            style: TextStyle(
                                fontSize: 40,
                                fontWeight: FontWeight.w400,
                            )
                        ),
                Row(
                                children: [
                                            Column(
                                        children: [
                                                    SizedBox(
                                        width: 10.501199722290039,
                                        height: 10.501199722290039,
                                        )
                                        ],
                                    ),
                        Text(
                                    "Lowest point: \$2,494.05 around Oct 25, after your card payment",
                                    style: TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.w500,
                                    )
                                )
                                ],
                            )
                        ],
                    ),
        Row(
                        children: [
                                    Column(
                                children: [
                                            Text(
                                    "Cash over the next 30 days",
                                    style: TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w500,
                                    )
                                ),
                        Column(
                                        children: [
                                                    SizedBox(
                                        width: 286,
                                        height: 1,
                                        ),
                                SizedBox(
                                        width: 286,
                                        height: 1,
                                        ),
                                SizedBox(
                                        width: 286,
                                        height: 1,
                                        ),
                                Text(
                                            "\$4k",
                                            style: TextStyle(
                                                fontSize: 10,
                                                fontWeight: FontWeight.w400,
                                            )
                                        ),
                                Text(
                                            "\$3k",
                                            style: TextStyle(
                                                fontSize: 10,
                                                fontWeight: FontWeight.w400,
                                            )
                                        ),
                                Text(
                                            "\$2k",
                                            style: TextStyle(
                                                fontSize: 10,
                                                fontWeight: FontWeight.w400,
                                            )
                                        ),
                                Image.asset(
                                            "assets/dot-oct18.png",
                                            width: 12,
                                            height: 12,
                                            ),
                                Image.asset(
                                            "assets/dot-oct25-outer.png",
                                            width: 14,
                                            height: 14,
                                            ),
                                Image.asset(
                                            "assets/dot-nov1.png",
                                            width: 12,
                                            height: 12,
                                            ),
                                Image.asset(
                                            "assets/dot-nov8.png",
                                            width: 12,
                                            height: 12,
                                            ),
                                Image.asset(
                                            "assets/dot-nov15.png",
                                            width: 12,
                                            height: 12,
                                            ),
                                Image.asset(
                                            "assets/dot-end.png",
                                            width: 8,
                                            height: 8,
                                            ),
                                Text(
                                            "\$4,034",
                                            style: TextStyle(
                                                fontSize: 10,
                                                fontWeight: FontWeight.w500,
                                            )
                                        ),
                                Column(
                                                children: [
                                                            Text(
                                                    "Low \$2,494",
                                                    style: TextStyle(
                                                        fontSize: 10,
                                                        fontWeight: FontWeight.w700,
                                                    )
                                                )
                                                ],
                                            ),
                                Image.asset(
                                            "assets/x-axis.png",
                                            width: 256,
                                            height: 1,
                                            ),
                                Text(
                                            "Oct 18",
                                            style: TextStyle(
                                                fontSize: 10,
                                                fontWeight: FontWeight.w400,
                                            )
                                        ),
                                Text(
                                            "Oct 25",
                                            style: TextStyle(
                                                fontSize: 10,
                                                fontWeight: FontWeight.w400,
                                            )
                                        ),
                                Text(
                                            "Nov 1",
                                            style: TextStyle(
                                                fontSize: 10,
                                                fontWeight: FontWeight.w400,
                                            )
                                        ),
                                Text(
                                            "Nov 8",
                                            style: TextStyle(
                                                fontSize: 10,
                                                fontWeight: FontWeight.w400,
                                            )
                                        ),
                                Text(
                                            "Nov 15",
                                            style: TextStyle(
                                                fontSize: 10,
                                                fontWeight: FontWeight.w400,
                                            )
                                        ),
                                Image.asset(
                                            "assets/Cash projection line.png",
                                            width: 240,
                                            height: 108,
                                            ),
                                Image.asset(
                                            "assets/Final projected segment.png",
                                            width: 20,
                                            height: 4,
                                            )
                                        ],
                                    )
                                ],
                            ),
                Column(
                                children: [
                                            Text(
                                    "How we got this",
                                    style: TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w500,
                                    )
                                ),
                        Row(
                                        children: [
                                                    Column(
                                                children: [
                                                            Text(
                                                    "Cash today",
                                                    style: TextStyle(
                                                        fontSize: 14,
                                                        fontWeight: FontWeight.w500,
                                                    )
                                                ),
                                        Text(
                                                    "Everyday Checking",
                                                    style: TextStyle(
                                                        fontSize: 12,
                                                        fontWeight: FontWeight.w400,
                                                    )
                                                )
                                                ],
                                            ),
                                Text(
                                            "\$3,248.60",
                                            style: TextStyle(
                                                fontSize: 14,
                                                fontWeight: FontWeight.w400,
                                            )
                                        )
                                        ],
                                    ),
                        Container(
                                    width: 336,
                                    height: 1,
                                    decoration:     BoxDecoration(
                                color: Color(0xffcbc8c1))
                                    ),
                        Row(
                                        children: [
                                                    Column(
                                                children: [
                                                            Text(
                                                    "Expected income",
                                                    style: TextStyle(
                                                        fontSize: 14,
                                                        fontWeight: FontWeight.w500,
                                                    )
                                                ),
                                        Text(
                                                    "Ardent Systems payroll · Oct 30, Nov 13",
                                                    style: TextStyle(
                                                        fontSize: 12,
                                                        fontWeight: FontWeight.w400,
                                                    )
                                                )
                                                ],
                                            ),
                                Text(
                                            "+\$4,290.00",
                                            style: TextStyle(
                                                fontSize: 14,
                                                fontWeight: FontWeight.w400,
                                            )
                                        )
                                        ],
                                    ),
                        Container(
                                    width: 336,
                                    height: 1,
                                    decoration:     BoxDecoration(
                                color: Color(0xffcbc8c1))
                                    ),
                        Row(
                                        children: [
                                                    Column(
                                                children: [
                                                            Text(
                                                    "Bills & recurring",
                                                    style: TextStyle(
                                                        fontSize: 14,
                                                        fontWeight: FontWeight.w500,
                                                    )
                                                ),
                                        Text(
                                                    "9 payments incl. rent on Nov 1",
                                                    style: TextStyle(
                                                        fontSize: 12,
                                                        fontWeight: FontWeight.w400,
                                                    )
                                                )
                                                ],
                                            ),
                                Text(
                                            "–\$2,154.52",
                                            style: TextStyle(
                                                fontSize: 14,
                                                fontWeight: FontWeight.w400,
                                            )
                                        )
                                        ],
                                    ),
                        Container(
                                    width: 336,
                                    height: 1,
                                    decoration:     BoxDecoration(
                                color: Color(0xffcbc8c1))
                                    ),
                        Row(
                                        children: [
                                                    Column(
                                                children: [
                                                            Text(
                                                    "Planned savings",
                                                    style: TextStyle(
                                                        fontSize: 14,
                                                        fontWeight: FontWeight.w500,
                                                    )
                                                ),
                                        Text(
                                                    "Emergency fund · Nov 10",
                                                    style: TextStyle(
                                                        fontSize: 12,
                                                        fontWeight: FontWeight.w400,
                                                    )
                                                )
                                                ],
                                            ),
                                Text(
                                            "–\$300.00",
                                            style: TextStyle(
                                                fontSize: 14,
                                                fontWeight: FontWeight.w400,
                                            )
                                        )
                                        ],
                                    ),
                        Container(
                                    width: 336,
                                    height: 1,
                                    decoration:     BoxDecoration(
                                color: Color(0xffcbc8c1))
                                    ),
                        Row(
                                        children: [
                                                    Column(
                                                children: [
                                                            Text(
                                                    "Everyday spending",
                                                    style: TextStyle(
                                                        fontSize: 14,
                                                        fontWeight: FontWeight.w500,
                                                    )
                                                ),
                                        Text(
                                                    "Your 3-month average",
                                                    style: TextStyle(
                                                        fontSize: 12,
                                                        fontWeight: FontWeight.w400,
                                                    )
                                                )
                                                ],
                                            ),
                                Text(
                                            "–\$1,050.00",
                                            style: TextStyle(
                                                fontSize: 14,
                                                fontWeight: FontWeight.w400,
                                            )
                                        )
                                        ],
                                    ),
                        Container(
                                    width: 336,
                                    height: 1,
                                    decoration:     BoxDecoration(
                                color: Color(0xffcbc8c1))
                                    ),
                        Row(
                                        children: [
                                                    Text(
                                            "Projected cash",
                                            style: TextStyle(
                                                fontSize: 14,
                                                fontWeight: FontWeight.w700,
                                            )
                                        ),
                                Text(
                                            "\$4,034.08",
                                            style: TextStyle(
                                                fontSize: 14,
                                                fontWeight: FontWeight.w700,
                                            )
                                        )
                                        ],
                                    )
                                ],
                            )
                        ],
                    ),
        Row(
                        children: [
                                    Column(
                                children: [
                                            SizedBox(
                                width: 10.501199722290039,
                                height: 10.501199722290039,
                                )
                                ],
                            ),
                Text(
                            "Add expected income",
                            style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w500,
                            )
                        )
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
                                                            SizedBox(
                                                width: 16.5,
                                                height: 17.417400360107422,
                                                )
                                                ],
                                            )
                                        ],
                                    ),
                        Text(
                                    "Home",
                                    style: TextStyle(
                                        fontSize: 10,
                                        fontWeight: FontWeight.w700,
                                    )
                                )
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
                                                )
                                                ],
                                            )
                                        ],
                                    ),
                        Text(
                                    "Transactions",
                                    style: TextStyle(
                                        fontSize: 10,
                                        fontWeight: FontWeight.w500,
                                    )
                                )
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
                                                )
                                                ],
                                            )
                                        ],
                                    ),
                        Text(
                                    "Spending",
                                    style: TextStyle(
                                        fontSize: 10,
                                        fontWeight: FontWeight.w500,
                                    )
                                )
                                ],
                            ),
                Column(
                                children: [
                                            Column(
                                        children: [
                                                    Column(
                                                children: [
                                                            SizedBox(
                                                width: 17.417400360107422,
                                                height: 16.5,
                                                )
                                                ],
                                            )
                                        ],
                                    ),
                        Text(
                                    "Budgets",
                                    style: TextStyle(
                                        fontSize: 10,
                                        fontWeight: FontWeight.w500,
                                    )
                                )
                                ],
                            ),
                Column(
                                children: [
                                            Column(
                                        children: [
                                                    Column(
                                                children: [
                                                            SizedBox(
                                                width: 16.5,
                                                height: 18.334800720214844,
                                                )
                                                ],
                                            )
                                        ],
                                    ),
                        Text(
                                    "Bills",
                                    style: TextStyle(
                                        fontSize: 10,
                                        fontWeight: FontWeight.w500,
                                    )
                                )
                                ],
                            )
                        ],
                    )
                ],
            ));

  }
}