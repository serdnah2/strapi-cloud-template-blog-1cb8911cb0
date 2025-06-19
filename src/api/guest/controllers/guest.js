'use strict';

/**
 * guest controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::guest.guest', ({ strapi }) => ({
  async findByGroupCode(ctx) {
    const { code } = ctx.params;
    
    // Buscar el grupo por código
    const group = await strapi.db.query('api::guest-group.guest-group').findOne({
      where: { code },
      populate: ['guests']
    });

    if (!group) {
      return ctx.notFound('Grupo no encontrado');
    }

    return group;
  },

  async confirmAttendance(ctx) {
    const { guestId } = ctx.params;
    const { is_attending, attending_ceremony, attending_reception, dietary_restrictions, special_requests } = ctx.request.body;

    // Validar que el invitado existe
    const guest = await strapi.entityService.findOne('api::guest.guest', guestId);
    if (!guest) {
      return ctx.notFound('Invitado no encontrado');
    }

    // Actualizar la información del invitado
    const updatedGuest = await strapi.entityService.update('api::guest.guest', guestId, {
      data: {
        is_attending,
        attending_ceremony,
        attending_reception,
        dietary_restrictions,
        special_requests,
        confirmed_at: new Date()
      }
    });

    return updatedGuest;
  }
}));
