import useDatabase from '@/composables/database';
import { TeaCategory } from '@/models';

const { getHandle } = useDatabase();

const getAll = async (): Promise<Array<TeaCategory>> => {
  const cats: Array<TeaCategory> = [];
  const handle = await getHandle();
  if (handle) {
    await handle.transaction((tx) =>
      tx.executeSql(
        'SELECT id, name, description FROM TeaCategories ORDER BY name',
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

const upsert = async (cat: TeaCategory): Promise<void> => {
  const handle = await getHandle();
  if (handle) {
    await handle.transaction((tx) => {
      tx.executeSql(
        'INSERT INTO TeaCategories (id, name, description) VALUES (?, ?, ?)' +
          ' ON CONFLICT(id) DO' +
          ' UPDATE SET name = ?, description = ? where id = ?',
        [cat.id, cat.name, cat.description, cat.name, cat.description, cat.id],
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
    await handle.transaction((tx) => {
      tx.executeSql(`DELETE FROM TeaCategories WHERE id not in (${params(idsToKeep.length)})`, [...idsToKeep], () => {
        null;
      });
    });
  }
};

export default (): any => ({
  getAll,
  trim,
  upsert,
});
