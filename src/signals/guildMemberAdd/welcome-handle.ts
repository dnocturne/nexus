// src/signals/guildMemberAdd.ts
import { Signal, execute } from "sunar";
import { WelcomeConfig } from "@/models/WelcomeConfig";
import { EmbedBuilder, type GuildMember } from "discord.js";

const signal = new Signal("guildMemberAdd");

execute(signal, async (member) => {
	try {
		const config = await WelcomeConfig.findOne({
			guildId: member.guild.id,
			enabled: true,
		});

		if (!config) return;

		const channel = await member.guild.channels.fetch(config.channelId);
		if (!channel?.isTextBased()) return;

		// Handle auto roles if configured
		if (config.autoRoles?.length > 0) {
			try {
				await member.roles.add(config.autoRoles);
			} catch (error) {
				console.error("Failed to add auto roles:", error);
			}
		}

		// Replace variables in text
		const replaceVariables = (text: string) => {
			const count = member.guild.memberCount;
			const ordinal = getOrdinalNumber(count);

			return text
				.replace(/{user}/g, member.user.username)
				.replace(/{user\.tag}/g, member.user.tag)
				.replace(/{user\.id}/g, member.user.id)
				.replace(/{server}/g, member.guild.name)
				.replace(/{memberCount}/g, count.toString())
				.replace(/{ordinal}/g, ordinal);
		};

		// Create welcome message embed if enabled
		let embed: EmbedBuilder | undefined;
		if (config.embedEnabled) {
			embed = new EmbedBuilder().setColor(config.embedColor);

			if (config.embedTitle) {
				embed.setTitle(replaceVariables(config.embedTitle));
			}

			if (config.embedDescription) {
				embed.setDescription(replaceVariables(config.embedDescription));
			}

			if (config.embedAuthor) {
				embed.setAuthor({
					name: member.user.tag,
					iconURL: member.user.displayAvatarURL(),
				});
			}

			if (config.embedThumbnail) {
				embed.setThumbnail(member.user.displayAvatarURL());
			}

			if (config.embedTimestamp) {
				embed.setTimestamp();
			}

			if (config.embedFooterText) {
				embed.setFooter({
					text: replaceVariables(config.embedFooterText),
					iconURL: config.embedFooterIcon
						? member.guild.iconURL() || undefined
						: undefined,
				});
			}

			if (config.imageEnabled && config.imageUrl) {
				embed.setImage(config.imageUrl);
			}
		}

		// Send welcome message
		await channel.send({
			content: config.mentionUser ? `<@${member.id}>` : undefined,
			embeds: embed ? [embed] : undefined,
		});

		// Send DM if enabled
		if (config.dmEnabled && config.dmContent) {
			try {
				await member.send({
					content: replaceVariables(config.dmContent),
				});
			} catch (error) {
				console.error("Failed to send welcome DM:", error);
			}
		}
	} catch (error) {
		console.error("Error in guildMemberAdd handler:", error);
	}
});

function getOrdinalNumber(n: number): string {
	const s = ["th", "st", "nd", "rd"];
	const v = n % 100;
	return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export { signal };
