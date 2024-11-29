// src/signals/ready.ts
import { Signal, execute } from "sunar";
import { registerCommands } from "sunar/registry";
import { MinecraftMonitor } from "../../services/MinecraftMonitor";

const signal = new Signal("ready", { once: true });

execute(signal, async (client) => {
	await registerCommands(client.application);
	console.log(`Logged in as ${client.user.tag}`);
	MinecraftMonitor.startMonitoring(client);
});

export { signal };
