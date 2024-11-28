import { Slash, execute } from "sunar";
import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";

const slash = new Slash({
	name: "clear",
	description:
		"Clear a specified number of messages, optionally from a specific user",
	defaultMemberPermissions: PermissionFlagsBits.ManageMessages,
	options: [
		{
			name: "amount",
			description: "Number of messages to delete (max 100)",
			type: ApplicationCommandOptionType.Integer,
			required: true,
			minValue: 1,
			maxValue: 100,
		},
		{
			name: "user",
			description: "Only delete messages from this user",
			type: ApplicationCommandOptionType.User,
			required: false,
		},
	],
});

execute(slash, async (interaction) => {
	await interaction.deferReply({ ephemeral: true });

	try {
		const amount = interaction.options.getInteger("amount", true);
		const user = interaction.options.getUser("user");
		const channel = interaction.channel;

		if (!channel || !channel.isTextBased() || channel.isDMBased()) {
			return interaction.editReply(
				"This command can only be used in server text channels.",
			);
		}

		// Ensure channel supports bulk delete
		if (!("bulkDelete" in channel)) {
			return interaction.editReply(
				"Bulk message deletion is not supported in this channel type.",
			);
		}

		// Fetch messages
		const messages = await channel.messages.fetch({ limit: amount });

		// Filter messages if user is specified
		const filteredMessages = user
			? messages.filter((msg) => msg.author.id === user.id)
			: messages;

		// Delete messages
		const deleted = await channel.bulkDelete(filteredMessages, true);

		const response = user
			? `Deleted ${deleted.size} messages from user ${user.tag}`
			: `Deleted ${deleted.size} messages`;

		await interaction.editReply(response);
	} catch (error) {
		console.error("Error in clear command:", error);
		await interaction.editReply(
			"Failed to clear messages. Messages older than 14 days cannot be bulk deleted.",
		);
	}
});

export { slash };
