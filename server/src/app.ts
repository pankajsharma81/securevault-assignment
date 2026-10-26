import express from 'express';
import cors from 'cors';
import routes from './routes/routes';
import { errorMiddleware } from './middleware/errorMiddleware';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/v1', routes);

app.use(errorMiddleware);

export default app;