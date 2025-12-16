import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::auth-log.auth-log', ({ strapi }) => ({
  /**
   * Obtener logs de autenticación del usuario
   * GET /api/auth-logs
   */
  async find(ctx) {
    try {
      const user = ctx.state.user;
      
      if (!user) {
        return ctx.unauthorized('Usuario no autenticado');
      }

      const logs = await strapi.db.query('api::auth-log.auth-log').findMany({
        where: {
          user: user.id
        },
        orderBy: { timestamp: 'desc' },
        limit: 100 // Limitar a los últimos 100 logs
      });

      ctx.body = {
        data: logs,
        meta: {
          total: logs.length
        }
      };

    } catch (error) {
      strapi.log.error('Error obteniendo logs de autenticación:', error);
      ctx.internalServerError('Error interno del servidor');
    }
  },

  /**
   * Crear log de autenticación
   * POST /api/auth-logs
   */
  async create(ctx) {
    try {
      const user = ctx.state.user;
      
      if (!user) {
        return ctx.unauthorized('Usuario no autenticado');
      }

      const { method, success } = ctx.request.body;

      if (!method) {
        return ctx.badRequest('El método de autenticación es requerido');
      }

      const log = await strapi.entityService.create('api::auth-log.auth-log', {
        data: {
          method,
          success: success !== undefined ? success : true,
          timestamp: new Date(),
          ipAddress: ctx.request.ip,
          userAgent: ctx.request.headers['user-agent'],
          user: user.id
        }
      });

      ctx.body = {
        data: log
      };

    } catch (error) {
      strapi.log.error('Error creando log de autenticación:', error);
      ctx.internalServerError('Error interno del servidor');
    }
  }
}));

