# Nexus Discord Bot

A Discord bot for Minecraft server monitoring and server management.

## Setup

1. Install dependencies:
```bash
bun install
```

2. Create `.env` file:
```env
DISCORD_TOKEN=your_bot_token
MONGODB_URL=your_mongodb_url
```

3. Run the bot:
```bash
bun run src/index.ts
```

## Commands

- `/help` - Shows all available commands
- `/clear [amount] [user]` - Clears messages
- `/monitor server add [ip] [port]` - Monitor a Minecraft server
- `/monitor server remove` - Stop monitoring a server

## Requirements

- Node.js
- MongoDB
- Discord Bot Token

## Note

This bot is designed for personal use but feel free to modify it for your needs.

## Credits

Built using:
- [Sunar](https://github.com/sunarjs/sunar)
- [Discord.js](https://discord.js.org/)
- [GameDig](https://github.com/gamedig/node-gamedig)