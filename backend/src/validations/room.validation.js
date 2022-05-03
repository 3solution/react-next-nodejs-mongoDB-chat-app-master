const Joi = require('@hapi/joi');
const { objectId } = require('./custom.validation');

const createRoom = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    userlist: Joi.array().required(),
    placed: Joi.array(),
    createdBy: Joi.string().required(),
    counter: Joi.number(),
  }),
};

const getRoom = {
  params: Joi.object().keys({
    roomId: Joi.string().custom(objectId),
  }),
};

const getRoomsByUserId = {
  params: Joi.object().keys({
    userId: Joi.string().required(),
  }),
};

const updateRoom = {
  params: Joi.object().keys({
    roomId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string().required(),
      userlist: Joi.array(),
      placed: Joi.array().required(),
      createdBy: Joi.string().required(),
      counter: Joi.number().required(),
    })
    .min(1),
};

const deleteRoom = {
  params: Joi.object().keys({
    roomId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createRoom,
  getRoomsByUserId,
  getRoom,
  updateRoom,
  deleteRoom,
};
