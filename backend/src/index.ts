import "reflect-metadata";
import express from 'express';
import morgan from "morgan";
import router from "./routes";
import { connection } from "./database/connection";
import cors from 'cors';

const app = express()

app.use(express.json());

app.use(cors())

// Middlleware para log de requisições
if (process.env.NODE_ENV == 'development') {
	app.use(morgan('dev'));
}

app.use(router);

connection.create().then(() => {
	app.listen(3333, () => {
		console.log('Server is online');
	});
});
