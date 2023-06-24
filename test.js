const Game = require('./src/Engine/Game');

const x = new Game({ username: 'benji' });
const y = new Game({ username: 'benji' });

(async () => {
    await x.preload();
    x.network.connect({"id":"v6005","region":"South America","name":"South America #5","hostname":"zombs-2d20af04-0.eggs.gg","ipAddress":"45.32.175.4","port":443,"fallbackPort":443,"selected":false});
})();