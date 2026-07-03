'use server';

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import Groq from "groq-sdk";

const groqApiKey = process.env.GROQ_API_KEY;

// Smart local rule-based extractor for instant testing in mock mode
function parseTransactionLocally(text: string) {
  const normalized = text.toLowerCase();
  
  // Default values
  let merchant = "Unknown Merchant";
  let amount = 0;
  let category = "General";
  let type = "EXPENSE";
  let notes = "";
  let tags: string[] = [];
  let isSplitBill = false;
  let items: any[] = [];

  // Extract amount
  const rpMatch = normalized.match(/(?:rp|idr)\.?\s*([\d\.,]+)/i);
  const numericMatch = normalized.match(/\b([\d\.,]+)\s*(?:ribu|juta)?\b/);
  
  let rawAmount = 0;
  if (rpMatch) {
    rawAmount = parseFloat(rpMatch[1].replace(/[\.,]/g, ''));
  } else if (numericMatch) {
    let multiplier = 1;
    if (normalized.includes("ribu")) multiplier = 1000;
    if (normalized.includes("juta")) multiplier = 1000000;
    rawAmount = parseFloat(numericMatch[1].replace(/[\.,]/g, '')) * multiplier;
  }
  amount = rawAmount || 0;

  // Determine details based on keywords
  if (normalized.includes("coffee") || normalized.includes("kopi") || normalized.includes("starbucks")) {
    merchant = normalized.includes("starbucks") ? "Starbucks" : "Coffee Shop";
    category = "Food";
    type = "EXPENSE";
    notes = "Coffee purchase";
    tags = ["coffee", "beverages"];
  } else if (normalized.includes("salary") || normalized.includes("gaji") || normalized.includes("freelance") || normalized.includes("income")) {
    merchant = normalized.includes("freelance") ? "Freelance Project" : "Company Salary";
    category = "Salary";
    type = "INCOME";
    notes = "Monthly payroll or client payout";
    tags = ["salary", "earnings"];
  } else if (normalized.includes("electricity") || normalized.includes("pln") || normalized.includes("listrik")) {
    merchant = "PLN Electricity";
    category = "Bills";
    type = "BILL";
    notes = "Electricity token / bill";
    tags = ["utilities", "electricity"];
  } else if (normalized.includes("brother") || normalized.includes("transfer") || normalized.includes("kirim")) {
    merchant = "Transfer to Friend/Family";
    category = "Transfer";
    type = "TRANSFER";
    notes = "Fund transfer";
    tags = ["transfer", "remittance"];
  } else if (normalized.includes("indomaret") || normalized.includes("alfamart") || normalized.includes("supermarket")) {
    merchant = normalized.includes("indomaret") ? "Indomaret" : (normalized.includes("alfamart") ? "Alfamart" : "Supermarket");
    category = "Groceries";
    type = "EXPENSE";
    notes = "Daily grocery items";
    tags = ["groceries", "daily"];
    items = [
      { name: "Snacks & Drinks", price: amount * 0.4 },
      { name: "Personal Care", price: amount * 0.6 }
    ];
  } else if (normalized.includes("restaurant") || normalized.includes("makan") || normalized.includes("dinner") || normalized.includes("lunch")) {
    merchant = "Restaurant Dine-In";
    category = "Food";
    type = "EXPENSE";
    notes = "Eating out";
    tags = ["food", "dining"];
    if (amount > 150000) {
      isSplitBill = true; // Suggest split bill for larger group size spending
    }
  } else if (normalized.includes("netflix") || normalized.includes("spotify") || normalized.includes("youtube premium")) {
    merchant = normalized.includes("netflix") ? "Netflix" : (normalized.includes("spotify") ? "Spotify" : "YouTube Premium");
    category = "Subscription";
    type = "SUBSCRIPTION";
    notes = "Recurring subscription fee";
    tags = ["entertainment", "subscription"];
  } else if (normalized.includes("invest") || normalized.includes("saham") || normalized.includes("crypto")) {
    merchant = "Investment Account";
    category = "Investment";
    type = "INVESTMENT";
    notes = "Investment deposit";
    tags = ["investing", "wealth"];
  } else {
    // Basic fallback parsing
    const words = text.split(" ");
    merchant = words.length > 2 ? words.slice(0, 3).join(" ") : "General Purchase";
    category = "General";
    type = "EXPENSE";
    notes = text;
  }

  return {
    merchant,
    amount,
    date: new Date().toISOString(),
    category,
    type,
    notes,
    tags,
    items,
    isSplitBill
  };
}

