# zombs-client-library

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/your-username/zombs-client-library/blob/main/LICENSE)

The zombs-client-library is a comprehensive Node.js library for building powerful and feature-rich client applications
for zombs.io. It offers a comprehensive set of tools, APIs, and utilities to facilitate seamless communication between
the game server and the client.

## Features

- Easy connection to the zombs.io game server
- Simple management for in game sessions
- Perform various actions in the game
- Flexible and extensible architecture

## Installation

You can install the library via npm:

```shell
npm install https://github.com/akbenjii/zombs-client-library
```

## Usage

To use the zombs-client-library in your Node.js application, you can import the `ZombsClient` class from the library:

```javascript
const { ZombsClient } = require('@akbenjii/zombs-client-library');
```

Once you have imported the `ZombsClient` class, you can create a new instance of the client and start using its methods to interact with the zombs.io game server.

Here's a basic example of how to create a `ZombsClient` instance and connect to the game server:

```javascript
const { ZombsClient } = require('@akbenjii/zombs-client-library');

// Create a new instance of the client
const client = new ZombsClient({
    username: 'benji',
    
    /** OPTIONAL **/
    
    /* NONE, DEFAULT, DEBUG, PACKET_ONLY, NO_PACKET, DISABLED */
    logType: ZombsClient.LOG_TYPE.DEFAULT, 
    
    /* All proxy types that are supported with websockets can be used, pass 
    their respective agent.  */
    agent: new HttpProxyAgent('http://168.63.76.32:3128') ||
           new HttpsProxyAgent('https://your-proxy-server:proxy-port') ||
           new SocksProxyAgent('socks://your-name%40gmail.com:abcdef12345124@br41.nordvpn.com')
});

// create asynchronous function
(async () => {
    // preload client and wasm
    await client.preload();

    // Connect to the game server
    client.network.connect('v2002');

    /** 
     * Handle events and perform actions.
     * These are done the *EXACT* same way as the browser.
     */

    client.network.addEnterWorldHandler(() => {
        console.log('entered world');
    });
    
    client.network.addPingHandler(() => {
       console.log('received ping packet'); 
    });
})();
```

This is just a basic example, and there are all methods the `ZombsClient` class can be used interchangeably with web-scripts.