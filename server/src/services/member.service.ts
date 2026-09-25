import { prisma } from '../config/db';

export async function findOrCreateMember(email: string, name?: string) {
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({ data: { email, name: name || null } });
  }
  return user;
}
