// src/commands/minecraft/monitor/server/add.ts
import { Group, execute, config, protect } from "sunar";
import { ServerStatus } from "../../../../models/ServerStatus";
import { MinecraftMonitor } from "../../../../services/MinecraftMonitor";
import { adminOnly } from "../../../../middleware/adminOnly";

const group = new Group("monitor", "server", "add");

// Add cooldown and admin-only protection
config(group, {
	cooldown: {
		time: 30000, // 30 seconds
	},
});

protect(group, [adminOnly]);

execute(group, async (interaction) => {
	await interaction.deferReply();

	const ip = interaction.options.getString("ip", true);
	const port = interaction.options.getInteger("port") ?? 25565;

	try {
		// Check for existing monitor
		const existingMonitor = await ServerStatus.findOne({
			channelId: interaction.channelId,
		});

		if (existingMonitor) {
			await interaction.editReply(
				"❌ This channel is already monitoring a server. Remove it first.",
			);
			return;
		}

		// Create new monitor
		const serverStatus = new ServerStatus({
			channelId: interaction.channelId,
			serverIp: ip,
			serverPort: port,
		});

		await serverStatus.save();
		await MinecraftMonitor.updateServer(interaction.client, serverStatus);

		await interaction.editReply("✅ Server monitoring has been set up.");
	} catch (error) {
		console.error("Error in monitor add command:", error);
		await interaction.editReply(
			"❌ Failed to set up server monitoring. Please try again.",
		);
	}
});

export { group };
