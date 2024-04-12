import RedisConfig from "./config.js";
import { createInterface } from 'readline';

const redisConfig = new RedisConfig();

// Start listening for user input from the console
const rl = createInterface({
    input: process.stdin,
    output: process.stdout
});

// Prompt user for input from the console (channel name) and subscribe to the Redis channel
rl.question('Channel name to subscribe: ', (channel) => {
    // Subscribe to the Redis channel and receive messages
    redisConfig.consume(channel, (message) => {
        console.log(`Message from channel '${channel}': ${message}`);
    });
});
