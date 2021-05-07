import Mongoose, { Connection } from "mongoose";
import { MongoConfig } from "../../config/database/mongodb";

let connection: Connection;

export const connect = async () => {
	return new Promise((resolve, reject) => {
		if (connection) return resolve(connection);

		if (!MongoConfig.url) {
			console.log(`Nao foi possivel carregar a url ${MongoConfig.url}`);
			reject();
		}

		Mongoose.connect(MongoConfig.url, MongoConfig.options).then(() => {
			connection = Mongoose.connection;

			connection.once("open", async () => {
				console.info("Conectado ao banco de dados");
			});

			connection.on("error", async (err) => {
				console.log("Erro no banco de dados");
				console.log(err);
			});

			resolve(connection);
		});
	});
};

export const disconnect = async () => {
	if (!connection) return;

	await Mongoose.disconnect();
	console.log("Desconectado!");
};
