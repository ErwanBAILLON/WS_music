import express from 'express';
import { Request, Response } from 'express';
import axios from 'axios';

const router = express.Router();


router.get('/sparql', async (req: Request, res: Response) => {
  const endpoint = 'http://dbpedia.org/sparql';
  const random = getRandomArbitrary(1, 100);

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
      console.log(data.results.bindings);

      result.artist = response.data.results.bindings[0].artistName.value;
      result.rightSong = response.data.results.bindings[0].songName.value;

      return response;
    })
    .then((response) => {

      const query2 = `
        PREFIX dbo: <http://dbpedia.org/ontology/>
        PREFIX dbr: <http://dbpedia.org/resource/>
        PREFIX dbp: <http://dbpedia.org/property/>
        PREFIX foaf: <http://xmlns.com/foaf/0.1/>
      
        SELECT DISTINCT ?song ?songName ?artistName
        WHERE {
          ?song a dbo:Song .
          ?song foaf:name ?songName .
          ?song dbo:artist ?artist .
          ?artist foaf:name ?artistName .
          FILTER (?artistName != '${response.data.results.bindings[0].artistName}')
        }
        ORDER BY ?s OFFSET ${random}
        LIMIT 3
        `;


      return axios.get(endpoint, {
        params: {
          query: query2,
          format: 'json',
        },
      })
        .then((response2) => {
          const data = response2.data;
          console.log(data.results.bindings);

          if(!result.wrongSongs)
            result.wrongSongs = [];

          response2.data.results.bindings.forEach((current: any) => {
            result.wrongSongs?.push(current.songName.value);
          })

          return result;
        })
    })
    .then(() => res.send(result))
    .catch((error) => {
      console.error('Erreur lors de la requête SPARQL :', error);
    });
});


function getRandomArbitrary(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

class QuizResult{
  artist?: string;
  rightSong?: string;
  wrongSongs?: string[];
}

module.exports = router;