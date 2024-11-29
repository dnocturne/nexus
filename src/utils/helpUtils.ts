//src/utils/helpUtils.ts

import {
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
} from "discord.js";

type CommandInfo = {
	name: string;
	description: string;
};

export function createHelpEmbed(
	commands: Record<string, CommandInfo[]>,
	category: string,
	currentPage: number,
	totalPages: number,
): EmbedBuilder {
	const embed = new EmbedBuilder()
		.setColor("#0099ff")
		.setTitle(
			`${category.charAt(0).toUpperCase() + category.slice(1)} Commands`,
		)
		.setFooter({ text: `Page ${currentPage}/${totalPages}` });

	const categoryCommands = commands[category];
	const description = categoryCommands
		.map((cmd) => `**/${cmd.name}** - ${cmd.description}`)
		.join("\n");

	embed.setDescription(description);
	return embed;
}

export function createButtonRow(
	currentPage: number,
	totalPages: number,
): ActionRowBuilder<ButtonBuilder> {
	const row = new ActionRowBuilder<ButtonBuilder>();

	row.addComponents(
		new ButtonBuilder()
			.setCustomId("help_first")
			.setLabel("≪")
			.setStyle(ButtonStyle.Primary)
			.setDisabled(currentPage === 0),
		new ButtonBuilder()
			.setCustomId("help_prev")
			.setLabel("←")
			.setStyle(ButtonStyle.Primary)
			.setDisabled(currentPage === 0),
		new ButtonBuilder()
			.setCustomId("help_next")
			.setLabel("→")
			.setStyle(ButtonStyle.Primary)
			.setDisabled(currentPage === totalPages - 1),
		new ButtonBuilder()
			.setCustomId("help_last")
			.setLabel("≫")
			.setStyle(ButtonStyle.Primary)
			.setDisabled(currentPage === totalPages - 1),
	);

	return row;
}
