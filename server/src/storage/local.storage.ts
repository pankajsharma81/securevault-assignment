import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';
import { env } from '../config/env';

const root = path.resolve(env.STORAGE_DIR);

const chunkPath = (fileId: string, n: number) => path.join(root, fileId, `${n}.chunk`);

export const Storage = {
  saveChunk: async (fileId: string, n: number, stream: Readable) => {
    await fs.promises.mkdir(path.join(root, fileId), { recursive: true });
    await pipeline(stream, fs.createWriteStream(chunkPath(fileId, n)));
  },

  readChunk: (fileId: string, n: number) => fs.createReadStream(chunkPath(fileId, n)),

  chunkExists: (fileId: string, n: number) => fs.existsSync(chunkPath(fileId, n)),
};