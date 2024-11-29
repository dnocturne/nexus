// src/commands/minecraft/monitor/root.ts
import { Slash } from "sunar";
import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";

const slash = new Slash({
	name: "monitor",
	description: "Manage Minecraft server monitoring",
	defaultMemberPermissions: PermissionFlagsBits.Administrator,
	options: [
		{
			name: "server",
			description: "Server monitoring commands",
			type: ApplicationCommandOptionType.SubcommandGroup,
			options: [
				{
					name: "add",
					description: "Add a Minecraft server to monitor",
					type: ApplicationCommandOptionType.Subcommand,
					options: [
						{
							name: "ip",
							description: "Server IP address",
							type: ApplicationCommandOptionType.String,
							required: true,
						},
						{
							name: "port",
							description: "Server port (default: 25565)",
							type: ApplicationCommandOptionType.Integer,
							required: false,
							minValue: 1,
							maxValue: 65535,
						},
					],
				},
				{
					name: "remove",
					description: "Stop monitoring a server",
					type: ApplicationCommandOptionType.Subcommand,
				},
			],
		},
	],
});

export { slash };
