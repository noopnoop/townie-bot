import { Guild, MessageActionRow, MessageButton, MessageButtonStyleResolvable } from 'discord.js';
import Keyv from 'keyv';
import { postDirectoryMessage } from './directory';
import { Directory, GameListing, PlayerId } from '../types';

export async function postGameMessage (creatorId : PlayerId, guild : Guild, directories : Keyv<Directory>, game : GameListing) {
  const button = new MessageActionRow()
    .addComponents(
      new MessageButton()
        .setCustomId('join-game/' + creatorId)
        .setLabel('Join Game')
        .setStyle('SUCCESS'),
    );
  const newMessage = await postDirectoryMessage(guild, directories, {
    content: game.name + '\nCreated by ' + game.creator + '\nPlayers: ' + game.current_players + '/' + game.max_players,
    components: [button],
  });
  return newMessage.id;
}
export function makeGameMessage (creatorId: PlayerId, game: GameListing) {
  let style : MessageButtonStyleResolvable = 'SUCCESS';
  let label = 'Join Game';
  if (game.current_players >= game.max_players) {
    style = 'PRIMARY';
    label = 'Spectate';
  }
  const button = new MessageActionRow()
    .addComponents(
      new MessageButton()
        .setCustomId('join-game/' + creatorId)
        .setLabel(label)
        .setStyle(style),
    );
  return {
    content: game.name + '\nCreated by ' + game.creator + '\nPlayers: ' + game.current_players + '/' + game.max_players,
    components: [button],
  };
}

export function addPlayerToGame (player : PlayerId, game : GameListing) {
  if (game.current_players >= game.max_players) return;
  game.players.push(player);
  game.current_players += 1;
}