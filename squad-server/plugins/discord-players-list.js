import DiscordIntervalUpdatedMessage from "./discord-interval-updated-message.js";

export default class DiscordPlayersList extends DiscordIntervalUpdatedMessage {
    constructor(server, options) {
        super(server, options);
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

    buildMessage(server) {
        const playerListByTeam = this.buildPlayerListByTeam(server.players);

        return {
            content: '',
            embed: {
                title: 'Players',
                fields: [
                    { name: `${server.layerHistory[0].teamOne.faction}  (${playerListByTeam.teamOneCount} players)`, value: "```"+playerListByTeam.teamOne+"```", inline: true },
                    { name: `${server.layerHistory[0].teamTwo.faction}  (${playerListByTeam.teamTwoCount} players)`, value: "```"+playerListByTeam.teamTwo+"```", inline: true }
                ]
            }
        };
    }
}