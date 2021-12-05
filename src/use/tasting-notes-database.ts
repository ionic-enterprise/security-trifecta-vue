import useDatabase from '@/use/database';
import useSessionVault from '@/use/session-vault';
import { TastingNote } from '@/models';

const { getHandle } = useDatabase();
const { getSession } = useSessionVault();

const getAll = async (includeDeleted = false): Promise<Array<TastingNote>> => {
  const notes: Array<TastingNote> = [];
  const handle = await getHandle();
  if (handle) {
    const { user } = await getSession();
    const predicate = includeDeleted
      ? 'userId = ? ORDER BY name'
      : "coalesce(syncStatus, '') != 'DELETE' AND userId = ? ORDER BY name";
    await handle.transaction((tx) =>
      tx.executeSql(
        `SELECT id, name, brand, notes, rating, teaCategoryId, syncStatus FROM TastingNotes WHERE ${predicate}`,
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

const reset = async (): Promise<void> => {
  const handle = await getHandle();
  if (handle) {
    const { user } = await getSession();
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

const remove = async (note: TastingNote): Promise<void> => {
  const handle = await getHandle();
  if (handle) {
    const { user } = await getSession();
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

const trim = async (idsToKeep: Array<number>): Promise<void> => {
  const handle = await getHandle();
  if (handle) {
    const { user } = await getSession();
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

const add = async (note: TastingNote): Promise<TastingNote | undefined> => {
  const handle = await getHandle();
  if (handle) {
    const { user } = await getSession();
    const n = { ...note, syncStatus: 'INSERT' as 'INSERT' };
    await handle.transaction((tx) => {
      tx.executeSql(
        'SELECT COALESCE(MAX(id), 0) + 1 AS newId FROM TastingNotes',
        [],
        // tslint:disable-next-line:variable-name
        (_t: any, r: any) => {
          n.id = r.rows.item(0).newId;
          tx.executeSql(
            'INSERT INTO TastingNotes (id, name, brand, notes, rating, teaCategoryId, userId, syncStatus)' +
              ' VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [n.id, n.name, n.brand, n.notes, n.rating, n.teaCategoryId, user.id, n.syncStatus],
            () => {
              null;
            }
          );
        }
      );
    });
    return n;
  }
};

const update = async (note: TastingNote): Promise<TastingNote | undefined> => {
  const handle = await getHandle();
  if (handle) {
    const { user } = await getSession();
    const n = { ...note, syncStatus: !note.syncStatus ? 'UPDATE' : note.syncStatus };
    console.log('updating', n);
    await handle.transaction((tx) => {
      tx.executeSql(
        'UPDATE TastingNotes SET name = ?, brand = ?, notes = ?, rating = ?, teaCategoryId = ?, syncStatus = ?' +
          ' WHERE userId = ? AND id = ?',
        [n.name, n.brand, n.notes, n.rating, n.teaCategoryId, n.syncStatus, user.id, n.id],
        () => {
          null;
        }
      );
    });
    return n;
  }
};

const save = async (note: TastingNote): Promise<TastingNote> => {
  return (note.id ? await update(note) : await add(note)) || note;
};

const upsert = async (note: TastingNote): Promise<void> => {
  const handle = await getHandle();
  if (handle) {
    const { user } = await getSession();
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

export default (): any => ({
  getAll,
  save,
  remove,

  reset,
  trim,
  upsert,
});
