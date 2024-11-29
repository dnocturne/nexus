// src/interactions/buttons/help/nextButton.ts
import { Button, execute } from "sunar";
import { createCategoryEmbed } from "../../../utils/helpEmbeds";

const button = new Button({ id: "help_next" });

execute(button, async (interaction) => {
	const [, category] = interaction.customId.split(":");
	const footer = interaction.message.embeds[0].footer?.text ?? "";
	const currentPage = Number.parseInt(footer.split("/")[0].split(" ")[1]) - 1;

	const helpEmbed = await createCategoryEmbed(category, currentPage + 1);
	if (!helpEmbed) {
		await interaction.reply({
			content: "No more pages available.",
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
