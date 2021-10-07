import "reflect-metadata";

import http from 'http';
import express from 'express';
import morgan from 'morgan';

import router from './routes';
import { connection } from './database/connection';

import cors from 'cors';
import { createTopic, WebsocketFactory } from "./Websocket";
import { monitoring } from "./monitoring";

const app = express()

const server = http.createServer(app);

app.use(express.json());

app.use(cors({ origin: '*' }));

app.use(morgan('dev'));

app.use(router);

WebsocketFactory(server);

createTopic('cpu');
createTopic('ram');

connection.create().then(() => {
	server.listen(3333, () => {
		console.log('Server is online');

		setInterval(monitoring, 15000);
	});
});
