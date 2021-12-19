'use strict';

/**
 * category router.
 */

 module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/categories',
      handler: 'category.find',
    },
  ]
}
