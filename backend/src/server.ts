import express from 'express';
require('dotenv').config();
let cors = require('cors');

const app: express.Application = express();
const PORT: number = Number(process.env.PORT) || 3000;

let sparqlRouter = require('./sparql/routes');
app.use(cors());
app.use(sparqlRouter);

app.get('/', (req: express.Request, res: express.Response) => {
  res.send('Hello World!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});