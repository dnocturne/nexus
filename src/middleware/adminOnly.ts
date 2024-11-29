// src/middleware/adminOnly.ts
import { Message, PermissionFlagsBits } from "discord.js";
import { Protector, execute } from "sunar";
import type { PermissionsBitField } from "discord.js";

const adminOnly = new Protector({
	commands: ["autocomplete", "contextMenu", "slash"],
	components: ["button", "modal", "selectMenu"],
	signals: ["interactionCreate", "messageCreate"],
});

const content = "This command requires administrator permissions.";

function checkIsAdmin(permissions?: PermissionsBitField | string): boolean {
	if (!permissions || typeof permissions === "string") return false;
	return permissions.has(PermissionFlagsBits.Administrator);
}

execute(adminOnly, (arg, next) => {
	const entry = Array.isArray(arg) ? arg[0] : arg;
	const isAdmin = checkIsAdmin(entry.member?.permissions);

	if (entry instanceof Message) {
		if (isAdmin) return next();
		return entry.reply({ content });
	}

	if (entry.isAutocomplete() && !isAdmin) return entry.respond([]);
	if (entry.isRepliable() && !isAdmin) {
		return entry.reply({ content, ephemeral: true });
	}

	return isAdmin && next();
});

export { adminOnly };
