// src/commands/utility/help.ts
import { Slash, execute, config } from "sunar";
import { createInitialHelpEmbed } from "../../utils/helpEmbeds";

const slash = new Slash({
	name: "help",
	description: "View all available commands and their usage",
});

config(slash, {
	cooldown: {
		time: 5000,
	},
});

execute(slash, async (interaction) => {
	const { embed, components } = await createInitialHelpEmbed();
	await interaction.reply({
		embeds: [embed],
		components,
		ephemeral: true,
	});
});

export { slash };
