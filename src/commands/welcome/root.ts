import { Slash } from "sunar";
import {
	ApplicationCommandOptionType,
	PermissionFlagsBits,
	ChannelType,
} from "discord.js";

const slash = new Slash({
	name: "welcome",
	description: "Configure server welcome messages",
	defaultMemberPermissions: PermissionFlagsBits.Administrator,
	options: [
		{
			name: "setup",
			description: "Start the interactive welcome message setup",
			type: ApplicationCommandOptionType.SubcommandGroup,
			options: [
				{
					name: "create",
					description: "Create a new welcome message",
					type: ApplicationCommandOptionType.Subcommand,
					options: [
						{
							name: "channel",
							description: "Channel to send welcome messages in",
							type: ApplicationCommandOptionType.Channel,
							channelTypes: [ChannelType.GuildText],
							required: true,
						},
					],
				},
				{
					name: "remove",
					description: "Remove the welcome message configuration",
					type: ApplicationCommandOptionType.Subcommand,
				},
			],
		},
	],
});

export { slash };
