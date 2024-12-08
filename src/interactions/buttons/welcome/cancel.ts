// src/interactions/buttons/welcome/cancel.ts
import { Button, execute } from "sunar";
import { welcomeSetup } from "../../../services/welcome/setup";

const button = new Button({ id: "welcome_cancel" });

execute(button, async (interaction) => {
	if (!interaction.guildId) {
		await interaction.reply({
			content: "This button can only be used in a server.",
			ephemeral: true,
		});
		return;
	}

	welcomeSetup.clearSetup(interaction.guildId, interaction.user.id);

	await interaction.update({
		content: "Welcome message setup cancelled.",
		embeds: [],
		components: [],
	});
});

export { button };
