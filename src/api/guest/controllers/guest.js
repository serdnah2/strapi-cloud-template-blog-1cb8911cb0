'use strict';

/**
 * guest controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::guest.guest', ({ strapi }) => ({
  async findByGroupCode(ctx) {
    const { code } = ctx.params;
    
    try {
      // Usar la API de Strapi directamente
      const groups = await strapi.entityService.findMany('api::guest-group.guest-group', {
        filters: { code },
        populate: {
          guests: {
            fields: ['id', 'name']
          }
        }
      });
      
      const group = groups[0]; // Tomar el primer grupo que coincida

      if (!group) {
        return ctx.notFound('Grupo no encontrado');
      }
      
      // Usar un Map para eliminar duplicados por ID
      const guestsMap = new Map();
      
      if (Array.isArray(group.guests)) {
        group.guests.forEach(guest => {
          if (guest && guest.id) {
            guestsMap.set(guest.id, {
              id: guest.id,
              name: guest.name || ''
            });
          }
        });
      }
      
      // Convertir el Map de vuelta a array
      const uniqueGuests = Array.from(guestsMap.values());

      return {
        id: group.id,
        name: group.name || '',
        is_attending: Boolean(group.is_attending),
        dietary_restrictions: group.dietary_restrictions || null,
        special_requests: group.special_requests || null,
        guests: uniqueGuests,
        has_responded: Boolean(group.has_responded)
      };
    } catch (error) {
      console.error('Error en findByGroupCode:', error);
      return ctx.internalServerError('Error al procesar la solicitud');
    }
  },

  async confirmAttendance(ctx) {
    const { groupId } = ctx.params;
    const { is_attending, dietary_restrictions, special_requests } = ctx.request.body;

    try {
      // Primero actualizar el grupo
      const updatedGroup = await strapi.entityService.update('api::guest-group.guest-group', groupId, {
        data: {
          is_attending: Boolean(is_attending),
          dietary_restrictions: dietary_restrictions || null,
          special_requests: special_requests || null,
          has_responded: true
        }
      });

      // Luego obtener el grupo con los invitados
      const groupWithGuests = await strapi.entityService.findOne('api::guest-group.guest-group', groupId, {
        populate: ['guests']
      });

      if (!groupWithGuests) {
        return ctx.notFound('Grupo no encontrado después de actualizar');
      }

      // Procesar los invitados
      const uniqueGuests = [];
      const guestIds = new Set();
      
      if (Array.isArray(groupWithGuests.guests)) {
        groupWithGuests.guests.forEach(guest => {
          if (guest && guest.id && !guestIds.has(guest.id)) {
            guestIds.add(guest.id);
            uniqueGuests.push({
              id: guest.id,
              name: guest.name || ''
            });
          }
        });
      }

      // Retornar la información actualizada
      return {
        id: updatedGroup.id,
        name: updatedGroup.name || '',
        is_attending: Boolean(updatedGroup.is_attending),
        dietary_restrictions: updatedGroup.dietary_restrictions || null,
        has_responded: Boolean(updatedGroup.has_responded),
        special_requests: updatedGroup.special_requests || null,
        guests: uniqueGuests
      };
    } catch (error) {
      console.error('Error en confirmAttendance:', error);
      return ctx.internalServerError('Error al actualizar la confirmación');
    }
  }
}));
