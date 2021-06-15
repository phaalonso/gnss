import SerialPort, { parsers } from 'serialport';
import { GPSConfig } from './config/gpsConfig';
import { SocketPubSub, socketPubSub } from './services/PubSub';
import fs, { ReadStream, WriteStream } from 'fs';
import GPS from 'gps';
import logger from "./logger";

/**
 * @description GnssDataStream is a class to help extend GPS node package, receiving
 * the NMEA data directly from the serial port
 */
export class NMEAStream extends GPS {
	protected socket?: SocketPubSub;

    protected inputStream: SerialPort | ReadStream;
    protected parserStream: parsers.Readline;
    protected writeStream?: WriteStream;

    /**
     * @description receives input value that indicate from where the device will receive
     * NMEA data, defaults to /dev/ttyUSB0
     * @param input
     */
    constructor() {
        super();
    }

    public setSerialInput(input: string = GPSConfig.serialInput) {
        if (this.inputStream) {
            throw new Error('There is already an input stream');
        }

        this.inputStream = new SerialPort(input, {
            baudRate: GPSConfig.baudRate,
        });

        this.inputStream.on('error', err => {
            logger.exception(err, 'Serial port')
        });
    }

    public setFilelInput(filelInput: string) {
        if (this.inputStream) {
            throw new Error('There is already an input stream');
        }

        this.inputStream = fs.createReadStream(filelInput);

        this.inputStream.on('error', err => {
            logger.exception(err, 'Serial port')
        });
    }

    public pipeToGps(sendNmea = false): void {
		this.socket = socketPubSub;

        if (sendNmea) {
            // Create socket channel	
            this.socket.createChannel('nmea');
        }

        this.parserStream = new parsers.Readline({
            delimiter: '\r\n',
        });

        this.parserStream.on('error', err => {
            logger.exception(err, 'Parser');
        });

        this.inputStream.pipe(this.parserStream);

        this.parserStream.on('data', data => {
            try {
                //console.log(data);
                this.update(data);
                // Use created channel to transmit nmea data
                this.socket.pub('nmea', data);
            } catch (err) {
                logger.exception(err.message);
            }
        });

        this.parserStream.on('error', err => {
            logger.exception(err, 'Parser');
        })
    }

    public pipeToFile(file: string): void {
        const writeStream = fs.createWriteStream(file);

        this.inputStream.pipe(writeStream);
    }

    public close(): void {
        this.writeStream?.close();
        this.inputStream?.close();
    }
}
