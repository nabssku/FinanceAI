'use client';

import React, { useState, useEffect, useTransition } from "react";
import { useSession } from "next-auth/react";
import { User, Mail, Link as LinkIcon, Save, Loader2, UserCheck } from "lucide-react";
import { updateProfile } from "@/app/actions/settings-actions";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState("");
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Populate data when session loads
  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "Alex Sterling");
      setEmail(session.user.email || "alex@example.com");
      setImage(session.user.image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200");
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        await updateProfile({ name, email, image: image || undefined });
        
        // Trigger session context update
        await update({
          name,
          email,
          image
        });

        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } catch (err) {
        console.error(err);
      }
    });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#27272A] pb-4">
        <div>
          <h2 className="text-sm font-bold text-[#FAFAFA] tracking-wide uppercase">Akun Pengguna</h2>
          <p className="text-[10px] text-[#A1A1AA]">Ubah detail profil dan tampilan avatar Anda</p>
        </div>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <UserCheck className="w-4.5 h-4.5" />
          <span>Profil berhasil diperbarui</span>
        </div>
      )}

      {/* Profile Form Card */}
      <div className="glass-panel border border-[#27272A] rounded-2xl p-6 shadow">
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Avatar Preview */}
          <div className="flex flex-col items-center gap-4 border-b border-[#27272A]/50 pb-5">
            <img
              src={image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"}
              alt="Avatar Profile Preview"
              className="w-20 h-20 rounded-full object-cover border-2 border-indigo-600 bg-zinc-800"
            />
            <span className="text-[10px] text-[#A1A1AA] uppercase tracking-wider font-semibold">Pratinjau Langsung</span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Display Name */}
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10px] text-[#A1A1AA] uppercase font-bold flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>Nama Lengkap</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-premium py-2 px-3 text-xs w-full font-medium"
                required
              />
            </div>

            {/* Email address */}
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10px] text-[#A1A1AA] uppercase font-bold flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                <span>Alamat Email</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-premium py-2 px-3 text-xs w-full text-[#A1A1AA] cursor-not-allowed bg-zinc-950/40"
                disabled
              />
              <span className="text-[9px] text-zinc-500">Email terautentikasi tidak dapat diubah secara manual</span>
            </div>

            {/* Profile Picture URL */}
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10px] text-[#A1A1AA] uppercase font-bold flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5" />
                <span>URL Foto Profil</span>
              </label>
              <input
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="Link gambar Unsplash / Google..."
                className="input-premium py-2 px-3 text-xs w-full"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 neon-glow-primary disabled:opacity-55 cursor-pointer"
          >
            {isPending ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Simpan Profil</span>
          </button>
        </form>
      </div>

    </div>
  );
}
