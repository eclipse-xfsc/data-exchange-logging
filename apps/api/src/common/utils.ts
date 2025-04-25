const PromisePool = require('es6-promise-pool');
const { resolve } = require('path');
const { readdir } = require('fs').promises;

export const promiseAllLimit = <T>(
  promises: Promise<T>[],
  concurrency: number
): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    const generatePromises = function* () {
      for (let index = 1; index < promises.length; index++) {
        yield promises[index];
      }
    };
    const promiseIterator = generatePromises();
    const pool = new PromisePool(promiseIterator, concurrency);
    pool.start().then((e) => {
      resolve(Promise.all(promises));
    }, reject);
  });
};

export async function getFiles(dir: string) {
  const dirents = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    dirents.map((dirent) => {
      const res = resolve(dir, dirent.name);
      return dirent.isDirectory() ? getFiles(res) : res;
    })
  );
  return files.flat(Number.POSITIVE_INFINITY);
}
