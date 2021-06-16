import path from 'path';
import { DataProvider } from './GnssDataStream';
import { createWriteStream } from 'fs';
import logger from './logger';

const nmea = false;

const stream = new DataProvider();

if (nmea) {
    const filePath = path.join(__dirname, '..', '..', 'gpsData.nmea');

    logger.log(`Saving data into ${filePath}`);
    stream.setSerialInput('/dev/ttyUSB0');

    stream.pipeToFile(filePath);
} else {
    const filePath = path.join(__dirname, '..', '..','gpsData.custom');
    const writeStream = createWriteStream(filePath);

    logger.log(`Saving data into ${filePath}`);

    stream.setSerialInput('/dev/ttyUSB0');

    stream.pipeToGps();

    let time = new Date();
    let lat: number;
    let lon: number;

    stream.on('data', data => {
			if (data.time) {
				time = data.time;
				lat = data.lat;
				lon = data.lon;
			}

			if (!data.msgNumber || data.msgNumber == "null" || !data.satellites || !lat || !lon) {
				return;
			} else {
				for (const satelite of data.satellites) {
-					writeStream.write(`sat_${satelite.prn}_${satelite.snr}_${satelite.azimuth}_${satelite.elevation}_${lat}_${lon}_${time.getTime()}\n`);
				}
			}

    });
}

setTimeout(() => {
    stream.close();
    process.exit(0);
<<<<<<< HEAD
}, 1000 * 60 * 60);
=======
<<<<<<< HEAD
}, 1000 * 60 * 60);
=======
}, 1000 * 60 * 1);o
>>>>>>> 6af98c3a3090cbc0fe1805fef9b58f0ef87bab1f
>>>>>>> 5b06c6ca4f12af99e976da7e04fea572f861ab25
