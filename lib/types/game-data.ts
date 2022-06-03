import { roleMention, userMention } from '@discordjs/builders';
import { GuildChannelManager, RoleManager, Permissions, TextChannel, VoiceChannel, Role, MessagePayload, MessageOptions } from 'discord.js';
import { ChannelId, GameListing, Games, NormalMember, PlayerId } from '../types';
import { clientId } from '../config.json';
import { exec } from 'child_process'

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

export type VoteContent = PlayerId | 'Pass' | 'Unvote'

export interface Vote {
  content: VoteContent,
  voter: PlayerId
}

export type GameState = Map<PlayerId, PlayerState>;

export interface Game {
  name : string
  role : Role
  textChannel : TextChannel
  secretTextChannel : TextChannel
  voiceChannel : VoiceChannel
  state: GameState
  votes: Vote[]
}

async function postGameMessage (game : Game, message : string | MessagePayload | MessageOptions, notify: boolean) {
  let mentions = ''
  if (notify) {
    mentions = roleMention(game.role.id);
  }
  await game.textChannel.send(mentions + message);
}

async function postSecretMessage (game : Game, message : string | MessagePayload | MessageOptions, notify: boolean) {
  let mentions = '';
  for (const [player, state] of game.state) { //likely a better spot for this, needs testing as well
    if (state.team === 'Mafia' && notify) {
      mentions += userMention(player)
    }
  }
  await game.secretTextChannel.send(mentions + message);
}

async function postGameStartMessage (game : Game) {
  await postGameMessage(game, 'The game of mafia has begun! It is currently night-time. Once the mafia have decided on their first target, this channel will open up for voting.', true)
}

async function postSecretStartMessage (game:Game) {
  await postSecretMessage(game, 'This is a secret channel that only mafia members have access to. Vote here with "/vote" to decide on your first kill.', true);
}

export function initialGameState (listing : GameListing, textChannel: TextChannel, secretTextChannel : TextChannel, voiceChannel: VoiceChannel, role : Role) : Game {
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
    secretTextChannel : secretTextChannel,
    voiceChannel : voiceChannel,
    state: state,
    votes: new Array<Vote>()
  };
}

function gameToJson (game : Game) {
  return JSON.stringify({
    state: Object.fromEntries(game.state),
    votes: game.votes
  });
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
  for (const [player, state] of game.state) { //likely a better spot for this, needs testing as well
    if (state.team === 'Mafia') {
      await game.secretTextChannel.permissionOverwrites.edit(player,{
        VIEW_CHANNEL: true,
        SEND_MESSAGES: !isAllowed
      })
    }
  }
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
  const secretTextChannel = await channelManager.create(gameId + '-secret', {
    type: 'GUILD_TEXT',
    permissionOverwrites: [
      {
        id: everyone.id,
        deny: [ Permissions.FLAGS.VIEW_CHANNEL ],
      },
      {
        id: clientId,
        allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES]
      }
    ]
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
  
  return {textChannel, voiceChannel, secretTextChannel};
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
  const {textChannel, voiceChannel, secretTextChannel} = await makeChannels(gameName,everyone,channelManager);
  const newGame = initialGameState(listing,textChannel, secretTextChannel, voiceChannel, mafiaRole);
  postGameStartMessage(newGame);
  postSecretStartMessage(newGame);
  await setPermissionsBasedOnTime('Day', newGame);
  games.set(listing.creatorId, newGame);
  console.log(gameToJson(newGame));
  // const townieProcess = exec('townie')
  // if (!townieProcess || !townieProcess.stdin) throw new Error('error making game: something went wrong with townie')
  // townieProcess.stdin.write(gameToJson(newGame));
}