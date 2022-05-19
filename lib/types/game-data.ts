import { GuildChannelManager, RoleManager, Permissions } from "discord.js";
import { ChannelId, GameListing, NormalMember } from "../types";

export interface GameData {
  players : [NormalMember],
  channelId : ChannelId
}

export async function makeGame(listing: GameListing, roleManager : RoleManager, channelManager : GuildChannelManager) {
  const gameId = 'mafia-' + listing.creatorId;
  const everyone = roleManager.everyone.id;
  const numOfChannels = channelManager.channelCountWithoutThreads;
  const mafiaRole = await roleManager.create({
    name: gameId
  })
  for (const player of listing.players) {
    await player.roles.add(mafiaRole);
  }
  await channelManager.create(gameId, {
    type: 'GUILD_TEXT',
    permissionOverwrites: [
      {
        id: everyone,
        deny: [ Permissions.FLAGS.SEND_MESSAGES ]
      },
      {
        id: mafiaRole.id,
        allow: [ Permissions.FLAGS.SEND_MESSAGES ]
      }
    ]
  });
}

// export interface GameChannel {
//   id : ChannelId,

// }