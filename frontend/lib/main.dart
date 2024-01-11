import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key});

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(
      debugShowCheckedModeBanner: false,
      home: LandingPage(),
    );
  }
}

class LandingPage extends StatefulWidget {
  const LandingPage({Key? key});

  @override
  _LandingPageState createState() => _LandingPageState();
}

class _LandingPageState extends State<LandingPage> {
  TextEditingController _questionController = TextEditingController();
  Map<String, dynamic> _secondButtonResponse = {};

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Music Quiz'),
      ),
      body: Container(
        decoration: const BoxDecoration(
          image: DecorationImage(
            image: AssetImage('lib/assets/background.png'), // Assurez-vous d'ajuster le chemin selon votre arborescence
            fit: BoxFit.cover,
          ),
        ),
        child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 20),
            // Deuxième bouton vers le haut de la page
            ElevatedButton(
              onPressed: () async {
                // Effectuez la requête GET
                http.Response response = await http.get(Uri.parse('http://localhost:3000/sparql'));

                // Convertissez la réponse en un objet Map
                Map<String, dynamic> jsonResponse = jsonDecode(response.body);

                // Mettez à jour l'état avec la réponse de la requête
                setState(() {
                  _secondButtonResponse = jsonResponse;
                });
              },
              child: const Text('Start Quiz !'),
            ),
            const SizedBox(height: 20),
            if (_secondButtonResponse.isNotEmpty) ...[
              Text(
                'Which of the following songs was performed by ${_secondButtonResponse["artist"]}?',
                style: const TextStyle(fontSize: 18),
              ),
              const Text(
                'Songs:',
                style: TextStyle(fontSize: 18),
              ),
              Text(
                '- ${_secondButtonResponse["rightSong"]}',
                style: const TextStyle(fontSize: 18),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: (_secondButtonResponse["wrongSongs"] as List<dynamic>?)?.map((wrongSong) {
                  return Text(
                    '- $wrongSong',
                    style: const TextStyle(fontSize: 18),
                  );
                }).toList() ?? [],
              ),
              const SizedBox(height: 20),
              TextField(
                controller: _questionController,
                decoration: const InputDecoration(
                  labelText: 'Enter your Answer (Name of the song that belongs to the artist)',
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
                    if (artistName == _secondButtonResponse["rightSong"]) {
                      showDialog(
                        context: context,
                        builder: (context) {
                          return AlertDialog(
                            title: const Text('Correct !'),
                            content: const Text('You are right !'),
                            actions: [
                              TextButton(
                                onPressed: () {
                                  Navigator.of(context).pop();
                                },
                                child: const Text('OK'),
                              ),
                            ],
                          );
                        },
                      );
                    } else {
                      showDialog(
                        context: context,
                        builder: (context) {
                          return AlertDialog(
                            title: const Text('Wrong !'),
                            content: const Text('You are wrong !'),
                            actions: [
                              TextButton(
                                onPressed: () {
                                  Navigator.of(context).pop();
                                },
                                child: const Text('OK'),
                              ),
                            ],
                          );
                        },
                      );
                    }
                  }
                },
                child: const Text('Submit'),
              ),
            ],
          ],
        ),
      ),
      ),
    );
  }
}
