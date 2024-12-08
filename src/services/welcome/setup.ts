// src/services/welcome/setup.ts
import {
	EmbedBuilder,
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder,
	type TextChannel,
	type Message,
	type Interaction,
	type GuildMember,
	type ColorResolvable,
} from "discord.js";
import type {
	SetupData,
	WelcomeConfigData,
	WelcomeMessagePreview,
} from "./types";

class WelcomeSetupService {
	private setupStorage = new Map<string, SetupData>();

	private readonly WELCOME_VARIABLES = {
		"{user}": "Member's username",
		"{user.tag}": "Member's username with discriminator",
		"{user.id}": "Member's ID",
		"{server}": "Server name",
		"{memberCount}": "Current member count",
		"{ordinal}": "Member's join position (1st, 2nd, etc.)",
	} as const;

	// Storage management
	private getStorageKey(guildId: string, userId: string): string {
		return `${guildId}-${userId}`;
	}

	public storeSetup(guildId: string, userId: string, channelId: string): void {
		const key = this.getStorageKey(guildId, userId);
		this.setupStorage.set(key, {
			guildId,
			userId,
			channelId,
			config: { enabled: false, embedEnabled: true },
		});
	}

	public getSetup(guildId: string, userId: string): SetupData | undefined {
		return this.setupStorage.get(this.getStorageKey(guildId, userId));
	}

	public clearSetup(guildId: string, userId: string): void {
		this.setupStorage.delete(this.getStorageKey(guildId, userId));
	}

	// Message collectors
	public async startMessageCollector(
		channel: TextChannel,
		userId: string,
		onCollect: (message: Message) => Promise<void>,
	): Promise<void> {
		const collector = channel.createMessageCollector({
			filter: (m: Message) => m.author.id === userId,
			time: 300000,
			max: 1,
		});

		collector.on("collect", async (message: Message) => {
			await onCollect(message);
			await message.delete().catch(console.error);
		});

		collector.on("end", async (collected) => {
			if (collected.size === 0) {
				// Handle timeout
				const timeoutEmbed = new EmbedBuilder()
					.setTitle("Welcome Message Setup")
					.setDescription("Setup timed out. Please try again.")
					.setColor("#ff0000");

				// You'll need to handle this embed display in the calling code
				return;
			}
		});
	}

	// Parse setup message
	public parseSetupMessage(content: string): Partial<WelcomeConfigData> {
		const lines = content.split("\n");
		const embedData: Record<string, string[]> = {
			title: [],
			description: [],
			footer: [],
			color: [],
			author: [],
			timestamp: [],
			thumbnail: [],
			footericon: [],
			autoroles: [],
			dmenabled: [],
			dmcontent: [],
			mentionuser: [],
			imageenabled: [],
			imageurl: [],
		};

		let currentKey: string | null = null;

		for (const line of lines) {
			const sectionMatch = line.match(/^([^:]+):\s*(.*)$/i);

			if (sectionMatch) {
				// Convert to lowercase and remove spaces for consistent keys
				const key = sectionMatch[1].toLowerCase().replace(/\s+/g, "");

				// Only set currentKey if it's a valid key in embedData
				if (key in embedData) {
					currentKey = key;
					if (sectionMatch[2].trim()) {
						embedData[currentKey].push(sectionMatch[2].trim());
					}
				}
			} else if (currentKey && currentKey in embedData) {
				// Only push if currentKey is valid
				embedData[currentKey].push(line);
			}
		}

		const parseBoolean = (key: string): boolean =>
			embedData[key]?.[0]?.toLowerCase() === "yes" || false;

		const roleIds =
			embedData.autoroles?.[0]
				?.split(",")
				.map((id) => id.trim())
				.filter((id) => id.length > 0) || [];

		return {
			embedEnabled: true,
			embedTitle: embedData.title.join("\n"),
			embedDescription: embedData.description.join("\n"),
			embedColor: this.validateColor(embedData.color[0] || "0099ff"),
			embedFooterText: embedData.footer.join("\n"),
			embedAuthor: parseBoolean("author"),
			embedTimestamp: parseBoolean("timestamp"),
			embedThumbnail: parseBoolean("thumbnail"),
			embedFooterIcon: parseBoolean("footericon"),
			autoRoles: roleIds,
			dmEnabled: parseBoolean("dmenabled"),
			dmContent: embedData.dmcontent.join("\n"),
			mentionUser: parseBoolean("mentionuser"),
			imageEnabled: parseBoolean("imageenabled"),
			imageUrl: embedData.imageurl[0],
		};
	}

