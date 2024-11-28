import { Slash } from 'sunar';
import { ApplicationCommandOptionType } from 'discord.js';

const slash = new Slash({
    name: 'monitor',
    description: 'Manage Minecraft server monitoring',
    options: [
        {
            name: 'server',
            description: 'Server monitoring commands',
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: [
                {
                    name: 'add',
                    description: 'Add a Minecraft server to monitor in this channel',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'ip',
                            description: 'The IP address of the Minecraft server',
                            type: ApplicationCommandOptionType.String,
                            required: true
                        },
                        {
                            name: 'port',
                            description: 'The port of the Minecraft server',
                            type: ApplicationCommandOptionType.Integer,
                            required: false,
                            minValue: 1,
                            maxValue: 65535
                        }
                    ]
                },
                {
                    name: 'remove',
                    description: 'Stop monitoring a Minecraft server in this channel',
                    type: ApplicationCommandOptionType.Subcommand
                }
            ]
        }
    ]
});

export { slash };
