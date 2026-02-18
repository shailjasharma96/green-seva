import Dexie from 'dexie';

export const db = new Dexie('GreenSevaDB');

// Define schema
db.version(1).stores({
  users: '++id, email, name', // Primary key and indexed props
  logs: '++id, userId, type, date',
  centers: '++id, name, status'
});

// Seed data if empty
export const seedDatabase = async () => {
  const centersCount = await db.centers.count();
  if (centersCount === 0) {
    await db.centers.bulkAdd([
      { name: 'EcoCenter Central', distance: '0.8 km', types: ['Plastic', 'Paper', 'Metal'], status: 'Open' },
      { name: 'GreenHub North', distance: '1.5 km', types: ['E-Waste', 'Glass'], status: 'Closing Soon' },
      { name: 'PureCycle West', distance: '2.3 km', types: ['Plastic', 'Organic'], status: 'Open' },
    ]);
  }
};
