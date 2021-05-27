import { PrnIndicesMongo } from "../controller/PrnIndices";
import { PrnInfoMongo } from "../controller/PrnInfo";
import { connect } from "../database/mongodb/connection";
import { ProcessData } from "../processData";
import { Client } from "./Client";


if (require.main == module) {
	connect().then(() => {
		const prnInfo = new PrnInfoMongo();
		const prnIndices = new PrnIndicesMongo()
		const processData = new ProcessData(prnInfo, prnIndices);

		const client = new Client(processData);

		client.run(() => {
			console.log('Client is running');
		})
	}).catch((err) => {
		console.log(err);
	});
}
