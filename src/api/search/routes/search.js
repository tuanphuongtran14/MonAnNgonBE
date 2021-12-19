'use strict';

/**
 * search router.
 */

 module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/searches',
      handler: 'search.find',
    },
  ]
}
