export default (config, { strapi }) => {
  return async (ctx, next) => {
    await next();

    // Solo aplicar soft delete a usuarios
    if (ctx.request.url.includes('/users') && ctx.request.method === 'DELETE') {
      const user = ctx.state.user;
      
      if (user) {
        // Marcar como eliminado en lugar de eliminar físicamente
        await strapi.entityService.update('plugin::users-permissions.user', user.id, {
          data: {
            deletedAt: new Date(),
            blocked: true
          }
        });

        ctx.body = {
          message: 'Cuenta eliminada exitosamente'
        };
      }
    }
  };
}; 