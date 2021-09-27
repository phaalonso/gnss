import { PrnIndicesSqlite } from "./controller/PrnIndicesSqlite";
import { PrnInfoSqlite } from "./controller/PrnInfoSqlite";
import { SQLite } from "./database/DAO";
import path from 'path';
import logger from "../logger";
import { Application } from "../Application";

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

	const client = new Application(
		prnInfo,
		prnIndices
	);

	client.run(() => {
		logger.log('Client is running');
	})
}

if (require.main == module) {
	run()
		.catch(err => logger.exception(err));
}
