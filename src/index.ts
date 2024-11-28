import { Client, dirname, load } from "sunar";
import { validateEnv } from "./utils/validateEnv";
import { connectDatabase } from "./utils/database";
import { MinecraftMonitor } from "./services/MinecraftMonitor";
import { GatewayIntentBits } from "discord.js";

const start = async () => {
	// Validate environment variables
	validateEnv();

	// Connect to MongoDB
	await connectDatabase();

	const client = new Client({
		intents: [
			GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildMessages,
			GatewayIntentBits.MessageContent,
		],
	});

	await load(`${dirname(import.meta.url)}/{commands,signals}/**/*.{js,ts}`);

	// Start Minecraft server monitoring after client is ready
	client.once("ready", () => {
		console.log("Bot is ready!");
		MinecraftMonitor.startMonitoring(client);
	});

	client.login(process.env.DISCORD_TOKEN);
};

start();
