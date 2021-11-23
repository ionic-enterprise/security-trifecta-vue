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

const addTastingNote = async (note: TastingNote, user: User): Promise<void> => {
  if ((await isReady()) && handle) {
    const n = { ...note };
    await handle.transaction((tx) => {
      tx.executeSql(
        'SELECT COALESCE(MAX(id), 0) + 1 AS newId FROM TastingNotes',
        [],
        // tslint:disable-next-line:variable-name
        (_t: any, r: any) => {
          n.id = r.rows.item(0).newId;
          tx.executeSql(
            'INSERT INTO TastingNotes (id, name, brand, notes, rating, teaCategoryId, userId, syncStatus)' +
              ' VALUES (?, ?, ?, ?, ?, ?, ?)',
            [n.id, n.name, n.brand, n.notes, n.rating, n.teaCategoryId, user.id, 'INSERT'],
            () => {
              null;
            }
          );
        }
      );
    });
  }
};

const resetTastingNotes = async (user: User): Promise<void> => {
  if ((await isReady()) && handle) {
    await handle.transaction((tx) => {
      tx.executeSql(
        "UPDATE TastingNotes SET syncStatus = null WHERE syncStatus = 'UPDATE' AND userId = ?",
        [user.id],
        () => {
          null;
        }
      );
      tx.executeSql(
        "DELETE FROM TastingNotes WHERE syncStatus in ('DELETE', 'INSERT') AND userId = ?",
        [user.id],
        () => {
          null;
        }
      );
    });
  }
};

const deleteTastingNote = async (note: TastingNote, user: User): Promise<void> => {
  if ((await isReady()) && handle) {
    await handle.transaction((tx) => {
      tx.executeSql(
        "UPDATE TastingNotes SET syncStatus = 'DELETE' WHERE userId = ? AND id = ?",
        [user.id, note.id],
        () => {
          null;
        }
      );
    });
  }
};

const params = (length: number): string => {
  let str = '';
  for (let i = 0; i < length; i++) {
    str += `${i ? ', ' : ''}?`;
  }
  return str;
};

const trimTastingNotes = async (idsToKeep: Array<number>, user: User): Promise<void> => {
  if ((await isReady()) && handle) {
    await handle.transaction((tx) => {
      tx.executeSql(
        `DELETE FROM TastingNotes WHERE userId = ? AND id not in (${params(idsToKeep.length)})`,
        [user.id, ...idsToKeep],
        () => {
          null;
        }
      );
    });
  }
};

const updateTastingNote = async (note: TastingNote, user: User): Promise<void> => {
  if ((await isReady()) && handle) {
    await handle.transaction((tx) => {
      tx.executeSql(
        'UPDATE TastingNotes SET name = ?, brand = ?, notes = ?, rating = ?, teaCategoryId = ?,' +
          " syncStatus = CASE syncStatus WHEN 'INSERT' then 'INSERT' when 'DELETE' then 'DELETE' else 'UPDATE' END" +
          ' WHERE syncStatus is NULL AND userId = ? AND id = ?',
        [note.name, note.brand, note.notes, note.rating, note.teaCategoryId, user.id, note.id],
        () => {
          null;
        }
      );
    });
  }
};

const mergeTastingNote = async (note: TastingNote, user: User): Promise<void> => {
  if ((await isReady()) && handle) {
    await handle.transaction((tx) => {
      tx.executeSql(
        'INSERT INTO TastingNotes (id, name, brand, notes, rating, teaCategoryId, userId) VALUES (?, ?, ?, ?, ?, ?, ?)' +
          ' ON CONFLICT(id) DO' +
          ' UPDATE SET name = ?, brand = ?, notes = ?, rating = ?, teaCategoryId = ?' +
          ' WHERE syncStatus is NULL AND userId = ? AND id = ?',
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
          user.id,
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
  mergeTeaCategory,

  addTastingNote,
  deleteTastingNote,
  updateTastingNote,
  resetTastingNotes,
  trimTastingNotes,

  getTeaCategories,
  mergeTastingNote,
});
