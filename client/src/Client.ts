import net from "net";
import logger from "./logger";
import { MessageBuffer } from "./MessageBuffer";
import { CustomData, ProcessData } from "./processData";

export class Client {
    private readonly config: net.SocketConnectOpts;
    private callback: Function;
    public client: net.Socket;
    public active = false;
    private processData: ProcessData;
    private timeout: NodeJS.Timeout;
    private connectedChannels: Set<string>;
    private buffer: MessageBuffer;
    //TODO restabelecer a conexão automaticamente

    constructor(processData: ProcessData, config: net.SocketConnectOpts) {
        this.config = config;
        this.connectedChannels = new Set<string>();
        this.buffer = new MessageBuffer('\n', false);
        this.processData = processData;
        this.client = new net.Socket();

        this.setupSocket();
    }

    private setupSocket() {
        this.client.on("connect", () => {
            logger.log("Conexão estabelecida");

            if (this.connectedChannels.size > 0) {
                this.connectedChannels.forEach(channelName => {
                    this.writeSubcribe(channelName);
                })
            } else {
                this.listenToChannel('custom');
            }
        });

        this.client.on('data', data => {
            this.buffer.push(data.toString());

            while (!this.buffer.isDone()) {
                const message = this.buffer.getMessage();

                this.processMessage(message);
            }
        });

        this.client.on("error", (err) => {
            logger.exception(err, 'Erro na conexão socket');
            this.active = false;
        });

        this.client.on("end", () => {
            logger.log("Conexão fechada");
            this.setReconnect();
            this.active = false;
        });
    }

    private processMessage(message: string) {
        // logger.log(message);

        const matchRec = message.match(/^rec_(.*)_(.*)$/);

        if (matchRec && matchRec[1] && matchRec[2]) {
            return;
        }

        // sat_prn_snr_azimuth_elevation_lat_lon_time\n
        const matchCustom = message.match(/^sat_(.*)_(.*)_(.*)_(.*)_(.*)_(.*)_(.*)$/);

        if (matchCustom && matchCustom[1] && matchCustom[2] && matchCustom[3] && matchCustom[4] && matchCustom[5] && matchCustom[6] && matchCustom[7]) {
            const customData: CustomData = {
                prn: parseInt(matchCustom[1]),
                snr: parseFloat(matchCustom[2]) || null,
                azimuth: parseFloat(matchCustom[3]) || null,
                elevation: parseFloat(matchCustom[4]) || null,
                lat: parseFloat(matchCustom[5]),
                lon: parseFloat(matchCustom[6]),
                time: new Date(parseInt(matchCustom[7])),
            };

            this.processData.processCustomData(customData);
        }
    }

    /**
     * @param name
     * @description helper method to subscribe to an channel
     * @private
     */
    private writeSubcribe(name: string) {
        logger.log(`Sending subscribe ${name}`);
        this.client.write(`sub_${name}\n`);
    }

    /**
     * @description set the client to listen to a channel
     * @param name
     */
    public listenToChannel(name: string) {
        if (!this.connectedChannels.has(name)) {
            this.connectedChannels.add(name);

            this.writeSubcribe(name);
        }
    }

    private setReconnect() {
        const time = 1000 * 5;
        logger.log(`Tentando reconectar em ${time} ms`)
        this.timeout = setTimeout((client) => {
            console.log('Tentando reconectar');
            client.run(client.callback);
        }, time, this);
    }

    public run(cb?: Function): net.Socket {
        this.callback = cb;

        this.client.on("lookup", (err: Error, address: string, family: string | number, host: string) => {
            if (err) {
                logger.log("Erro ao tentar criar conexão");
                logger.log(err);
            } else {
                logger.log("Conexão criada");
            }
        }
        );

        return this.client.connect(this.config, () => {
            this.active = true;

            if (this.timeout) {
                clearTimeout(this.timeout);
                this.timeout = null;
            }

            if (cb) {
                return cb();
            } else {
                return;
            }
        });
    }
}
