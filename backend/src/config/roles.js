const roles = ['user', 'admin'];

const roleRights = new Map();
roleRights.set(roles[0], ['getUsers', 'sendMessages', 'getMessages', 'manageRooms', 'getRooms']);
roleRights.set(roles[1], [
  'getUsers',
  'manageUsers',
  'sendMessages',
  'getMessages',
  'manageMessages',
  'getRooms',
  'manageRooms',
  'createRooms',
]);

module.exports = {
  roles,
  roleRights,
};
