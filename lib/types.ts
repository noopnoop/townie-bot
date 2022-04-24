import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, SelectMenuInteraction } from 'discord.js';
import Keyv from 'keyv';

export interface Directory {
  channelId : string,
  messageIds : string[],
}

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

export interface Executable<interactionType> {
  execute(_interaction : interactionType, _directories? : Keyv<Directory>): Promise<void>
}

export interface Command extends Executable<CommandInteraction> {
  data: SlashCommandBuilder
}

export interface MenuHandler extends Executable<SelectMenuInteraction> {
  name: string,
}