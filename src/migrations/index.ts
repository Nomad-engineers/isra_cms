import * as migration_20251207_163558 from './20251207_163558';
import * as migration_20260113_210724 from './20260113_210724';

export const migrations = [
  {
    up: migration_20251207_163558.up,
    down: migration_20251207_163558.down,
    name: '20251207_163558',
  },
  {
    up: migration_20260113_210724.up,
    down: migration_20260113_210724.down,
    name: '20260113_210724'
  },
];