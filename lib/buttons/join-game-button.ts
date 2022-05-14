import { ButtonInteraction, Message } from 'discord.js';
import { GameDB, NormalInteraction } from '../types';
import { addPlayerToGame, makeGameMessage } from '../types/game-listing';
import { checkForGame } from '../types/gamedb';

function getCreator (interaction : ButtonInteraction) {
  const creator = interaction.customId.split('/')[1];
  if (!creator) throw new Error ('bad join-game interaction: no creator id');
  return creator;
}

export async function executeJoinGameButton (interaction : ButtonInteraction & NormalInteraction, db : GameDB) {
  const guild = interaction.guild;
  const player = interaction.member.user.id;
  const messageCreator = getCreator(interaction);
  const guildListings = db.get(guild.id);
  const listing = guildListings?.get(messageCreator);
  if (!guildListings || !listing || !checkForGame(guild.id, messageCreator, db)) throw new Error ('bad join-game interaction: no game listing');
  addPlayerToGame(player, listing);
  guildListings.set(messageCreator, listing);
  db.set(messageCreator, guildListings);
  if (!(interaction.message instanceof Message)) throw new Error ('bad join-game interaction: not our message');
  interaction.message.edit(makeGameMessage(messageCreator, listing));
  interaction.reply({ ephemeral:true, content:'Joined game successfully. Use the "/leave-game" command before the game begins to quit out.' });
}