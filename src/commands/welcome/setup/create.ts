// src/commands/welcome/setup/create.ts
import { Group, execute } from "sunar";
import { ChannelType, TextChannel, GuildMember } from "discord.js";
import { welcomeSetup } from "../../../services/welcome/setup";
import { WelcomeConfig } from "../../../models/WelcomeConfig";

const group = new Group("welcome", "setup", "create");

execute(group, async (interaction) => {
	if (
		!interaction.guildId ||
		!interaction.channel?.isTextBased() ||
		!(interaction.channel instanceof TextChannel)
	) {
		await interaction.reply({
			content: "This command can only be used in a server text channel.",
			ephemeral: true,
		});
		return;
	}

	// Store these since we know they exist
	const guildId = interaction.guildId;
	const channel = interaction.channel;

	const targetChannel = interaction.options.getChannel("channel", true, [
		ChannelType.GuildText,
	]);
	if (!(targetChannel instanceof TextChannel)) {
		await interaction.reply({
			content: "Please select a valid text channel.",
			ephemeral: true,
		});
		return;
	}

	// Check if user is a guild member
	const member = interaction.member;
	if (!(member instanceof GuildMember)) {
		await interaction.reply({
			content: "Could not verify your server membership.",
			ephemeral: true,
		});
		return;
	}

	try {
		const existingSetup = welcomeSetup.getSetup(guildId, interaction.user.id);
		if (existingSetup) {
			await interaction.reply({
				content:
					"You already have an active setup. Please finish or cancel it first.",
				ephemeral: true,
			});
			return;
		}

		welcomeSetup.storeSetup(guildId, interaction.user.id, targetChannel.id);

		const setupEmbed = welcomeSetup.createSetupEmbed();
		const buttons = welcomeSetup.createSetupButtons();

		await interaction.reply({
			embeds: [setupEmbed],
			components: [buttons],
			ephemeral: true,
		});

		await welcomeSetup.startMessageCollector(
			channel,
			interaction.user.id,
			async (message) => {
				// Ensure message has a member
				if (!message.member) {
					console.error("Message member not found");
					return;
				}

				const config = welcomeSetup.parseSetupMessage(message.content);
				const setup = welcomeSetup.getSetup(guildId, interaction.user.id);

				if (setup) {
					setup.config = config;
					const preview = welcomeSetup.createPreviewEmbed(
						config,
						message.member,
					);

					await interaction.editReply({
						embeds: preview.embed ? [preview.embed] : [],
						components: [welcomeSetup.createSetupButtons()],
					});
				}
			},
		);
	} catch (error) {
		console.error("Error in welcome setup:", error);
		await interaction.reply({
			content: "An error occurred during setup. Please try again.",
			ephemeral: true,
		});
		welcomeSetup.clearSetup(guildId, interaction.user.id);
	}
});

export { group };
