import { Guild, MessageActionRow, MessageButton } from 'discord.js';
import Keyv from 'keyv';
import { postDirectoryMessage } from './directory';
import { Directory, GameDB, GameListing, GuildId, PlayerId } from '../types';

// working on this still
export async function postGameMessage (guild : Guild, directories : Keyv<Directory>, game : GameListing) {
  const button = new MessageActionRow()
    .addComponents(
      new MessageButton()
        .setCustomId('join-game')
        .setLabel('Join Game')
        .setStyle('SUCCESS'),
    );
  postDirectoryMessage(guild, directories, {
    content: game.name + '\nCreated by ' + game.creator + '\nPlayers: ' + game.current_players + '/' + game.max_players,
    components: [button],
  });
}

export async function addGameToDB (game : GameListing, guildId : GuildId, playerId : PlayerId, db : GameDB) {
  const previous = db.get(guildId);
  if (previous) {
    previous.set(playerId, game);
    return;
  }
  const newEntry = new Map<PlayerId, GameListing>();
  newEntry.set(playerId, game);
  db.set(guildId, newEntry);
}