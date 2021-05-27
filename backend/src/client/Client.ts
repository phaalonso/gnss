import net from "net";
import { CustomData, ProcessData } from "../core/processData";

export class Client {
    private readonly config: net.SocketConnectOpts;
    private callback: Function;
    public socket: net.Socket;
    public active = false;
    private processData: ProcessData;
    private timeout: NodeJS.Timeout;
    private connectedChannels: Set<string>;
    //TODO restabelecer a conexão automaticamente

    constructor(processData: ProcessData, config: net.SocketConnectOpts) {
        if (!processData) {
            throw new Error('Client requires processData');
        }

        if (!config) {
            throw new Error('Client requires socket config');
        }

        this.config = config;

        this.connectedChannels = new Set<string>();

        this.processData = processData;
        this.socket = new net.Socket();
        this.socket.on("connect", () => {
            console.log("Conexão estabelecida");

            // Em casos em que o cliente recupera a conexão, irá utilizar a lista para
            // se reinscrever nos canais
            if (this.connectedChannels.size > 0) {
                this.connectedChannels.forEach(channelName => {
                    this.writeSubcribe(channelName);
                })
            } else {
                this.listenToChannel('custom');
            }
        });

        this.socket.on('data', data => {
            //TODO criar buffer de mensagens
            const msgs = data.toString().split("\n");
            //console.log(msgs)

            for (const msg of msgs) {
                const matchRec = msg.match(/^rec_(.*)_(.*)$/);

                if (matchRec && matchRec[1] && matchRec[2]) {
                    //TODO Marcar que a mensagem enviada foi recebida pelo cliente
                    console.log(msg);
                    return;
                }

                //`sat_prn_snr_azimuth_elevation_lat_lon_time\n`)
                const matchCustom = msg.match( /^sat_(.*)_(.*)_(.*)_(.*)_(.*)_(.*)_(.*)$/);
                //console.log(matchCustom[7]);

                if ( matchCustom && matchCustom[1] && matchCustom[2] && matchCustom[3] && matchCustom[4] && matchCustom[5] && matchCustom[6] && matchCustom[7]) {
                    const customData: CustomData = {
                        prn: parseInt(matchCustom[1]),
                        snr: parseFloat(matchCustom[2]) || null,
                        azimuth: parseFloat(matchCustom[3]) || null,
                        elevation: parseFloat(matchCustom[4]) || null,
                        lat: parseFloat(matchCustom[5]),
                        lon: parseFloat(matchCustom[6]),
                        time: new Date(parseInt(matchCustom[7])),
                    };

                    //console.log(customData);

                    this.processData.processCustomData(customData);

                    return;
                }

                console.log(msg);
            }

        });

        this.socket.on("error", (err) => {
            console.log("Erro na conexão socket");
            console.log(err);
            this.active = false;
        });

        this.socket.on("end", () => {
            console.log("Conexão fechada");
            this.setReconnect();
            this.active = false;
        });
    }

    /**
     * @param name
     * @description helper method to subscribe to an channel
     * @private
     */
    private writeSubcribe(name: string) {
        this.socket.write(`sub_${name}`);
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
        console.log(`Tentando reconectar em ${time} ms`)
        this.timeout = setTimeout((client) => {
            console.log('Tentando reconectar');
            client.run(client.callback);
        }, time, this);
    }

    public run(cb?: Function): net.Socket {
        this.callback = cb;

        this.socket.on( "lookup", ( err: Error, address: string, family: string | number, host: string) => {
                if (err) {
                    console.log("Erro ao tentar criar conexão");
                    console.log(err);
                } else {
                    console.log("Conexão criada");
                }
            }
        );

        return this.socket.connect(this.config, () => {
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
