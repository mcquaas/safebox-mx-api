import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::document-category.document-category', ({ strapi }) => ({
  /**
   * Obtener categorías (sistema y personalizadas del usuario)
   * GET /api/document-categories
   */
  async find(ctx) {
    try {
      const user = ctx.state.user;
      
      if (!user) {
        return ctx.unauthorized('Usuario no autenticado');
      }

      // Obtener categorías del sistema y las personalizadas del usuario
      const categories = await strapi.db.query('api::document-category.document-category').findMany({
        where: {
          $or: [
            { systemCategory: true },
            { owner: user.id }
          ]
        },
        orderBy: [
          { systemCategory: 'desc' },
          { name: 'asc' }
        ]
      });

      ctx.body = {
        data: categories
      };

    } catch (error) {
      strapi.log.error('Error obteniendo categorías:', error);
      ctx.internalServerError('Error interno del servidor');
    }
  },

  /**
   * Obtener categoría por ID
   * GET /api/document-categories/:id
   */
  async findOne(ctx) {
    try {
      const user = ctx.state.user;
      const { id } = ctx.params;
      
      if (!user) {
        return ctx.unauthorized('Usuario no autenticado');
      }

      const category = await strapi.db.query('api::document-category.document-category').findOne({
        where: {
          id: id,
          $or: [
            { systemCategory: true },
            { owner: user.id }
          ]
        }
      });

      if (!category) {
        return ctx.notFound('Categoría no encontrada');
      }

      ctx.body = {
        data: category
      };

    } catch (error) {
      strapi.log.error('Error obteniendo categoría:', error);
      ctx.internalServerError('Error interno del servidor');
    }
  },

  /**
   * Crear categoría personalizada
   * POST /api/document-categories
   */
  async create(ctx) {
    try {
      const user = ctx.state.user;
      
      if (!user) {
        return ctx.unauthorized('Usuario no autenticado');
      }

      const { name, icon, country } = ctx.request.body;

      if (!name) {
        return ctx.badRequest('El nombre es requerido');
      }

      if (!country || !['USA', 'MX'].includes(country)) {
        return ctx.badRequest('El país es requerido y debe ser USA o MX');
      }

      // Verificar que no exista una categoría con el mismo nombre para este usuario
      const existingCategory = await strapi.db.query('api::document-category.document-category').findOne({
        where: {
          name,
          country,
          $or: [
            { systemCategory: true },
            { owner: user.id }
          ]
        }
      });

      if (existingCategory) {
        return ctx.badRequest('Ya existe una categoría con ese nombre para este país');
      }

      const category = await strapi.entityService.create('api::document-category.document-category', {
        data: {
          name,
          icon: icon || 'shield',
          country,
          systemCategory: false,
          owner: user.id
        }
      });

      ctx.body = {
        data: category
      };

    } catch (error) {
      strapi.log.error('Error creando categoría:', error);
      ctx.internalServerError('Error interno del servidor');
    }
  },

  /**
   * Actualizar categoría personalizada
   * PUT /api/document-categories/:id
   */
  async update(ctx) {
    try {
      const user = ctx.state.user;
      const { id } = ctx.params;
      
      if (!user) {
        return ctx.unauthorized('Usuario no autenticado');
      }

      // Verificar que la categoría existe y pertenece al usuario (no es del sistema)
      const existingCategory = await strapi.db.query('api::document-category.document-category').findOne({
        where: {
          id: id,
          owner: user.id,
          systemCategory: false
        }
      });

      if (!existingCategory) {
        return ctx.notFound('Categoría no encontrada o no puedes modificarla');
      }

      const { name, icon } = ctx.request.body;

      const category = await strapi.entityService.update('api::document-category.document-category', id, {
        data: {
          name,
          icon
        }
      });

      ctx.body = {
        data: category
      };

    } catch (error) {
      strapi.log.error('Error actualizando categoría:', error);
      ctx.internalServerError('Error interno del servidor');
    }
  },

  /**
   * Eliminar categoría personalizada
   * DELETE /api/document-categories/:id
   */
  async delete(ctx) {
    try {
      const user = ctx.state.user;
      const { id } = ctx.params;
      
      if (!user) {
        return ctx.unauthorized('Usuario no autenticado');
      }

      // Verificar que la categoría existe y pertenece al usuario (no es del sistema)
      const existingCategory = await strapi.db.query('api::document-category.document-category').findOne({
        where: {
          id: id,
          owner: user.id,
          systemCategory: false
        }
      });

      if (!existingCategory) {
        return ctx.notFound('Categoría no encontrada o no puedes eliminarla');
      }

      // Verificar que no haya documentos usando esta categoría
      const documentsCount = await strapi.entityService.count('api::document.document', {
        filters: { 
          category: id,
          owner: user.id
        }
      });

      if (documentsCount > 0) {
        return ctx.badRequest('No puedes eliminar una categoría que tiene documentos asociados');
      }

      await strapi.entityService.delete('api::document-category.document-category', id);

      ctx.body = {
        message: 'Categoría eliminada exitosamente'
      };

    } catch (error) {
      strapi.log.error('Error eliminando categoría:', error);
      ctx.internalServerError('Error interno del servidor');
    }
  }
}));

