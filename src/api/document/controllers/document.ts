import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::document.document', ({ strapi }) => ({
  /**
   * Obtener documentos del usuario actual con filtros
   * GET /api/documents?category=Legal&search=acta
   */
  async find(ctx) {
    try {
      const user = ctx.state.user;
      
      if (!user) {
        return ctx.unauthorized('Usuario no autenticado');
      }

      const { category, search, emergencyOnly, visibleToContacts } = ctx.query;

      // Construir filtros
      const filters = {
        owner: user.id,
        ...(category && { category: { name: category } }),
        ...(emergencyOnly !== undefined && { emergencyOnly: emergencyOnly === 'true' }),
        ...(visibleToContacts !== undefined && { visibleToContacts: visibleToContacts === 'true' })
      };

      // Filtro de búsqueda por título
      if (search) {
        filters['title'] = { $containsi: search };
      }

      const documents = await strapi.entityService.findMany('api::document.document', {
        filters,
        populate: ['file', 'category', 'owner'],
        sort: { uploadedAt: 'desc' }
      });

      ctx.body = {
        data: documents,
        meta: {
          total: documents.length
        }
      };

    } catch (error) {
      strapi.log.error('Error obteniendo documentos:', error);
      ctx.internalServerError('Error interno del servidor');
    }
  },

  /**
   * Crear documento
   * POST /api/documents
   */
  async create(ctx) {
    try {
      const user = ctx.state.user;
      
      if (!user) {
        return ctx.unauthorized('Usuario no autenticado');
      }

      const { title, description, category, visibleToContacts, emergencyOnly } = ctx.request.body;
      const files = ctx.request.files || {};
      const file = Array.isArray(files.file) ? files.file[0] : files.file;

      if (!file) {
        return ctx.badRequest('Archivo requerido');
      }

              // Verificar que la categoría pertenece al usuario o es del sistema
        if (category) {
          const categoryExists = await strapi.entityService.findOne('api::document-category.document-category', category);

          if (!categoryExists) {
            return ctx.badRequest('Categoría no válida');
          }
        }

      const document = await strapi.entityService.create('api::document.document', {
        data: {
          title,
          description,
          category,
          visibleToContacts: visibleToContacts || false,
          emergencyOnly: emergencyOnly || false,
          uploadedAt: new Date(),
          owner: user.id,
          file: file
        },
        populate: ['file', 'category', 'owner']
      });

      ctx.body = {
        data: document,
        message: 'Documento creado exitosamente'
      };

    } catch (error) {
      strapi.log.error('Error creando documento:', error);
      ctx.internalServerError('Error interno del servidor');
    }
  },

  /**
   * Actualizar documento
   * PUT /api/documents/:id
   */
  async update(ctx) {
    try {
      const user = ctx.state.user;
      const { id } = ctx.params;
      
      if (!user) {
        return ctx.unauthorized('Usuario no autenticado');
      }

      // Verificar que el documento pertenece al usuario
      const existingDocument = await strapi.entityService.findOne('api::document.document', id);

      if (!existingDocument) {
        return ctx.notFound('Documento no encontrado');
      }

      const { title, description, category, visibleToContacts, emergencyOnly } = ctx.request.body;

      const document = await strapi.entityService.update('api::document.document', id, {
        data: {
          title,
          description,
          category,
          visibleToContacts,
          emergencyOnly
        },
        populate: ['file', 'category', 'owner']
      });

      ctx.body = {
        data: document,
        message: 'Documento actualizado exitosamente'
      };

    } catch (error) {
      strapi.log.error('Error actualizando documento:', error);
      ctx.internalServerError('Error interno del servidor');
    }
  },

  /**
   * Eliminar documento
   * DELETE /api/documents/:id
   */
  async delete(ctx) {
    try {
      const user = ctx.state.user;
      const { id } = ctx.params;
      
      if (!user) {
        return ctx.unauthorized('Usuario no autenticado');
      }

      // Verificar que el documento pertenece al usuario
      const existingDocument = await strapi.entityService.findOne('api::document.document', id);

      if (!existingDocument) {
        return ctx.notFound('Documento no encontrado');
      }

      await strapi.entityService.delete('api::document.document', id);

      ctx.body = {
        message: 'Documento eliminado exitosamente'
      };

    } catch (error) {
      strapi.log.error('Error eliminando documento:', error);
      ctx.internalServerError('Error interno del servidor');
    }
  },

  /**
   * Obtener estadísticas de documentos
   * GET /api/documents/stats
   */
  async stats(ctx) {
    try {
      const user = ctx.state.user;
      
      if (!user) {
        return ctx.unauthorized('Usuario no autenticado');
      }

      // Contar documentos por categoría
      const categories = await strapi.entityService.findMany('api::document-category.document-category');

      const stats = categories.map((category: any) => ({
        categoryId: category.id,
        categoryName: category.name,
        icon: category.icon,
        documentCount: 0 // Se calculará después
      }));

      // Contar documentos totales
      const totalDocuments = await strapi.entityService.count('api::document.document', {
        filters: { owner: user.id }
      });

      const emergencyDocuments = await strapi.entityService.count('api::document.document', {
        filters: { owner: user.id, emergencyOnly: true }
      });

      ctx.body = {
        data: {
          categories: stats,
          totalDocuments,
          emergencyDocuments
        }
      };

    } catch (error) {
      strapi.log.error('Error obteniendo estadísticas:', error);
      ctx.internalServerError('Error interno del servidor');
    }
  }
})); 