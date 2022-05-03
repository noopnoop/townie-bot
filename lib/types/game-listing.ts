import { Guild, MessageActionRow, MessageButton } from 'discord.js';
import Keyv from 'keyv';
import { postDirectoryMessage } from './directory';
import { Directory, GameListing } from '../types';

// working on this still
export async function postGameMessage (guild : Guild, directories : Keyv<Directory>, game : GameListing) {
  const button = new MessageActionRow()
    .addComponents(
      new MessageButton()
        .setCustomId('join-game')
        .setLabel('Join Game')
        .setStyle('SUCCESS'),
    );
  const newMessage = await postDirectoryMessage(guild, directories, {
    content: game.name + '\nCreated by ' + game.creator + '\nPlayers: ' + game.current_players + '/' + game.max_players,
    components: [button],
  });
  return newMessage.id;
}
