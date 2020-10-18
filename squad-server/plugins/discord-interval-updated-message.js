import { DataTypes } from "sequelize/types";
import DiscordBasePlugin from "./discord-base-plugin";

export default class DiscordIntervalUpdatedMessage extends DiscordBasePlugin {
    static get description() {
        return ('dont instanciate me plox');
    }

    static get optionsSpecification() {
        return {
            discordClient: {
                connector: 'discord'
            },
            subscribeMessage: {
                default: '!start'
            },
            unsubscribeMessage: {
                default: '!stop'
            },
            interval: {
                default: 300
            },
            storage: {
                connector: 'databaseClient'
            }
        };
    }

    constructor(server, options) {
        super(server, options);

        this.subscribeMessage = options.subscribeMessage;
        this.unsubscribeMessage = options.unsubscribeMessage;

        this.discordClient.once('ready', async () => {
            await this.setupDatabase();
            this.setupMessageTriggers(server);
            this.setupUpdateInterval(server);
        });
    }

    async setupDatabase() {
        try {
            const tableName = this.__proto__.constructor.name + '_DiscordIntervalUpdateMessage'
            this.storage.authentucate();
            this.DiscordBrodcastDestination = this.storage.define(tableName,
            { channelId: DataTypes.STRING, messageId: DataTypes.STRING });
            await this.storage.sync();
        } catch (e) {

        }
    }

    setupMessageTriggers(server) {
        this.discordClient.on('message', async (message) => {
            if (message.content === this.subscribeMessage) {
                await this.subscribeDiscordDesination(server, message.channel);
            } else if (message.content === this.unsubscribeMessage) {
                await this.unsubscribeDiscordDestination(message.channel.id);
            }
        });
    }

    setupUpdateInterval(server) {
        this.discordClient.setInterval(async () => {
            this.DiscordBrodcastDestination.findAll().then((bordcastsArray) => {
                bordcastsArray.every(async (brodcast) => {
                    try {
                        const channel = await this.discordClient.channels.fetch(brodcast.channelId);
                        const message = await channel.messages.fetch(brodcast.messageId);

                        await message.edit(this.buildMessage(server));
                    } catch (e) {
                        if (e.httpStatus === 404) {
                            await this.DiscordBrodcastDestination.destroy({ where: { id: brodcast.id }});
                        } else {
                            console.error(e);
                        }
                    }
                });
            });
        });
    }

    async subscribeDiscordDesination(server, channel) {
        const message = await this.writeMessageToChannel(server, channel);
        const brodcast = this.DiscordBrodcastDestination.build(
            { channelId: channel.id, messageId: message.id });
        await brodcast.save();
    }

    writeMessageToChannel(server, channel) {
        const message = await channel.send(this.buildMessage(server));
        return message.id;
    }

    buildMessage(server) {
        return 'Override me !';
    }

    async unsubscribeDiscordDestination(channelId) {
        await this.DiscordBrodcastDestination.destroy({ where: { channelId: channelId }});
    }
}