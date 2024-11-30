//src/services/MinecraftMonitor.ts

import type { Client } from "sunar";
import type { TextChannel } from "discord.js";
import { EmbedBuilder } from "discord.js";
import { GameDig } from "gamedig";
import type { IServerStatus } from "@/models/ServerStatus";
import { ServerStatus } from "@/models/ServerStatus";

interface ServerQueryResult {
	isOnline: boolean;
	playerCount: number; // Maps to GameDig's numplayers
	maxPlayers: number; // Maps to GameDig's maxplayers
	players: string[]; // List of player names from GameDig's players array
	serverIp?: string;
	serverPort?: number;
}

export const MinecraftMonitor = {
	async queryServer(ip: string, port: number): Promise<ServerQueryResult> {
		try {
			const state = await GameDig.query({
				type: "minecraft",
				host: ip,
				port: port,
			});

			// If maxplayers is 0, consider the server unresponsive/offline
			const isResponsive = state.maxplayers > 0;

			return {
				isOnline: isResponsive,
				playerCount: isResponsive ? state.numplayers : 0,
				maxPlayers: state.maxplayers,
				players: isResponsive
					? (state.players
							.map((p) => p.name)
							.filter((name) => name !== undefined) as string[])
					: [],
			};
		} catch (error) {
			console.error(`Server ${ip}:${port} is offline:`, error);
			return {
				isOnline: false,
				playerCount: 0,
				maxPlayers: 0,
				players: [],
			};
		}
	},

	createEmbed(
		data: ServerQueryResult & {
			serverIp: string;
			serverPort: number;
			lastQuery: Date;
		},
	): EmbedBuilder {
		// Consider the server online only if maxPlayers > 0
		const isResponsive = data.maxPlayers > 0;

		const embed = new EmbedBuilder()
			.setColor(isResponsive ? "#00ff00" : "#ff0000")
			.setTitle("Minecraft Server Monitor")
			.setDescription(`**IP:** \`${data.serverIp}\``)
			.addFields(
				{
					name: "📡 Status",
					value: isResponsive ? "🟢 Online" : "🔴 Unresponsive",
					inline: true,
				},
				{
					name: "👥 Players",
					value: isResponsive
						? `${data.playerCount}/${data.maxPlayers}`
						: "N/A",
					inline: true,
				},
			);

		// Add footer with timestamp
		embed.setFooter({
			text: "Auto-updates every minute",
		});

		// Set timestamp
		embed.setTimestamp();

		return embed;
	},

	async updateServer(client: Client, serverStatus: IServerStatus) {
		const channel = (await client.channels.fetch(
			serverStatus.channelId,
		)) as TextChannel;
		if (!channel) return;

		const queryResult = await this.queryServer(
			serverStatus.serverIp,
			serverStatus.serverPort,
		);

		// Update database
		serverStatus.isOnline = queryResult.isOnline;
		serverStatus.playerCount = queryResult.playerCount;
		serverStatus.maxPlayers = queryResult.maxPlayers;
		serverStatus.players = queryResult.players;
		serverStatus.lastQuery = new Date();
		await serverStatus.save();

		const embed = this.createEmbed({
			...queryResult,
			serverIp: serverStatus.serverIp,
			serverPort: serverStatus.serverPort,
			lastQuery: serverStatus.lastQuery,
		});

		// Update or send new message
		try {
			if (serverStatus.messageId) {
				const message = await channel.messages.fetch(serverStatus.messageId);
				await message.edit({ embeds: [embed] });
			} else {
				const message = await channel.send({ embeds: [embed] });
				serverStatus.messageId = message.id;
				await serverStatus.save();
			}
		} catch (error) {
			console.error("Failed to update server status message:", error);
		}
	},

	async startMonitoring(client: Client) {
		// Update every minute
		setInterval(async () => {
			const servers = await ServerStatus.find();
			for (const server of servers) {
				await this.updateServer(client, server);
			}
		}, 60000); // 1 minute interval
	},
};
