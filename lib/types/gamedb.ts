import { GameDB, GameListing, GuildId, PlayerId } from '../types';

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

export function checkForGame (guildId : GuildId, playerId : PlayerId, db: GameDB) {
  const guildInfo = db.get(guildId);
  if (!guildInfo) return false;
  const gameInfo = guildInfo.get(playerId);
  if (!gameInfo) return false;
  return true;
}