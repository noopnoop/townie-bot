import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { Listings, NormalInteraction } from '../types';
import { deleteGameMessage } from '../types/game-listing';
import { deleteGameFromDB } from '../types/gamedb';

export const deleteGameData = new SlashCommandBuilder()
  .setName('delete-game')
  .setDescription('Delete a game of mafia, if you have one up.');

export async function executeDeleteGame (interaction : CommandInteraction & NormalInteraction, listings : Listings) {
  const player = interaction.member.user.id;
  const guild = interaction.guild;
  const game = listings.get(guild.id)?.get(player);
  if (!game) throw new Error ('bad delete-game interaction: no game');
  deleteGameFromDB(guild.id, player, listings);
  await deleteGameMessage(game, interaction.channel.messages);
  await interaction.reply({ ephemeral: true, content:'Message deleted.' });
}