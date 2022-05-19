import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { GameDB, NormalInteraction, NormalMember, PlayerDB } from '../types';
import { updateGameMessage } from '../types/game-listing';

export const leaveGameData = new SlashCommandBuilder()
  .setName('leave-game')
  .setDescription('Leave a game of mafia that hasn\'t started yet.');

export async function executeLeaveGame (interaction : CommandInteraction & NormalInteraction, playerDb : PlayerDB, games : GameDB) {
  const player = interaction.member.user.id;
  const info = playerDb.get(player);
  if (!info) {
    await interaction.reply({ ephemeral:true, content:'You aren\'t in a game.' });
    throw new Error ('bad leave-game interaction: not in a game');
  }
  const [currentGuild, currentCreator] = info;
  const guildDb = games.get(currentGuild);
  const listing = guildDb?.get(currentCreator);
  playerDb.delete(player);
  if (!guildDb || !listing) throw new Error ('bad leave-game interaction: bad playerDb info');
  listing.players.filter((p : NormalMember) => p.id !== player);
  listing.current_players -= 1;
  guildDb.set(currentCreator, listing);
  games.set(currentGuild, guildDb);
  updateGameMessage(listing, interaction.channel.messages);
  await interaction.reply({ ephemeral:true, content:'Left game successfully.' });
}