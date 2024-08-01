import { ConfigModuleOptions } from '@nestjs/config';
 
export const envOptions: ConfigModuleOptions = {
  envFilePath: '.env',
  isGlobal: true,
  cache: true
};