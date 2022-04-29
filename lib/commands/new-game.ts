import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import Keyv from 'keyv';
import { getDirectory } from '../directory';
import { postGameMessage } from '../game-listing';
import { Directory, GameListing } from '../types';

function makeGameListing (players: number, gameName : string, creator: string) : GameListing {
  return {
    max_players : players,
    current_players : 1,
    name : gameName,
    creator : creator,
    players : [creator],
  };
}

// const choices = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map(num => {
//   return {
//     name: num.toString(),
//     value: num,
//   };
// });

async function validateInteraction (interaction : CommandInteraction, directories : Keyv<Directory>) {
  const guild = interaction.guild;
  if (!guild) {
    await interaction.reply({ ephemeral: true, content: 'This command may only be used in a guild.' });
    throw new Error('bad new-game interaction: not in a guild');
  }
  await getDirectory(interaction.guild, directories)
    .catch(async () => {
      await interaction.reply({ ephemeral: true, content: 'You need to designate a channel to be a directory using the "/set-directory" command before you can make a game.' });
      throw new Error('bad new-game interaction: no directory');
    });
  let players = interaction.options.get('players')?.value;
  if (!(typeof players === 'number')
    || Math.floor(players) < 5
    || Math.floor(players) > 20
  ) {
    await interaction.reply({ ephemeral: true, content: 'You must specify how many players will be in a game. You can have between 5 and 20 players.' });
    throw new Error ('bad new-game interaction: bad number of players');
  }
  players = Math.floor(players);
  const gameName = interaction.options.get('game-name')?.value;
  if (!(typeof gameName === 'string')
  || gameName.length < 5
  || gameName.length > 30
  ) {
    await interaction.reply({ ephemeral: true, content: 'You must give your game a name. It may be between 5 and 30 characters in length.' });
    throw new Error ('bad new-game interaction: bad game name');
  }
  const creator = interaction.member?.user.username;
  if (!creator) {
    throw new Error ('bad new-game interaction: invalid creator');
  }
  return { guild, players, gameName, creator };
}

module.exports = {

  data: new SlashCommandBuilder()
    .setName('new-game')
    .setDescription('Create a new mafia game.')
    .addIntegerOption(option =>
      option.setName('players')
        .setDescription('The number of players this game will have. Must be between 5 and 20.')
        .setRequired(true),
      // .addChoices(...choices)
    )
    .addStringOption(option =>
      option.setName('game-name')
        .setDescription('The name of the game. Must be between 5 and 30 characters long.')
        .setRequired(true),
    ),

  async execute (interaction : CommandInteraction, directories : Keyv<Directory>) {
    const { guild, players, gameName, creator } = await validateInteraction(interaction, directories);
    const game = makeGameListing(players, gameName, creator);
    await postGameMessage(guild, directories, game);
    await interaction.reply({ephemeral: true, content: `New game "${gameName}" created successfully.`})
  },

};