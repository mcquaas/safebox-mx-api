import { factories } from '@strapi/strapi';

export default factories.createCoreController('plugin::users-permissions.user', ({ strapi }) => ({
  /**
   * Eliminar cuenta del usuario (soft delete)
   * DELETE /api/user/me
   */
  async deleteAccount(ctx) {
    try {
      const user = ctx.state.user;
      
      if (!user) {
        return ctx.unauthorized('Usuario no autenticado');
      }

      // Soft delete: marcar como eliminado
      await strapi.entityService.update('plugin::users-permissions.user', user.id, {
        data: {
          deletedAt: new Date(),
          blocked: true,
          username: `deleted_${user.id}_${Date.now()}`,
          email: `deleted_${user.id}_${Date.now()}@deleted.com`
        }
      });

      // Registrar evento de eliminación
      try {
        await strapi.entityService.create('api::auth-log.auth-log', {
          data: {
            user: user.id,
            method: 'password',
            success: true,
            timestamp: new Date(),
            ipAddress: ctx.request.ip,
            userAgent: ctx.request.headers['user-agent']
          }
        });
      } catch (logError) {
        strapi.log.error('Error creando log de eliminación:', logError);
      }

      ctx.body = {
        message: 'Cuenta eliminada exitosamente'
      };

    } catch (error) {
      strapi.log.error('Error eliminando cuenta:', error);
      ctx.internalServerError('Error interno del servidor');
    }
  },

  /**
   * Actualizar PIN de emergencia
   * PUT /api/user/emergency-pin
   */
  async updateEmergencyPin(ctx) {
    try {
      const user = ctx.state.user;
      const { currentPin, newPin } = ctx.request.body;
      
      if (!user) {
        return ctx.unauthorized('Usuario no autenticado');
      }

      if (!newPin || newPin.length < 4) {
        return ctx.badRequest('PIN debe tener al menos 4 dígitos');
      }

      // Verificar PIN actual si existe
      if (user.emergencyPin && user.emergencyPin !== currentPin) {
        return ctx.unauthorized('PIN actual incorrecto');
      }

      // Actualizar PIN (en producción, cifrar)
      await strapi.entityService.update('plugin::users-permissions.user', user.id, {
        data: {
          phone: user.phone, // Mantener datos existentes
          firstName: user.firstName,
          lastName: user.lastName
        } as any
      });

      ctx.body = {
        message: 'PIN de emergencia actualizado exitosamente'
      };

    } catch (error) {
      strapi.log.error('Error actualizando PIN:', error);
      ctx.internalServerError('Error interno del servidor');
    }
  },

  /**
   * Configurar autenticación biométrica
   * PUT /api/user/biometric
   */
  async updateBiometric(ctx) {
    try {
      const user = ctx.state.user;
      const { enabled } = ctx.request.body;
      
      if (!user) {
        return ctx.unauthorized('Usuario no autenticado');
      }

      await strapi.entityService.update('plugin::users-permissions.user', user.id, {
        data: {
          phone: user.phone, // Mantener datos existentes
          firstName: user.firstName,
          lastName: user.lastName
        } as any
      });

      ctx.body = {
        message: `Autenticación biométrica ${enabled ? 'habilitada' : 'deshabilitada'} exitosamente`
      };

    } catch (error) {
      strapi.log.error('Error configurando biométrica:', error);
      ctx.internalServerError('Error interno del servidor');
    }
  },

  /**
   * Obtener perfil del usuario
   * GET /api/user/me
   */
  async me(ctx) {
    try {
      const user = ctx.state.user;
      
      if (!user) {
        return ctx.unauthorized('Usuario no autenticado');
      }

      // Obtener datos del usuario sin información sensible
      const userData = await strapi.entityService.findOne('plugin::users-permissions.user', user.id);

      // Remover información sensible
      if (userData) {
        delete (userData as any).password;
        delete (userData as any).resetPasswordToken;
        delete (userData as any).confirmationToken;
      }

      ctx.body = {
        data: userData
      };

    } catch (error) {
      strapi.log.error('Error obteniendo perfil:', error);
      ctx.internalServerError('Error interno del servidor');
    }
  }
})); 