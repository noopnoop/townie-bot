import { MessageActionRow, MessageButton, MessageButtonStyleResolvable, MessageManager, Role, RoleManager } from 'discord.js';
import { GameListing, NormalMember, PlayerDB, PlayerId } from '../types';
import { makeGame } from './game-data';

export function makeGameMessage (game: GameListing) {
  let style : MessageButtonStyleResolvable = 'SUCCESS';
  let label = 'Join Game';
  if (game.current_players >= game.max_players) {
    style = 'PRIMARY';
    label = 'Spectate';
  }
  const button = new MessageActionRow()
    .addComponents(
      new MessageButton()
        .setCustomId('join-game/' + game.creatorId)
        .setLabel(label)
        .setStyle(style),
    );
  return {
    content: game.name + '\nCreated by ' + game.creator + '\nPlayers: ' + game.current_players + '/' + game.max_players,
    components: [button],
  };
}

export async function deleteGameMessage (game: GameListing, manager : MessageManager) {
  await manager.delete(game.messageId);
}

export async function updateGameMessage (game: GameListing, manager: MessageManager) {
  manager.edit(game.messageId,makeGameMessage(game));
}

export async function addPlayerToGame (player : NormalMember, game : GameListing, playerDb : PlayerDB, manager : MessageManager, roleManager : RoleManager) {
  if (game.current_players >= game.max_players) throw new Error ('couldn\'t add player to game: already at maximum capacity');
  // change tthis next line to look in the player db instead whenever i add it back in
  //if (game.players.find(p => p === player)) throw new Error ('couldn\'t add player to game: player already in game');
  game.players.push(player);
  game.current_players += 1;
  playerDb.set(player.id, [game.guildId, game.creatorId]);
  updateGameMessage(game,manager);
  if (game.current_players === game.max_players) {
    await makeGame(game, roleManager);
  }
}