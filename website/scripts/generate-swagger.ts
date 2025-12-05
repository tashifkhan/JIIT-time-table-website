import { createSwaggerSpec } from 'next-swagger-doc';
import { swaggerConfig } from '../lib/swagger';
import fs from 'fs';
import path from 'path';

const generateSwagger = async () => {
  const spec = createSwaggerSpec(swaggerConfig);
  const outputPath = path.join(process.cwd(), 'public', 'swagger.json');
  
  fs.writeFileSync(outputPath, JSON.stringify(spec, null, 2));
  console.log(`Swagger spec generated at ${outputPath}`);
};

generateSwagger();
