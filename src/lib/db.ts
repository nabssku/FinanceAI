import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Helper to determine if we are in Mock/Demo mode
const isDemoMode = !process.env.DATABASE_URL;

const createMockDb = () => {
  console.warn("⚠️ DATABASE_URL is not set. FinanceAI is running in DEMO MODE with in-memory database storage.");
    const memoryStore: Record<string, any[]> = {
      user: [
        {
          id: "demo-user-id",
          name: "Alex Sterling",
          email: "alex@example.com",
          image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      settings: [
        {
          id: "demo-settings-id",
          userId: "demo-user-id",
          currency: "IDR",
          theme: "dark",
          budgetAlerts: true,
          billReminders: true,
          weeklySummary: true
        }
      ],
      transaction: [
        {
          id: "tx-1",
          userId: "demo-user-id",
          type: "EXPENSE",
          merchant: "Indomaret",
          amount: 87500,
          date: new Date(),
          category: "Groceries",
          notes: "Snacks and bottled water",
          tags: ["indomaret", "daily"],
          createdAt: new Date()
        },
        {
          id: "tx-2",
          userId: "demo-user-id",
          type: "INCOME",
          merchant: "Freelance Client",
          amount: 5000000,
          date: new Date(Date.now() - 86400000), // yesterday
          category: "Salary",
          notes: "Web design project payment",
          tags: ["freelance", "design"],
          createdAt: new Date()
        },
        {
          id: "tx-3",
          userId: "demo-user-id",
          type: "EXPENSE",
          merchant: "Coffee Shop",
          amount: 35000,
          date: new Date(Date.now() - 172800000), // 2 days ago
          category: "Food",
          notes: "Vanilla Latte",
          tags: ["coffee", "work"],
          createdAt: new Date()
        },
        {
          id: "tx-4",
          userId: "demo-user-id",
          type: "EXPENSE",
          merchant: "PLN Electricity",
          amount: 450000,
          date: new Date(Date.now() - 259200000), // 3 days ago
          category: "Bills",
          notes: "Monthly utility bill",
          tags: ["electricity", "utilities"],
          createdAt: new Date()
        }
      ],
      budget: [
        {
          id: "b-1",
          userId: "demo-user-id",
          category: "Groceries",
          limit: 1500000,
          spent: 87500,
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: "b-2",
          userId: "demo-user-id",
          category: "Food",
          limit: 1000000,
          spent: 35000,
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: "b-3",
          userId: "demo-user-id",
          category: "Bills",
          limit: 1500000,
          spent: 450000,
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      notification: [
        {
          id: "n-1",
          userId: "demo-user-id",
          title: "Welcome to FinanceAI!",
          content: "Get started by typing a message in the AI Chat, or drag and drop a receipt photo.",
          type: "SUMMARY",
          read: false,
          createdAt: new Date()
        }
      ],
      aiConversation: [
        {
          id: "demo-conv-id",
          userId: "demo-user-id",
          title: "Finance Assistant",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      aiMessage: [
        {
          id: "msg-1",
          conversationId: "demo-conv-id",
          role: "assistant",
          content: "Halo! Saya adalah Asisten Keuangan AI Anda. Anda dapat memberi tahu saya apa yang Anda belanjakan (contoh: 'Beli kopi Rp25.000' atau 'Bayar listrik Rp450.000') atau mengunggah foto struk belanja. Saya akan membantu mengekstrak detailnya sehingga Anda tinggal mengonfirmasi dan mencatatnya.",
          status: "sent",
          createdAt: new Date()
        }
      ],
      friend: [
        { id: "f-1", userId: "demo-user-id", name: "Sarah", createdAt: new Date() },
        { id: "f-2", userId: "demo-user-id", name: "David", createdAt: new Date() },
        { id: "f-3", userId: "demo-user-id", name: "Jessica", createdAt: new Date() }
      ],
      splitBill: [],
      friendShare: []
    };

    const makeQueryMethods = (tableName: string) => {
      return {
        findMany: async (args: any = {}) => {
          let list = [...(memoryStore[tableName] || [])];
          if (args.where) {
            list = list.filter(item => {
              for (const [key, value] of Object.entries(args.where)) {
                if (value !== undefined) {
                  if (typeof value === 'object' && value !== null) {
                    if ('equals' in value && item[key] !== value.equals) return false;
                    // handle basic filters like not, in, etc
                    if ('in' in value && Array.isArray(value.in) && !value.in.includes(item[key])) return false;
                  } else if (item[key] !== value) {
                    return false;
                  }
                }
              }
              return true;
            });
          }
          if (args.orderBy) {
            const orderBy = Array.isArray(args.orderBy) ? args.orderBy[0] : args.orderBy;
            const [field, dir] = Object.entries(orderBy)[0] as [string, string];
            list.sort((a, b) => {
              const valA = a[field];
              const valB = b[field];
              if (valA < valB) return dir === 'desc' ? 1 : -1;
              if (valA > valB) return dir === 'desc' ? -1 : 1;
              return 0;
            });
          }
          if (args.take) {
            list = list.slice(0, args.take);
          }
          return list;
        },
        findUnique: async (args: any) => {
          const list = memoryStore[tableName] || [];
          const where = args.where || {};
          return list.find(item => {
            for (const [key, value] of Object.entries(where)) {
              if (item[key] !== value) return false;
            }
            return true;
          }) || null;
        },
        findFirst: async (args: any = {}) => {
          const list = memoryStore[tableName] || [];
          if (args.where) {
            return list.find(item => {
              for (const [key, value] of Object.entries(args.where)) {
                if (item[key] !== value) return false;
              }
              return true;
            }) || null;
          }
          return list[0] || null;
        },
        create: async (args: any) => {
          const newItem = {
            id: args.data.id || `${tableName.substring(0, 3)}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...args.data
          };
          if (!memoryStore[tableName]) memoryStore[tableName] = [];
          memoryStore[tableName].push(newItem);
          return newItem;
        },
        update: async (args: any) => {
          const list = memoryStore[tableName] || [];
          const idx = list.findIndex(item => {
            for (const [key, value] of Object.entries(args.where)) {
              if (item[key] !== value) return false;
            }
            return true;
          });
          if (idx !== -1) {
            list[idx] = { ...list[idx], ...args.data, updatedAt: new Date() };
            return list[idx];
          }
          throw new Error(`Record not found in mock db table ${tableName}`);
        },
        upsert: async (args: any) => {
          try {
            return await makeQueryMethods(tableName).update({
              where: args.where,
              data: args.update
            });
          } catch {
            return await makeQueryMethods(tableName).create({
              data: { ...args.where, ...args.create }
            });
          }
        },
        delete: async (args: any) => {
          const list = memoryStore[tableName] || [];
          const idx = list.findIndex(item => {
            for (const [key, value] of Object.entries(args.where)) {
              if (item[key] !== value) return false;
            }
            return true;
          });
          if (idx !== -1) {
            const deleted = list[idx];
            memoryStore[tableName] = list.filter((_, i) => i !== idx);
            return deleted;
          }
          throw new Error(`Record not found in mock db table ${tableName}`);
        },
        count: async (args: any = {}) => {
          const list = await makeQueryMethods(tableName).findMany(args);
          return list.length;
        }
      };
    };

    return {
      user: makeQueryMethods('user'),
      settings: makeQueryMethods('settings'),
      transaction: makeQueryMethods('transaction'),
      budget: makeQueryMethods('budget'),
      notification: makeQueryMethods('notification'),
      aIConversation: makeQueryMethods('aiConversation'),
      aIMessage: makeQueryMethods('aiMessage'),
      friend: makeQueryMethods('friend'),
      splitBill: makeQueryMethods('splitBill'),
      friendShare: makeQueryMethods('friendShare'),
      category: makeQueryMethods('category'),
      account: makeQueryMethods('account'),
      session: makeQueryMethods('session'),
      verificationToken: makeQueryMethods('verificationToken'),
      $connect: async () => {},
      $disconnect: async () => {}
    } as unknown as PrismaClient;
};

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getPrismaClient(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    globalForPrisma.prisma = createMockDb();
    return globalForPrisma.prisma;
  }

  const cleanConnectionString = connectionString.replace(/^["']|["']$/g, "");
  const pool = new Pool({ connectionString: cleanConnectionString });
  const adapter = new PrismaPg(pool);

  const client = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = client;
  }

  return client;
}

export const db: PrismaClient = new Proxy({} as PrismaClient, {
  get(_, prop) {
    return (getPrismaClient() as any)[prop];
  },
});

export { isDemoMode };
