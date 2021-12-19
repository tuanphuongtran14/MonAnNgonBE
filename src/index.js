'use strict';

const initializeStrapiAccount = async () => {
  try {
    const params = {
      username: process.env.STRAPI_USERNAME || 'admin',
      password: process.env.STRAPI_PASSWORD || '123456Abc',
      email: process.env.STRAPI_EMAIL || 'admin@test.test',
    };

    //check super admin user exists
    const isExisted = await strapi.admin.services.user.exists();
    if (isExisted) {
      return;
    }

    //create super admin role if not exists
    await strapi.admin.services.role.createRolesIfNoneExist();
    const superAdminRole = await strapi.admin.services.role.getSuperAdmin();

    //create super admin user
    await strapi.admin.services.user.create({
      ...params,
      registrationToken: null,
      isActive: true,
      roles: superAdminRole ? [superAdminRole.id] : [],
    });

    await strapi.telemetry.send('didCreateFirstAdmin');
  } catch (ex) {
    strapi.log.error(ex);
    strapi.stop();
  }
}

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register: (/*{ strapi }*/) => {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap: async (/*{ strapi }*/) => {
    await initializeStrapiAccount();
  },
};
