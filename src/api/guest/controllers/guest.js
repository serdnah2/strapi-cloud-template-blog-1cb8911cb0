'use strict';

/**
 * guest controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::guest.guest', ({ strapi }) => ({
  async findByGroupCode(ctx) {
    const { code } = ctx.params;
    
    try {
      // Buscar el grupo por código con sus invitados, asegurando que no haya duplicados
      const group = await strapi.db.query('api::guest-group.guest-group').findOne({
        where: { code },
        populate: {
          guests: {
            select: ['id', 'name', 'email', 'phone'],
            where: { guest_group: { code } },
            orderBy: { id: 'asc' },
            distinct: ['id']
          }
        }
      });

      if (!group) {
        return ctx.notFound('Grupo no encontrado');
      }

      // Usar un Set para asegurar que no haya invitados duplicados
      const uniqueGuests = [];
      const guestIds = new Set();
      
      group.guests.forEach(guest => {
        if (!guestIds.has(guest.id)) {
          guestIds.add(guest.id);
          uniqueGuests.push({
            id: guest.id,
            name: guest.name,
            email: guest.email,
            phone: guest.phone
          });
        }
      });

      // Retornar la información del grupo con invitados únicos
      return {
        id: group.id,
        name: group.name,
        is_attending: group.is_attending,
        dietary_restrictions: group.dietary_restrictions,
        special_requests: group.special_requests,
        guests: uniqueGuests
      };
    } catch (error) {
      return ctx.internalServerError('Error al procesar la solicitud');
    }
  },

  async confirmAttendance(ctx) {
    const { groupId } = ctx.params;
    const { is_attending, dietary_restrictions, special_requests } = ctx.request.body;

    // Validar que el grupo existe
    const group = await strapi.entityService.findOne('api::guest-group.guest-group', groupId, {
      populate: ['guests']
    });
    
    if (!group) {
      return ctx.notFound('Grupo no encontrado');
    }

    // Actualizar los datos del grupo
    const updatedGroup = await strapi.entityService.update('api::guest-group.guest-group', groupId, {
      data: {
        is_attending: Boolean(is_attending),
        dietary_restrictions: dietary_restrictions || null,
        special_requests: special_requests || null
      },
      populate: ['guests']
    });

    // Enviar correo de confirmación si hay un email en el grupo
    // Esto es opcional, puedes implementarlo más adelante
    // await this.sendConfirmationEmail(updatedGroup);

    // Retornar la información actualizada
    return {
      id: updatedGroup.id,
      name: updatedGroup.name,
      is_attending: updatedGroup.is_attending,
      dietary_restrictions: updatedGroup.dietary_restrictions,
      special_restrictions: updatedGroup.special_requests,
      guests: updatedGroup.guests.map(guest => ({
        id: guest.id,
        name: guest.name,
        email: guest.email,
        phone: guest.phone
      }))
    };
  }
}));
