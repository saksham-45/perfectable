import 'package:flutter/material.dart';

class Files extends StatelessWidget {
  final files = ['a.dart', 'b.dart'];
  @override
  Widget build(BuildContext context) {
    return ListView(
      children: files.map((f) => Text(f)).toList(),
    );
  }
}
