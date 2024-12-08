// src/models/WelcomeConfig.ts
import mongoose from "mongoose";
import type { ColorResolvable } from "discord.js";

export interface IWelcomeConfig extends mongoose.Document {
	guildId: string;
	channelId: string;
	enabled: boolean;
	setupMessageId?: string; // ID of the setup message for ongoing setup
	setupUserId?: string; // ID of the user doing setup
	// Message configuration
	content?: string;
	// Embed configuration
	embedEnabled: boolean;
	embedTitle?: string;
	embedDescription?: string;
	embedColor: ColorResolvable;
	embedThumbnail: boolean;
	embedTimestamp: boolean;
	embedFooterText?: string;
	embedFooterIcon: boolean;
	embedAuthor: boolean;
	// Role configuration
	autoRoles: string[];
	// Image configuration
	imageEnabled: boolean;
	imageUrl?: string;
	// Mention configuration
	mentionUser: boolean;
	// Direct Message configuration
	dmEnabled: boolean;
	dmContent?: string;
}

const WelcomeConfigSchema = new mongoose.Schema<IWelcomeConfig>({
	guildId: { type: String, required: true, unique: true },
	channelId: { type: String, required: true },
	enabled: { type: Boolean, default: false },
	setupMessageId: { type: String },
	setupUserId: { type: String },
	// Message configuration
	content: { type: String },
	// Embed configuration
	embedEnabled: { type: Boolean, default: true },
	embedTitle: { type: String },
	embedDescription: { type: String },
	embedColor: { type: String, default: "#0099ff" },
	embedThumbnail: { type: Boolean, default: true },
	embedTimestamp: { type: Boolean, default: true },
	embedFooterText: { type: String },
	embedFooterIcon: { type: Boolean, default: true },
	embedAuthor: { type: Boolean, default: true },
	// Role configuration
	autoRoles: [{ type: String }],
	// Image configuration
	imageEnabled: { type: Boolean, default: false },
	imageUrl: { type: String },
	// Mention configuration
	mentionUser: { type: Boolean, default: true },
	// DM configuration
	dmEnabled: { type: Boolean, default: false },
	dmContent: { type: String },
});

export const WelcomeConfig = mongoose.model<IWelcomeConfig>(
	"WelcomeConfig",
	WelcomeConfigSchema,
);
