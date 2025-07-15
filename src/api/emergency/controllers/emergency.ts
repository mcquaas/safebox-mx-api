import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::emergency-log.emergency-log', ({ strapi }) => ({
  /**
   * Activar emergencia
   * POST /api/emergency/trigger
   */
  async trigger(ctx) {
    try {
      const user = ctx.state.user;
      
      if (!user) {
        return ctx.unauthorized('Usuario no autenticado');
      }

      const { location, latitude, longitude, emergencyPin } = ctx.request.body;

      // Verificar PIN de emergencia si se proporciona
      if (emergencyPin && user.emergencyPin !== emergencyPin) {
        return ctx.unauthorized('PIN de emergencia incorrecto');
      }

      // Obtener contactos que pueden recibir alertas de emergencia
      const contacts = await strapi.entityService.findMany('api::contact.contact', {
        filters: {
          owner: user.id,
          canReceiveEmergencyAlert: true
        }
      });

      if (contacts.length === 0) {
        return ctx.badRequest('No hay contactos de emergencia configurados');
      }

      // Obtener documentos marcados para emergencia
      const emergencyDocuments = await strapi.entityService.findMany('api::document.document', {
        filters: {
          owner: user.id,
          emergencyOnly: true
        },
        populate: ['file', 'category']
      });

      // Crear logs de emergencia para cada contacto notificado
      const emergencyLogs = [];
      
      for (const contact of contacts) {
        const emergencyLog = await strapi.entityService.create('api::emergency-log.emergency-log', {
          data: {
            user: user.id,
            contactNotified: contact.id,
            location,
            latitude,
            longitude,
            documentsShared: emergencyDocuments.length > 0 ? emergencyDocuments[0].id : null
          }
        });

        emergencyLogs.push(emergencyLog);

        // Notificar al contacto (implementar servicio de notificación)
        await strapi.service('api::emergency.emergency').notifyContact(contact, user, emergencyDocuments, {
          location,
          latitude,
          longitude
        });
      }

      ctx.body = {
        success: true,
        message: 'Emergencia activada exitosamente',
        contactsNotified: contacts.length,
        documentsShared: emergencyDocuments.length,
        emergencyLogs
      };

    } catch (error) {
      strapi.log.error('Error al activar emergencia:', error);
      ctx.internalServerError('Error interno del servidor');
    }
  },

  /**
   * Notificar contacto manualmente
   * POST /api/emergency/notify/:contactId
   */
  async notifyContact(ctx) {
    try {
      const user = ctx.state.user;
      const { contactId } = ctx.params;
      const { message } = ctx.request.body;

      if (!user) {
        return ctx.unauthorized('Usuario no autenticado');
      }

      // Verificar que el contacto pertenece al usuario
      const contact = await strapi.entityService.findOne('api::contact.contact', contactId);

      if (!contact) {
        return ctx.notFound('Contacto no encontrado');
      }

      // Enviar notificación
      await strapi.service('api::emergency.emergency').notifyContact(contact, user, [], {}, message);

      ctx.body = {
        success: true,
        message: 'Contacto notificado exitosamente'
      };

    } catch (error) {
      strapi.log.error('Error al notificar contacto:', error);
      ctx.internalServerError('Error interno del servidor');
    }
  }
})); 