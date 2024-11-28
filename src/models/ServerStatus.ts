import mongoose from "mongoose";

export interface IServerStatus extends mongoose.Document {
    channelId: string;
    messageId?: string;
    serverIp: string;
    serverPort: number;
    lastQuery: Date;
    isOnline: boolean;
    playerCount: number;
    maxPlayers: number;
    players: string[];
}

const ServerStatusSchema = new mongoose.Schema({
    channelId: { type: String, required: true },
    messageId: { type: String },
    serverIp: { type: String, required: true },
    serverPort: { type: Number, default: 25565 },
    lastQuery: { type: Date, default: Date.now },
    isOnline: { type: Boolean, default: false },
    playerCount: { type: Number, default: 0 },
    maxPlayers: { type: Number, default: 0 },
    players: [String],
});

export const ServerStatus = mongoose.model<IServerStatus>("ServerStatus", ServerStatusSchema);
