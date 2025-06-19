'use strict';

/**
 * guest router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = {
  routes: [
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
};
