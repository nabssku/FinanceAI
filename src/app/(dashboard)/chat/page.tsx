'use client';

import React, { useState, useEffect, useRef, useTransition } from "react";
import { 
  Sparkles, 
  Send, 
  Upload, 
  Image as ImageIcon, 
  X, 
  Save, 
  Edit2, 
  Trash2, 
  Plus, 
  Check, 
  ArrowRightLeft,
  Users, 
  FileText,
  DollarSign,
  Loader2,
  Receipt
} from "lucide-react";
import { 
  getConversations, 
  getMessages, 
  createConversation, 
  sendMessage, 
  confirmTransaction, 
  cancelTransaction 
} from "@/app/actions/chat-actions";
import { uploadReceipt } from "@/app/actions/upload-actions";

export default function ChatPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  
  // Receipt Upload States
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Edit / Form states for transaction confirmation cards
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<any>(null);

  // Pending action transitions
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load chat conversations on mount
  useEffect(() => {
    loadChats();
  }, []);

  // Reload messages when active conversation changes
  useEffect(() => {
    if (activeConvId) {
      loadMessages(activeConvId);
    }
  }, [activeConvId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, uploading]);

  const loadChats = async () => {
    try {
      const chats = await getConversations();
      setConversations(chats);
      if (chats.length > 0 && !activeConvId) {
        setActiveConvId(chats[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadMessages = async (convId: string) => {
    try {
      const msgs = await getMessages(convId);
      setMessages(msgs);
    } catch (e) {
      console.error(e);
    }
  };

  const handleNewChat = async () => {
    try {
      const newChat = await createConversation("Chat " + new Date().toLocaleDateString());
      setConversations(prev => [newChat, ...prev]);
      setActiveConvId(newChat.id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !selectedFile) return;
    if (!activeConvId) return;

    const textToSend = inputText;
    setInputText("");
    
    let receiptUrl = "";

    startTransition(async () => {
      // 1. If file selected, upload to Cloudinary first
      if (selectedFile) {
        setUploading(true);
        try {
          const formData = new FormData();
          formData.append("file", selectedFile);
          const uploadRes = await uploadReceipt(formData);
          receiptUrl = uploadRes.url;
        } catch (err) {
          console.error("Upload failed", err);
        } finally {
          setUploading(false);
          setSelectedFile(null);
          setPreviewImage(null);
        }
      }

      // Optimistic user message addition
      const tempUserMsg = {
        id: `temp-${Date.now()}`,
        role: "user",
        content: textToSend || "Uploaded a receipt photo",
        receiptUrl: receiptUrl || null,
        createdAt: new Date()
      };
      setMessages(prev => [...prev, tempUserMsg]);

      // 2. Call Send Message action
      try {
        await sendMessage(activeConvId, textToSend, receiptUrl);
        // Reload messages to retrieve actual database records
        await loadMessages(activeConvId);
      } catch (err) {
        console.error("Failed to send message", err);
      }
    });
  };

  // File drag & drop / Select Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreviewImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Transaction card actions
  const handleSave = async (messageId: string, customData?: any) => {
    startTransition(async () => {
      try {
        await confirmTransaction(messageId, customData || null);
        if (activeConvId) await loadMessages(activeConvId);
        setEditingMessageId(null);
        setEditFormData(null);
      } catch (err) {
        console.error(err);
      }
    });
  };

  const handleCancel = async (messageId: string) => {
    startTransition(async () => {
      try {
        await cancelTransaction(messageId);
        if (activeConvId) await loadMessages(activeConvId);
      } catch (err) {
        console.error(err);
      }
    });
  };

  const startEditing = (message: any) => {
    setEditingMessageId(message.id);
    
    // Initialize editing form with extracted transaction schema
    const data = message.extractedData || {};
    
    // Initialize split details if not existing
    const splitDetails = data.splitDetails || {
      groupSize: 2,
      payerName: "You",
      userPaidFirst: true,
      userShare: data.amount / 2,
      receivables: data.amount / 2,
      friendsShares: [
        { friendName: "Sarah", shareAmount: data.amount / 2 }
      ]
    };

    setEditFormData({
      merchant: data.merchant || "Indomaret",
      amount: data.amount || 0,
      date: data.date ? data.date.substring(0, 10) : new Date().toISOString().substring(0, 10),
      category: data.category || "Groceries",
      type: data.type || "EXPENSE",
      notes: data.notes || "",
      tags: data.tags || [],
      isSplitBill: data.type === "SPLIT_BILL" || data.isSplitBill || false,
      splitDetails
    });
  };

  const handleFormChange = (key: string, value: any) => {
    setEditFormData((prev: any) => {
      const updated = { ...prev, [key]: value };
      
      // Auto recalculate split shares if split bill properties edit
      if (key === "amount" || key === "type") {
        if (updated.type === "SPLIT_BILL" || updated.isSplitBill) {
          const groupSize = updated.splitDetails.groupSize;
          const userShare = updated.amount / groupSize;
          const receivables = updated.amount - userShare;
          
          updated.splitDetails = {
            ...updated.splitDetails,
            userShare,
            receivables,
            friendsShares: updated.splitDetails.friendsShares.map((f: any) => ({
              ...f,
              shareAmount: receivables / (groupSize - 1)
            }))
          };
        }
      }
      return updated;
    });
  };

  const handleSplitFieldChange = (field: string, value: any) => {
    setEditFormData((prev: any) => {
      const split = { ...prev.splitDetails, [field]: value };
      const amount = prev.amount;

      if (field === "groupSize") {
        const size = Number(value) || 2;
        // Re-align friends array size
        let shares = [...split.friendsShares];
        if (shares.length < size - 1) {
          // Add default friends
          const names = ["Sarah", "David", "Jessica", "Michael"];
          for (let i = shares.length; i < size - 1; i++) {
            shares.push({ friendName: names[i] || `Friend ${i + 1}`, shareAmount: 0 });
          }
        } else if (shares.length > size - 1) {
          shares = shares.slice(0, size - 1);
        }

        const userShare = amount / size;
        const receivables = amount - userShare;
        const sharePerFriend = receivables / (size - 1);

        split.userShare = userShare;
        split.receivables = receivables;
        split.friendsShares = shares.map(f => ({ ...f, shareAmount: sharePerFriend }));
      }

      if (field === "userShare") {
        split.userShare = Number(value) || 0;
        split.receivables = amount - split.userShare;
        // Distribute remaining receivables equally among friends
        const friendCount = split.friendsShares.length;
        if (friendCount > 0) {
          const perFriend = split.receivables / friendCount;
          split.friendsShares = split.friendsShares.map((f: any) => ({ ...f, shareAmount: perFriend }));
        }
      }

      return {
        ...prev,
        splitDetails: split
      };
    });
  };

  const handleFriendShareChange = (index: number, field: string, value: any) => {
    setEditFormData((prev: any) => {
      const split = { ...prev.splitDetails };
      const shares = [...split.friendsShares];
      
      shares[index] = { ...shares[index], [field]: field === "shareAmount" ? Number(value) || 0 : value };
      split.friendsShares = shares;

      // Recalculate receivables and user share
      const friendsSum = shares.reduce((acc: number, f: any) => acc + f.shareAmount, 0);
      split.receivables = friendsSum;
      split.userShare = prev.amount - friendsSum;

      return {
        ...prev,
        splitDetails: split
      };
    });
  };

  return (
    <div className="h-[calc(100vh-88px)] flex gap-6 overflow-hidden relative">
      
      {/* CHAT SESSION LIST (SIDEBAR PANEL) */}
      <div className="w-64 bg-[#18181B] border border-[#27272A] rounded-2xl flex flex-col overflow-hidden shrink-0 hidden md:flex">
        <div className="p-4 border-b border-[#27272A] flex items-center justify-between">
          <span className="text-xs font-bold text-[#FAFAFA] tracking-wide uppercase">Percakapan</span>
          <button 
            onClick={handleNewChat}
            className="p-1.5 rounded-lg bg-[#27272A] hover:bg-zinc-800 text-[#FAFAFA] transition-colors border border-transparent hover:border-[#3f3f46]"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => setActiveConvId(conv.id)}
              className={`w-full text-left p-3 rounded-xl text-xs font-medium transition-all truncate border ${
                activeConvId === conv.id 
                  ? "bg-indigo-600/10 text-indigo-400 border-indigo-500/20 font-semibold" 
                  : "text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#202024] border-transparent"
              }`}
            >
              {conv.title}
            </button>
          ))}
        </div>
      </div>

      {/* CHAT CONSOLE */}
      <div className="flex-1 bg-[#18181B] border border-[#27272A] rounded-2xl flex flex-col overflow-hidden shadow-xl">
        {/* Chat Stream Header */}
        <div className="px-6 py-4 border-b border-[#27272A] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#FAFAFA]">Area Kerja Asisten</h3>
            <p className="text-[10px] text-[#A1A1AA]">Tulis kalimat seperti "Beli kopi Rp25.000" atau unggah foto struk</p>
          </div>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 && !uploading && (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <Sparkles className="w-12 h-12 text-indigo-500/20 mb-4 animate-pulse-glow rounded-xl p-2 bg-indigo-500/5 border border-indigo-500/10" />
              <h4 className="text-xs font-bold text-[#FAFAFA]">Riwayat Percakapan Asisten AI</h4>
              <p className="text-[10px] text-[#A1A1AA] max-w-xs mt-1 leading-relaxed">
                Gambarkan transaksi Anda atau unggah foto struk. AI akan mengekstrak dan menstrukturkan data secara instan untuk konfirmasi pencatatan Anda.
              </p>
            </div>
          )}

          {messages.map((msg) => {
            const isUser = msg.role === "user";
            
            return (
              <div 
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar Icon */}
                <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center border ${
                  isUser 
                    ? 'bg-zinc-800 border-zinc-700 text-[#FAFAFA]' 
                    : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                }`}>
                  {isUser ? <FileText className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                </div>

                {/* Message Bubble Content */}
                <div className="flex flex-col gap-2">
                  <div className={`p-4 rounded-2xl text-xs leading-relaxed border ${
                    isUser 
                      ? 'bg-[#27272A]/70 text-[#FAFAFA] border-[#27272A]' 
                      : 'bg-[#09090B]/60 text-[#FAFAFA] border-[#27272A]'
                  }`}>
                    {/* Render raw content text */}
                    <div className="whitespace-pre-line leading-relaxed space-y-1.5">
                      {parseMarkdownToJSX(msg.content)}
                    </div>

                    {/* Render user receipt thumbnail inside chat if present */}
                    {msg.receiptUrl && (
                      <div className="mt-3 relative w-36 rounded-lg overflow-hidden border border-[#27272A] bg-zinc-950 group">
                        <img 
                          src={msg.receiptUrl} 
                          alt="Receipt Scan Attachment" 
                          className="w-full h-auto object-cover max-h-48"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-[9px] text-white bg-black/60 px-2 py-0.5 rounded">Struk diunggah</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* TRANSACTION PENDING CONFIRMATION CARD (ASSISTANT VALUE) */}
                  {!isUser && msg.status === "pending_confirmation" && msg.extractedData && (
                    <div className="glass-panel border border-[#27272A] rounded-2xl p-5 shadow-2xl w-full max-w-md flex flex-col gap-4 animate-slide-up mt-1">
                      
                      {/* Card Title Header */}
                      <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
                        <span className="font-bold text-xs text-indigo-400 flex items-center gap-2">
                          <Receipt className="w-4 h-4 text-indigo-400" />
                          Kartu Transaksi Terdeteksi
                        </span>
                        <span className="text-[9px] uppercase tracking-wider font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded">
                          {editingMessageId === msg.id ? editFormData?.type : msg.extractedData.type}
                        </span>
                      </div>

                      {/* CONDITIONAL CARD RENDER (EDITING FORM VS READ-ONLY DETAILS) */}
                      {editingMessageId === msg.id ? (
                        /* EDITING STATE FORM */
                        <div className="space-y-3.5">
                          <div className="grid grid-cols-2 gap-3">
                            {/* Merchant Input */}
                            <div className="flex flex-col gap-1">
                              <label className="text-[9px] text-[#A1A1AA] uppercase font-bold">Merchant/Toko</label>
                              <input
                                type="text"
                                value={editFormData.merchant}
                                onChange={(e) => handleFormChange("merchant", e.target.value)}
                                className="input-premium py-1.5 px-3 text-xs w-full"
                              />
                            </div>
                            {/* Amount Input */}
                            <div className="flex flex-col gap-1">
                              <label className="text-[9px] text-[#A1A1AA] uppercase font-bold">Nominal (Rp)</label>
                              <input
                                type="number"
                                value={editFormData.amount}
                                onChange={(e) => handleFormChange("amount", Number(e.target.value))}
                                className="input-premium py-1.5 px-3 text-xs w-full font-semibold text-emerald-400"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            {/* Category Input */}
                            <div className="flex flex-col gap-1">
                              <label className="text-[9px] text-[#A1A1AA] uppercase font-bold">Kategori</label>
                              <select
                                value={editFormData.category}
                                onChange={(e) => handleFormChange("category", e.target.value)}
                                className="input-premium py-1.5 px-3 text-xs w-full"
                              >
                                <option value="Groceries">Bahan Makanan</option>
                                <option value="Food">Makanan & Minuman</option>
                                <option value="Bills">Tagihan & Utilitas</option>
                                <option value="Subscription">Langganan</option>
                                <option value="Salary">Gaji & Pendapatan</option>
                                <option value="Investment">Investasi</option>
                                <option value="Savings">Tabungan</option>
                                <option value="Transport">Transportasi</option>
                                <option value="Entertainment">Hiburan</option>
                                <option value="Other">Lainnya</option>
                              </select>
                            </div>
                            {/* Date Input */}
                            <div className="flex flex-col gap-1">
                              <label className="text-[9px] text-[#A1A1AA] uppercase font-bold">Tanggal</label>
                              <input
                                type="date"
                                value={editFormData.date}
                                onChange={(e) => handleFormChange("date", e.target.value)}
                                className="input-premium py-1.5 px-3 text-xs w-full"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            {/* Transaction Type Select */}
                            <div className="flex flex-col gap-1">
                              <label className="text-[9px] text-[#A1A1AA] uppercase font-bold">Tipe Transaksi</label>
                              <select
                                value={editFormData.type}
                                onChange={(e) => handleFormChange("type", e.target.value)}
                                className="input-premium py-1.5 px-3 text-xs w-full"
                              >
                                <option value="EXPENSE">Pengeluaran</option>
                                <option value="INCOME">Pendapatan</option>
                                <option value="TRANSFER">Transfer</option>
                                <option value="BILL">Tagihan</option>
                                <option value="SUBSCRIPTION">Langganan</option>
                                <option value="INVESTMENT">Investasi</option>
                                <option value="SAVINGS">Tabungan</option>
                                <option value="SPLIT_BILL">Patungan Tagihan (Split Bill)</option>
                              </select>
                            </div>
                            {/* Notes Input */}
                            <div className="flex flex-col gap-1">
                              <label className="text-[9px] text-[#A1A1AA] uppercase font-bold">Catatan</label>
                              <input
                                type="text"
                                value={editFormData.notes}
                                onChange={(e) => handleFormChange("notes", e.target.value)}
                                placeholder="Tambah catatan..."
                                className="input-premium py-1.5 px-3 text-xs w-full"
                              />
                            </div>
                          </div>

                          {/* SPLIT BILL SPECIAL WORKFLOW DETAILS */}
                          {(editFormData.type === "SPLIT_BILL" || editFormData.isSplitBill) && (
                            <div className="mt-4 p-4 rounded-xl bg-zinc-950/60 border border-[#27272A] space-y-4">
                              <div className="flex items-center gap-2 text-indigo-400 font-semibold text-[11px]">
                                <Users className="w-3.5 h-3.5" />
                                <span>Distribusi Patungan (Split Bill)</span>
                              </div>

                              <div className="grid grid-cols-3 gap-3">
                                {/* Group size */}
                                <div className="flex flex-col gap-1">
                                  <label className="text-[8px] text-[#A1A1AA] uppercase">Jumlah Orang</label>
                                  <input
                                    type="number"
                                    min="2"
                                    value={editFormData.splitDetails.groupSize}
                                    onChange={(e) => handleSplitFieldChange("groupSize", Number(e.target.value))}
                                    className="input-premium py-1 px-2 text-xs w-full"
                                  />
                                </div>
                                {/* Payer field */}
                                <div className="flex flex-col gap-1">
                                  <label className="text-[8px] text-[#A1A1AA] uppercase">Nama Pembayar</label>
                                  <input
                                    type="text"
                                    value={editFormData.splitDetails.payerName}
                                    onChange={(e) => handleSplitFieldChange("payerName", e.target.value)}
                                    className="input-premium py-1 px-2 text-xs w-full"
                                  />
                                </div>
                                {/* Did user pay first? */}
                                <div className="flex flex-col gap-1">
                                  <label className="text-[8px] text-[#A1A1AA] uppercase">Anda yang bayar?</label>
                                  <select
                                    value={editFormData.splitDetails.userPaidFirst ? "yes" : "no"}
                                    onChange={(e) => handleSplitFieldChange("userPaidFirst", e.target.value === "yes")}
                                    className="input-premium py-1 px-2 text-xs w-full"
                                  >
                                    <option value="yes">Ya</option>
                                    <option value="no">Tidak</option>
                                  </select>
                                </div>
                              </div>

                              {/* Share Calculations */}
                              <div className="space-y-3 pt-2 border-t border-[#27272A]/50">
                                <div className="flex justify-between items-center text-[11px]">
                                  <span className="text-[#A1A1AA]">Bagian Anda:</span>
                                  <input
                                    type="number"
                                    value={editFormData.splitDetails.userShare}
                                    onChange={(e) => handleSplitFieldChange("userShare", Number(e.target.value))}
                                    className="w-24 bg-transparent border-b border-[#27272A] focus:border-indigo-500 outline-none text-right font-semibold text-white px-1 text-xs"
                                  />
                                </div>
                                <div className="flex justify-between items-center text-[11px]">
                                  <span className="text-[#A1A1AA]">Total Piutang Teman:</span>
                                  <span className="font-bold text-emerald-400">Rp{editFormData.splitDetails.receivables.toLocaleString('id-ID')}</span>
                                </div>

                                {/* Friends individual splits list */}
                                <div className="space-y-2 pt-2 border-t border-[#27272A]/30">
                                  <p className="text-[9px] uppercase text-[#A1A1AA] font-bold">Rincian Bagian Teman</p>
                                  {editFormData.splitDetails.friendsShares.map((friend: any, fIdx: number) => (
                                    <div key={fIdx} className="flex gap-2 items-center justify-between">
                                      <input
                                        type="text"
                                        value={friend.friendName}
                                        onChange={(e) => handleFriendShareChange(fIdx, "friendName", e.target.value)}
                                        className="bg-transparent border-b border-transparent hover:border-[#27272A] focus:border-indigo-500 outline-none text-[11px] text-white w-24 px-1"
                                      />
                                      <input
                                        type="number"
                                        value={friend.shareAmount}
                                        onChange={(e) => handleFriendShareChange(fIdx, "shareAmount", Number(e.target.value))}
                                        className="w-24 bg-transparent border-b border-[#27272A] focus:border-indigo-500 outline-none text-right text-[11px] text-white px-1"
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* STANDARD READ-ONLY VIEW */
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                              <span className="text-[#A1A1AA]">Merchant/Toko</span>
                              <p className="font-bold text-[#FAFAFA] text-sm mt-0.5">{msg.extractedData.merchant}</p>
                            </div>
                            <div>
                              <span className="text-[#A1A1AA]">Nominal</span>
                              <p className="font-extrabold text-emerald-400 text-sm mt-0.5">
                                Rp{msg.extractedData.amount.toLocaleString('id-ID')}
                              </p>
                            </div>
                            <div>
                              <span className="text-[#A1A1AA]">Kategori Rekomendasi</span>
                              <p className="font-semibold text-[#FAFAFA] mt-0.5">{msg.extractedData.category}</p>
                            </div>
                            <div>
                              <span className="text-[#A1A1AA]">Tanggal Transaksi</span>
                              <p className="font-semibold text-[#FAFAFA] mt-0.5">
                                {new Date(msg.extractedData.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </p>
                            </div>
                          </div>

                          {msg.extractedData.notes && (
                            <div className="text-[11px] bg-zinc-950/40 p-2.5 rounded-lg border border-[#27272A]/50">
                              <span className="text-[#A1A1AA] block text-[9px] uppercase font-bold">Catatan</span>
                              <p className="text-[#FAFAFA] mt-0.5 leading-normal">{msg.extractedData.notes}</p>
                            </div>
                          )}

                          {/* Split bill visual shares */}
                          {msg.extractedData.type === "SPLIT_BILL" && msg.extractedData.splitDetails && (
                            <div className="p-3 bg-zinc-950/40 border border-[#27272A] rounded-xl text-[11px]">
                              <span className="text-indigo-400 font-semibold block mb-2">Detail Patungan: {msg.extractedData.splitDetails.payerName} membayar</span>
                              <div className="space-y-1">
                                <div className="flex justify-between">
                                  <span className="text-[#A1A1AA]">Bagian Anda:</span>
                                  <span className="font-semibold text-white">Rp{msg.extractedData.splitDetails.userShare.toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-[#A1A1AA]">Piutang yang harus ditagih:</span>
                                  <span className="font-bold text-emerald-400">Rp{msg.extractedData.splitDetails.receivables.toLocaleString('id-ID')}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* CARD CONTROLS BUTTONS FOOTER */}
                      <div className="flex items-center gap-2 pt-3 border-t border-[#27272A] mt-2">
                        {editingMessageId === msg.id ? (
                          /* EDITING CONTROLS */
                          <>
                            <button
                              onClick={() => handleSave(msg.id, editFormData)}
                              disabled={isPending}
                              className="flex-1 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-transparent hover:border-indigo-400 transition-colors"
                            >
                              <Save className="w-3.5 h-3.5" />
                              <span>Simpan Perubahan</span>
                            </button>
                            <button
                              onClick={() => { setEditingMessageId(null); setEditFormData(null); }}
                              className="py-2 px-3 rounded-lg bg-[#27272A] hover:bg-zinc-800 text-[#FAFAFA] font-semibold text-xs transition-colors"
                            >
                              Batal
                            </button>
                          </>
                        ) : (
                          /* READ CONTROLS */
                          <>
                            <button
                              onClick={() => handleSave(msg.id)}
                              disabled={isPending}
                              className="flex-1 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-transparent hover:border-indigo-400 transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Simpan Transaksi</span>
                            </button>
                            <button
                              onClick={() => startEditing(msg)}
                              className="py-2 px-3 rounded-lg bg-[#27272A] hover:bg-zinc-800 text-[#FAFAFA] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleCancel(msg.id)}
                              className="py-2 px-3 rounded-lg bg-[#121214] hover:bg-red-500/10 text-[#A1A1AA] hover:text-red-400 font-semibold text-xs flex items-center justify-center gap-1.5 border border-transparent hover:border-red-500/20 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Batal</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Confirmed / Saved indicator states */}
                  {!isUser && msg.status === "saved" && (
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 self-start ml-2 mt-0.5">
                      <Check className="w-3 h-3 text-emerald-400" />
                      Berhasil disimpan ke database
                    </span>
                  )}
                  {!isUser && msg.status === "cancelled" && (
                    <span className="text-[10px] text-[#A1A1AA] font-semibold flex items-center gap-1 self-start ml-2 mt-0.5 italic">
                      Transaksi dibatalkan
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {/* UPLOADING LOADER COMPONENT */}
          {uploading && (
            <div className="flex gap-3 max-w-[85%] mr-auto items-center animate-pulse">
              <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center bg-indigo-500/10 border border-indigo-500/20">
                <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
              </div>
              <div className="p-4 rounded-2xl text-xs bg-[#09090B]/60 text-[#FAFAFA] border border-[#27272A] flex items-center gap-2">
                <span>Mengunggah struk dan memproses ekstraksi OCR di Groq...</span>
              </div>
            </div>
          )}

          <div ref={scrollRef} />
        </div>

        {/* DRAG AND DROP PREVIEW IMAGE STICKER */}
        {previewImage && (
          <div className="px-6 py-3 bg-[#09090B]/80 border-t border-[#27272A] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img 
                src={previewImage} 
                alt="Receipt Snapshot Thumbnail" 
                className="w-10 h-10 object-cover rounded-lg border border-[#27272A]"
              />
              <div className="text-left">
                <p className="text-xs font-semibold text-[#FAFAFA]">{selectedFile?.name}</p>
                <p className="text-[9px] text-[#A1A1AA]">Kirim pesan untuk menganalisis gambar</p>
              </div>
            </div>
            <button 
              onClick={clearFile}
              className="p-1 rounded-full hover:bg-[#27272A] text-[#A1A1AA] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* INPUT FORM BAR FOOTER */}
        <form 
          onSubmit={handleSend}
          className="p-4 border-t border-[#27272A] flex gap-2 items-center bg-[#121214]"
        >
          {/* File input */}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-lg text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#27272A] transition-all border border-transparent hover:border-[#27272A]"
          >
            <Upload className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={previewImage ? "Tambah komentar atau klik kirim untuk menganalisis..." : "Catat pemasukan, pengeluaran kopi, patungan tagihan, atau unggah struk..."}
            className="flex-1 input-premium py-2 text-xs"
            disabled={isPending}
          />

          <button
            type="submit"
            disabled={isPending || (!inputText.trim() && !selectedFile)}
            className="p-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] cursor-pointer"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

// Lightweight custom markdown parser to avoid importing heavy external packages
function parseMarkdownToJSX(text: string) {
  if (!text) return null;

  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  let key = 0;

  const lines = text.split("\n");
  return lines.map((line, lineIdx) => {
    const lineParts: React.ReactNode[] = [];
    let lastIdx = 0;
    linkRegex.lastIndex = 0; // reset
    
    while ((match = linkRegex.exec(line)) !== null) {
      if (match.index > lastIdx) {
        lineParts.push(renderTextWithFormatting(line.substring(lastIdx, match.index), key++));
      }
      
      const label = match[1];
      const url = match[2];
      const isExternal = url.startsWith("http") || url.startsWith("https");
      
      lineParts.push(
        <a 
          key={key++} 
          href={url} 
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          className="text-indigo-400 hover:text-indigo-300 font-bold underline transition-colors"
        >
          {label}
        </a>
      );
      
      lastIdx = linkRegex.lastIndex;
    }
    
    if (lastIdx < line.length) {
      lineParts.push(renderTextWithFormatting(line.substring(lastIdx), key++));
    }
    
    return (
      <span key={lineIdx} className="block min-h-[1em]">
        {lineParts}
      </span>
    );
  });
}

function renderTextWithFormatting(text: string, parentKey: number): React.ReactNode {
  const codeParts = text.split(/`([^`]+)`/g);
  let key = 0;
  
  return codeParts.map((part, idx) => {
    const isCode = idx % 2 === 1;
    if (isCode) {
      return (
        <code 
          key={`${parentKey}-code-${key++}`} 
          className="px-2 py-0.5 mx-0.5 rounded bg-zinc-950 border border-[#27272A] text-[#FAFAFA] font-mono text-[10px] select-all cursor-pointer hover:bg-zinc-900 transition-colors inline-block"
        >
          {part}
        </code>
      );
    }
    
    const boldParts = part.split(/\*\*([^*]+)\*\*/g);
    return boldParts.map((subPart, subIdx) => {
      const isBold = subIdx % 2 === 1;
      if (isBold) {
        return <strong key={`${parentKey}-bold-${key++}`} className="font-bold text-white">{subPart}</strong>;
      }
      return subPart;
    });
  });
}
