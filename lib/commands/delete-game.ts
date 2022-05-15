import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { GameDB, NormalInteraction } from '../types';
import { deleteGameMessage } from '../types/game-listing';
import { deleteGameFromDB } from '../types/gamedb';

export const deleteGameData = new SlashCommandBuilder()
  .setName('delete-game')
  .setDescription('Delete a game of mafia, if you have one up.');

export async function executeDeleteGame (interaction : CommandInteraction & NormalInteraction, games : GameDB) {
  const player = interaction.member.user.id;
  const guild = interaction.guild;
  const game = games.get(guild.id)?.get(player);
  if (!game) throw new Error ('bad delete-game interaction: no game');
  deleteGameFromDB(guild.id, player, games);
  await deleteGameMessage(game, interaction.channel.messages);
  await interaction.reply({ ephemeral: true, content:'Message deleted.' });
}