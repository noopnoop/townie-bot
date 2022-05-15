import { Guild, GuildMember, Interaction, TextChannel } from 'discord.js';

// when you add the Townie to a server before you can do anything with it you have to specify a channel to act as a Directory
// the Directory channel has a bunch of messages from Townie, one for each mafia game in progress in the guild, with a 'Join game' button and some info about the game
// the Directory type contains the id of the channel and an array of ids, one for each message the bot has posted in the channel.

export interface NormalInteraction extends Interaction {
  guild : Guild
  member : NormalMember
  channel: NormalChannel
}

export interface NormalMember extends GuildMember {
  displayName : string
}

export interface NormalChannel extends TextChannel {
  type: 'GUILD_TEXT'
}

export type GuildId = string;
export type PlayerId = string;
export type MessageId = string;
export type GameDB = Map<GuildId, Map<PlayerId, GameListing>>;
export type PlayerDB = Map<PlayerId, [GuildId, PlayerId]>;

export interface GameListing {
  max_players : number,
  current_players : number,
  name : string,
  creator : string,
  creatorId : PlayerId
  players : string[],
  messageId : MessageId,
  guildId : GuildId
}