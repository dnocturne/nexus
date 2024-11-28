import { Group, execute } from 'sunar';
import { ServerStatus } from '../../../../models/ServerStatus';
import { MinecraftMonitor } from '../../../../services/MinecraftMonitor';

const group = new Group('monitor', 'server', 'add');

execute(group, async (interaction) => {
    await interaction.deferReply();

    const ip = interaction.options.getString('ip', true);
    const port = interaction.options.getInteger('port') ?? 25565;

    try {
        // Check if monitor already exists for this channel
        let serverStatus = await ServerStatus.findOne({ channelId: interaction.channelId });

        if (serverStatus) {
            serverStatus.serverIp = ip;
            serverStatus.serverPort = port;
        } else {
            serverStatus = new ServerStatus({
                channelId: interaction.channelId,
                serverIp: ip,
                serverPort: port
            });
        }

        await serverStatus.save();

        // Immediately update the status
        await MinecraftMonitor.updateServer(interaction.client, serverStatus);

        await interaction.editReply('✅ Minecraft server monitoring has been set up in this channel.');
    } catch (error) {
        console.error('Error setting up Minecraft server monitoring:', error);
        await interaction.editReply('❌ Failed to set up Minecraft server monitoring. Please try again later.');
    }
});

export { group };
