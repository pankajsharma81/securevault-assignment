import bcrypt from "bcryptjs";
import { UserRepo } from "./user.repo";
import { AppError } from "../../core/errors/AppError";
import { USER_MESSAGES } from "../../shared/constants/user.constants";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";

interface RegisterInput {
  email: string;
  authKey: string;
  publicKey: string;
  encryptedPrivateKey: string;
  kdfSalt: string;
  privateKeyIv: string;
}

export const UserService = {
  register: async (input: RegisterInput) => {
    const existing = await UserRepo.findByEmail(input.email);
    if (existing) {
      throw new AppError(USER_MESSAGES.ALREADY_EXISTS, 409);
    }

    const passwordHash = await bcrypt.hash(input.authKey, 10);

    const user = await UserRepo.create({
      email: input.email,
      passwordHash,
      publicKey: input.publicKey,
      encryptedPrivateKey: input.encryptedPrivateKey,
      kdfSalt: input.kdfSalt,
      privateKeyIv: input.privateKeyIv,
    });

    return { id: user.id, email: user.email };
  },

  login: async (email: string, authKey: string) => {
    const user = await UserRepo.findByEmail(email);
    if (!user) {
      throw new AppError(USER_MESSAGES.INVALID_CREDENTIALS, 401);
    }

    const ok = await bcrypt.compare(authKey, user.passwordHash);
    if (!ok) {
      throw new AppError(USER_MESSAGES.INVALID_CREDENTIALS, 401);
    }

    const token = jwt.sign({ id: user.id, email: user.email }, env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        publicKey: user.publicKey,
        encryptedPrivateKey: user.encryptedPrivateKey,
        kdfSalt: user.kdfSalt,
        privateKeyIv: user.privateKeyIv,
      },
    };
  },
};
