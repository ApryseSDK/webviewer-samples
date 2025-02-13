import 'package:flutter/material.dart';

import 'dart:ui_web' as ui;
import 'dart:html' as html;

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Apryse Flutter Demo',
      theme: ThemeData(
        // This is the theme of your application.
        //
        // Try running your application with "flutter run". You'll see the
        // application has a blue toolbar. Then, without quitting the app, try
        // changing the primarySwatch below to Colors.green and then invoke
        // "hot reload" (press "r" in the console where you ran "flutter run",
        // or simply save your changes to "hot reload" in a Flutter IDE).
        // Notice that the counter didn't reset back to zero; the application
        // is not restarted.
        primarySwatch: Colors.blue,
        // This makes the visual density adapt to the platform that you run
        // the app on. For desktop platforms, the controls will be smaller and
        // closer together (more dense) than on mobile platforms.
        visualDensity: VisualDensity.adaptivePlatformDensity,
      ),
      home: MyHomePage(title: 'Apryse WebViewer for Flutter'),
    );
  }
}

class MyHomePage extends StatefulWidget {
  MyHomePage({wkey,required this.title}) : super(key: wkey);

  // This widget is the home page of your application. It is stateful, meaning
  // that it has a State object (defined below) that contains fields that affect
  // how it looks.

  // This class is the configuration for the state. It holds the values (in this
  // case the title) provided by the parent (in this case the App widget) and
  // used by the build method of the State. Fields in a Widget subclass are
  // always marked "final".

  final String title;

  @override
  _MyHomePageState createState() => _MyHomePageState();
}

String viewID = "webviewer-id"; 

class _MyHomePageState extends State<MyHomePage> {

  @override
  void initState() {
    super.initState();

    html.DivElement _element = html.DivElement();
    _element
      ..id = 'canvas'
      ..style.height = '100%'
      ..style.width = '100%'
      ..append(html.ScriptElement()
        ..text = """
        // Defines a ShadowRoot within DOM, and is set to 'Open'
        // Reference: https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot
        const shadowHost = document.querySelector("flt-platform-view").querySelector("#canvas");
        const shadowRoot = shadowHost.attachShadow({ mode: 'open' });

        WebViewer({
          path: 'WebViewer/lib',
          initialDoc: 'https://pdftron.s3.amazonaws.com/downloads/pl/demo.pdf'
        }, shadowRoot).then((instance) => {
            // call apis here
        });
        """);

    // ignore: undefined_prefixed_name
    ui.platformViewRegistry
        .registerViewFactory(viewID, (int viewId) => _element);
  }

  @override
  Widget build(BuildContext context) {
    // This method is rerun every time setState is called
    //
    // The Flutter framework has been optimized to make rerunning build methods
    // fast, so that you can just rebuild anything that needs updating rather
    // than having to individually change instances of widgets.
    return Scaffold(
      appBar: AppBar(
        // Here we take the value from the MyHomePage object that was created by
        // the App.build method, and use it to set our appbar title.
        title: Text(widget.title),
      ),
      body: FractionallySizedBox(
        widthFactor: 1,
        heightFactor: 1,
        child: Container(
          alignment: Alignment.center, 
          child: HtmlElementView(
            viewType: viewID,
          ),
        ),
      ), // This trailing comma makes auto-formatting nicer for build methods.
    );
  }
}
