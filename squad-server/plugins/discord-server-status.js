import DiscordIntervalUpdatedMessage from "./discord-interval-updated-message.js";

export default class DiscordServerStatus extends DiscordIntervalUpdatedMessage {
    static get description() {
        return (
          '<code>DiscordServerStatus</code>'
        );
      }

    static get optionsSpecification() {
      return {
        ...super.optionsSpecification,
        accentColor: {
          description: "Color to use on small stuff to make things look cool",
          default: '#FFFFFF'
        }
      }
    }

    constructor(server, options) {
      super(server, options)

      this.accentColor = options.accentColor;
    }

    buildMessage(server) {
        let playersCount = '';

        playersCount += `${server.a2sPlayerCount}`;
        if (server.publicQueue + server.reserveQueue > 0)
          playersCount += ` (+${server.publicQueue + server.reserveQueue})`;
    
        playersCount += ` / ${server.publicSlots}`;
        if (server.reserveSlots > 0) playersCount += ` (+${server.reserveSlots})`;
    
        const fields = [
          { name: 'Players', value: "```"+`${playersCount}`+"```" },
          { name: 'Current Layer', value: "```"+`${server.layerHistory[0].layer || 'Unknown'}`+"```", inline: true },
          { name: 'Next Layer', value: "```"+`${server.nextLayer || 'Unknown'}`+"```", inline: true },
          { name: 'Join', value: `steam://connect/${server.options.host}:${server.options.queryPort}` }
        ];
    
        return {
          content: '',
          embed: {
            title: server.serverName,
            fields: fields,
            color: this.accentColor,
            timestamp: new Date().toISOString(),
            footer: { text: "Shit was made by some famous dude." }
          }
        };
      }
}