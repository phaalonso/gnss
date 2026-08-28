import path from 'node:path';
import { GPSProvider } from '../../dataProvider/src/GnssDataStream';
import { ProcessData } from './ProcessData';
import { SignalMetrics } from './model/SignalMetrics';
import { SQLite, PrnInfoBetterSqlite, PrnIndicesBetterSqlite } from './adapter/out/store/sqlite';

const file = path.join(__dirname, '..', '..', 'gpsData.nmea')

const dataStream = new GPSProvider({
	fileInput: file,
});

let time = new Date();
let lat: number;
let lon: number;

async function run() {
    const dao = new SQLite();
    const prnInfo = new PrnInfoBetterSqlite(dao);
    const prnIndices = new PrnIndicesBetterSqlite(dao)

    await prnInfo.initialize();
    await prnIndices.initialize();

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
                const customData: SignalMetrics = {
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

    dataStream.parse();
}

run();
