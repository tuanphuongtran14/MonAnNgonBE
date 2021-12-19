'use strict';

/**
 *  food controller
 */

const _ = require('lodash');
const { marked } = require('marked');

const renderer = {
  list(body) {
    return body;
  },
  listitem(text) {
    return `– ${text} <br />`;
  },
};

marked.use({ renderer });

module.exports = ({ strapi }) =>  ({
  async find(ctx) {
    try {
      const params = ctx.query;
      if (!params.populate) {
        params.populate = 'category,image';
      }
      const page = await strapi.service('api::food.food').find(params);
      if (!_.isEmpty(page.results)) {
        page.results.forEach((item) => {
          item.instruction = marked.parse(item.instruction);
          item.ingredients = marked.parse(item.ingredients);
        });
      }

      return page;
    } catch (ex) {
      return ctx.badGateway(ex);
    }
  },
  async findOne(ctx) {
    try {
      const { id } = ctx.params;
      const food = await strapi.service('api::food.food').findOne(id, {
        populate: 'category,image',
      });
      food.instruction = marked.parse(food.instruction);
      food.ingredients = marked.parse(food.ingredients);
      return food;
    } catch (ex) {
      return ctx.badGateway(ex);
    }
  },
  async findRelated(ctx) {
    try {
      const { id } = ctx.params;
      const food = await strapi.service('api::food.food').findOne(id, {
        populate: 'category',
      });
      console.log(food);
      const params = {
        filters: {
          category: food.category.id,
          id: {
            $ne: food.id,
          },
        },
        populate: 'category',
      };
      console.log(params);
      const relatedFoods = await strapi.service('api::food.food').find(params);
      return relatedFoods;
    } catch (ex) {
      return ctx.badGateway(ex);
    }
  },
});

