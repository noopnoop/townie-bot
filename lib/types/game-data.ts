import { roleMention } from '@discordjs/builders';
import { GuildChannelManager, RoleManager, Permissions } from 'discord.js';
import { ChannelId, GameListing, Games, NormalMember, PlayerId } from '../types';
import { clientId } from '../config.json';

export interface GameData {
  players : [NormalMember],
  channelId : ChannelId
}

export type Team = 'Mafia' | 'Town'

export interface PlayerState {
  name : string,
  team : Team,
  alive : boolean
}

export type Vote = PlayerId | 'Pass'

export type GameState = Map<PlayerId,PlayerState>;

export type Votes = Array<[PlayerId, Vote]>;

export interface Game {
  state: GameState
  votes: Votes
}

function makeGameStartMessage (roleId : string) {
  const msg = roleMention(roleId) + 'The game of mafia has begun!';
  return { ephemeral: true, content: msg };
}

export function initialGameState (players : NormalMember[]) : Game {
  const state : GameState = new Map();
  for (const player of players) {
    state.set(player.user.id,{
      name: player.displayName,
      team: 'Town',
      alive: true
    });
  }
  return {
    state: state,
    votes: new Array<[PlayerId, Vote]>()
  }
}

export async function makeGame (listing: GameListing, roleManager : RoleManager, channelManager : GuildChannelManager, games: Games) {
  games.set(listing.creatorId, initialGameState(listing.players));
  const gameId = 'mafia-' + listing.creatorId;
  const everyone = roleManager.everyone.id;
  const mafiaRole = await roleManager.create({
    name: gameId,
  });
  for (const player of listing.players) {
    await player.roles.add(mafiaRole);
  }
  const textChannel = await channelManager.create(gameId, {
    type: 'GUILD_TEXT',
    permissionOverwrites: [
      {
        id: everyone,
        deny: [ Permissions.FLAGS.SEND_MESSAGES ],
      },
      {
        id: mafiaRole.id,
        allow: [ Permissions.FLAGS.SEND_MESSAGES ],
      },
      {
        id: clientId,
        allow: [ Permissions.FLAGS.SEND_MESSAGES ],
      },
    ],
  });
  await textChannel.send(makeGameStartMessage(mafiaRole.id));
  await channelManager.create(gameId + '-voice', {
    type: 'GUILD_VOICE',
    permissionOverwrites: [
      {
        id: everyone,
        deny: [ Permissions.FLAGS.SPEAK],
      },
      {
        id: mafiaRole.id,
        allow: [ Permissions.FLAGS.SPEAK ],
      },
    ],
  });
  
}

// export interface GameChannel {
//   id : ChannelId,

// }