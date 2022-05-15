import { MessageActionRow, MessageButton, MessageButtonStyleResolvable, MessageManager } from 'discord.js';
import { GameListing, PlayerDB, PlayerId } from '../types';

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

export function addPlayerToGame (player : PlayerId, game : GameListing, playerDb : PlayerDB) {
  if (game.current_players >= game.max_players) throw new Error ('couldn\'t add player to game: already at maximum capacity');
  if (game.players.find(p => p === player)) throw new Error ('couldn\'t add player to game: player already in game');
  game.players.push(player);
  game.current_players += 1;
  playerDb.set(player, [game.guildId, game.creatorId]);
}