	// Helper functions
	private validateColor(inputColor: string): ColorResolvable {
		const colorHex = inputColor.startsWith("#")
			? inputColor.slice(1)
			: inputColor;
		const isValidHex = /^[0-9A-Fa-f]{6}$/.test(colorHex);
		return isValidHex
			? (`#${colorHex}` as ColorResolvable)
			: ("#0099ff" as ColorResolvable);
	}

	// Also need to restore the complete setup embed description
	public createSetupEmbed(): EmbedBuilder {
		const variablesList = Object.entries(this.WELCOME_VARIABLES)
			.map(([variable, description]) => `\`${variable}\` - ${description}`)
			.join("\n");

		return new EmbedBuilder()
			.setTitle("Welcome Message Setup")
			.setDescription(`Please configure your welcome message using this format:
    
    \`\`\`
    Title: Your Title Here
    Description: Your welcome message here.
    Footer: Your footer text here
    Color: #HexColor (optional, default: #0099ff)
    
    # Additional Configuration (use Yes/No)
    Author: Yes/No (shows member as author)
    Timestamp: Yes/No (shows time member joined)
    Thumbnail: Yes/No (shows member avatar)
    FooterIcon: Yes/No (shows server icon in footer)
    
    # Additional Features
    MentionUser: Yes/No (mentions user in channel)
    ImageEnabled: Yes/No
    ImageURL: URL to image (if ImageEnabled is Yes)
    
    # DM Configuration
    DMEnabled: Yes/No
    DMContent: Your DM message here (if DMEnabled is Yes)
    
    # Roles Configuration
    AutoRoles: roleID1, roleID2, roleID3 (optional)
    \`\`\`
    
    **Available Variables:**
    ${variablesList}
    
    Example:
    \`\`\`
    Title: Welcome to {server}!
    Description: Hey {user}, thanks for joining! 
    You are our {memberCount}th member.
    Check out our rules at #rules
    Join the discussion at #general
    
    Footer: You are our {ordinal} member!
    Color: #ff0000
    
    Author: Yes
    Timestamp: Yes
    Thumbnail: Yes
    FooterIcon: Yes
    
    MentionUser: Yes
    ImageEnabled: No
    DMEnabled: Yes
    DMContent: Welcome to our server's private chat! Here are some quick tips...
    
    AutoRoles: 123456789, 987654321
    \`\`\``)
			.setColor("#0099ff")
			.setFooter({ text: "⏳ Waiting for your message..." });
	}

	public createSetupButtons(): ActionRowBuilder<ButtonBuilder> {
		return new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setCustomId("welcome_back")
				.setLabel("Back")
				.setStyle(ButtonStyle.Secondary),
			new ButtonBuilder()
				.setCustomId("welcome_preview")
				.setLabel("Preview")
				.setStyle(ButtonStyle.Primary),
			new ButtonBuilder()
				.setCustomId("welcome_save")
				.setLabel("Save")
				.setStyle(ButtonStyle.Success),
			new ButtonBuilder()
				.setCustomId("welcome_cancel")
				.setLabel("Cancel")
				.setStyle(ButtonStyle.Danger),
		);
	}

	public createPreviewEmbed(
		config: Partial<WelcomeConfigData>,
		member: GuildMember,
	): WelcomeMessagePreview {
		const preview: WelcomeMessagePreview = {
			content: config.mentionUser ? `<@${member.id}>` : undefined,
		};

		if (config.embedEnabled) {
			const embed = new EmbedBuilder().setColor(config.embedColor || "#0099ff");

			if (config.embedTitle) {
				embed.setTitle(this.replaceVariables(config.embedTitle, member));
			}

			if (config.embedDescription) {
				embed.setDescription(
					this.replaceVariables(config.embedDescription, member),
				);
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
					text: this.replaceVariables(config.embedFooterText, member),
					iconURL: config.embedFooterIcon
						? member.guild.iconURL() || undefined
						: undefined,
				});
			}

			if (config.imageEnabled && config.imageUrl) {
				embed.setImage(config.imageUrl);
			}

			preview.embed = embed;
		}

		return preview;
	}

	private replaceVariables(text: string, member: GuildMember): string {
		const count = member.guild.memberCount;
		return text
			.replace(/{user}/g, member.user.username)
			.replace(/{user\.tag}/g, member.user.tag)
			.replace(/{user\.id}/g, member.user.id)
			.replace(/{server}/g, member.guild.name)
			.replace(/{memberCount}/g, count.toString())
			.replace(/{ordinal}/g, this.getOrdinalNumber(count));
	}

	private getOrdinalNumber(n: number): string {
		const s = ["th", "st", "nd", "rd"];
		const v = n % 100;
		return n + (s[(v - 20) % 10] || s[v] || s[0]);
	}
}

export const welcomeSetup = new WelcomeSetupService();
