import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::app-config.app-config', ({ strapi }) => ({
  // Single type: find returns the one document; update is used to save.
  // Restrict API access via permissions (e.g. only Admin in Users & Permissions).
}));
