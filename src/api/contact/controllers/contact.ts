import { factories } from '@strapi/strapi';

const getContactPayload = (body: any) => body?.data || body || {};
const getDigits = (phone?: string) => String(phone || '').replace(/\D/g, '');
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const normalizeBoolean = (value: any, fallback: boolean) => {
  if (value === undefined || value === null) return fallback;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  return Boolean(value);
};

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

      const { fullName, phone, email, relationship, canReceiveEmergencyAlert, canViewSharedDocs } = getContactPayload(ctx.request.body);
      const cleanFullName = String(fullName || '').trim();
      const cleanPhone = String(phone || '').trim();
      const cleanEmail = String(email || '').trim();
      const cleanRelationship = String(relationship || '').trim();

      if (!cleanFullName || !cleanPhone || !cleanRelationship) {
        return ctx.badRequest('Nombre completo, teléfono y relación son requeridos');
      }

      if (getDigits(cleanPhone).length < 10) {
        return ctx.badRequest('Ingresa un teléfono válido con al menos 10 dígitos');
      }

      if (cleanEmail && !isValidEmail(cleanEmail)) {
        return ctx.badRequest('Ingresa un email válido o deja el campo vacío');
      }

      const contact = await strapi.entityService.create('api::contact.contact', {
        data: {
          fullName: cleanFullName,
          phone: cleanPhone,
          ...(cleanEmail && { email: cleanEmail }),
          relationship: cleanRelationship,
          canReceiveEmergencyAlert: normalizeBoolean(canReceiveEmergencyAlert, true),
          canViewSharedDocs: normalizeBoolean(canViewSharedDocs, false),
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

      const { fullName, phone, email, relationship, canReceiveEmergencyAlert, canViewSharedDocs } = getContactPayload(ctx.request.body);
      const data: any = {};

      if (fullName !== undefined) {
        const cleanFullName = String(fullName || '').trim();
        if (!cleanFullName) return ctx.badRequest('Nombre completo es requerido');
        data.fullName = cleanFullName;
      }

      if (phone !== undefined) {
        const cleanPhone = String(phone || '').trim();
        if (getDigits(cleanPhone).length < 10) {
          return ctx.badRequest('Ingresa un teléfono válido con al menos 10 dígitos');
        }
        data.phone = cleanPhone;
      }

      if (email !== undefined) {
        const cleanEmail = String(email || '').trim();
        if (cleanEmail && !isValidEmail(cleanEmail)) {
          return ctx.badRequest('Ingresa un email válido o deja el campo vacío');
        }
        data.email = cleanEmail || null;
      }

      if (relationship !== undefined) {
        const cleanRelationship = String(relationship || '').trim();
        if (!cleanRelationship) return ctx.badRequest('Relación es requerida');
        data.relationship = cleanRelationship;
      }

      if (canReceiveEmergencyAlert !== undefined) {
        data.canReceiveEmergencyAlert = normalizeBoolean(canReceiveEmergencyAlert, true);
      }

      if (canViewSharedDocs !== undefined) {
        data.canViewSharedDocs = normalizeBoolean(canViewSharedDocs, false);
      }

      const contact = await strapi.entityService.update('api::contact.contact', id, {
        data
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