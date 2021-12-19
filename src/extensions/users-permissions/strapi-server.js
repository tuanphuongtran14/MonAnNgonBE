const usersPermissions = require('./services/users-permissions');

module.exports = (plugin) => {
  plugin.services['users-permissions'] = usersPermissions;
  return plugin;
};
