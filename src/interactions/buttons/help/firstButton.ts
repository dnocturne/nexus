// src/interactions/buttons/help/firstButton.ts
import { Button, execute } from "sunar";
import { createCategoryEmbed } from "../../../utils/helpEmbeds";

const button = new Button({ id: "help_first" });

execute(button, async (interaction) => {
	const category = interaction.customId.split(":")[1];
	const helpEmbed = await createCategoryEmbed(category, 0);

	if (!helpEmbed) {
		await interaction.reply({
			content: "Failed to load help menu.",
			ephemeral: true,
		});
		return;
	}

	await interaction.update({
		embeds: [helpEmbed.embed],
		components: helpEmbed.components,
	});
});

export { button };
