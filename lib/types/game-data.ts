import { RoleManager } from "discord.js";
import { ChannelId, GameListing, PlayerId } from "../types";

export interface GameData {
  players : [PlayerId],
  channelId : ChannelId
}

export async function makeGame(listing: GameListing, roleManager : RoleManager) {
  const mafiaRole = await roleManager.create({
    name:'mafia-' + listing.creatorId,
  })
  for (const player of listing.players) {
    await player.roles.add(mafiaRole);
  }
}

// export interface GameChannel {
//   id : ChannelId,

// }