import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::contact.contact', ({ strapi }) => ({
  /**
   * Crear contacto
   * POST /api/contacts
   */
  async create(ctx) {
    try {
      const user = ctx.state.user;
      
      if (!user) {
        return ctx.unauthorized('Usuario no autenticado');
      }

      const { fullName, phone, email, relationship, canReceiveEmergencyAlert, canViewSharedDocs } = ctx.request.body;

      if (!fullName || !phone || !relationship) {
        return ctx.badRequest('Nombre completo, teléfono y relación son requeridos');
      }

      const contact = await strapi.entityService.create('api::contact.contact', {
        data: {
          fullName,
          phone,
          email,
          relationship,
          canReceiveEmergencyAlert: canReceiveEmergencyAlert ?? true,
          canViewSharedDocs: canViewSharedDocs ?? false,
          owner: user.id
        }
      });

      ctx.body = {
        data: contact
      };

    } catch (error) {
      strapi.log.error('Error creando contacto:', error);
      ctx.internalServerError('Error interno del servidor');
    }
  },

  /**
   * Obtener contactos del usuario
   * GET /api/contacts
   */
  async find(ctx) {
    try {
      const user = ctx.state.user;
      
      if (!user) {
        return ctx.unauthorized('Usuario no autenticado');
      }

      const contacts = await strapi.db.query('api::contact.contact').findMany({
        where: {
          owner: user.id
        },
        orderBy: { createdAt: 'desc' }
      });

      ctx.body = {
        data: contacts
      };

    } catch (error) {
      strapi.log.error('Error obteniendo contactos:', error);
      ctx.internalServerError('Error interno del servidor');
    }
  },

  /**
   * Obtener contacto por ID
   * GET /api/contacts/:id
   */
  async findOne(ctx) {
    try {
      const user = ctx.state.user;
      const { id } = ctx.params;
      
      if (!user) {
        return ctx.unauthorized('Usuario no autenticado');
      }

      const contact = await strapi.db.query('api::contact.contact').findOne({
        where: {
          id: id,
          owner: user.id
        }
      });

      if (!contact) {
        return ctx.notFound('Contacto no encontrado');
      }

      ctx.body = {
        data: contact
      };

    } catch (error) {
      strapi.log.error('Error obteniendo contacto:', error);
      ctx.internalServerError('Error interno del servidor');
    }
  },

  /**
   * Actualizar contacto
   * PUT /api/contacts/:id
   */
  async update(ctx) {
    try {
      const user = ctx.state.user;
      const { id } = ctx.params;
      
      if (!user) {
        return ctx.unauthorized('Usuario no autenticado');
      }

      // Verificar que el contacto pertenece al usuario
      const existingContact = await strapi.db.query('api::contact.contact').findOne({
        where: {
          id: id,
          owner: user.id
        }
      });

      if (!existingContact) {
        return ctx.notFound('Contacto no encontrado');
      }

      const { fullName, phone, email, relationship, canReceiveEmergencyAlert, canViewSharedDocs } = ctx.request.body;

      const contact = await strapi.entityService.update('api::contact.contact', id, {
        data: {
          fullName,
          phone,
          email,
          relationship,
          canReceiveEmergencyAlert,
          canViewSharedDocs
        }
      });

      ctx.body = {
        data: contact
      };

    } catch (error) {
      strapi.log.error('Error actualizando contacto:', error);
      ctx.internalServerError('Error interno del servidor');
    }
  },

  /**
   * Eliminar contacto
   * DELETE /api/contacts/:id
   */
  async delete(ctx) {
    try {
      const user = ctx.state.user;
      const { id } = ctx.params;
      
      if (!user) {
        return ctx.unauthorized('Usuario no autenticado');
      }

      // Verificar que el contacto pertenece al usuario
      const existingContact = await strapi.db.query('api::contact.contact').findOne({
        where: {
          id: id,
          owner: user.id
        }
      });

      if (!existingContact) {
        return ctx.notFound('Contacto no encontrado');
      }

      await strapi.entityService.delete('api::contact.contact', id);

      ctx.body = {
        message: 'Contacto eliminado exitosamente'
      };

    } catch (error) {
      strapi.log.error('Error eliminando contacto:', error);
      ctx.internalServerError('Error interno del servidor');
    }
  }
})); 