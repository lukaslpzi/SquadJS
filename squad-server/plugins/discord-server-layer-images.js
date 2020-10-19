import DiscordIntervalUpdatedMessage from "./discord-interval-updated-message.js";

export default class DiscordServerLayerImages extends DiscordIntervalUpdatedMessage {

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

    layerNameToSquadWikiImageName(layerName) {
        if (!layerName) return '';
        if (layerName.includes('CAF')) layerName = layerName.replace(/CAF( |_)/, '') + ' CAF';
        return layerName.replace(/ /g, '_').replace('_v', '_V');
    }

    buildMessage(server) {
        const currentLayerUrl = `https://squad.gamepedia.com/Special:FilePath/${this.layerNameToSquadWikiImageName(server.layerHistory[0].layer)}.jpg`;
        const nextLayerUrl = `https://squad.gamepedia.com/Special:FilePath/${this.layerNameToSquadWikiImageName(server.nextLayer)}.jpg`;

        return {
            embed: {
                title: `Current: ${server.layerHistory[0].layer}`,
                description: `Next: ${server.nextLayer}`,
                color: this.accentColor,
                timestamp: new Date().toISOString(),
                image: {
                    url: currentLayerUrl,
                    height: 100,
                    width: 100
                },
                thumbnail: {
                    url: nextLayerUrl,
                    height: 20,
                    width: 20
                }
            }
        }
    }
}