const httpStatus = require('http-status');
const { Message } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a message
 * @param {Object} messageBody
 * @returns {Promise<Message>}
 */
const createMessage = async (messageBody) => {
  const message = await Message.create(messageBody);
  return message;
};

/**
 * Query for messages
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 500)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryMessages = async (filter, options) => {
  const messages = await Message.paginate(filter, options);
  return messages;
};

/**
 * Get message by id
 * @param {ObjectId} id
 * @returns {Promise<Message>}
 */
const getMessageById = async (id) => {
  return Message.findById(id);
};

/**
 * Get messages by user
 * @param {ObjectId} userId
 * @param {ObjectId} toId
 * @returns {Promise<Message>}
 */
const getMessagesByUserId = async (userId, toId) => {
  return Message.find({
    $or: [
      {
        senderChatID: userId,
        receiverChatID: toId,
      },
      {
        senderChatID: toId,
        receiverChatID: userId,
      },
    ],
  });
};

/**
 * Get messages by user
 * @param {Object} query
 * @returns {Promise<Message>}
 */
const getMessageByQuery = async (query) => {
  return Message.findOne({
    ...query,
  });
};

/**
 * Update message by id
 * @param {ObjectId} messageId
 * @param {Object} updateBody
 * @returns {Promise<Message>}
 */
const updateMessageById = async (messageId, updateBody) => {
  const message = await getMessageById(messageId);
  if (!message) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Message not found');
  }
  Object.assign(message, updateBody);
  await message.save();
  return message;
};

/**
 * Delete message by id
 * @param {ObjectId} messageId
 * @returns {Promise<Message>}
 */
const deleteMessageById = async (messageId) => {
  const message = await getMessageById(messageId);
  if (!message) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Message not found');
  }
  await message.remove();
  return message;
};

module.exports = {
  createMessage,
  queryMessages,
  getMessageById,
  getMessagesByUserId,
  getMessageByQuery,
  updateMessageById,
  deleteMessageById,
};
