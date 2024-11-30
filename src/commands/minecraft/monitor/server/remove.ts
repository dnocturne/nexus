//src/commands/minecraft/monitor/server/remove.ts

import { Group, execute } from "sunar";
import { ServerStatus } from "@/models/ServerStatus";

const group = new Group("monitor", "server", "remove");

execute(group, async (interaction) => {
	await interaction.deferReply();

	try {
		// Find the server status for this channel
		const serverStatus = await ServerStatus.findOne({
			channelId: interaction.channelId,
		});

		if (!serverStatus) {
			await interaction.editReply(
				"❌ No Minecraft server is being monitored in this channel.",
			);
			return;
		}

		// If there's a message ID, try to delete the message
		if (serverStatus.messageId) {
			try {
				const message = await interaction.channel?.messages.fetch(
					serverStatus.messageId,
				);
				if (message) {
					await message.delete();
				}
			} catch (error) {
				console.error("Error deleting monitor message:", error);
				// Continue with removal even if message deletion fails
			}
		}

		// Remove the server status from the database
		await ServerStatus.deleteOne({ _id: serverStatus._id });

		await interaction.editReply(
			"✅ Minecraft server monitoring has been removed from this channel.",
		);
	} catch (error) {
		console.error("Error removing Minecraft server monitoring:", error);
		await interaction.editReply(
			"❌ Failed to remove Minecraft server monitoring. Please try again later.",
		);
	}
});

export { group };
