'use strict';

/**
 * favorite router.
 */

 module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/favorites',
      handler: 'favorite.create',
    },
    {
      method: 'DELETE',
      path: '/favorites/:foodId',
      handler: 'favorite.delete',
    },
  ]
}

