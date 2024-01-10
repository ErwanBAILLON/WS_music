import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(
      home: LandingPage(),
    );
  }
}

class LandingPage extends StatefulWidget {
  const LandingPage({super.key});

  @override
  _LandingPageState createState() => _LandingPageState();
}

class _LandingPageState extends State<LandingPage> {
  TextEditingController _questionController = TextEditingController();
  String _sparqlResponse = '';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Landing Page'),
      ),
      body: Container(
        decoration: const BoxDecoration(
          image: DecorationImage(
            image: AssetImage('lib/assets/background.png'),
            fit: BoxFit.cover,
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              TextField(
                controller: _questionController,
                decoration: const InputDecoration(
                  labelText: 'Posez une question (nom de l\'artiste)',
                  fillColor: Colors.white,
                  filled: true,
                ),
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: () async {
                  String artistName = _questionController.text;
                  // Vérifiez si l'utilisateur a saisi un nom d'artiste
                  if (artistName.isNotEmpty) {
                    // Construisez l'URL avec le paramètre artist
                    Uri url = Uri.parse('http://localhost:3000/sparql');
                    
                    // Effectuez la requête GET
                    http.Response response = await http.get(url);

                    // Mettez à jour l'état avec la réponse de la requête
                    setState(() {
                      _sparqlResponse = response.body;
                    });
                  }
                },
                child: const Text('Poser la question'),
              ),
              const SizedBox(height: 20),
              Text(
                'Réponse de la requête SPARQL : $_sparqlResponse',
                style: const TextStyle(fontSize: 18),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
