'use client'

import { useEffect, useState } from 'react'
import AdminPageLayout from '@/features/admin/components/AdminPageLayout'

interface DraftItem {
  type: 'blog' | 'project'
  slug: string
  title: string
  status: string
  path: string
  updatedAt?: string
}

export default function ReviewPage() {
  const [drafts, setDrafts] = useState<DraftItem[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/agent/drafts')
      const data = await res.json()
      setDrafts(data.drafts || [])
    } catch (e) {
      setMessage('Failed to load drafts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const act = async (item: DraftItem, action: 'approve' | 'reject') => {
    setMessage('')
    const res = await fetch('/api/agent/drafts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: item.path, action }),
    })
    const data = await res.json()
    if (!res.ok) {
      setMessage(data.error || 'Action failed')
      return
    }
    setMessage(data.message || 'OK')
    await load()
  }

  return (
    <AdminPageLayout
      title="Review Queue"
      subtitle="Approve or reject agent-ingested drafts before Publish"
      centered={false}
      maxWidth="1200px"
    >
      {message && (
        <p className="mb-4 text-sm" style={{ color: 'var(--accent, #06b6d4)' }}>
          {message}
        </p>
      )}

      {loading ? (
        <p className="text-gray-400">Loading drafts…</p>
      ) : drafts.length === 0 ? (
        <div className="glass-card p-6">
          <p className="text-gray-300">No drafts waiting.</p>
          <p className="text-gray-500 text-sm mt-2">
            Agents POST to <code>/api/agent/ingest</code> with <code>status: &quot;draft&quot;</code>.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {drafts.map((d) => (
            <div
              key={`${d.type}-${d.path}`}
              className="glass-card p-4 flex flex-wrap items-center justify-between gap-3"
            >
              <div>
                <div className="text-xs uppercase tracking-wide text-gray-500">
                  {d.type} · {d.status}
                </div>
                <div className="text-lg font-semibold">{d.title}</div>
                <div className="text-sm text-gray-400">
                  <code>{d.path}</code>
                  {d.updatedAt ? ` · ${new Date(d.updatedAt).toLocaleString()}` : ''}
                </div>
              </div>
              <div className="flex gap-2">
                <a className="btn-neon px-3 py-2 text-sm" href={`/admin/content`}>
                  Open editor
                </a>
                <button
                  type="button"
                  className="btn-neon px-3 py-2 text-sm"
                  onClick={() => act(d, 'approve')}
                >
                  Approve
                </button>
                <button
                  type="button"
                  className="px-3 py-2 text-sm rounded border border-red-400/40 text-red-300"
                  onClick={() => act(d, 'reject')}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminPageLayout>
  )
}
