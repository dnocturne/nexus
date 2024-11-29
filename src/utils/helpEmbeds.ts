// src/utils/helpEmbeds.ts
import {
	EmbedBuilder,
	ActionRowBuilder,
	StringSelectMenuBuilder,
	ButtonBuilder,
	ButtonStyle,
} from "discord.js";
import { getCommandsByCategory } from "./commandUtils";

const COMMANDS_PER_PAGE = 8;

export async function createInitialHelpEmbed() {
	try {
		console.log("Creating initial help embed");
		const commands = await getCommandsByCategory();
		const categories = Object.keys(commands);

		console.log("Available categories:", categories);

		const embed = new EmbedBuilder()
			.setColor(0x0099ff)
			.setTitle("Command Help")
			.setDescription("Select a category from the dropdown menu below.")
			.setFooter({ text: `${categories.length} categories available` });

		// Ensure we're creating unique options for each category
		const selectOptions = categories.map((category) => ({
			label: category.charAt(0).toUpperCase() + category.slice(1),
			description: `View ${commands[category].length} ${category} commands`,
			value: category.toLowerCase(), // Ensure consistent casing
		}));

		console.log("Created select options:", selectOptions);

		const selectMenu = new StringSelectMenuBuilder()
			.setCustomId("help_category_select") // This ID must match the SelectMenu component
			.setPlaceholder("Choose a category")
			.addOptions(selectOptions);

		const menuRow =
			new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

		return { embed, components: [menuRow] };
	} catch (error) {
		console.error("Error creating initial help embed:", error);
		throw error;
	}
}

export async function createCategoryEmbed(category: string, page = 0) {
	console.log(`Creating category embed for: ${category}`); // Debug log

	try {
		const commands = await getCommandsByCategory();
		const categoryCommands = commands[category.toLowerCase()]; // Match casing with select menu

		if (!categoryCommands || categoryCommands.length === 0) {
			console.log(`No commands found for category: ${category}`);
			return null;
		}

		console.log(`Found ${categoryCommands.length} commands for ${category}`);

		const totalPages = Math.ceil(categoryCommands.length / COMMANDS_PER_PAGE);
		const startIndex = page * COMMANDS_PER_PAGE;
		const pageCommands = categoryCommands.slice(
			startIndex,
			startIndex + COMMANDS_PER_PAGE,
		);

		// Rest of your embed creation code...
		const embed = new EmbedBuilder()
			.setColor(0x0099ff)
			.setTitle(
				`${category.charAt(0).toUpperCase() + category.slice(1)} Commands`,
			)
			.setDescription(
				pageCommands
					.map((cmd) => `**/${cmd.name}**\n${cmd.description}`)
					.join("\n\n"),
			)
			.setFooter({
				text: `Page ${page + 1}/${totalPages} | Category: ${category}`,
			});

		// Create navigation buttons
		const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setCustomId("help_back")
				.setLabel("Back")
				.setStyle(ButtonStyle.Secondary),
			new ButtonBuilder()
				.setCustomId(`help_prev:${category}`)
				.setLabel("Previous")
				.setStyle(ButtonStyle.Primary)
				.setDisabled(page === 0),
			new ButtonBuilder()
				.setCustomId(`help_next:${category}`)
				.setLabel("Next")
				.setStyle(ButtonStyle.Primary)
				.setDisabled(page === totalPages - 1),
		);

		return { embed, components: [buttonRow] };
	} catch (error) {
		console.error(`Error creating category embed for ${category}:`, error);
		return null;
	}
}
