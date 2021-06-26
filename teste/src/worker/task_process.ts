import { parentPort } from 'worker_threads';
import { PrnIndicesMongo } from '../controller/PrnIndicesMongo';
import { PrnInfoMongo } from '../controller/PrnInfoMongo';
import { connect } from '../database/connection';
import { ProcessData } from '../services/processData';
import { IWorkerMessages } from './WorkerPool';

connect().then(() => {
    const prnInfo = new PrnInfoMongo();
	const prnIndices = new PrnIndicesMongo();
	const processData = new ProcessData(prnInfo, prnIndices);

	parentPort.on('message', async ({ data, time }: IWorkerMessages) => {
		if (data) {
			await prnInfo.insertMany(data);
			parentPort.postMessage('Data inserted');
		} else if (time) {
			await processData.processMinute(time);
			parentPort.postMessage(`Minute ${time.getMinutes()} processed`);
		}
	});
});
