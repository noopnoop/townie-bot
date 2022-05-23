import { roleMention } from '@discordjs/builders';
import { GuildChannelManager, RoleManager, Permissions, TextChannel, VoiceChannel, Role } from 'discord.js';
import { ChannelId, GameListing, Games, NormalMember, PlayerId } from '../types';
import { clientId } from '../config.json';
import { sendRoleMessage } from './role-message';

export interface GameData {
  players : [NormalMember],
  channelId : ChannelId
}

export type Team = 'Mafia' | 'Town'

export type Time = 'Day' | 'Night'

export interface PlayerState {
  name : string,
  team : Team,
  alive : boolean
}

export type Vote = PlayerId | 'Pass'

export type GameState = Map<PlayerId, PlayerState>;

export type Votes = Array<[PlayerId, Vote]>;

export interface Game {
  textChannel : TextChannel
  voiceChannel : VoiceChannel
  state: GameState
  votes: Votes
}

function makeGameStartMessage (roleId : string) {
  const msg = roleMention(roleId) + 'The game of mafia has begun!';
  return { ephemeral: true, content: msg };
}

export function initialGameState (players : NormalMember[], textChannel: TextChannel, voiceChannel: VoiceChannel) : Game {
  const state : GameState = new Map();
  for (const player of players) {
    state.set(player.user.id, {
      name: player.displayName,
      team: 'Town',
      alive: true,
    });
  }
  return {
    textChannel : textChannel,
    voiceChannel : voiceChannel,
    state: state,
    votes: new Array<[PlayerId, Vote]>(),
  };
}

export async function setPermissionsBasedOnTime (time : Time, game : Game) {

}

export async function makeChannels (gameId : string, everyone : Role, mafiaRole : Role, channelManager : GuildChannelManager) {
  const textChannel = await channelManager.create(gameId, {
    type: 'GUILD_TEXT',
    permissionOverwrites: [
      {
        id: everyone.id,
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
  const voiceChannel = await channelManager.create(gameId + '-voice', {
    type: 'GUILD_VOICE',
    permissionOverwrites: [
      {
        id: everyone.id,
        deny: [ Permissions.FLAGS.SPEAK],
      },
      {
        id: mafiaRole.id,
        allow: [ Permissions.FLAGS.SPEAK ],
      },
    ],
  });
  return {textChannel, voiceChannel};
}

export async function makeGame (listing: GameListing, roleManager : RoleManager, channelManager : GuildChannelManager, games: Games) {
  const gameId = 'mafia-' + listing.creatorId;
  const everyone = roleManager.everyone
  const mafiaRole = await roleManager.create({
    name: gameId,
  });
  for (const player of listing.players) {
    await player.roles.add(mafiaRole);
    await sendRoleMessage(player);
  }
  const {textChannel, voiceChannel} = await makeChannels(gameId,everyone,mafiaRole,channelManager);
  await textChannel.send(makeGameStartMessage(mafiaRole.id));
  games.set(listing.creatorId, initialGameState(listing.players,textChannel, voiceChannel));
}

// export interface GameChannel {
//   id : ChannelId,

// }