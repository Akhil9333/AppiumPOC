import { fileURLToPath } from 'node:url';
import { loadProperties } from './properties.js';

const fileProperties = loadProperties([
  fileURLToPath(new URL('../../user-creation.properties', import.meta.url))
]);

export function userCreationSetting(key: string): string | undefined {
  return process.env[key]?.trim() || fileProperties.get(key)?.trim() || undefined;
}

export function requiredUserCreationSetting(key: string): string {
  const value = userCreationSetting(key);
  if (!value) {
    throw new Error(`Missing required setting: ${key}. Provide it as an environment variable or in user-creation.properties.`);
  }
  return value;
}
