// import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    // Configurar permisos para el rol PUBLIC (permite registro y login sin autenticación)
    try {
      const publicRole = await strapi.query('plugin::users-permissions.role').findOne({
        where: { type: 'public' }
      });

      if (publicRole) {
        // Endpoints públicos necesarios para registro y login
        const publicEndpoints = [
          'plugin::users-permissions.auth.register',
          'plugin::users-permissions.auth.callback',
          'plugin::users-permissions.auth.connect',
          'plugin::users-permissions.auth.login',
        ];

        for (const action of publicEndpoints) {
          const existingPermission = await strapi.query('plugin::users-permissions.permission').findOne({
            where: {
              action: action,
              role: publicRole.id
            }
          });

          if (!existingPermission) {
            await strapi.query('plugin::users-permissions.permission').create({
              data: {
                action: action,
                enabled: true,
                role: publicRole.id
              }
            });
            strapi.log.info(`✅ Permiso público habilitado: ${action}`);
          } else if (!existingPermission.enabled) {
            await strapi.query('plugin::users-permissions.permission').update({
              where: { id: existingPermission.id },
              data: { enabled: true }
            });
            strapi.log.info(`✅ Permiso público actualizado: ${action}`);
          }
        }
      }
    } catch (error) {
      strapi.log.error('❌ Error configurando permisos públicos:', error);
    }

    // Configurar permisos para usuarios autenticados
    try {
      const authenticatedRole = await strapi.query('plugin::users-permissions.role').findOne({
        where: { type: 'authenticated' }
      });

      if (authenticatedRole) {
        // Permisos para usuarios autenticados
        const authenticatedEndpoints = [
          'plugin::users-permissions.user.updateProfile',
          // Contactos
          'api::contact.contact.find',
          'api::contact.contact.findOne',
          'api::contact.contact.create',
          'api::contact.contact.update',
          'api::contact.contact.delete',
          // Documentos
          'api::document.document.find',
          'api::document.document.findOne',
          'api::document.document.create',
          'api::document.document.update',
          'api::document.document.delete',
          'api::document.document.stats',
          // Categorías de documentos
          'api::document-category.document-category.find',
          'api::document-category.document-category.findOne',
          'api::document-category.document-category.create',
          'api::document-category.document-category.update',
          'api::document-category.document-category.delete',
          // Emergencia
          'api::emergency.emergency.trigger',
          'api::emergency.emergency.notify',
          // Logs
          'api::emergency-log.emergency-log.find',
          'api::auth-log.auth-log.find',
        ];

        for (const action of authenticatedEndpoints) {
          const existingPermission = await strapi.query('plugin::users-permissions.permission').findOne({
            where: {
              action: action,
              role: authenticatedRole.id
            }
          });

          if (!existingPermission) {
            await strapi.query('plugin::users-permissions.permission').create({
              data: {
                action: action,
                enabled: true,
                role: authenticatedRole.id
              }
            });
            strapi.log.info(`✅ Permiso habilitado para autenticados: ${action}`);
          } else if (!existingPermission.enabled) {
            await strapi.query('plugin::users-permissions.permission').update({
              where: { id: existingPermission.id },
              data: { enabled: true }
            });
            strapi.log.info(`✅ Permiso actualizado para autenticados: ${action}`);
          }
        }
      }
    } catch (error) {
      strapi.log.error('❌ Error configurando permisos:', error);
    }

    // Crear categorías del sistema si no existen - USA
    const systemCategoriesUSA = [
      { name: 'Identificación', icon: 'id-card', country: 'USA', description: 'Documentos de identificación de Estados Unidos' },
      { name: 'Legal', icon: 'gavel', country: 'USA', description: 'Documentos legales y jurídicos' },
      { name: 'Médico', icon: 'medical', country: 'USA', description: 'Registros médicos y de salud' },
      { name: 'Contactos', icon: 'users', country: 'USA', description: 'Información de contactos importantes' },
      { name: 'Financiero', icon: 'bank', country: 'USA', description: 'Documentos financieros y bancarios' },
      { name: 'Seguros', icon: 'shield', country: 'USA', description: 'Pólizas y documentos de seguros' },
      { name: 'Educación', icon: 'graduation-cap', country: 'USA', description: 'Diplomas y certificados educativos' },
      { name: 'Trabajo', icon: 'briefcase', country: 'USA', description: 'Documentos laborales y de empleo' },
      { name: 'Vivienda', icon: 'home', country: 'USA', description: 'Documentos de propiedad y vivienda' }
    ];

    // Crear categorías del sistema si no existen - México
    const systemCategoriesMX = [
      { name: 'Identificación', icon: 'id-card', country: 'MX', description: 'Documentos de identificación mexicanos' },
      { name: 'Legal', icon: 'gavel', country: 'MX', description: 'Documentos legales y jurídicos' },
      { name: 'Médico', icon: 'medical', country: 'MX', description: 'Registros médicos y de salud' },
      { name: 'Contactos', icon: 'users', country: 'MX', description: 'Información de contactos importantes' },
      { name: 'Financiero', icon: 'bank', country: 'MX', description: 'Documentos financieros y bancarios' },
      { name: 'Seguros', icon: 'shield', country: 'MX', description: 'Pólizas y documentos de seguros' },
      { name: 'Educación', icon: 'graduation-cap', country: 'MX', description: 'Diplomas y certificados educativos' },
      { name: 'Trabajo', icon: 'briefcase', country: 'MX', description: 'Documentos laborales y de empleo' },
      { name: 'Vivienda', icon: 'home', country: 'MX', description: 'Documentos de propiedad y vivienda' }
    ];

    const allCategories = [...systemCategoriesUSA, ...systemCategoriesMX];

    for (const category of allCategories) {
      const existingCategory = await strapi.entityService.findMany('api::document-category.document-category', {
        filters: {
          name: category.name,
          country: category.country,
          systemCategory: true
        }
      });

      if (existingCategory.length === 0) {
        await strapi.entityService.create('api::document-category.document-category', {
          data: {
            ...category,
            systemCategory: true
          }
        });
        strapi.log.info(`✅ Categoría del sistema creada: ${category.name} (${category.country})`);
      }
    }
  },
};
