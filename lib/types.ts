export interface Directory {
  channelId : string,
  messageIds : string[],
}

export interface GuildMafiaInfo {
  directory : Directory,
  games : Map<string,Game>,
}

export interface Game {
  max_players : Number,
  current_players : Number,
  name : string,
  creator : string,
  players : string[]
}