import { User } from "discord.js";
import DataTypes from "sequelize";
import SquadServer from "../index.js";
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
            interval: {
                required: false,
                description: 'Discord rebrodcast interval in seconds',
                default: 300
            }
        };
    }

    constructor(server, options) {
        super(server, options);

        this.storage = options.storage;

        this.discordClient.once('ready', async () => {
            await this.setupDatabase();
            this.waitForMessageTrigger(server);
            this.setupRefreshInterval(server);
        });        
        this.sendDiscordMessage();
    }

    async setupDatabase() {
        try {
            this.storage.authenticate();
            SquadServer.verbose('Storage authenticated');

            // This dhould be a migration
            this.DiscordBordcastDestination = this.storage.define('discord_brodcast_destinations', {
                channelId: DataTypes.STRING,
                messageId: DataTypes.STRING
            });
            await this.storage.sync();
        } catch (e) {
            console.error(e);
        }
    }

    waitForMessageTrigger(server) {
        this.discordClient.on('message', async (message) => {
            if (message.content === '!server') {
                await this.subscribeDiscordDestination(server, message);
            } else if (message.content === '!server-stop') {
                await this.unsubscribeDiscordDestination(message);
            }
        });
    }

    async subscribeDiscordDestination(server, message) {
        const messageId = await this.writeMessageToChannel(server, message.channel);
        const brodcast = this.DiscordBordcastDestination.build({ channelId: message.channel.id, messageId: messageId});
        
        await brodcast.save();
    }

    async unsubscribeDiscordDestination(message) {
        await this.DiscordBordcastDestination.destroy({where: { channelId: message.channel.id }});
    }

    async writeMessageToChannel(server, channel) {
        const message = await channel.send(this.buildEmbededMessage(server));
        return message.id;
    }

    setupRefreshInterval(server) {
        this.discordClient.setInterval(async () => {
            this.DiscordBordcastDestination.findAll().then(async (brodcasts) => {
                brodcasts.every(async (brodcast) => {
                    try {
                        const channel = await this.discordClient.channels.fetch(brodcast.channelId);
                        const message = await channel.messages.fetch(brodcast.messageId);

                        await message.edit(this.buildEmbededMessage(server));
                    } catch (e) {
                        if (e.httpStatus === 404) {
                            await this.DiscordBordcastDestination.destroy({where: { id: brodcast.id}});
                            SquadServer.verbose('Message or channel not found, deleting the reference');
                        } else {
                            console.error(e);
                        }
                    }
                });
            }).catch((e) => {
                console.error(e);
            });

            
        }, 10000);
    }

    buildPlayerListByTeam(playerArrayMixed) {
        let playerByTeam = { teamOne: '', teamTwo: '', teamOneCount: 0, teamTwoCount: 0 };

        playerArrayMixed.forEach(player => {
            if (player.teamID === '1') {
                playerByTeam.teamOne += player.name + '\n';
                playerByTeam.teamOneCount++;
            } else {
                playerByTeam.teamTwo += player.name + '\n';
                playerByTeam.teamTwoCount++;
            }

        });

        return playerByTeam;
    }

    buildEmbededMessage(server) {
        let playersCount = '';

        playersCount += `${server.a2sPlayerCount}`;
        if (server.publicQueue + server.reserveQueue > 0)
          playersCount += ` (+${server.publicQueue + server.reserveQueue})`;
    
        playersCount += ` / ${server.publicSlots}`;
        if (server.reserveSlots > 0) playersCount += ` (+${server.reserveSlots})`;
    
        const playerListByTeam = this.buildPlayerListByTeam(server.players);
        const fields = [
          { name: 'Players', value: "```"+`${playersCount}`+"```" },
          { name: 'Current Layer', value: "```"+`${server.layerHistory[0].layer || 'Unknown'}`+"```", inline: true },
          { name: 'Next Layer', value: "```"+`${server.nextLayer || 'Unknown'}`+"```", inline: true },
          { name: 'Join', value: `steam://connect/${server.options.host}:${server.options.queryPort}` },
          { name: `${server.layerHistory[0].teamOne.faction}  (${playerListByTeam.teamOneCount} players)`, value: "```"+playerListByTeam.teamOne+"```", inline: true },
          { name: `${server.layerHistory[0].teamTwo.faction}  (${playerListByTeam.teamTwoCount} players)`, value: "```"+playerListByTeam.teamTwo+"```", inline: true }
        ];
    
        return {
          content: '',
          embed: {
            title: server.serverName,
            fields: fields,
            color: '#C02026',
            timestamp: new Date().toISOString(),
            footer: { text: "Shit was made by some famous dude." }
          }
        };
      }
}