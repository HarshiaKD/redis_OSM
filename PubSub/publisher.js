import RedisConfig from './config.js';

const redisConfig = new RedisConfig();

import { createInterface } from 'readline';
const rl = createInterface({
    input: process.stdin,
    output: process.stdout
});

// Function to prompt user for message and publish it to the specified Redis channel
async function publishMessage(channel) {
    const message = await new Promise((resolve) => {
        rl.question('Enter message to publish to Redis channel: ', (message) => {
            resolve(message);
        });
    });

    await redisConfig.produce(channel, message);
    console.log(`Message published successfully to Redis channel '${channel}'!`);
}

// Function to continue publishing messages to the same channel until the user decides to stop
async function publishMessages(channel) {
    while (true) {
        await publishMessage(channel);
        const continuePublishing = await new Promise((resolve) => {
            rl.question('Do you want to publish another message? (yes/no): ', (answer) => {
                resolve(answer.toLowerCase() === 'yes');
            });
        });
        if (!continuePublishing) break;
    }
    rl.close();
}

rl.question('Enter channel name: ', (channel) => {
    publishMessages(channel);
});
