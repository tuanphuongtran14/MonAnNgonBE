'use strict';

/**
 *  search controller
 */

 module.exports = ({ strapi }) =>  ({
  async find(ctx) {
    try {
      const params = ctx.query;
      const page = await strapi.service('api::search.search').find(params);
      return page;
    } catch (ex) {
      return ctx.badGateway(ex);
    }
  },
});
