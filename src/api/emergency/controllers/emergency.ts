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

      const appConfig = await strapi.service('api::app-config.app-config').getConfig();
      const notifyAllContactsForDemo = appConfig.emergencyDemoNotifyAllContacts;

      // En producción se respeta el permiso de alerta; en demo se puede notificar a todos.
      const contacts = await strapi.entityService.findMany('api::contact.contact', {
        filters: {
          owner: user.id,
          ...(!notifyAllContactsForDemo && { canReceiveEmergencyAlert: true }),
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
      const failedContacts: Array<{ contactId: string | number; name: string; reason: string }> = [];
      let notificationsSent = 0;
      
      // Preparar IDs de documentos para la relación manyToMany
      const documentIds = emergencyDocuments.map(doc => doc.id);
      
      strapi.log.info('🚨 Creando logs de emergencia para', contacts.length, 'contactos');
      strapi.log.info('📊 Datos recibidos:', { location, latitude, longitude, documentIds });
      
      for (const contact of contacts) {
        try {
          // Preparar datos para el log de emergencia - NO incluir triggeredAt
          // El campo triggeredAt ahora es opcional y se puede omitir
          const logData: any = {
            user: user.id,
            contactNotified: contact.id,
          };
          
          // Agregar location solo si existe
          if (location) {
            logData.location = location;
          }
          
          // Solo agregar latitud y longitud si están definidas y son válidas
          if (latitude !== undefined && latitude !== null && !isNaN(Number(latitude))) {
            logData.latitude = parseFloat(latitude.toString());
          }
          
          if (longitude !== undefined && longitude !== null && !isNaN(Number(longitude))) {
            logData.longitude = parseFloat(longitude.toString());
          }
          
          // Agregar documentos si hay alguno (manyToMany requiere array)
          if (documentIds.length > 0) {
            logData.documentsShared = documentIds;
          }
          
          strapi.log.info('📝 Datos del log antes de crear:', JSON.stringify(logData, null, 2));
          
          // Crear el log sin triggeredAt - dejarlo como NULL o undefined
          const emergencyLog = await strapi.entityService.create('api::emergency-log.emergency-log', {
            data: logData,
            populate: ['user', 'contactNotified', 'documentsShared']
          });

          strapi.log.info('✅ Log de emergencia creado exitosamente:', emergencyLog.id);
          emergencyLogs.push(emergencyLog);

          // Notificar al contacto (usar el servicio correcto)
          try {
            await strapi.service('api::emergency-log.emergency-log').notifyContact(contact, user, emergencyDocuments, {
              location,
              latitude,
              longitude
            });
            notificationsSent += 1;
          } catch (notifyError) {
            strapi.log.error('⚠️ Error al notificar contacto (continuando):', notifyError);
            failedContacts.push({
              contactId: contact.id,
              name: contact.fullName || contact.email || contact.phone || `Contacto ${contact.id}`,
              reason: notifyError instanceof Error ? notifyError.message : 'Error desconocido al notificar',
            });
          }
        } catch (logError: any) {
          strapi.log.error('❌ Error creando log de emergencia:', logError);
          strapi.log.error('❌ Error message:', logError?.message);
          strapi.log.error('❌ Error stack:', logError?.stack);
          strapi.log.error('❌ Error name:', logError?.name);
          failedContacts.push({
            contactId: contact.id,
            name: contact.fullName || contact.email || contact.phone || `Contacto ${contact.id}`,
            reason: logError?.message || 'Error al crear log de emergencia',
          });
        }
      }

      ctx.body = {
        success: true,
        message: 'Emergencia activada exitosamente',
        contactsNotified: contacts.length,
        documentsShared: emergencyDocuments.length,
        emergencyLogs,
        notifyMode: notifyAllContactsForDemo ? 'all_contacts_demo' : 'allowed_contacts_only',
        notificationSummary: {
          attempted: contacts.length,
          sent: notificationsSent,
          failed: failedContacts.length,
          failedContacts,
        },
      };

    } catch (error: any) {
      strapi.log.error('Error al activar emergencia:', error);
      strapi.log.error('Error details:', {
        message: error?.message,
        stack: error?.stack,
        name: error?.name,
        code: error?.code
      });
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
      await strapi.service('api::emergency-log.emergency-log').notifyContact(contact, user, [], {}, message);

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