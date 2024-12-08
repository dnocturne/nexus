// src/interactions/buttons/welcome/preview.ts
import { Button, execute } from "sunar";
import { GuildMember } from "discord.js";
import { welcomeSetup } from "../../../services/welcome/setup";

const button = new Button({ id: "welcome_preview" });

execute(button, async (interaction) => {
	if (!interaction.guildId) {
		await interaction.reply({
			content: "This button can only be used in a server.",
			ephemeral: true,
		});
		return;
	}

	const member = interaction.member;
	if (!(member instanceof GuildMember)) {
		await interaction.reply({
			content: "Could not verify your server membership.",
			ephemeral: true,
		});
		return;
	}

	const setupData = welcomeSetup.getSetup(
		interaction.guildId,
		interaction.user.id,
	);
	if (!setupData) {
		await interaction.reply({
			content: "No active welcome setup found.",
			ephemeral: true,
		});
		return;
	}

	const preview = welcomeSetup.createPreviewEmbed(setupData.config, member);

	await interaction.reply({
		content: preview.content,
		embeds: preview.embed ? [preview.embed] : undefined,
		ephemeral: true,
	});
});

export { button };
