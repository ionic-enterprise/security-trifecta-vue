import { useEncryption } from '@/composables/encryption';
import { DbTransaction, SQLite, SQLiteObject } from '@ionic-enterprise/secure-storage';
import { isPlatform } from '@ionic/vue';

interface Column {
  name: string;
  type: string;
}

let handle: SQLiteObject | null = null;

const openDatabase = async (): Promise<SQLiteObject | null> => {
  if (isPlatform('hybrid')) {
    const { getDatabaseKey } = useEncryption();
    const key = await getDatabaseKey();
    if (key) {
      return SQLite.create({
        name: 'teaisforme.db',
        location: 'default',
        key,
      });
    }
  }
  return null;
};

const createTableSQL = (name: string, columns: Array<Column>): string => {
  let cols = '';
  columns.forEach((c, i) => {
    cols += `${i ? ', ' : ''}${c.name} ${c.type}`;
  });
  return `CREATE TABLE IF NOT EXISTS ${name} (${cols})`;
};

const createTables = (transaction: DbTransaction): void => {
  const id = { name: 'id', type: 'INTEGER PRIMARY KEY' };
  const name = { name: 'name', type: 'TEXT' };
  const description = { name: 'description', type: 'TEXT' };
  const syncStatus = { name: 'syncStatus', type: 'TEXT' };
  transaction.executeSql(createTableSQL('TeaCategories', [id, name, description]));
  transaction.executeSql(
    createTableSQL('TastingNotes', [
      id,
      name,
      { name: 'brand', type: 'TEXT' },
      { name: 'notes', type: 'TEXT' },
      { name: 'rating', type: 'INTEGER' },
      { name: 'teaCategoryId', type: 'INTEGER' },
      { name: 'userId', type: 'INTEGER' },
      syncStatus,
    ])
  );
};

const getHandle = async (): Promise<SQLiteObject | null> => {
  if (!handle) {
    handle = await openDatabase();
    if (handle) {
      handle.transaction((tx) => createTables(tx));
    }
  }
  return handle;
};

export const useDatabase = () => ({
  getHandle,
});
