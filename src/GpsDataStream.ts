import SerialPort, { parsers } from 'serialport';
import { GPSConfig } from './config/gpsConfig';
import GPS from 'gps';

/**
 * @description GpsDataStream is a class to help extend GPS node package, receiving
 * the NMEA data directly from the serial port
 */
export class GpsDataStream extends GPS {
    protected _serialPort: SerialPort;
    protected _parser: parsers.Readline;
    protected input: string;

    /**
     * @description receives input value that indicate from where the device will receive
     * NMEA data, defaults to /dev/ttyUSB0
     * @param input
     */
    constructor(input?: string) {
        super();
        this.input = input || GPSConfig.serialInput || '/dev/ttyUSB0';

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