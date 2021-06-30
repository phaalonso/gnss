import path from 'path';
import { SQLite } from './sqlite/database/DAO';
import { CustomData, ProcessData } from './core/processData';
import { PrnInfoSqlite } from './sqlite/controller/PrnInfoSqlite';
import { PrnIndicesSqlite } from './sqlite/controller/PrnIndicesSqlite';
import { createReadStream } from 'fs';
import logger from '../../dataProvider/src/logger';
import { PrnInfoMongo } from './mongodb/controller/PrnInfoMongo';
import { PrnIndicesMongo } from './mongodb/controller/PrnIndicesMongo';
import { connect } from './mongodb/database/connection';

const file = path.join(__dirname, '..', '..', 'gpsData.custom');

async function run() {
    // const dao = new SQLite();
    // const prnInfo = new PrnInfoSqlite(dao);
    // await prnInfo.createTable();
    // const prnIndices = new PrnIndicesSqlite(dao)
    // await prnIndices.createTable();

	await connect();
    const prnInfo = new PrnInfoMongo();
    const prnIndices = new PrnIndicesMongo()
    const processData = new ProcessData(prnInfo, prnIndices);
    const stream = createReadStream(file);

    stream.on('open', () => {
        logger.log('Stream open');
    })

    stream.on('data', async data => {
        // console.log(data.toString());
        const message = data.toString().split('\n');

        for (const msg of message) {
            const matchCustom = msg.match(/sat_(.*)_(.*)_(.*)_(.*)_(.*)_(.*)_(.*)/);
            // console.log(matchCustom);

            if (matchCustom && matchCustom[1] && matchCustom[2] && matchCustom[3] && matchCustom[4] && matchCustom[5] && matchCustom[6] && matchCustom[7]) {
                console.log(matchCustom);
				const time = new Date(parseInt(matchCustom[7]));
				console.log(time);
                const customData: CustomData = {
                    prn: parseInt(matchCustom[1]),
                    snr: parseFloat(matchCustom[2]) || null,
                    azi: parseFloat(matchCustom[3]) || null,
                    elev: parseFloat(matchCustom[4]) || null,
                    lat: parseFloat(matchCustom[5]),
                    lon: parseFloat(matchCustom[6]),
                    time,
                };

                //console.log(customData);
                await processData.processCustomData(customData);
            }
        }
    });

    stream.on('close', () => {
        process.exit(0);
    })
}

run();
