const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

const io = socketIO(config.socket_port, {
  cors: {
    origin: '*',
  },
}).sockets;

const socketSetup = () => {
  io.use(function (socket, next) {
    if (socket.handshake.query && socket.handshake.query.token) {
      jwt.verify(socket.handshake.query.token, config.jwt.secret, function (err, decoded) {
        if (err) return next(new Error('Authentication error'));
        // eslint-disable-next-line no-param-reassign
        socket.decoded = decoded;
        next();
      });
    } else {
      next(new Error('Token not found in query'));
    }
  }).on('connection', (socket) => {
    const { chatID } = socket.handshake.query;
    socket.join(chatID);

    const { roomName } = socket.handshake.query;
    socket.join(roomName);

    socket.on('disconnect', () => {
      socket.leave(chatID);
    });

    socket.on('send_message', (message) => {
      const { receiverChatID, senderChatID, text, from } = message;

      socket.to(receiverChatID).emit('receive_message', {
        text,
        from,
        senderChatID,
        receiverChatID,
      });
    });

    socket.on('send_state', async (data) => {
      const { roomName } = data;
      await socket.to(roomName).emit('receive_state', data);
    });
  });
};

module.exports = socketSetup;
