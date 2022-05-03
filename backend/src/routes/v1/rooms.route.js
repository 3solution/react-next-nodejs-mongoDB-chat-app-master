const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const roomValidation = require('../../validations/room.validation');
const roomController = require('../../controllers/room.controller');

const router = express.Router();

router.route('/').post(auth('createRooms'), validate(roomValidation.createRoom), roomController.createRoom);

router
  .route('/getRooms/:userId')
  .get(auth('getRooms'), validate(roomValidation.getRoomsByUserId), roomController.getRoomsByUserId);

router
  .route('/manage/:roomId')
  .get(auth('getRooms'), validate(roomValidation.getRoom), roomController.getRoom)
  .post(auth('manageRooms'), validate(roomValidation.updateRoom), roomController.updateRoom);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Rooms
 *   description: Room management and retrieval
 */

/**
 * @swagger
 * path:
 *  /rooms:
 *    post:
 *      summary: Create a room
 *      description: All admin users can create a room.
 *      tags: [Rooms]
 *      security:
 *        - bearerAuth: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 userlist:
 *                   type: array
 *                 createdBy:
 *                   type: string
 *                 placed:
 *                   type: array
 *                 counter:
 *                   type: number
 *                   default: 0
 *               example:
 *                 name: sample room
 *                 counter: 0
 *                 userlist: [5rebc534954b54139706d920, 5rebc534954b54139706d943]
 *                 placed: []
 *                 createdBy: 8rebc534954b54139706d948
 *      responses:
 *        "201":
 *          description: Created
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/Room'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *
 */

/**
 * @swagger
 * path:
 *  /rooms/getRooms/{userId}:
 *    get:
 *      summary: Get rooms associated with a user.
 *      description: Logged in users can fetch only their own rooms in their rooms.
 *      tags: [Rooms]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: query
 *          name: userId
 *          required: true
 *          schema:
 *            type: string
 *          description: User id of logged in user
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/Room'
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
 *  /rooms/manage/{roomId}:
 *    get:
 *      summary: Get room from room id.
 *      description: Logged in users can fetch only their associated rooms.
 *      tags: [Rooms]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: query
 *          name: roomId
 *          required: true
 *          schema:
 *            type: string
 *          description: Room id of room
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/Room'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *        "404":
 *          $ref: '#/components/responses/NotFound'
 *    post:
 *      summary: Update a room
 *      description: Only users associated with rooms can update them.
 *      tags: [Rooms]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: roomId
 *          required: true
 *          schema:
 *            type: string
 *          description: Room id
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 createdBy:
 *                   type: string
 *                 userlist:
 *                   type: array
 *                 placed:
 *                   type: array
 *                 counter:
 *                   type: number
 *               example:
 *                 name: sample name
 *                 createdBy: 5ebbc534954b54139706d913
 *                 placed: []
 *                 userlist: [5rebc534954b54139706d920, 5rebc534954b54139706d943]
 *                 counter: 0
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/Room'
 *        "400":
 *          $ref: '#/components/responses/DuplicateEmail'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *        "404":
 *          $ref: '#/components/responses/NotFound'
 *
 */
