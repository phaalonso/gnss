import path from 'path';
import { NMEAStream } from './GnssDataStream';

const filePath = path.join(__dirname, '..', 'gpsData.nmea');

const stream = new NMEAStream();
stream.setSerialInput('/dev/ttyUSB0');

stream.pipeToFile(filePath);

setTimeout(() => {
    stream.close();
    process.exit(0);
<<<<<<< HEAD
}, 1000 * 60 * 60);
=======
}, 1000 * 60 * 1);o
>>>>>>> 6af98c3a3090cbc0fe1805fef9b58f0ef87bab1f
