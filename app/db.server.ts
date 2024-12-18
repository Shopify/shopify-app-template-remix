import { JSONFilePreset } from 'lowdb/node';

const createDatabase = async () => {
  const db = await JSONFilePreset('db.json', { entities: []})
  return db;
}

export const db = createDatabase();