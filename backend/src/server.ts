import 'dotenv/config'; // DEVE SER A PRIMEIRA LINHA DO ARQUIVO!
import express from 'express';
import cors from 'cors';
import routes from './routes';

const app = express();
const PORT = 3333;

app.use(cors());
app.use(express.json());

// Avisamos o app para usar as rotas que criamos
app.use(routes);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT} 🚀`);
});