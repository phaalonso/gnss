import SerialPort, { parsers } from 'serialport';
import { GPSConfig } from './config/gpsConfig';
import GPS from 'gps';

export class GpsDataStream extends GPS {
    private _serialPort: SerialPort;
    private _parser: parsers.Readline; 
    private input: string;

    constructor(input?: string) {
        super();
        this.input = input || GPSConfig.serialInput;

        this._parser = new SerialPort.parsers.Readline({
            delimiter: '\r\n',
        });

        this._serialPort = new SerialPort(this.input, {
            baudRate: GPSConfig.baudRage,
        });
        
        this._serialPort.pipe(this._parser);

        this._parser.on('data', data => {
            this.update(data);
        });
    }

}