// AI Chat - Fetching Conversations
export async function getConversations() {
  const session = await auth();
  const userId = session?.user?.id || "demo-user-id";

  return await db.aIConversation.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" }
  });
}

export async function getMessages(conversationId: string) {
  return await db.aIMessage.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" }
  });
}

// Create new conversation
export async function createConversation(title: string = "New Chat") {
  const session = await auth();
  const userId = session?.user?.id || "demo-user-id";

  const conversation = await db.aIConversation.create({
    data: {
      userId,
      title
    }
  });

  revalidatePath("/chat");
  return conversation;
}

// Send Chat Message Action
export async function sendMessage(conversationId: string, content: string, receiptUrl?: string) {
  const session = await auth();
  const userId = session?.user?.id || "demo-user-id";

  // 1. Create and save the User Message
  await db.aIMessage.create({
    data: {
      conversationId,
      role: "user",
      content,
      receiptUrl,
      status: "sent"
    }
  });

  // 2. Perform parsing of transaction
  let extractedData: any = null;
  let replyText = "";
  let messageStatus = "sent";

  if (receiptUrl) {
    // Vision / Receipt OCR Flow
    if (groqApiKey) {
      try {
        const groq = new Groq({ apiKey: groqApiKey });
        
        const isSplitRequest = content && (
          content.toLowerCase().includes("patungan") || 
          content.toLowerCase().includes("split") || 
          content.toLowerCase().includes("bagi")
        );

        let promptText = `You are a financial receipt parser. Extract the following information from the receipt photo in JSON format: merchant (string), amount (number representing total amount in IDR), date (string), category (e.g. Groceries, Food, Bills, Subscription, Entertainment, Health, Travel, Salary, Investment, Savings, Gift, Other), type (INCOME, EXPENSE, TRANSFER, BILL, SUBSCRIPTION, INVESTMENT, SAVINGS, LOAN, DEBT, SPLIT_BILL), items (array of {name, price}), and notes (string). Respond ONLY with the JSON object.`;

        if (isSplitRequest) {
          promptText = `You are a financial receipt parser. Extract the following information from the receipt photo in JSON format: merchant (string), amount (number representing total amount in IDR), date (string), category (e.g. Groceries, Food, Bills, Subscription, Entertainment, Health, Travel, Salary, Investment, Savings, Gift, Other), type (INCOME, EXPENSE, TRANSFER, BILL, SUBSCRIPTION, INVESTMENT, SAVINGS, LOAN, DEBT, SPLIT_BILL), items (array of {name, price}), and notes (string).

If the user's message: "${content.replace(/"/g, '\\"')}" requests to split the bill (e.g. "patungan"), change the type to "SPLIT_BILL" and include a "splitDetails" object with the following structure:
{
  "groupSize": number,
  "payerName": string,
  "userPaidFirst": boolean,
  "userShare": number,
  "receivables": number,
  "friendsShares": [{"friendName": string, "shareAmount": number}]
}
Assume the total number of participants (groupSize) from the context (e.g. if the user says "untuk Salsabila dan Nabil", assume it is a split of 2 people unless the user explicitly indicates otherwise). Divide the bill equally among all participants (including the user) unless specified.

Respond ONLY with the JSON object.`;
        }

        const response = await groq.chat.completions.create({
          model: "qwen/qwen3.6-27b",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: promptText
                },
                {
                  type: "image_url",
                  image_url: { url: receiptUrl }
                }
              ]
            }
          ],
          response_format: { type: "json_object" }
        });
        
        let rawJson = response.choices[0]?.message?.content || "{}";
        // Sanitize code blocks if wrapped by the Vision model
        rawJson = rawJson.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
        extractedData = JSON.parse(rawJson);
      } catch (err) {
        console.error("Groq vision OCR failed, falling back to mock parser:", err);
        extractedData = parseTransactionLocally(content || "Makan di restoran Rp350.000");
      }
    } else {
      // Simulate receipt parsing
      extractedData = parseTransactionLocally(content || "Makan di restoran Rp350.000");
      // Add mock receipt details
      extractedData.merchant = "Struk Belanja Mock";
      extractedData.items = [
        { name: "Barang 1", price: extractedData.amount * 0.4 },
        { name: "Barang 2", price: extractedData.amount * 0.6 }
      ];
      
      if (content.toLowerCase().includes("patungan")) {
        extractedData.type = "SPLIT_BILL";
        const groupSize = 2;
        const share = extractedData.amount / groupSize;
        extractedData.splitDetails = {
          groupSize,
          payerName: "You",
          userPaidFirst: true,
          userShare: share,
          receivables: extractedData.amount - share,
          friendsShares: [
            { friendName: "Salsabila", shareAmount: share }
          ]
        };
      }
    }

    if (extractedData.type === "SPLIT_BILL" && extractedData.splitDetails) {
      const details = extractedData.splitDetails;
      replyText = `Saya mendeteksi struk **${extractedData.merchant}** sebesar **Rp${extractedData.amount.toLocaleString('id-ID')}** dan mengaturnya sebagai **Patungan (Split Bill)**:\n\n* **Bagian Anda**: Rp${details.userShare.toLocaleString('id-ID')}\n* **Piutang Teman**: Rp${details.receivables.toLocaleString('id-ID')}\n\nApakah Anda ingin menyimpan patungan ini?`;
    } else {
      replyText = `Saya telah menganalisis struk yang diunggah. Saya menemukan transaksi untuk **${extractedData.merchant}** dengan total **Rp${extractedData.amount.toLocaleString('id-ID')}**. Apakah Anda ingin saya menyimpan transaksi ini?`;
    }
    messageStatus = "pending_confirmation";
  } else {
    // Standard NLP Chat Flow
    if (groqApiKey) {
      try {
        const groq = new Groq({ apiKey: groqApiKey });
        const response = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: "Anda adalah asisten AI keuangan pribadi. Anda harus berbicara dan menjawab dalam Bahasa Indonesia. Jika pengguna menceritakan tentang transaksi (pendapatan, pengeluaran, transfer, tagihan, dll), ekstrak informasi tersebut ke dalam format JSON dengan kunci: merchant (string), amount (number), date (ISO string), category (string), type (INCOME, EXPENSE, TRANSFER, BILL, SUBSCRIPTION, INVESTMENT, SAVINGS, LOAN, DEBT, SPLIT_BILL), items (array of {name, price}), notes (string), tags (array of strings), isSplitBill (boolean), dan isTransaction: true. Jika pesan bukan berupa pencatatan transaksi (seperti sapaan, obrolan biasa, tips hemat, dll), set isTransaction: false dan berikan tanggapan ramah Anda dalam Bahasa Indonesia pada kunci 'response'. Balas HANYA dengan objek JSON."
            },
            {
              role: "user",
              content
            }
          ],
          response_format: { type: "json_object" }
        });
        
        const parsed = JSON.parse(response.choices[0]?.message?.content || "{}");
        if (parsed.isTransaction && (parsed.amount > 0 || parsed.merchant)) {
          extractedData = parsed;
          messageStatus = "pending_confirmation";
          replyText = `Saya menemukan transaksi baru. Apakah Anda ingin menyimpannya?\n\n* **Merchant**: ${extractedData.merchant}\n* **Jumlah**: Rp${extractedData.amount.toLocaleString('id-ID')}\n* **Kategori**: ${extractedData.category}\n* **Tipe**: ${extractedData.type}`;
        } else {
          replyText = parsed.response || "Saya tidak menangkap detail transaksi apa pun. Bisa tolong sebutkan nama merchant dan nominal uangnya?";
        }
      } catch (err) {
        console.error("Groq chat parsing failed, falling back to local:", err);
        const localExtracted = parseTransactionLocally(content);
        if (localExtracted.amount > 0) {
          extractedData = localExtracted;
          messageStatus = "pending_confirmation";
          replyText = `Saya berhasil mengekstrak transaksi:\n\n* **Merchant**: ${extractedData.merchant}\n* **Jumlah**: Rp${extractedData.amount.toLocaleString('id-ID')}\n* **Kategori**: ${extractedData.category}\n* **Tipe**: ${extractedData.type}\n\nApakah Anda ingin menyimpan transaksi ini?`;
        } else {
          replyText = "Saya tidak dapat mengidentifikasi transaksi. Bisakah Anda memberi tahu apa yang Anda belanjakan atau peroleh? Contoh: 'Saya membayar Rp45.000 untuk kopi'.";
        }
      }
    } else {
      // Local extraction for demo mode
      const localExtracted = parseTransactionLocally(content);
      if (localExtracted.amount > 0) {
        extractedData = localExtracted;
        messageStatus = "pending_confirmation";
        replyText = `Saya mendeteksi transaksi berikut dari pesan Anda:\n\n* **Merchant**: ${extractedData.merchant}\n* **Jumlah**: Rp${extractedData.amount.toLocaleString('id-ID')}\n* **Kategori**: ${extractedData.category}\n* **Tipe**: ${extractedData.type}\n\nApakah Anda ingin saya menyimpannya?`;
      } else {
        replyText = "Saya siap mencatat keuangan Anda! Coba kirimkan sesuatu seperti:\n- *'Saya belanja bulanan Rp120.000'*\n- *'Menerima gaji Rp5.000.000 hari ini'*\n- *'Saya membayar langganan Netflix Rp186.000'*";
      }
    }
  }

  // 3. Save the Assistant Message with the Extracted Data
  const assistantMsg = await db.aIMessage.create({
    data: {
      conversationId,
      role: "assistant",
      content: replyText,
      extractedData: extractedData ? (extractedData as any) : undefined,
      status: messageStatus
    }
  });

  // 4. Update Conversation timestamp
  await db.aIConversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() }
  });

  revalidatePath("/chat");
  return assistantMsg;
}

