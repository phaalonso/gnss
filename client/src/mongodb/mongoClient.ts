import { Client } from "../core/Client";
import logger from "../logger";
import path from 'path';
import { connect } from "./database/connection";
import { PrnInfoMongo } from "./controller/PrnInfoMongo";
import { PrnIndicesMongo } from "./controller/PrnIndicesMongo";
import { ProcessData } from "../core/ProcessData";
import config from "../config/ConfigProvider";

if (require.main == module) {
	connect().then(() => {
		const file = path.join(__dirname, '..', '..', '..', `sqlite.log`);
		logger.enableWrite(file)
		const prnInfo = new PrnInfoMongo();
		const prnIndices = new PrnIndicesMongo()
		const processData = new ProcessData(prnInfo, prnIndices);

		const clientConfig = config.get('client');
		//const client = new Client(processData,  { port: 3000, host: '192.168.3.23' });
		const client = new Client(processData,  { 
			port: clientConfig.port, 
			host: clientConfig.host 
		});

		client.run(() => {
			logger.log('Client is running');
		});
	}).catch((err) => {
		logger.exception(err);
	});
}
