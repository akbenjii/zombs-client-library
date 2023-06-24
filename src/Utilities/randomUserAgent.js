'use strict';

const fs = require('fs');
const path = require('path');

const userAgentsPath = path.join(__dirname, '../../bin/user-agents.txt');
const userAgents = fs.readFileSync(userAgentsPath, 'utf8');

exports.getRandomUserAgent = () => {
    const entries = userAgents.split('\n').filter(entry => entry.trim() !== '');

    if (entries.length === 0) {
        console.log('Please add user-agents to', userAgentsPath);
        return;
    }

    const randomIndex = Math.floor(Math.random() * entries.length);
    const randomUserAgent = entries[randomIndex];
    return randomUserAgent.trim();
}
