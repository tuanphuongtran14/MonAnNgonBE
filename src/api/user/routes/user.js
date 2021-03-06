'use strict';

/**
 * user router.
 */

 module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/users',
      handler: 'user.create',
    },
    {
      method: 'GET',
      path: '/users/favorite',
      handler: 'user.getFavorites',
    },
  ]
}
