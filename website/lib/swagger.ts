import { createSwaggerSpec } from 'next-swagger-doc';

export const swaggerConfig = {
  apiFolder: 'app/api', // define api folder
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'JIIT Time Table API',
      version: '1.0',
    },
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [],
  },
};

export const getApiDocs = async () => {
  const spec = createSwaggerSpec(swaggerConfig);
  return spec;
};
