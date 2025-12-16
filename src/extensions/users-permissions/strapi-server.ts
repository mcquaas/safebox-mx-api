import customUserMethods from './controllers/user';

export default (plugin) => {
  // Extend and override the existing user controller methods
  Object.assign(plugin.controllers.user, customUserMethods);
  
  // Override the default me method to return custom fields
  plugin.controllers.user.me = customUserMethods.me;
  
  // Add custom routes - authentication is handled by the controller checking ctx.state.user
  plugin.routes['content-api'].routes.push(
    {
      method: 'PUT',
      path: '/user/update-profile',
      handler: 'plugin::users-permissions.user.updateProfile',
      config: {
        prefix: '',
        policies: [],
      },
    },
    {
      method: 'PUT',
      path: '/user/emergency-pin',
      handler: 'plugin::users-permissions.user.updateEmergencyPin',
      config: {
        prefix: '',
        policies: [],
      },
    },
    {
      method: 'PUT',
      path: '/user/biometric',
      handler: 'plugin::users-permissions.user.updateBiometric',
      config: {
        prefix: '',
        policies: [],
      },
    },
    {
      method: 'DELETE',
      path: '/user/me',
      handler: 'plugin::users-permissions.user.deleteAccount',
      config: {
        prefix: '',
        policies: [],
      },
    }
  );

  return plugin;
};

