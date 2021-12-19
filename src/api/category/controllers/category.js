'use strict';

/**
 *  category controller
 */

const _ = require('lodash');

module.exports = ({ strapi }) =>  ({
  async find(ctx) {
    try {
      const params = ctx.query;
      if (!params.populate) {
        params.populate = 'image';
      }
      const page = await strapi.service('api::category.category').find(params);
      if (!_.isEmpty(page.results)) {
        page.results.forEach((item) => {
          item.foodCount = 0;
        });
      }
      return page;
    } catch (ex) {
      return ctx.badGateway(ex);
    }
  },
});
