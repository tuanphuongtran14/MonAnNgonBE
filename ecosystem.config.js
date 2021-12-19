module.exports = {
  apps: [
    {
      name: 'strapi-dev',
      cwd: '/home/phuongtt/deployment/MonAnNgonBE',
      script: 'yarn',
      args: 'start',
      env: {
        NODE_ENV: 'development',
        DB_HOST: '127.0.0.1',
        DB_PORT: '5431',
        DB_NAME: 'monanngon',
        DB_USER: 'monanngon',
        DB_PASS: '123456Abc',
        JWT_SECRET: 'fceb2781-14f2-4f11-bbda-2959eb551354',
        API_TOKEN_SALT: '561d8811f83be4cff5c9c55610b10ebf',
        STRAPI_USERNAME: 'admin',
        STRAPI_PASSWORD: '123456Abc',
        STRAPI_EMAIL: 'admin@test.test',
        STRAPI_JWT_SECRET: 'dc4185349ed39479d511ff4c51c2aecf',
        ADMIN_USER: 'admin',
        ADMIN_PASSWORD: '123456Abc',
        ADMIN_EMAIL: 'monanngon.uit@gmail.com',
      },
    },
  ],
};
