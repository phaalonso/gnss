import SerialPort from 'serialport';
import { GPSConfig } from './config/gpsConfig';

const parser = new SerialPort.parsers.Readline({
    delimiter: '\r\n'
});

const port = new SerialPort(GPSConfig.serialInput, {
    baudRate: GPSConfig.baudRage,
});

port.pipe(parser);

export default parser;
