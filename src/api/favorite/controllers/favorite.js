'use strict';

/**
 *  favorite controller
 */

 const _ = require('lodash');

 module.exports = ({ strapi }) =>  ({
  async create(ctx) {
    try {
      const params = ctx.request.body;
      const user = ctx.state.user;
      params.user = user.id;
      //check if food exists
      const food = await strapi.db.query('api::food.food').findOne({
        where: { id: params.food },
        populate: {
          category: true,
          image: true,
        },
      });
      if (!food) {
        return ctx.notFound('Food not found', 'Food.not.found');
      }

      //check if favorite exists
      const favorite = await strapi.db.query('api::favorite.favorite').findOne({
        where: {
          food: params.food,
          user: user.id,
        },
      });
      if (favorite) {
        return food;
      }

      //create favorite by params
      await strapi.db.query('api::favorite.favorite').create({
        data: params,
      });
      return food;
    } catch (ex) {
      return ctx.badGateway(ex);
    }
  },
  async delete(ctx) {
    const { foodId } = ctx.params;
    const user = ctx.state.user;
    const deletedFavor = await strapi.db.query('api::favorite.favorite').delete({
      where: {
        food: foodId,
        user: user.id,
      },
    });

    return deletedFavor ? true : false;
  }
 });
