// src/index.ts
import { Client, dirname, load } from "sunar";
import { GatewayIntentBits } from "discord.js";
import { validateEnv } from "./utils/validateEnv";
import { connectDatabase } from "./utils/database";

const start = async () => {
	validateEnv();
	await connectDatabase();

	const client = new Client({
		intents: [
			GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildMessages,
			GatewayIntentBits.MessageContent,
		],
	});

	await load("src/{commands,signals,middleware,interactions}/**/*.{js,ts}");
	await client.login(process.env.DISCORD_TOKEN);
};

start().catch(console.error);
