// src/interactions/buttons/help/backButton.ts
import { Button, execute } from "sunar";
import { createInitialHelpEmbed } from "../../../utils/helpEmbeds";

const button = new Button({ id: "help_back" });

execute(button, async (interaction) => {
	const { embed, components } = await createInitialHelpEmbed();
	await interaction.update({
		embeds: [embed],
		components,
	});
});

export { button };
