import { PrnIndicesSqlite } from "./controller/PrnIndices";
import { PrnInfoSqlite } from "./controller/PrnInfo";
import { ProcessData } from "./processData";
import { Client } from "./Client";
import { SQLite } from "./database/sqlite/DAO";
import logger from "./logger";


(async () => {
	if (require.main == module) {
	    try {
			const dao = new SQLite();
			const prnInfo = new PrnInfoSqlite(dao);
			await prnInfo.createTable();
			const prnIndices = new PrnIndicesSqlite(dao)
			await prnIndices.createTable();
			const processData = new ProcessData(prnInfo, prnIndices);

			// const client = new Client(processData,  { port: 3000, host: '192.168.3.23' });
			const client = new Client(processData,  { port: 2108, host: 'localhost' });

			client.run(() => {
				logger.log('Client is running');
			})
		}  catch(err) {
			logger.exception(err);
		}
	}
})()
