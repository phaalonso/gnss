import { PrnIndicesSqlite } from "./controller/PrnIndicesSqlite";
import { PrnInfoSqlite } from "./controller/PrnInfoSqlite";
import { ProcessData } from "../ProcessData";
import { SQLite } from "./database/DAO";
import path from 'path';
import logger from "../logger";
import { WebSocketClient } from "../clients/WebSocketClient";

async function run() {
	const timeStamp = new Date().getTime();
	const file = path.join(__dirname, '..', '..', '..', `sqlite_${timeStamp}.log`);
	logger.enableWrite(file)
	logger.log(`Logging is being saved in the file ${file}`);

	const dao = new SQLite();
	const prnInfo = new PrnInfoSqlite(dao);
	const prnIndices = new PrnIndicesSqlite(dao)

	await prnInfo.createTable();
	await prnIndices.createTable();

	const processData = new ProcessData(prnInfo, prnIndices);

	//const clientConfig = config.get('client');
	//const client = new Client(processData,  { port: 3000, host: '192.168.3.23' });
	const client = new WebSocketClient(processData);

	client.run();
}

if (require.main == module) {
	run()
		.catch(err => logger.exception(err));
}
