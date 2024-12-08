import { Group, execute } from "sunar";
import { WelcomeConfig } from "@/models/WelcomeConfig";

const group = new Group("welcome", "setup", "remove");

execute(group, async (interaction) => {
	try {
		const config = await WelcomeConfig.findOne({
			guildId: interaction.guildId,
		});

		if (!config) {
			await interaction.reply({
				content: "No welcome message configuration found.",
				ephemeral: true,
			});
			return;
		}

		await WelcomeConfig.findByIdAndDelete(config._id);

		await interaction.reply({
			content: "Welcome message configuration has been removed.",
			ephemeral: true,
		});
	} catch (error) {
		console.error("Error removing welcome config:", error);
		await interaction.reply({
			content: "An error occurred while removing the welcome configuration.",
			ephemeral: true,
		});
	}
});

export { group };
