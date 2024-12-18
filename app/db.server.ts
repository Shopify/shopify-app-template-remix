import { JSONFilePreset } from 'lowdb/node';
import type { Section } from './types';


export const createDatabase = async () => {
  const db = await JSONFilePreset<{ sections: Section[]}>('db.json', { sections: []})
  return db;
}
export const database = createDatabase();