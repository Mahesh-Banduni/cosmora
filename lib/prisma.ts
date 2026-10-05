import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@/lib/generated/prisma/client";

type Client = InstanceType<typeof PrismaClient>;

const globalForPrisma = globalThis as unknown as {
  prisma?: Client;
  prismaUrl?: string;
};

function createClient(connectionString: string): Client {
  return new PrismaClient({
    adapter: new PrismaNeon({ connectionString }),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

/**
 * Lazily instantiates the Prisma client.
 *
 * Construction is deferred behind a Proxy so that merely importing this
 * module never fails during `next build` when `DATABASE_URL` is absent. The
 * missing-variable error surfaces on first real database use instead.
 */
export const prisma: Client = new Proxy({} as Client, {
  get(_target, property) {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error(
        "DATABASE_URL is not set. Add it to .env (see .env.example)."
      );
    }

    if (!globalForPrisma.prisma || globalForPrisma.prismaUrl !== connectionString) {
      globalForPrisma.prisma = createClient(connectionString);
      globalForPrisma.prismaUrl = connectionString;
    }

    const client = globalForPrisma.prisma;
    const value = Reflect.get(client as object, property, client);

    return typeof value === "function" ? value.bind(client) : value;
  },
});