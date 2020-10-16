import { MessageManager } from "discord.js";
import DiscordBasePlugin from "./discord-base-plugin.js"

export default class DiscordServerStatus extends DiscordBasePlugin {
    static get description() {
        return (
          '<code>DiscordServerStatus</code>'
        );
      }

    static get optionsSpecification() {
        return {
            discordClient: {
                required: true,
                description: 'Discord connector name.',
                connector: 'discord',
                default: 'discord'
            },
            storage: {
                required: true,
                description: 'Local storrage connector',
                connector: 'databaseClient',

            },
            channelID: {
                required: true,
                description: 'Discord channel name.',
                default: null,
                example: 123457890
            }
        };
    }

    channelId = null;
    messageId = null;

    constructor(server, options) {
        super(server, options);

        this.discordClient.once('ready', async () => {
            this.waitForMessageTrigger();
            this.setupRefreshInterval();
        });        
    }
//     const channel = await this.discordClient.channels.fetch(this.channelID);
            
//     // await channel.send('test');
//     // const channel = await this.discordClient.channels.fetch(this.channelID);
//     const message = await channel.messages.fetch('766649320597487636');
    
//     await message.edit('new test');
// });
    waitForMessageTrigger() {
        this.discordClient.on('message', async (message) => {
            if (message.content === 'toto1') {
                this.channelId = message.channel.id;

                this.messageId = await this.writeMessageToChannel(message.channel);
            }
        });
    }

    async writeMessageToChannel(channel) {
        const message = await channel.send("Test");
        return message.id;
    }

    setupRefreshInterval() {
        this.discordClient.setInterval(async () => {
            if (this.messageId) {
                const channel = await this.discordClient.channels.fetch(this.channelID);
                const message = await channel.messages.fetch(this.messageId);

                await message.edit('Test' + new Date().toString());
            }
        }, 3000);
    }
}