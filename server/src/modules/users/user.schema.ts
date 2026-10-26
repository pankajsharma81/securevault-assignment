import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  authKey: z.string().min(20),
  publicKey: z.string().min(1),
  encryptedPrivateKey: z.string().min(1),
  kdfSalt: z.string().min(1),
  privateKeyIv: z.string().min(1),
});

export const loginSchema = z.object({
  email: z.string().email(),
  authKey: z.string().min(20),
});

export const emailParamSchema = z.object({
  email: z.string().email(),
});