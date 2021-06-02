import { PrnIndicesMongo } from "./controller/PrnIndices";
import { PrnInfoMongo } from "./controller/PrnInfo";
import { connect } from "./database/mongodb/connection";
import { ProcessData } from "./processData";
import { Client } from "./Client";
import logger from "./logger";

if (require.main == module) {
	connect().then(() => {
		const prnInfo = new PrnInfoMongo();
		const prnIndices = new PrnIndicesMongo()
		const processData = new ProcessData(prnInfo, prnIndices);

		const client = new Client(processData,  { port: 3000, host: '192.168.3.23' });

		client.run(() => {
			logger.log('Client is running');
		});
	}).catch((err) => {
		logger.exception(err);
	});
}
