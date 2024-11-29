// src/interactions/buttons/help/lastButton.ts
import { Button, execute } from "sunar";
import { createCategoryEmbed } from "../../../utils/helpEmbeds";

const button = new Button({ id: "help_last" });

execute(button, async (interaction) => {
	const [, category] = interaction.customId.split(":");
	const footer = interaction.message.embeds[0].footer?.text ?? "";
	const [, totalPages] = footer.split("/");
	const lastPage = Number.parseInt(totalPages.split(" ")[0]) - 1;

	const helpEmbed = await createCategoryEmbed(category, lastPage);
	if (!helpEmbed) {
		await interaction.reply({
			content: "Failed to load last page.",
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
