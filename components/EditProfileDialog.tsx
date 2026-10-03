// Nagbibigay ito ng modal form para baguhin ang pangalan at phone ng user.
'use client';

import { useState, type FormEvent } from 'react';
import { useApp } from '@/lib/store';

// Tumatanggap ng user details at close handler; ibinabalik ang form para i-update ang pangalan at phone number.
export function EditProfileDialog({
  userId,
  name,
  phone,
  onClose,
}: {
  userId: string;
  name: string;
  phone: string;
  onClose: () => void;
}) {
  const { updateUserProfile } = useApp();
  const [nextName, setNextName] = useState(name);
  const [nextPhone, setNextPhone] = useState(phone);

  // Tumatanggap ng form event; vine-validate at sine-save ang pangalan at phone, saka isinasara ang dialog.
  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!nextName.trim() || !nextPhone.trim()) return;
    updateUserProfile(userId, { name: nextName.trim(), phone: nextPhone.trim() });
    onClose();
  }

  return (
    // Modal form updates a user's editable profile fields without leaving the page.
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 px-4 pb-4 pt-10 backdrop-blur-sm sm:items-center sm:py-6" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="edit-profile-title" className="w-full max-w-[420px] rounded-2xl bg-white p-5 shadow-2xl ">
        <h2 id="edit-profile-title" className="font-display text-[18px] font-bold text-slate-900 ">Edit profile</h2>
        <p className="mt-1 text-[12px] text-slate-500 ">Update the contact details on your AYAB account.</p>
        <form onSubmit={saveProfile} className="mt-5 space-y-4">
          <div>
            <label htmlFor="profile-name" className="mb-1.5 block text-[11px] font-semibold text-slate-600 ">Full name</label>
            <input id="profile-name" className="w-full rounded-xl border-0 bg-slate-100 px-3.5 py-3 text-[13px] text-slate-800 outline-none focus:ring-2 focus:ring-blue-500  " value={nextName} onChange={(event) => setNextName(event.target.value)} required />
          </div>
          <div>
            <label htmlFor="profile-phone" className="mb-1.5 block text-[11px] font-semibold text-slate-600 ">Phone number</label>
            <input id="profile-phone" type="tel" className="w-full rounded-xl border-0 bg-slate-100 px-3.5 py-3 text-[13px] text-slate-800 outline-none focus:ring-2 focus:ring-blue-500  " value={nextPhone} onChange={(event) => setNextPhone(event.target.value)} required />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="min-h-11 flex-1 rounded-xl bg-slate-100 text-[12px] font-semibold text-slate-600 transition hover:bg-slate-200 active:scale-[0.98]   ">Cancel</button>
            <button type="submit" className="min-h-11 flex-1 rounded-xl bg-[#1769e0] text-[12px] font-semibold text-white transition hover:bg-[#125cc9] active:scale-[0.98]  ">Save changes</button>
          </div>
        </form>
      </section>
    </div>
  );
}
