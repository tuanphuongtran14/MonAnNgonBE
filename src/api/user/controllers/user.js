'use strict';

/**
 *  user controller
 */

const axios = require('axios');
const utils = require('@strapi/utils');

const { sanitize } = utils;

const sanitizeUser = (user, ctx) => {
  const { auth } = ctx.state;
  const userSchema = strapi.getModel('plugin::users-permissions.user');

  return sanitize.contentAPI.output(user, userSchema, { auth });
};

 module.exports = ({ strapi }) =>  ({
  async create(ctx) {
    try {
      const { accessToken } = ctx.request.body;
      const { data: params } = await axios.default.get(
        'https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        }
      });

      let user = await strapi.db.query('plugin::users-permissions.user').findOne({
        where: { email: params.email },
      });
      //create user if not exists
      if (!user) {
        const role = await strapi.db.query('plugin::users-permissions.role').findOne({
          where: { type: 'authenticated' },
        });
        user = await strapi.db.query('plugin::users-permissions.user').create({
          data: {
            username: params.sub,
            email: params.email,
            fullName: params.name,
            provider: 'google',
            password: null,
            resetPasswordToken: null,
            confirmationToken: null,
            confirmed: true,
            blocked: false,
            role: role.id,
            photoUrl: params.picture,
          },
        });
      }

      ctx.send({
        jwt: strapi.service('plugin::users-permissions.jwt').issue({ id: user.id }),
        user: await sanitizeUser(user, ctx),
      });
    } catch (ex) {
      return ctx.badGateway(ex);
    }
  },
});
