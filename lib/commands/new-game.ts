import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { addPlayerToGame, makeGameMessage } from '../types/game-listing';
import { GameDB, GameListing, GuildId, NormalInteraction, PlayerDB, PlayerId } from '../types';
import { addGameToDB } from '../types/gamedb';

function makeGameListing (players: number, gameName : string, creator: string, creatorId: PlayerId, guildId : GuildId) {
  return {
    max_players : players,
    current_players : 0,
    name : gameName,
    creator : creator,
    creatorId : creatorId,
    players : [],
    guildId : guildId,
  };
}

async function validateInteraction (interaction : CommandInteraction & NormalInteraction) {
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
  return { players, gameName };
}

export const newGameData = new SlashCommandBuilder()
  .setName('new-game')
  .setDescription('Create a new mafia game.')
  .addIntegerOption(option =>
    option.setName('players')
      .setDescription('The number of players this game will have. Must be between 5 and 20.')
      .setRequired(true),
  )
  .addStringOption(option =>
    option.setName('game-name')
      .setDescription('The name of the game. Must be between 5 and 30 characters long.')
      .setRequired(true),
  );

export async function executeNewGame (interaction : CommandInteraction & NormalInteraction, db : GameDB, playerDb : PlayerDB) {
  const guild = interaction.guild;
  const creator = interaction.member;
  const { players, gameName } = await validateInteraction(interaction);
  const game = (makeGameListing(players, gameName, creator.displayName, creator.id, guild.id) as unknown) as GameListing;
  const gameMsg = makeGameMessage(game);
  const msg = await interaction.channel.send(gameMsg);
  game.messageId = msg.id;
  addGameToDB(game, guild.id, creator.id, db);
  addPlayerToGame(creator, game, playerDb, interaction.channel.messages, guild.roles, guild.channels);
  await interaction.reply({ ephemeral: true, content: `New game "${gameName}" created successfully.` });
}
