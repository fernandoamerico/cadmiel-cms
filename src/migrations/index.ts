import * as migration_20260410_234108 from './20260410_234108';
import * as migration_20260429_181639_add_projects from './20260429_181639_add_projects';
import * as migration_20260524_032639 from './20260524_032639';
import * as migration_20260614_005717_add_users_api_keys from './20260614_005717_add_users_api_keys';

export const migrations = [
  {
    up: migration_20260410_234108.up,
    down: migration_20260410_234108.down,
    name: '20260410_234108',
  },
  {
    up: migration_20260429_181639_add_projects.up,
    down: migration_20260429_181639_add_projects.down,
    name: '20260429_181639_add_projects',
  },
  {
    up: migration_20260524_032639.up,
    down: migration_20260524_032639.down,
    name: '20260524_032639',
  },
  {
    up: migration_20260614_005717_add_users_api_keys.up,
    down: migration_20260614_005717_add_users_api_keys.down,
    name: '20260614_005717_add_users_api_keys'
  },
];
