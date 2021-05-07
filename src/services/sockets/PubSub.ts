export class PubSub<T> {
    private readonly listeningChannels = new Map<string, T[]>();
    private _methodName: string;

    constructor(methodName = 'write') {
        this._methodName = methodName;
    }

    /**
     * @description create a channel with given channel name
     * @param channelName
     */
    public createChannel(channelName: string) {
        this.listeningChannels[channelName] = [];

        return this.listeningChannels[channelName];
    }

    /**
     * @description Subscribe a socket in determined channel
     * @param channelName
     * @param socket
     */
    public sub(channelName: string, socket) {
        if (!this.listeningChannels[channelName]) return;

        this.listeningChannels[channelName].push(socket)
    }

    /**
     * @description Publish a message in determined channel
     * @param channelName
     * @param message
     */
    public pub(channelName: string, message: string) {
        if (!this.listeningChannels[channelName]) return;

        for (const con of this.listeningChannels[channelName]) {
            con[this._methodName](message);
        }
    }

    public echo(message: string) {
        this.listeningChannels.forEach(channel => {
            for (const con of channel) {
                // @ts-ignore
                con[this._methodName](message);
            }
        })
    }

    public handleMessage(socket, data) {
        const msg = data.toString();

        const matchSub = msg.match(/^sub_(.*)$/);

        if (matchSub && matchSub[1]) {
            const channel = matchSub[1];
            this.sub(channel, socket);
            return;
        }

        const matchPub = msg.match(/^pub_(.*)_(.*)$/);

        if (matchPub && matchPub[1]) {
            const channel = matchPub[1];
            const message = matchPub[2];

            this.pub(channel, message);
            return;
        }

        console.error(new Error(`Comando desconhecido ${msg}`));
    }
}