// Save Transaction Confirmation Action
export async function confirmTransaction(messageId: string, updatedData: any) {
  const session = await auth();
  const userId = session?.user?.id || "demo-user-id";

  // 1. Fetch message to check state
  const message = await db.aIMessage.findUnique({
    where: { id: messageId }
  });

  if (!message || message.status !== "pending_confirmation") {
    throw new Error("Message not found or not in pending state");
  }

  const transactionData = updatedData || message.extractedData;
  if (!transactionData) {
    throw new Error("No transaction data to save");
  }

  // 2. Handle Receipt creation if present
  let receiptId: string | undefined = undefined;
  if (message.receiptUrl) {
    const receipt = await db.receipt.create({
      data: {
        url: message.receiptUrl,
        merchant: transactionData.merchant,
        total: transactionData.amount,
        items: transactionData.items ? (transactionData.items as any) : undefined
      }
    });
    receiptId = receipt.id;
  }

  // 3. Handle Split Bill creation if present
  let splitBillId: string | undefined = undefined;
  if (transactionData.type === "SPLIT_BILL" && transactionData.splitDetails) {
    const split = transactionData.splitDetails;
    const splitBill = await db.splitBill.create({
      data: {
        totalAmount: transactionData.amount,
        groupSize: split.groupSize || 2,
        payerName: split.payerName || "You",
        userPaidFirst: split.userPaidFirst ?? true,
        userShare: split.userShare || (transactionData.amount / (split.groupSize || 2)),
        receivables: split.receivables || 0
      }
    });

    splitBillId = splitBill.id;

    // Create friends shares
    if (split.friendsShares && Array.isArray(split.friendsShares)) {
      for (const share of split.friendsShares) {
        // Upsert friend record first to ensure they exist
        let friend = await db.friend.findUnique({
          where: {
            userId_name: {
              userId,
              name: share.friendName
            }
          }
        });

        if (!friend) {
          friend = await db.friend.create({
            data: {
              userId,
              name: share.friendName
            }
          });
        }

        await db.friendShare.create({
          data: {
            splitBillId: splitBill.id,
            friendId: friend.id,
            shareAmount: share.shareAmount,
            isPaid: false
          }
        });
      }
    }
  }

  // 4. Create the main Transaction
  const transaction = await db.transaction.create({
    data: {
      userId,
      type: transactionData.type || "EXPENSE",
      merchant: transactionData.merchant || "General Merchant",
      amount: transactionData.amount || 0,
      date: transactionData.date ? new Date(transactionData.date) : new Date(),
      category: transactionData.category || "General",
      notes: transactionData.notes || "",
      tags: transactionData.tags || [],
      receiptId,
      splitBillId
    }
  });

  // 5. Update Budget thresholds and create notifications if exceeded
  if (transaction.type === "EXPENSE" || transaction.type === "BILL" || transaction.type === "SUBSCRIPTION") {
    const month = transaction.date.getMonth() + 1;
    const year = transaction.date.getFullYear();
    
    // Find budget for this category
    const budget = await db.budget.findUnique({
      where: {
        userId_category_month_year: {
          userId,
          category: transaction.category,
          month,
          year
        }
      }
    });

    if (budget) {
      const updatedSpent = budget.spent + transaction.amount;
      await db.budget.update({
        where: { id: budget.id },
        data: { spent: updatedSpent }
      });

      if (updatedSpent > budget.limit) {
        // Create budget exceeded notification
        await db.notification.create({
          data: {
            userId,
            title: `Budget Exceeded: ${transaction.category}`,
            content: `You spent Rp${updatedSpent.toLocaleString('id-ID')} which exceeds your budget limit of Rp${budget.limit.toLocaleString('id-ID')} for ${transaction.category}.`,
            type: "BUDGET_EXCEEDED"
          }
        });
      }
    }
  }

  // 6. Mark message as confirmed/saved
  await db.aIMessage.update({
    where: { id: messageId },
    data: { status: "saved" }
  });

  if (transaction.type === "SPLIT_BILL" && splitBillId) {
    const headersList = await headers();
    const host = headersList.get("host") || "localhost:3000";
    const protocol = headersList.get("x-forwarded-proto") || "http";
    const baseUrl = `${protocol}://${host}`;
    const shareUrl = `${baseUrl}/share/split/${splitBillId}`;
    await db.aIMessage.create({
      data: {
        conversationId: message.conversationId,
        role: "assistant",
        content: `Transaksi patungan Anda berhasil disimpan! 🎉\n\nApakah Anda ingin membagikan tagihan ini kepada teman-teman? Berikut adalah tautan patungan yang dapat Anda bagikan:\n\n🔗 [Bagikan Tautan Patungan](${shareUrl})\n\nAtau salin tautan berikut:\n\`${shareUrl}\`\n\n*Catatan: Tautan ini hanya berlaku selama 7 hari atau otomatis ditutup setelah semua patungan dilunasi.*`,
        status: "sent"
      }
    });
  }

  revalidatePath("/chat");
  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/budgets");
  return transaction;
}

// Cancel Transaction Action
export async function cancelTransaction(messageId: string) {
  const message = await db.aIMessage.update({
    where: { id: messageId },
    data: { status: "cancelled" }
  });

  revalidatePath("/chat");
  return message;
}

// Pay Friend Share Action
export async function payFriendShare(friendShareId: string) {
  const share = await db.friendShare.update({
    where: { id: friendShareId },
    data: { isPaid: true },
    include: {
      splitBill: {
        include: {
          friendsShares: true
        }
      }
    }
  });

  // Calculate new receivables: total receivables is the sum of unpaid shares
  const unpaidSharesSum = share.splitBill.friendsShares
    .filter(s => !s.isPaid)
    .reduce((sum, s) => sum + s.shareAmount, 0);

  await db.splitBill.update({
    where: { id: share.splitBillId },
    data: {
      receivables: unpaidSharesSum
    }
  });

  revalidatePath(`/share/split/${share.splitBillId}`);
  revalidatePath("/chat");
  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/budgets");
  return share;
}
