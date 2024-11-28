export const validateEnv = () => {
	const requiredEnvVars = [
		"MONGODB_URL",
		// Add any other required environment variables here
	];

	const missingVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

	if (missingVars.length > 0) {
		throw new Error(
			`Missing required environment variables:\n${missingVars.join("\n")}\nPlease check your .env file and ensure all required variables are set.`,
		);
	}
};
