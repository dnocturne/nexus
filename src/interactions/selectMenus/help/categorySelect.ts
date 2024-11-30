// src/interactions/selectMenus/help/categorySelect.ts
import { SelectMenu, execute } from "sunar";
import { ComponentType } from "discord.js";
import { createCategoryEmbed } from "@/utils/helpEmbeds";

// Ensure the ID matches exactly what we set in createInitialHelpEmbed
const select = new SelectMenu({
	id: "help_category_select",
	type: ComponentType.StringSelect,
});

execute(select, async (interaction) => {
	console.log("Select menu interaction received"); // Debug log

	try {
		// Add immediate interaction deferral
		await interaction.deferUpdate();
		console.log("Interaction deferred");

		const selectedCategory = interaction.values[0];
		console.log("Selected category:", selectedCategory);

		const categoryData = await createCategoryEmbed(selectedCategory, 0);
		console.log("Category data created:", !!categoryData);

		if (!categoryData) {
			console.log("No category data returned");
			await interaction.followUp({
				content: "Failed to load category information.",
				ephemeral: true,
			});
			return;
		}

		await interaction.editReply({
			embeds: [categoryData.embed],
			components: categoryData.components,
		});
		console.log("Interaction updated successfully");
	} catch (error) {
		console.error("Error in category select:", error);
		try {
			await interaction.followUp({
				content: "An error occurred while processing your selection.",
				ephemeral: true,
			});
		} catch (e) {
			console.error("Error sending error message:", e);
		}
	}
});

export { select };
