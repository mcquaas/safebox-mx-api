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

      // Ensure category.country is populated - Strapi might not include it by default
      // IMPORTANTE: Siempre obtener la categoría completa para asegurar que el campo country esté presente
      for (const doc of documents as any[]) {
        if (doc.category && doc.category.id) {
          // Always fetch full category to ensure country is included
          const fullCategory = await strapi.entityService.findOne('api::document-category.document-category', doc.category.id);
          if (fullCategory) {
            // Actualizar todos los campos de la categoría
            doc.category.country = (fullCategory as any).country;
            doc.category.description = (fullCategory as any).description;
            doc.category.name = fullCategory.name;
            doc.category.icon = fullCategory.icon;
            
            // Log para debugging
            if (documents.length <= 5) { // Solo log si hay pocos documentos para no saturar
              strapi.log.info(`📄 Document ${doc.id} (${doc.title}): category="${doc.category.name}", country="${doc.category.country}"`);
            }
          } else {
            strapi.log.error(`❌ Category ${doc.category.id} not found for document ${doc.id}`);
          }
        } else {
          strapi.log.warn(`⚠️ Document ${doc.id} has no category or category.id`);
        }
      }
      
      strapi.log.info(`📊 Returning ${documents.length} documents with populated categories`);

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

      // Primero subir el archivo usando el servicio de upload de Strapi
      const uploadedFiles = await strapi.plugins.upload.services.upload.upload({
        data: {
          refId: null,
          ref: null,
          field: null,
        },
        files: file,
      });

      // Obtener el ID del archivo subido
      const uploadedFileId = Array.isArray(uploadedFiles) ? uploadedFiles[0].id : uploadedFiles.id;

      // Crear el documento con la referencia al archivo
      const document = await strapi.entityService.create('api::document.document', {
        data: {
          title,
          description,
          category,
          visibleToContacts: visibleToContacts === 'true' || visibleToContacts === true,
          emergencyOnly: emergencyOnly === 'true' || emergencyOnly === true,
          uploadedAt: new Date(),
          owner: user.id,
          file: uploadedFileId
        },
        populate: ['file', 'category', 'owner']
      });

      // Verificar y populater category.country - Siempre obtener la categoría completa
      const docWithCategory = document as any;
      if (docWithCategory.category) {
        const fullCategory = await strapi.entityService.findOne('api::document-category.document-category', docWithCategory.category.id);
        if (fullCategory) {
          docWithCategory.category.country = (fullCategory as any).country;
          docWithCategory.category.description = (fullCategory as any).description;
          docWithCategory.category.name = fullCategory.name;
          docWithCategory.category.icon = fullCategory.icon;
          strapi.log.info(`✅ Created document ${docWithCategory.id}: title="${title}", category="${docWithCategory.category.name}", country="${docWithCategory.category.country}"`);
        } else {
          strapi.log.error(`❌ Category ${docWithCategory.category.id} not found for document ${docWithCategory.id}`);
        }
      } else {
        strapi.log.warn(`⚠️ Document ${docWithCategory.id} created without category`);
      }

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

      // Ensure category.country is populated
      const docWithCategory = document as any;
      if (docWithCategory.category && !docWithCategory.category.country) {
        const fullCategory = await strapi.entityService.findOne('api::document-category.document-category', docWithCategory.category.id);
        if (fullCategory) {
          docWithCategory.category.country = (fullCategory as any).country;
          docWithCategory.category.description = (fullCategory as any).description;
        }
      }

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