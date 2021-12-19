'use strict';

const _ = require('lodash');
const { filter, map, pipe, prop } = require('lodash/fp');

const DEFAULT_ROLES = [
  {
    name: 'Admin',
    description: 'Default role given to administrator.',
    type: 'admin',
  },
  {
    name: 'Authenticated',
    description: 'Default role given to authenticated user.',
    type: 'authenticated',
  },
  {
    name: 'Public',
    description: 'Default role given to unauthenticated user.',
    type: 'public',
  },
]
const DEFAULT_PERMISSIONS = [
  //strapi default
  { action: 'plugin::users-permissions.auth.admincallback', roleType: 'public' },
  { action: 'plugin::users-permissions.auth.adminregister', roleType: 'public' },
  { action: 'plugin::users-permissions.auth.callback', roleType: 'public' },
  { action: 'plugin::users-permissions.auth.connect', roleType: null },
  { action: 'plugin::users-permissions.auth.forgotpassword', roleType: 'public' },
  { action: 'plugin::users-permissions.auth.resetpassword', roleType: 'public' },
  { action: 'plugin::users-permissions.auth.register', roleType: 'public' },
  { action: 'plugin::users-permissions.auth.emailconfirmation', roleType: 'public' },
  { action: 'plugin::users-permissions.user.me', roleType: null },

  //category
  { action: 'api::category.category.find', roleType: null },

  //food
  { action: 'api::food.food.find', roleType: null },
  { action: 'api::food.food.findOne', roleType: null },
  { action: 'api::food.food.findRelated', roleType: null },

  //search
  { action: 'api::search.search.find', roleType: null },
];

const transformRoutePrefixFor = pluginName => route => {
  const prefix = route.config && route.config.prefix;
  const path = prefix !== undefined ? `${prefix}${route.path}` : `/${pluginName}${route.path}`;

  return {
    ...route,
    path,
  };
};

module.exports = ({ strapi }) => ({
  getActions({ defaultEnable = false } = {}) {
    const actionMap = {};

    const isContentApi = action => {
      if (!_.has(action, Symbol.for('__type__'))) {
        return false;
      }

      return action[Symbol.for('__type__')].includes('content-api');
    };

    _.forEach(strapi.api, (api, apiName) => {
      const controllers = _.reduce(
        api.controllers,
        (acc, controller, controllerName) => {
          const contentApiActions = _.pickBy(controller, isContentApi);

          if (_.isEmpty(contentApiActions)) {
            return acc;
          }

          acc[controllerName] = _.mapValues(contentApiActions, () => {
            return {
              enabled: defaultEnable,
              policy: '',
            };
          });

          return acc;
        },
        {}
      );

      if (!_.isEmpty(controllers)) {
        actionMap[`api::${apiName}`] = { controllers };
      }
    });

    _.forEach(strapi.plugins, (plugin, pluginName) => {
      const controllers = _.reduce(
        plugin.controllers,
        (acc, controller, controllerName) => {
          const contentApiActions = _.pickBy(controller, isContentApi);

          if (_.isEmpty(contentApiActions)) {
            return acc;
          }

          acc[controllerName] = _.mapValues(contentApiActions, () => {
            return {
              enabled: defaultEnable,
              policy: '',
            };
          });

          return acc;
        },
        {}
      );

      if (!_.isEmpty(controllers)) {
        actionMap[`plugin::${pluginName}`] = { controllers };
      }
    });

    return actionMap;
  },

  async getRoutes() {
    const routesMap = {};

    _.forEach(strapi.api, (api, apiName) => {
      const routes = _.flatMap(api.routes, route => {
        if (_.has(route, 'routes')) {
          return route.routes;
        }

        return route;
      }).filter(route => route.info.type === 'content-api');

      if (routes.length === 0) {
        return;
      }

      routesMap[`api::${apiName}`] = routes.map(route => ({
        ...route,
        path: `/api${route.path}`,
      }));
    });

    _.forEach(strapi.plugins, (plugin, pluginName) => {
      const transformPrefix = transformRoutePrefixFor(pluginName);

      const routes = _.flatMap(plugin.routes, route => {
        if (_.has(route, 'routes')) {
          return route.routes.map(transformPrefix);
        }

        return transformPrefix(route);
      }).filter(route => route.info.type === 'content-api');

      if (routes.length === 0) {
        return;
      }

      routesMap[`plugin::${pluginName}`] = routes.map(route => ({
        ...route,
        path: `/api${route.path}`,
      }));
    });

    return routesMap;
  },

  async syncPermissions() {
    const roles = await strapi.query('plugin::users-permissions.role').findMany();
    const dbPermissions = await strapi.query('plugin::users-permissions.permission').findMany();

    const permissionsFoundInDB = _.uniq(_.map(dbPermissions, 'action'));

    const appActions = _.flatMap(strapi.api, (api, apiName) => {
      return _.flatMap(api.controllers, (controller, controllerName) => {
        return _.keys(controller).map(actionName => {
          return `api::${apiName}.${controllerName}.${actionName}`;
        });
      });
    });

    const pluginsActions = _.flatMap(strapi.plugins, (plugin, pluginName) => {
      return _.flatMap(plugin.controllers, (controller, controllerName) => {
        return _.keys(controller).map(actionName => {
          return `plugin::${pluginName}.${controllerName}.${actionName}`;
        });
      });
    });

    const allActions = [...appActions, ...pluginsActions];

    const toDelete = _.difference(permissionsFoundInDB, allActions);

    await Promise.all(
      toDelete.map(action => {
        return strapi.query('plugin::users-permissions.permission').delete({ where: { action } });
      })
    );

    if (strapi.config.environment === 'development' || permissionsFoundInDB.length === 0) {
      // create default permissions
      for (const role of roles) {
        const toCreate = pipe(
          filter(({ roleType }) => roleType === role.type || roleType === null),
          map(prop('action'))
        )(DEFAULT_PERMISSIONS);

        await Promise.all(
          toCreate.map(action => {
            return strapi.query('plugin::users-permissions.permission').create({
              data: {
                action,
                role: role.id,
              },
            });
          })
        );
      }
    }
  },

  async initialize() {
    //create default roles if none exist
    let adminRole;
    const roleCount = await strapi.query('plugin::users-permissions.role').count();
    if (roleCount === 0) {
      const roles = await Promise.all(
        DEFAULT_ROLES.map((data) =>
          strapi.query('plugin::users-permissions.role').create({
            data,
          })
        )
      );
      adminRole = roles.find((role) => role.type === 'admin');
    } else {
      adminRole  = await strapi.query('plugin::users-permissions.role').findOne({
        where: { type: 'admin' },
      });
    }

    //create default admin user if none exists
    const params = {
      username: process.env.ADMIN_USER || 'admin',
      password: process.env.ADMIN_PASSWORD || '123456Abc',
      email: process.env.ADMIN_EMAIL || 'monanngon.uit@gmail.com',
      role: adminRole.id,
    };
    const admin = await strapi.query('plugin::users-permissions.user').findOne({
      where: {
        username: params.username,
        email: params.email,
        role: adminRole.id,
      }
    });
    if (!admin) {
      await strapi.query('plugin::users-permissions.user').create({
        data: {
          ...params,
          confirmed: true,
          provider: 'local',
        },
      });
    }

    return strapi.service('plugin::users-permissions.users-permissions').syncPermissions();
  },

  async updateUserRole(user, role) {
    return strapi
      .query('plugin::users-permissions.user')
      .update({ where: { id: user.id }, data: { role } });
  },

  template(layout, data) {
    const compiledObject = _.template(layout);
    return compiledObject(data);
  },
});
