import WebSocket from "ws";
import { Client } from "./IClient";

export class WebsocketClient extends Client {
    private client: WebSocket;

    constructor(
        private websocketUrl: string,
    ) {
        super();
    }

    protected _sendMessage(message: string) {
        this.client.send(message);
    }
    protected _sendSubscribeMessage(channel: string) {
        this.client.send(`sub_${channel}\n`);
    }
    protected _connect(cb: (...args: any[]) => void) {
        this.client = new WebSocket(this.websocketUrl);
        this.client.on('open', cb);
        this.client.on('message', this.messageCB);
        this.client.on('error', this.errorCB);
        this.client.on('close', this.endCB);
    }

}