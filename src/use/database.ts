import { TastingNote, TeaCategory, User } from '@/models';
import useEncryption from '@/use/encryption';
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
        // key,
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
  transaction.executeSql(createTableSQL('TeaCategories', [id, name, description, syncStatus]));
  transaction.executeSql(
    createTableSQL('TastingNotes', [
      id,
      name,
      { name: 'brand', type: 'TEXT' },
      { name: 'notes', type: 'TEXT' },
      { name: 'rating', type: 'TEXT' },
      { name: 'teaCategoryId', type: 'INTEGER' },
      { name: 'userId', type: 'INTEGER' },
      syncStatus,
    ])
  );
};

const isReady = async (): Promise<boolean> => {
  if (!handle) {
    handle = await openDatabase();
    if (handle) {
      handle.transaction((tx) => createTables(tx));
    }
  }
  return !!handle;
};

const getTeaCategories = async (): Promise<Array<TeaCategory>> => {
  const cats: Array<TeaCategory> = [];
  if ((await isReady()) && handle) {
    await handle.transaction((tx) =>
      tx.executeSql(
        "SELECT id, name, description FROM TeaCategories WHERE coalesce(syncStatus, '') != 'DELETE' ORDER BY name",
        [],
        // tslint:disable-next-line:variable-name
        (_t: any, r: any) => {
          for (let i = 0; i < r.rows.length; i++) {
            cats.push(r.rows.item(i));
          }
        }
      )
    );
  }
  return cats;
};

const getTastingNotes = async (user: User): Promise<Array<TastingNote>> => {
  const notes: Array<TastingNote> = [];
  if ((await isReady()) && handle) {
    await handle.transaction((tx) =>
      tx.executeSql(
        'SELECT id, name, brand, notes, rating, teaCategoryId FROM TastingNotes' +
          " WHERE coalesce(syncStatus, '') != 'DELETE' AND userId = ? ORDER BY name",
        [user.id],
        // tslint:disable-next-line:variable-name
        (_t: any, r: any) => {
          for (let i = 0; i < r.rows.length; i++) {
            notes.push(r.rows.item(i));
          }
        }
      )
    );
  }
  return notes;
};

const mergeTastingNote = async (note: TastingNote, user: User): Promise<void> => {
  if ((await isReady()) && handle) {
    await handle.transaction((tx) => {
      tx.executeSql(
        'INSERT INTO TastingNotes (id, name, brand, notes, rating, teaCategoryId, userId) VALUES (?, ?, ?, ?, ?, ?, ?)' +
          ' ON CONFLICT(id) DO' +
          ' UPDATE SET name = ?, brand = ?, notes = ?, rating = ?, teaCategoryId = ? where syncStatus is NULL AND id = ?',
        [
          note.id,
          note.name,
          note.brand,
          note.notes,
          note.rating,
          note.teaCategoryId,
          user.id,
          note.name,
          note.brand,
          note.notes,
          note.rating,
          note.teaCategoryId,
          note.id,
        ],
        () => {
          null;
        }
      );
    });
  }
};

const mergeTeaCategory = async (cat: TeaCategory): Promise<void> => {
  if ((await isReady()) && handle) {
    await handle.transaction((tx) => {
      tx.executeSql(
        'INSERT INTO TeaCategories (id, name, description) VALUES (?, ?, ?)' +
          ' ON CONFLICT(id) DO' +
          ' UPDATE SET name = ?, description = ? where syncStatus is NULL AND  id = ?',
        [cat.id, cat.name, cat.description, cat.name, cat.description, cat.id],
        () => {
          null;
        }
      );
    });
  }
};

export default () => ({
  getTastingNotes,
  getTeaCategories,
  mergeTastingNote,
  mergeTeaCategory,
});
