// src/services/welcome/types.ts
import type { ColorResolvable, EmbedBuilder } from "discord.js";

export interface SetupData {
	guildId: string;
	userId: string;
	channelId: string;
	config: Partial<WelcomeConfigData>;
}

export interface WelcomeConfigData {
	enabled: boolean;
	embedEnabled: boolean;
	embedTitle?: string;
	embedDescription?: string;
	embedColor: ColorResolvable;
	embedThumbnail: boolean;
	embedTimestamp: boolean;
	embedFooterText?: string;
	embedFooterIcon: boolean;
	embedAuthor: boolean;
	autoRoles: string[];
	imageEnabled: boolean;
	imageUrl?: string;
	mentionUser: boolean;
	dmEnabled: boolean;
	dmContent?: string;
}

export interface WelcomeMessagePreview {
	content?: string;
	embed?: EmbedBuilder;
}
