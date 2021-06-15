import SerialPort, { parsers } from 'serialport';
import { GPSConfig } from './config/gpsConfig';
import { SocketPubSub, socketPubSub } from './services/PubSub';
import GPS from 'gps';
import logger from "./logger";

/**
 * @description GnssDataStream is a class to help extend GPS node package, receiving
 * the NMEA data directly from the serial port
 */
export class GnssDataStream extends GPS {
    protected serialPort: SerialPort;
    protected parser: parsers.Readline;
    protected input: string;
	protected socket: SocketPubSub;

    /**
     * @description receives input value that indicate from where the device will receive
     * NMEA data, defaults to /dev/ttyUSB0
     * @param input
     */
    constructor(input?: string) {
        super();

		this.socket = socketPubSub;

		// Create socket channel	
		this.socket.createChannel('nmea');

        this.input = input || GPSConfig.serialInput || '/dev/ttyUSB0';

        this.parser = new parsers.Readline({
            delimiter: '\r\n',
        });

        this.parser.on('error', err => {
            logger.exception(err, 'Parser');
        });

        this.serialPort = new SerialPort(this.input, {
            baudRate: GPSConfig.baudRage,
        });

        this.serialPort.on('error', err => {
            logger.exception(err, 'Serial port')
        });
        
        this.serialPort.pipe(this.parser);

        this.parser.on('data', data => {
            try {
                //console.log(data);
                this.update(data);
                // Use created channel to transmit nmea data
                this.socket.pub('nmea', data);
            } catch (err) {
                logger.exception(err.message);
            }
        });

        this.parser.on('error', err => {
            logger.exception(err, 'Parser');
        })
    }
}
