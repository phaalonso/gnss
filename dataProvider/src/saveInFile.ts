import SerialPort, { parsers } from 'serialport';
import { GPSConfig } from './config/gpsConfig';
import fs from 'fs';
import path from 'path';

const writeStream = fs.createWriteStream(path.join(__dirname, '..', 'gpsData.nmea'));

const serialPort = new SerialPort('/dev/ttyUSB0' , {
    baudRate: GPSConfig.baudRate,
});

serialPort.pipe(writeStream);

setTimeout(() => {
    writeStream.close();
    process.exit(0);
}, 1000 * 60 * 1);