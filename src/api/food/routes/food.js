'use strict';

/**
 * food router.
 */

 module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/foods/:id/related',
      handler: 'food.findRelated',
    },
    {
      method: 'GET',
      path: '/foods/:id',
      handler: 'food.findOne',
    },
    {
      method: 'GET',
      path: '/foods',
      handler: 'food.find',
    },
  ]
}

