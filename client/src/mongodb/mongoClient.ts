import logger from "../logger";
import path from 'path';
import { connect } from "./database/connection";
import { PrnInfoMongo } from "./controller/PrnInfoMongo";
import { PrnIndicesMongo } from "./controller/PrnIndicesMongo";
import { Application } from "../Application";

if (require.main == module) {
	connect().then(() => {
		const file = path.join(__dirname, '..', '..', '..', `sqlite.log`);
		logger.enableWrite(file)
		const prnInfo = new PrnInfoMongo();
		const prnIndices = new PrnIndicesMongo()

		const client = new Application(
			prnInfo,
			prnIndices,
		);

		client.run(() => {
			logger.log('Client is running');
		});
	}).catch((err) => {
		logger.exception(err);
	});
}
