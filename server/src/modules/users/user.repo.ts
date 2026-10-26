import { User } from "../../models/user.model";

export const UserRepo = {
  findByEmail: (email: string) => User.findOne({ email }),

  create: (data: {
    email: string;
    passwordHash: string;
    publicKey: string;
    encryptedPrivateKey: string;
    kdfSalt: string;
    privateKeyIv: string;
  }) => User.create(data),
};