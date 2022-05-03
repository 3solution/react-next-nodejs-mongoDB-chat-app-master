const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const messageValidation = require('../../validations/message.validation');
const messageController = require('../../controllers/message.controller');

const router = express.Router();

router
  .route('/')
  .post(auth('sendMessages'), validate(messageValidation.createMessage), messageController.createMessage)
  .get(auth('getMessages'), validate(messageValidation.getMessagesByUserId), messageController.getMessagesByUserId);

router
  .route('/:messageId')
  .get(auth('getMessages'), validate(messageValidation.getMessage), messageController.getMessage)
  .patch(auth('manageMessages'), validate(messageValidation.updateMessage), messageController.updateMessage)
  .delete(auth('manageMessages'), validate(messageValidation.deleteMessage), messageController.deleteMessage);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: Message management and retrieval
 */

/**
 * @swagger
 * path:
 *  /messages:
 *    post:
 *      summary: Create a message
 *      description: All users can create a message.
 *      tags: [Messages]
 *      security:
 *        - bearerAuth: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *               type: object
 *               properties:
 *                 text:
 *                   type: string
 *                 from:
 *                   type: string
 *                 senderChatID:
 *                   type: string
 *                 receiverChatID:
 *                   type: string
 *               example:
 *                 text: hello
 *                 from: fake name
 *                 senderChatID: 5rebc534954b54139706d920
 *                 receiverChatID: 5rebc534954b54139706d943
 *      responses:
 *        "201":
 *          description: Created
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/Message'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *
 */

/**
 * @swagger
 * path:
 *  /messages/{userId}/{toId}:
 *    get:
 *      summary: Get messages from a room.
 *      description: Logged in users can fetch only their own messages in their rooms.
 *      tags: [Messages]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: query
 *          name: userId
 *          required: true
 *          schema:
 *            type: string
 *          description: User id of 'from'
 *        - in: query
 *          name: toId
 *          required: true
 *          schema:
 *            type: string
 *          description: User id of 'to'
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/Message'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *        "404":
 *          $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * path:
 *  /messages/{id}:
 *    patch:
 *      summary: Update a message
 *      description: Logged in messages can only update their own messages. Only admins can update other messages.
 *      tags: [Messages]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: Message id
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 text:
 *                   type: string
 *                 from:
 *                   type: string
 *                 senderChatID:
 *                   type: string
 *                 receiverChatID:
 *                   type: string
 *               example:
 *                 id: 5ebbc534954b54139706d913
 *                 text: hello
 *                 from: fake name
 *                 senderChatID: 5rebc534954b54139706d920
 *                 receiverChatID: 5rebc534954b54139706d943
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/Message'
 *        "400":
 *          $ref: '#/components/responses/DuplicateEmail'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *        "404":
 *          $ref: '#/components/responses/NotFound'
 *
 *    delete:
 *      summary: Delete a message
 *      description: Logged in messages can delete only their messages. Only admins can delete other messages.
 *      tags: [Messages]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: Message id
 *      responses:
 *        "200":
 *          description: No content
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *        "404":
 *          $ref: '#/components/responses/NotFound'
 */
