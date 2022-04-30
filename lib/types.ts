import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, SelectMenuInteraction } from 'discord.js';
import Keyv from 'keyv';

// when you add the Townie to a server before you can do anything with it you have to specify a channel to act as a Directory
// the Directory channel has a bunch of messages from Townie, one for each mafia game in progress in the guild, with a 'Join game' button and some info about the game
// the Directory type contains the id of the channel and an array of ids, one for each message the bot has posted in the channel.
export interface Directory {
  channelId : string,
  messageIds : string[],
}

export type GuildId = string;
export type PlayerId = string;
export type GameDB = Map<GuildId, Map<PlayerId, GameListing>>;

export interface GuildMafiaInfo {
  directory : Directory,
  games : Map<string, GameListing>,
}

export interface GameListing {
  max_players : number,
  current_players : number,
  name : string,
  creator : string,
  players : string[]
}

export interface Executable<InteractionType> {
  execute(_interaction : InteractionType, _directories? : Keyv<Directory>): Promise<void>
}

export interface Command extends Executable<CommandInteraction> {
  data: SlashCommandBuilder
}

export interface MenuHandler extends Executable<SelectMenuInteraction> {
  name: string,
}