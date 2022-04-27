import { Guild, MessageActionRow, MessageButton } from 'discord.js';
import Keyv from 'keyv';
import { makeDirectoryMessage } from './directory';
import { Directory, GameListing } from './types';

// working on this still
export async function makeGameMessage (guild : Guild, directories : Keyv<Directory>, game : GameListing) {
  const button = new MessageActionRow()
    .addComponents(
      new MessageButton()
        .setCustomId('join-game')
        .setLabel('Join Game')
        .setStyle('SUCCESS'),
    );
  makeDirectoryMessage(guild, directories, {
    content: game.name + '\nCreated by ' + game.creator + '\nPlayers: ' + game.current_players + '/' + game.max_players,
    components: [button],
  });
}