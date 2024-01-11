import express from 'express';
import { Request, Response } from 'express';
import axios from 'axios';

const router = express.Router();


router.get('/sparql', async (req: Request, res: Response) => {
  const endpoint = 'http://dbpedia.org/sparql';
  const endpoint2 = 'https://query.wikidata.org/sparql';
  const random = randomIntFromInterval(1, 100);

  let result = new QuizResult();

  const query = `
  PREFIX dbo: <http://dbpedia.org/ontology/>
  PREFIX dbr: <http://dbpedia.org/resource/>
  PREFIX dbp: <http://dbpedia.org/property/>
  PREFIX foaf: <http://xmlns.com/foaf/0.1/>

  SELECT DISTINCT ?song ?songName ?artist ?artistName
  WHERE {
    ?song a dbo:Song .
    ?song foaf:name ?songName .
    ?song dbo:artist ?artist .
    ?artist foaf:name ?artistName .
  }
  ORDER BY ?s OFFSET ${random}
  LIMIT 1
  `;

  axios.get(endpoint, {
    params: {
      query: query,
      format: 'json',
    },
  })
    .then((response) => {
      const data = response.data;
      // console.log(data.results.bindings);

      result.artist = response.data.results.bindings[0].artistName.value;
      result.rightSong = response.data.results.bindings[0].songName.value;

      return response;
    })
    .then((response) => {
      const query2 = `
PREFIX wd: <http://www.wikidata.org/entity/>
PREFIX wdt: <http://www.wikidata.org/prop/direct/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT DISTINCT ?song ?songLabel ?artistLabel
WHERE {
  ?song wdt:P31 wd:Q7366 ;
        rdfs:label ?songLabel .
  ?song wdt:P31/wdt:P279* wd:Q2188189 .

  ?song wdt:P175 ?artist .
  ?artist rdfs:label ?artistLabel .
  FILTER (
    LANG(?songLabel) = 'en' &&
    LANG(?artistLabel) = 'en' &&
    ?artistLabel != '${response.data.results.bindings[0].artistName.value}'
  )
}
LIMIT 250`;
  console.log(query2);

      return axios.get(endpoint2, {
        params: {
          query: query2,
          format: 'json',
        },
      })
        .then((response2) => {
          const data = response2.data;
          console.log(data.results.bindings);

          if (!result.wrongSongs)
            result.wrongSongs = [];

          let random2 = randomIntFromInterval(1, 250);
          let random3 = randomIntFromInterval(1, 250);
          let random4 = randomIntFromInterval(1, 250);

          while(random3 == random2 || random3 == random4){
            random3 = randomIntFromInterval(1, 250);
          }

          while(random4 == random2){
            random4 = randomIntFromInterval(1, 250);
          }

          result.wrongSongs?.push(response2.data.results.bindings[random2].songLabel.value);
          result.wrongSongs?.push(response2.data.results.bindings[random3].songLabel.value);
          result.wrongSongs?.push(response2.data.results.bindings[random4].songLabel.value);

          return result;
        })
    })
    .then(() => res.send(result))
    .catch((error) => {
      console.error('Erreur lors de la requête SPARQL :', error);
    });
});


function randomIntFromInterval(min: number, max: number) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min)
}

class QuizResult {
  artist?: string;
  rightSong?: string;
  wrongSongs?: string[];
}

module.exports = router;