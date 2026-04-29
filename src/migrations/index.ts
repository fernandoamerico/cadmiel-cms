import * as migration_20260410_234108 from './20260410_234108';
import * as migration_20260429_181639_add_projects from './20260429_181639_add_projects';

export const migrations = [
  {
    up: migration_20260410_234108.up,
    down: migration_20260410_234108.down,
    name: '20260410_234108',
  },
  {
    up: migration_20260429_181639_add_projects.up,
    down: migration_20260429_181639_add_projects.down,
    name: '20260429_181639_add_projects'
  },
];
