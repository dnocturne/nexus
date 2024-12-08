// src/interactions/buttons/welcome/save.ts
import { Button, execute } from "sunar";
import { welcomeSetup } from "@/services/welcome/setup";
import { WelcomeConfig } from "@/models/WelcomeConfig";

const button = new Button({ id: "welcome_save" });

execute(button, async (interaction) => {
	if (!interaction.guildId) {
		await interaction.reply({
			content: "This command can only be used in a server.",
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

	try {
		await WelcomeConfig.create({
			guildId: setupData.guildId,
			channelId: setupData.channelId,
			...setupData.config,
			enabled: true,
		});

		welcomeSetup.clearSetup(setupData.guildId, setupData.userId);

		await interaction.update({
			content: "Welcome message has been saved and enabled!",
			embeds: [],
			components: [],
		});
	} catch (error) {
		console.error("Error saving welcome config:", error);
		await interaction.reply({
			content: "An error occurred while saving the configuration.",
			ephemeral: true,
		});
	}
});

export { button };
