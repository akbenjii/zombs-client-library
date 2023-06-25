'use strict';

const https = require('https');
const endpoint = 'https://zombs.io/';

let serversCache, serverCache = {};

exports.fetchServers = () => {
    return new Promise((resolve, reject) => {
        if (serversCache) return resolve(serversCache);

        https.get(endpoint, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                const serverInfoRegex = /"([a-zA-Z0-9]+)":\s*{"id":"([a-zA-Z0-9]+)".+?}/g;
                let match;
                let servers = {};

                while ((match = serverInfoRegex.exec(data)) !== null) {
                    const serverId = match[1];
                    const serverInfoString = match[0];
                    const serverInfo = JSON.parse(`{${serverInfoString}}`);

                    servers[serverId] = serverInfo[serverId];
                }

                serversCache = servers;
                resolve(servers);
            });
        }).on('error', (err) => {
            reject(new Error(`Error: ${err.message}`));
        });
    });
}

exports.fetchServer = serverId => {
    return new Promise((resolve, reject) => {
        if (serverCache[serverId]) return resolve(serverCache[serverId]);

        https.get(endpoint, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                const serverInfoRegex = new RegExp(`"([a-zA-Z0-9]+)":\\s*{"id":"(${serverId})".+?}`);
                const match = data.match(serverInfoRegex);

                if (match) {
                    const serverInfoString = match[0];
                    const serverInfo = JSON.parse(`{${serverInfoString}}`);

                    const options = serverInfo[serverId];

                    if (options) {
                        serverCache[serverId] = options;
                        resolve(options);
                    } else reject('Couldn\'t fetch server options');
                } else reject(new Error(`Couldn't fetch ${serverId}`));
            });
        }).on('error', (err) => {
            reject(new Error(`Error: ${err.message}`));
        });
    });
}