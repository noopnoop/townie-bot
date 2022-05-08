import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import Keyv from 'keyv';
import { Directory, GameDB } from '../types';
import { deleteDirectoryMessage, postEmptyDirectoryMessage } from '../types/directory';
import { deleteGameFromDB } from '../types/gamedb';

export const deleteGameData = new SlashCommandBuilder()
  .setName('delete-game')
  .setDescription('Delete a game of mafia, if you have one up.');

export async function executeDeleteGame (interaction : CommandInteraction, directories : Keyv<Directory>, db : GameDB) {
  const player = interaction.member?.user.id;
  const guild = interaction.guild;
  if (guild?.id && player) {
    try {
      const msgId = db.get(guild.id)?.get(player)?.messageId;
      deleteGameFromDB(guild.id, player, db);
      if (!msgId) {
        throw new Error ('bad delete game interaction: no directory message');
      }
      await deleteDirectoryMessage(guild, msgId, directories);
      await interaction.reply({ ephemeral: true, content:'Message deleted.' });
    } catch (error) {
      console.error(error);
      await interaction.reply({ ephemeral: true, content:'Something went wrong. The directory message for this game was likely already deleted, but if not, you may have to delete it manually.' });
    }
    const guildGames = db.get(guild.id);
    if (guildGames?.size === 0) {
      await postEmptyDirectoryMessage(guild, directories);
    }
  } else {throw new Error ('bad delete-game interaction: no guild or player');}
}