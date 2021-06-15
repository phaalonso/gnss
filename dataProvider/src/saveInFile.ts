import path from 'path';
import { NMEAStream } from './GnssDataStream';

const filePath = path.join(__dirname, '..', 'gpsData.nmea');

const stream = new NMEAStream();
stream.setSerialInput('/dev/ttyUSB0');

stream.pipeToFile(filePath);

setTimeout(() => {
    stream.close();
    process.exit(0);
}, 1000 * 60 * 60);
