'use strict';

/**
 * guest router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::guest.guest', {
  config: {
    find: {
      auth: false
    },
    findOne: {
      auth: false
    },
    create: {
      auth: false
    },
    update: {
      auth: false
    },
    delete: {
      auth: false
    },
  },
  only: ['find', 'findOne', 'create', 'update'],
  except: [],
  extends: [
    {
      method: 'GET',
      path: '/guests/group/:code',
      handler: 'guest.findByGroupCode',
      config: {
        auth: false
      }
    },
    {
      method: 'POST',
      path: '/guests/:guestId/confirm',
      handler: 'guest.confirmAttendance',
      config: {
        auth: false
      }
    }
  ]
});
