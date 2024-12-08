// src/interactions/buttons/welcome/back.ts
import { Button, execute } from "sunar";
import { TextChannel } from "discord.js";
import { welcomeSetup } from "../../../services/welcome/setup";

const button = new Button({ id: "welcome_back" });

execute(button, async (interaction) => {
	if (
		!interaction.guildId ||
		!interaction.channel?.isTextBased() ||
		!(interaction.channel instanceof TextChannel)
	) {
		await interaction.reply({
			content: "This button can only be used in a server text channel.",
			ephemeral: true,
		});
		return;
	}

	// Store the guildId since we know it exists
	const guildId = interaction.guildId;
	const setupEmbed = welcomeSetup.createSetupEmbed();
	const buttons = welcomeSetup.createSetupButtons();

	await interaction.update({
		embeds: [setupEmbed],
		components: [buttons],
	});

	await welcomeSetup.startMessageCollector(
		interaction.channel,
		interaction.user.id,
		async (message) => {
			if (!message.member) return;

			const config = welcomeSetup.parseSetupMessage(message.content);
			const setup = welcomeSetup.getSetup(
				guildId, // Use the stored guildId instead
				interaction.user.id,
			);

			if (setup) {
				setup.config = config;
				const preview = welcomeSetup.createPreviewEmbed(config, message.member);

				await interaction.editReply({
					embeds: preview.embed ? [preview.embed] : [],
					components: [welcomeSetup.createSetupButtons()],
				});
			}
		},
	);
});

export { button };
