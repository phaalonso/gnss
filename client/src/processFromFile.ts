import path from 'path';
import { DataProvider } from '../../dataProvider/src/GnssDataStream';
import { SQLite } from './sqlite/database/DAO';
import { CustomData, ProcessData } from './core/processData';
import { PrnInfoSqlite } from './sqlite/controller/PrnInfoSqlite';
import { PrnIndicesSqlite } from './sqlite/controller/PrnIndicesSqlite';

const file = path.join(__dirname, '..', '..', 'gpsData.nmea')

const dataStream = new DataProvider();

dataStream.setFileInput(file);
dataStream.pipeToGps();

let time = new Date();
let lat: number;
let lon: number;

async function run() {
    const dao = new SQLite();
    const prnInfo = new PrnInfoSqlite(dao);
    await prnInfo.createTable();
    const prnIndices = new PrnIndicesSqlite(dao)
    await prnIndices.createTable();
    const processData = new ProcessData(prnInfo, prnIndices);

    dataStream.on('data', async data => {
        if (data.time) {
            time = data.time;
            lat = data.lat;
            lon = data.lon;
        }

        if (!data.msgNumber || data.msgNumber == "null" || !data.satellites || !lat || !lon) {
            return;
        } else {
            console.log(data);
            for (const satelite of data.satellites) {
                const customData: CustomData = {
                    prn: satelite.prn,
                    snr: satelite.snr,
                    azi: satelite.azimuth,
                    elev: satelite.elevation,
                    lat: lat,
                    lon: lon,
                    time: time,
                };

                processData.sendToBuffer(customData);
            }
        }
    })
}

run();
