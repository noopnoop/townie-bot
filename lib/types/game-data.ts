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
  name : string
  role : Role
  textChannel : TextChannel
  voiceChannel : VoiceChannel
  state: GameState
  votes: Votes
}

function makeGameStartMessage (roleId : string) {
  const msg = roleMention(roleId) + 'The game of mafia has begun!';
  return { ephemeral: true, content: msg };
}

export function initialGameState (listing : GameListing, textChannel: TextChannel, voiceChannel: VoiceChannel, role : Role) : Game {
  const state : GameState = new Map();
  for (const player of listing.players) {
    state.set(player.user.id, {
      name: player.displayName,
      team: 'Town',
      alive: true,
    });
  }
  return {
    name : listing.name,
    role : role,
    textChannel : textChannel,
    voiceChannel : voiceChannel,
    state: state,
    votes: new Array<[PlayerId, Vote]>(),
  };
}

export async function setPermissionsBasedOnTime (time : Time, game : Game) {
  let isAllowed : boolean;
  if (time === 'Day') {
    isAllowed = true
  } else {
    isAllowed = false
  }
  await game.textChannel.permissionOverwrites.edit(game.role,{
    SEND_MESSAGES: isAllowed
  })
  await game.voiceChannel.permissionOverwrites.edit(game.role,{
    SPEAK: isAllowed
  })
}

export async function makeChannels (gameId : string, everyone : Role, channelManager : GuildChannelManager) {
  const textChannel = await channelManager.create(gameId, {
    type: 'GUILD_TEXT',
    permissionOverwrites: [
      {
        id: everyone.id,
        deny: [ Permissions.FLAGS.SEND_MESSAGES ],
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
    ],
  });
  return {textChannel, voiceChannel};
}

export async function makeGame (listing: GameListing, roleManager : RoleManager, channelManager : GuildChannelManager, games: Games) {
  const gameName = listing.name;
  const everyone = roleManager.everyone
  const mafiaRole = await roleManager.create({
    name: gameName,
  });
  for (const player of listing.players) {
    await player.roles.add(mafiaRole);
    //await sendRoleMessage(player); TURN THIS BACK ON LATER!!!!
  }
  const {textChannel, voiceChannel} = await makeChannels(gameName,everyone,channelManager);
  await textChannel.send(makeGameStartMessage(mafiaRole.id));
  const newGame = initialGameState(listing,textChannel, voiceChannel, mafiaRole);
  await setPermissionsBasedOnTime('Night', newGame);
  games.set(listing.creatorId, newGame);
}

// export interface GameChannel {
//   id : ChannelId,

// }