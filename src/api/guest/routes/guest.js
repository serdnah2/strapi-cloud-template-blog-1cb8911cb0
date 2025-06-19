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
      path: '/invitation/:code',
      handler: 'guest.findByGroupCode',
      config: {
        auth: false,
        description: 'Obtener los detalles de una invitación por su código',
        tags: ['invitation']
      }
    },
    {
      method: 'POST',
      path: '/invitation/:groupId/confirm',
      handler: 'guest.confirmAttendance',
      config: {
        auth: false,
        description: 'Confirmar asistencia para un grupo de invitados',
        tags: ['invitation']
      }
    }
  ]
});
