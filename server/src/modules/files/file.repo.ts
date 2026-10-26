import { File } from "../../models/file.model";
import { Acl } from "../../models/acl.model";

export const FileRepo = {
  createFile: (data: {
    ownerId: string;
    name: string;
    mimeType?: string;
    size: number;
    chunkSize: number;
    chunkCount: number;
  }) => File.create(data),

  createAcl: (data: {
    fileId: string;
    userId: string;
    role: "owner" | "viewer";
    wrappedKey: string;
    wrapIv: string;
    grantedBy: string;
  }) => Acl.create(data),

  findFileById: (id: string) => File.findById(id),

  findAcl: (fileId: string, userId: string) => Acl.findOne({ fileId, userId }),

  markComplete: (id: string) =>
    File.findByIdAndUpdate(id, { status: "complete" }),
};
