const { version } = require('../../package.json');
const config = require('../config/config');

const swaggerDef = {
  openapi: '3.0.0',
  info: {
    title: 'GSOC 21 Chat App API documentation',
    version,
    license: {
      name: 'MIT',
      url: 'https://github.com/vedant1202/react-nodejs-chat-app/blob/master/LICENSE',
    },
  },
  servers: [
    {
      url: `http://localhost:${config.port}/v1`,
    },
  ],
};

module.exports = swaggerDef;
