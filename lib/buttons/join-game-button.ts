import { ButtonInteraction, Message } from 'discord.js';
import { GameDB, NormalInteraction, PlayerDB } from '../types';
import { addPlayerToGame, makeGameMessage } from '../types/game-listing';
import { checkForGame } from '../types/gamedb';

function getCreator (interaction : ButtonInteraction) {
  const creator = interaction.customId.split('/')[1];
  if (!creator) throw new Error ('bad join-game interaction: no creator id');
  return creator;
}

export async function executeJoinGameButton (interaction : ButtonInteraction & NormalInteraction, db : GameDB, players : PlayerDB) {
  const guild = interaction.guild;
  const player = interaction.member;
  const messageCreator = getCreator(interaction);
  const guildListings = db.get(guild.id);
  const listing = guildListings?.get(messageCreator);
  if (!guildListings || !listing || !checkForGame(guild.id, messageCreator, db)) throw new Error ('bad join-game interaction: no game listing');
  addPlayerToGame(player, listing, players, interaction.channel.messages, guild.roles, guild.channels);
  guildListings.set(messageCreator, listing);
  db.set(messageCreator, guildListings);
  if (!(interaction.message instanceof Message)) throw new Error ('bad join-game interaction: not our message');
  interaction.message.edit(makeGameMessage(listing));
  interaction.reply({ ephemeral:true, content:'Joined game successfully. Use the "/leave-game" command before the game begins to quit out.' });
}