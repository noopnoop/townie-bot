import { Listings, GameListing, GuildId, PlayerId } from '../types';

export function addGameToDB (game : GameListing, guildId : GuildId, playerId : PlayerId, db : Listings) {
  const previous = db.get(guildId);
  if (previous) {
    previous.set(playerId, game);
    return;
  }
  const newEntry = new Map<PlayerId, GameListing>();
  newEntry.set(playerId, game);
  db.set(guildId, newEntry);
}

export function deleteGameFromDB (guildId: GuildId, playerId : PlayerId, db: Listings) {
  const previous = db.get(guildId);
  if (previous) {
    previous.delete(playerId);
    db.set(guildId, previous);
  }
}

export function checkForGame (guildId : GuildId, playerId : PlayerId, db: Listings) {
  const guildInfo = db.get(guildId);
  if (!guildInfo) return false;
  const gameInfo = guildInfo.get(playerId);
  if (!gameInfo) return false;
  return true;
}

export function noGames (guildId : GuildId, db: Listings) {
  const info = db.get(guildId);
  if (!info || info.size === 0) {
    return true;
  }
  return false;
}