// src/utils/commandUtils.ts
import { dirname } from "sunar";
import { promises as fs } from "node:fs";
import path from "node:path";

interface Command {
	name: string;
	description: string;
}

export async function getCommandsByCategory(): Promise<
	Record<string, Command[]>
> {
	try {
		const commandsDir = path.join(dirname(import.meta.url), "../commands");
		const categories = await fs.readdir(commandsDir);
		const commands: Record<string, Command[]> = {};

		for (const category of categories) {
			const categoryPath = path.join(commandsDir, category);
			const stat = await fs.stat(categoryPath);

			if (!stat.isDirectory()) continue;

			commands[category] = [];
			await loadCommandsFromDirectory(categoryPath, commands[category]);

			// Filter out commands without descriptions
			commands[category] = commands[category].filter(
				(cmd) => cmd.description !== undefined,
			);

			// Remove empty categories
			if (commands[category].length === 0) {
				delete commands[category];
			}
		}

		return commands;
	} catch (error) {
		console.error("Error getting commands by category:", error);
		return {};
	}
}

async function loadCommandsFromDirectory(
	dirPath: string,
	commandsList: Command[],
) {
	try {
		const files = await fs.readdir(dirPath);

		for (const file of files) {
			const filePath = path.join(dirPath, file);
			const stat = await fs.stat(filePath);

			if (stat.isDirectory()) {
				await loadCommandsFromDirectory(filePath, commandsList);
			} else if (file.endsWith(".ts") || file.endsWith(".js")) {
				try {
					const module = await import(filePath);

					if (module.slash?.data) {
						commandsList.push({
							name: module.slash.data.name,
							description: module.slash.data.description,
						});
					}
				} catch (error) {
					console.error(`Error loading command from ${filePath}:`, error);
				}
			}
		}
	} catch (error) {
		console.error(`Error reading directory ${dirPath}:`, error);
	}
}
