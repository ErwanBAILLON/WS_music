import express from 'express';
import { Request, Response } from 'express';
import axios from 'axios';

const router = express.Router();

router.get('/sparql', async (req: Request, res: Response) => {
  const endpoint = 'http://dbpedia.org/sparql';

  const query = `
  PREFIX dbo: <http://dbpedia.org/ontology/>
  PREFIX dbr: <http://dbpedia.org/resource/>
  PREFIX dbp: <http://dbpedia.org/property/>
  PREFIX foaf: <http://xmlns.com/foaf/0.1/>

  SELECT ?artist ?name ?birthDate ?deathDate ?birthPlace ?deathPlace ?thumbnail
  WHERE {
    ?artist a dbo:Artist ;
      foaf:name ?name ;
      dbo:birthDate ?birthDate ;
      dbo:deathDate ?deathDate ;
      dbo:birthPlace ?birthPlace ;
      dbo:deathPlace ?deathPlace ;
      dbo:thumbnail ?thumbnail .
    FILTER (lang(?name) = 'en')
  }
  LIMIT 100
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
    })
    .catch((error) => {
      console.error('Erreur lors de la requête SPARQL :', error);
    });
  res.send('Hello World!');
});

module.exports = router;