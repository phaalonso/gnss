import { PrnIndicesSqlite } from "../controller/PrnIndices";
import { PrnInfoSqlite } from "../controller/PrnInfo";
import { connect } from "../database/mongodb/connection";
import { ProcessData } from "../core/processData";
import { Client } from "./Client";
import { SQLite } from "../database/sqlite/DAO";


(async () => {
	if (require.main == module) {
	    try {
			await connect();

			const dao = new SQLite();
			const prnInfo = new PrnInfoSqlite(dao);
			await prnInfo.createTable();
			const prnIndices = new PrnIndicesSqlite(dao)
			await prnIndices.createTable();
			const processData = new ProcessData(prnInfo, prnIndices);

			const client = new Client(processData,  { port: 3000, host: '192.168.3.23' });

			client.run(() => {
				console.log('Client is running');
			})
		}  catch(err) {
			console.log(err);
		}
	}
})()