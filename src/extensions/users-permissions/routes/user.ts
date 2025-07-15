export default {
  routes: [
    {
      method: 'DELETE',
      path: '/user/me',
      handler: 'user.deleteAccount',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/user/emergency-pin',
      handler: 'user.updateEmergencyPin',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/user/biometric',
      handler: 'user.updateBiometric',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/user/me',
      handler: 'user.me',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
}; 