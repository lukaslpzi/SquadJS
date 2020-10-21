import DiscordIntervalUpdatedMessage from "./discord-interval-updated-message.js";

export default class DiscordServerStatus extends DiscordIntervalUpdatedMessage {
    static get description() {
      return (
        '<code>DiscordServerStatus</code> discord plugin showing server information when called. It will update it\'s information on set delay.\
        Side accent color can be changed, current layer image can be displayed under and next layer image as a thumbnail.'
      );
    }

    static get defaultEnabled() {
      return false;
    }

    static get optionsSpecification() {
      return {
        ...super.optionsSpecification,
        accentColor: {
          description: "Color to use on small stuff to make things look cool",
          default: '#FFFFFF'
        },
        displayCurrentLayerImage: {
          description: "Turns on or off current layer image in the embed message",
          default: false
        },
        displayNextLayerThumbnail: {
          description: "Turns on or off next layer image in the messages thumbnail",
          default: false
        }
      }
    }

    constructor(server, options) {
      super(server, options)
      this.accentColor = options.accentColor;
      this.displayCurrentLayerImage = options.displayCurrentLayerImage;
      this.displayNextLayerThumbnail = options.displayNextLayerThumbnail;
    }

    buildCurrentLayerImage(currentLayer) {
      const currentLayerUrl = `https://squad.gamepedia.com/Special:FilePath/${this.layerNameToSquadWikiImageName(currentLayer)}.jpg`;

      return {
        image: {
          url: currentLayerUrl, height: 100, width: 100
        }
      }
    }

    buildNextLayerThumbnail(nextLayer) {
      const nextLayerUrl = `https://squad.gamepedia.com/Special:FilePath/${this.layerNameToSquadWikiImageName(nextLayer)}.jpg`;

      return {
        thumbnail: {
          url: nextLayerUrl, height: 20, width: 20
        }
      }
    }

    layerNameToSquadWikiImageName(layerName) {
      if (!layerName) return '';
      // TODO: This should be generalised when future DLC arives
      if (layerName.includes('CAF')) layerName = layerName.replace(/CAF( |_)/, '') + ' CAF';
      return layerName.replace(/ /g, '_').replace('_v', '_V');
    }

    buildMessage(server) {

      let playersCount = '';

      playersCount += `${server.a2sPlayerCount}`;
      if (server.publicQueue + server.reserveQueue > 0)
        playersCount += ` (+${server.publicQueue + server.reserveQueue})`;

      playersCount += ` / ${server.publicSlots}`;
      if (server.reserveSlots > 0) playersCount += ` (+${server.reserveSlots})`;

      const fields = [
        { name: 'Players', value: "```" + `${playersCount}` + "```" },
        { name: 'Current Layer', value: "```" + `${server.layerHistory[0].layer || 'Unknown'}` + "```", inline: true },
        { name: 'Next Layer', value: "```" + `${server.nextLayer || 'Unknown'}` + "```", inline: true },
        { name: 'Join', value: `steam://connect/${server.options.host}:${server.options.queryPort}` }
      ];

      return {
        content: '',
        embed: {
          ...this.displayCurrentLayerImage && server.layerHistory[0] && server.layerHistory[0].layer ? this.buildCurrentLayerImage(server.layerHistory[0].layer) : {},
          ...this.displayNextLayerThumbnail && server.nextLayer ? this.buildNextLayerThumbnail(server.nextLayer) : {},
          title: server.serverName,
          fields: fields,
          color: this.accentColor,
          timestamp: new Date().toISOString(),
          footer: { text: "Shit was made by some famous dude." }
        }
      };
    }
}