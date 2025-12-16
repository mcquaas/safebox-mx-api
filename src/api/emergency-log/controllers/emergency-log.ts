import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::emergency-log.emergency-log', ({ strapi }) => ({
  /**
   * Obtener logs de emergencia del usuario
   * GET /api/emergency-logs
   */
  async find(ctx) {
    try {
      const user = ctx.state.user;
      
      if (!user) {
        return ctx.unauthorized('Usuario no autenticado');
      }

      const logs = await strapi.db.query('api::emergency-log.emergency-log').findMany({
        where: {
          user: user.id
        },
        populate: ['contactNotified', 'documentsShared'],
        orderBy: { triggeredAt: 'desc' },
        limit: 100 // Limitar a los últimos 100 logs
      });

      ctx.body = {
        data: logs,
        meta: {
          total: logs.length
        }
      };

    } catch (error) {
      strapi.log.error('Error obteniendo logs de emergencia:', error);
      ctx.internalServerError('Error interno del servidor');
    }
  },

  /**
   * Obtener log de emergencia específico
   * GET /api/emergency-logs/:id
   */
  async findOne(ctx) {
    try {
      const user = ctx.state.user;
      const { id } = ctx.params;
      
      if (!user) {
        return ctx.unauthorized('Usuario no autenticado');
      }

      const log = await strapi.db.query('api::emergency-log.emergency-log').findOne({
        where: {
          id: id,
          user: user.id
        },
        populate: ['contactNotified', 'documentsShared']
      });

      if (!log) {
        return ctx.notFound('Log de emergencia no encontrado');
      }

      ctx.body = {
        data: log
      };

    } catch (error) {
      strapi.log.error('Error obteniendo log de emergencia:', error);
      ctx.internalServerError('Error interno del servidor');
    }
  }
}));

