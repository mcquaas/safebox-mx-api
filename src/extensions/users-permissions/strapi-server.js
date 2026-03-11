module.exports = (plugin) => {
  plugin.controllers.auth.register = async (ctx) => {
    const { username, email, password, firstName, lastName, phone } = ctx.request.body;

    // Basic validation
    if (!username || !email || !password || !firstName || !lastName) {
      return ctx.badRequest('Missing required fields.');
    }

    const pluginStore = await strapi.store({
      type: 'plugin',
      name: 'users-permissions',
    });

    const settings = await pluginStore.get({
      key: 'advanced',
    });

    if (!settings.allow_register) {
      return ctx.badRequest('Register action is currently disabled.');
    }

    const role = await strapi
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: settings.default_role } });

    const newUser = {
      username,
      email,
      password,
      firstName,
      lastName,
      phone,
      provider: 'local',
      confirmed: true, // O false si quieres confirmación por email
      blocked: false,
      role: role.id,
    };

    try {
      const user = await strapi.plugins['users-permissions'].services.user.add(newUser);

      const sanitizedUser = await strapi.plugins['users-permissions'].controllers.user.sanitizeUser(user, ctx);

      const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
        id: user.id,
      });

      return ctx.send({
        jwt,
        user: sanitizedUser,
      });
    } catch (err) {
      if (err.name === 'ApplicationError') {
        return ctx.badRequest(err.message);
      }
      // Handle unique constraint errors (e.g., username or email already taken)
      if (err.message.includes('Duplicate entry')) {
        const field = err.message.includes('username') ? 'username' : 'email';
        return ctx.badRequest(`${field} already taken.`);
      }
      strapi.log.error(err);
      return ctx.internalServerError();
    }
  };

  return plugin;
};



