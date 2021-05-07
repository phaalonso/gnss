export class PubSub<T> {
    private readonly listeningChannels = new Map<string, T[]>();
    private methodName: string;

    constructor(methodName = 'write') {
        this.methodName = methodName;
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
            con[this.methodName](message);
        }
    }

    public echo(message: string) {
        this.listeningChannels.forEach(channel => {
            for (const con of channel) {
                // @ts-ignore
                con[this.methodName](message);
            }
        })
    }
}