/** Almacenamiento local de PDFs de recetas en IndexedDB.
 *  Los blobs no caben en localStorage; aquí guardamos solo los archivos,
 *  mientras el store de Zustand guarda los metadatos.
 *  (Se reemplazará por almacenamiento en la nube cuando exista backend.) */

const DB_NAME = 'themis-recipes'
const STORE = 'pdfs'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function run<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest): Promise<T> {
  return openDB().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE, mode)
        const req = fn(tx.objectStore(STORE))
        req.onsuccess = () => resolve(req.result as T)
        req.onerror = () => reject(req.error)
        tx.oncomplete = () => db.close()
      }),
  )
}

export const savePdf = (id: string, blob: Blob) => run<IDBValidKey>('readwrite', (s) => s.put(blob, id))
export const getPdf = (id: string) => run<Blob | undefined>('readonly', (s) => s.get(id))
export const deletePdf = (id: string) => run<undefined>('readwrite', (s) => s.delete(id))
