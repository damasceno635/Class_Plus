import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import routes from './routes';
import { iniciarCronJobs } from './cron/faturasAutomaticas';

const app = express();
const PORT = 3333;

app.use(cors());
app.use(express.json());

import path from 'path';

app.use(express.json());
app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));
app.use(routes);

iniciarCronJobs();

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT} 🚀`);
});