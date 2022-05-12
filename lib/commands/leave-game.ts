// import { CommandInteraction } from "discord.js";
// import Keyv from "keyv";
// import { Directory, GameDB, PlayerDB, PlayerId } from "../types";
// import { deleteDirectoryMessage } from "../types/directory";

// export async function executeLeaveGame (interaction : CommandInteraction, playerDb : PlayerDB, games : GameDB, directories : Keyv<Directory>) {
//   const player = interaction.member?.user.id;
//   if (!player) throw new Error('bad leave-game interaction: no player id');
//   const info = playerDb.get(player);
//   if (!info) {
//     await interaction.reply({ephemeral:true,content:'You aren\'t in a game.'});
//     throw new Error ('bad leave-game interaction: not in a game')
//   }
//   const [currentGuild, currentCreator] = info;
//   const guildDb = games.get(currentGuild);
//   const listing = guildDb?.get(currentCreator)
//   playerDb.delete(player);
//   if (!guildDb || !listing) throw new Error ('bad leave-game interaction: bad playerDb info');
//   listing.players.filter((p : PlayerId) => p !== player)
//   listing.current_players -= 1;
//   guildDb.set(currentCreator, listing);
//   games.set(currentGuild,guildDb);
//   await interaction.reply({ephemeral:true,content:'Left game successfully.'});
// }