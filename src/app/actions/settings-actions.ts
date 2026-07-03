'use server';

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function getSettings() {
  const session = await auth();
  const userId = session?.user?.id || "demo-user-id";

  let settings = await db.settings.findUnique({
    where: { userId }
  });

  if (!settings) {
    // Auto-create default settings
    settings = await db.settings.create({
      data: {
        userId,
        currency: "IDR",
        theme: "dark",
        budgetAlerts: true,
        billReminders: true,
        weeklySummary: true
      }
    });
  }

  return settings;
}

export async function updateSettings(data: {
  currency: string;
  theme: string;
  budgetAlerts: boolean;
  billReminders: boolean;
  weeklySummary: boolean;
}) {
  const session = await auth();
  const userId = session?.user?.id || "demo-user-id";

  const settings = await db.settings.upsert({
    where: { userId },
    update: {
      currency: data.currency,
      theme: data.theme,
      budgetAlerts: data.budgetAlerts,
      billReminders: data.billReminders,
      weeklySummary: data.weeklySummary
    },
    create: {
      userId,
      currency: data.currency,
      theme: data.theme,
      budgetAlerts: data.budgetAlerts,
      billReminders: data.billReminders,
      weeklySummary: data.weeklySummary
    }
  });

  revalidatePath("/settings");
  return settings;
}

export async function updateProfile(data: {
  name: string;
  email: string;
  image?: string;
}) {
  const session = await auth();
  const userId = session?.user?.id || "demo-user-id";

  const user = await db.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      email: data.email,
      image: data.image
    }
  });

  revalidatePath("/profile");
  revalidatePath("/settings");
  return user;
}

// Fetch notifications
export async function getNotifications() {
  const session = await auth();
  const userId = session?.user?.id || "demo-user-id";

  return await db.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" }
  });
}

// Mark notifications as read
export async function markNotificationsAsRead() {
  const session = await auth();
  const userId = session?.user?.id || "demo-user-id";

  await db.notification.updateMany({
    where: { userId, read: false },
    data: { read: true }
  });

  revalidatePath("/dashboard");
}
