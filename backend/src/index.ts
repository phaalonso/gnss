import "reflect-metadata";
import express from 'express';
import morgan from "morgan";

const app = express()

app.use(express.json());

// Middlleware para log de requisições
if (process.env.NODE_ENV == 'development') {
	app.use(morgan('dev'));
}

app.listen(3333);
