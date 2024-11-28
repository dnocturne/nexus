import { Signal, execute } from 'sunar';
import { registerCommands } from 'sunar/registry';
 
const signal = new Signal('ready', { once: true });
 
execute(signal, async (client) => {
	await registerCommands(client.application);
	console.log(`Logged in as ${client.user.tag}`);
});
 
export { signal };