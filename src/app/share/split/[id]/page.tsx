import React from "react";
import { db } from "@/lib/db";
import { 
  Receipt, 
  Calendar, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Wallet, 
  CreditCard
} from "lucide-react";
import { payFriendShare } from "@/app/actions/chat-actions";

export const revalidate = 0; // Fresh updates on navigation

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SplitBillSharePage({ params }: PageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  // Retrieve split bill along with transaction and friends shares
  const splitBill = await db.splitBill.findUnique({
    where: { id },
    include: {
      transaction: true,
      friendsShares: {
        include: {
          friend: true
        }
      }
    }
  });

  if (!splitBill) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#09090B]">
        <div className="glass-panel border border-[#27272A] rounded-2xl p-8 max-w-md w-full text-center space-y-4">
          <XCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h1 className="text-lg font-bold text-[#FAFAFA]">Tagihan Tidak Ditemukan</h1>
          <p className="text-xs text-[#A1A1AA]">Tautan pembayaran patungan ini tidak valid atau telah dihapus.</p>
        </div>
      </div>
    );
  }

  // Check if expired (7 days)
  const createdAt = splitBill.transaction ? new Date(splitBill.transaction.createdAt) : new Date();
  const isExpired = new Date().getTime() - createdAt.getTime() > 7 * 24 * 60 * 60 * 1000;

  // Check if fully paid
  const isFullyPaid = splitBill.friendsShares.every(s => s.isPaid);

  if (isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#09090B]">
        <div className="glass-panel border border-[#27272A] rounded-2xl p-8 max-w-md w-full text-center space-y-4">
          <XCircle className="w-12 h-12 text-amber-500 mx-auto" />
          <h1 className="text-lg font-bold text-[#FAFAFA]">Tautan Kedaluwarsa</h1>
          <p className="text-xs text-[#A1A1AA]">Tautan patungan ini telah melewati batas waktu 7 hari dan sudah tidak dapat diakses.</p>
        </div>
      </div>
    );
  }

  if (isFullyPaid) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#09090B]">
        <div className="glass-panel border border-[#27272A] rounded-2xl p-8 max-w-md w-full text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl" />
          <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce-slow" />
          <div className="space-y-2">
            <h1 className="text-lg font-extrabold text-[#FAFAFA]">Patungan Lunas! 🎉</h1>
            <p className="text-xs text-[#A1A1AA]">Seluruh pembayaran patungan untuk **{splitBill.transaction?.merchant || "Karis Jaya Shop"}** telah diselesaikan oleh semua orang.</p>
          </div>
          
          <div className="p-4 rounded-xl bg-zinc-950/45 border border-[#27272A]/50 text-left space-y-3">
            <h3 className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Histori Pembayar</h3>
            <div className="divide-y divide-[#27272A]/40 space-y-2.5">
              {splitBill.friendsShares.map((share) => (
                <div key={share.id} className="flex justify-between items-center text-xs pt-2.5 first:pt-0">
                  <span className="text-white font-medium">{share.friend.name}</span>
                  <span className="font-semibold text-emerald-400">Rp{share.shareAmount.toLocaleString('id-ID')} • Lunas</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#09090B]">
      <div className="w-full max-w-lg glass-panel border border-[#27272A] rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden flex flex-col gap-6">
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/5 rounded-full blur-3xl" />
        
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-[#27272A] pb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-[#FAFAFA] tracking-wide uppercase">Tagihan Patungan</h1>
            <p className="text-[10px] text-[#A1A1AA]">Rincian pembayaran bersama untuk Karis Jaya Shop</p>
          </div>
        </div>

        {/* Bill Summary */}
        <div className="grid grid-cols-2 gap-4 bg-zinc-950/45 p-4 rounded-xl border border-[#27272A]/50 text-xs">
          <div>
            <span className="text-[#A1A1AA] text-[9px] uppercase font-bold flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5" /> Toko / Merchant
            </span>
            <p className="font-bold text-[#FAFAFA] text-sm mt-1">{splitBill.transaction?.merchant || "Karis Jaya Shop"}</p>
          </div>
          <div>
            <span className="text-[#A1A1AA] text-[9px] uppercase font-bold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Tanggal Struk
            </span>
            <p className="font-semibold text-[#FAFAFA] text-sm mt-1">
              {splitBill.transaction ? new Date(splitBill.transaction.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : "-"}
            </p>
          </div>
          <div>
            <span className="text-[#A1A1AA] text-[9px] uppercase font-bold flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5" /> Total Pembayaran
            </span>
            <p className="font-extrabold text-emerald-400 text-sm mt-1">Rp{splitBill.totalAmount.toLocaleString('id-ID')}</p>
          </div>
          <div>
            <span className="text-[#A1A1AA] text-[9px] uppercase font-bold flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> Sisa Piutang
            </span>
            <p className="font-extrabold text-indigo-400 text-sm mt-1">Rp{splitBill.receivables.toLocaleString('id-ID')}</p>
          </div>
        </div>

        {/* Participants Shares */}
        <div className="space-y-3.5">
          <h2 className="text-[10px] font-bold text-[#FAFAFA] uppercase tracking-wider">Daftar Rekan Patungan</h2>
          <div className="space-y-2.5 divide-y divide-[#27272A]/30">
            {/* User Share (Read-only as Payer) */}
            <div className="flex justify-between items-center text-xs pt-2.5 first:pt-0">
              <div className="text-left">
                <p className="font-semibold text-[#FAFAFA]">{splitBill.payerName || "Anda"}</p>
                <span className="text-[9px] text-indigo-400 font-medium">Pembayar Pertama</span>
              </div>
              <div className="text-right">
                <p className="font-bold text-white">Rp{splitBill.userShare.toLocaleString('id-ID')}</p>
                <span className="text-[9px] text-[#A1A1AA]">Lunas</span>
              </div>
            </div>

            {/* Friend Shares */}
            {splitBill.friendsShares.map((share) => (
              <div key={share.id} className="flex justify-between items-center text-xs pt-2.5">
                <div className="text-left">
                  <p className="font-semibold text-[#FAFAFA]">{share.friend.name}</p>
                  <span className="text-[9px] text-[#A1A1AA]">Rekan Kongsi</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-bold text-white">Rp{share.shareAmount.toLocaleString('id-ID')}</p>
                    <span className={`text-[9px] font-bold ${share.isPaid ? 'text-emerald-400' : 'text-amber-500'}`}>
                      {share.isPaid ? 'Lunas' : 'Belum Lunas'}
                    </span>
                  </div>
                  {!share.isPaid && (
                    <form action={async () => {
                      "use server";
                      await payFriendShare(share.id);
                    }}>
                      <button 
                        type="submit" 
                        className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-[10px] font-bold text-white transition-all shadow-lg shadow-indigo-600/10 cursor-pointer animate-pulse-glow"
                      >
                        Bayar Porsi Saya
                      </button>
                    </form>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="text-[9px] text-[#A1A1AA] text-center mt-2 border-t border-[#27272A] pt-4">
          Tautan ini dibagikan secara publik oleh pemilik transaksi untuk memudahkan pembayaran patungan bersama.
        </div>
      </div>
    </div>
  );
}
