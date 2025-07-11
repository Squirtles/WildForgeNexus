const { Server } = require('socket.io');
const serverless = require('serverless-http');

let players = {};
let creatures = [
  { id: 1, type: 'Fire Drake', x: 100, y: 100, rarity: 'common' },
  { id: 2, type: 'Ice Wyrm', x: 200, y: 200, rarity: 'rare' }
];
let trades = [];

module.exports.handler = serverless(async (req, res, context) => {
  const io = new Server(res.socket.server, {
    path: '/.netlify/functions/socket',
    cors: { origin: '*' }
  });

  io.on('connection', (socket) => {
    socket.on('join', (player) => {
      players[player.id] = player;
      io.emit('players', players);
      io.emit('creatures', creatures);
      io.emit('trades', trades);
    });

    socket.on('move', (player) => {
      players[player.id] = player;
      io.emit('players', players);
    });

    socket.on('capture', (creatureId) => {
      creatures = creatures.filter(c => c.id !== creatureId);
      io.emit('creatures', creatures);
    });

    socket.on('listTrade', (creature) => {
      trades.push(creature);
      io.emit('trades', trades);
    });

    socket.on('buy', ({ creatureId, buyer }) => {
      trades = trades.filter(t => t.id !== creatureId);
      io.emit('trades', trades);
    });

    socket.on('disconnect', () => {
      delete players[socket.id];
      io.emit('players', players);
    });
  });

  // Wild Surge Event
  setInterval(() => {
    const newCreature = {
      id: Math.random(),
      type: 'Void Phoenix',
      x: Math.random() * 800,
      y: Math.random() * 600,
      rarity: 'legendary'
    };
    creatures.push(newCreature);
    io.emit('wildSurge', newCreature);
  }, 3600000);

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/plain' },
    body: 'Socket.IO server running'
  };
});
