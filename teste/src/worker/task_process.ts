import { parentPort } from 'worker_threads';
import { PrnIndicesMongo } from '../controller/PrnIndicesMongo';
import { PrnInfoMongo } from '../controller/PrnInfoMongo';
import { connect } from '../database/connection';
import { CustomData } from '../services/processData';

connect().then(() => {
    const prnInfo = new PrnInfoMongo();
    const prnIndices = new PrnIndicesMongo();

    parentPort.on('message', async (data: CustomData[]) => {
        await prnInfo.insertMany(data);
        parentPort.postMessage('ok');
    })
});