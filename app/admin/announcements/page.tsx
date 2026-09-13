'use client';

import type { FormEvent } from 'react';
import { useState } from 'react';
import { RequireRole } from '@/components/RequireRole';
import { PageHeader } from '@/components/PageHeader';
import { BottomTabs } from '@/components/BottomTabs';
import { PlusIcon, TrashIcon } from '@/components/Icons';
import { useApp } from '@/lib/store';
import { formatDate } from '@/lib/utils';

function AnnouncementsAdmin() {
  const { announcements, addAnnouncement, toggleAnnouncementPublished, deleteAnnouncement } = useApp();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    addAnnouncement(title.trim(), body.trim());
    setTitle('');
    setBody('');
  }

  return (
    <div className="shell">
      <PageHeader title="Announcements" />
      <div className="page-body">
        <form onSubmit={submit} className="panel !mt-0">
          <p className="text-[14px] font-semibold">New announcement</p>
          <input
            className="input mt-2"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="input mt-2"
            placeholder="Message"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <button type="submit" className="btn-primary mt-2">
            <PlusIcon width={17} height={17} /> Publish announcement
          </button>
        </form>

        <p className="section-label">Published & drafts</p>
        {announcements.map((a) => (
          <div key={a.id} className="panel !mt-0 mb-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-[14px] font-semibold">{a.title}</p>
                <p className="text-[12px] text-ink/50">{formatDate(a.date)}</p>
              </div>
              <span className={a.published ? 'badge-success' : 'badge-neutral'}>
                {a.published ? 'Published' : 'Hidden'}
              </span>
            </div>
            <p className="mt-2 text-[13px] text-ink/70">{a.body}</p>
            <div className="mt-2 flex gap-2">
              <button onClick={() => toggleAnnouncementPublished(a.id)} className="btn-outline btn-sm flex-1">
                {a.published ? 'Unpublish' : 'Publish'}
              </button>
              <button
                onClick={() => deleteAnnouncement(a.id)}
                className="btn-outline btn-sm !border-danger !text-danger"
                aria-label="Delete announcement"
              >
                <TrashIcon width={16} height={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <BottomTabs role="admin" />
    </div>
  );
}

export default function Page() {
  return (
    <RequireRole role="admin">
      <AnnouncementsAdmin />
    </RequireRole>
  );
}
