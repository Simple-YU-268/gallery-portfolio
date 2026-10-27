'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const router = useRouter()
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [activeTab, setActiveTab] = useState('photos')
  const [photos, setPhotos] = useState<any[]>([])
  const [series, setSeries] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)

  const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY || 'admin-secret-key'

  useEffect(() => {
    const key = localStorage.getItem('admin_key')
    if (key === ADMIN_KEY) {
      setAuthed(true)
      loadData()
    }
  }, [])

  const loadData = async () => {
    const key = localStorage.getItem('admin_key')
    const [photosRes, seriesRes] = await Promise.all([
      fetch('/api/photos', { headers: { Authorization: `Bearer ${key}` } }),
      fetch('/api/series', { headers: { Authorization: `Bearer ${key}` } }),
    ])
    setPhotos(await photosRes.json())
    setSeries(await seriesRes.json())
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_KEY) {
      localStorage.setItem('admin_key', password)
      setAuthed(true)
      loadData()
    } else {
      alert('Invalid password')
    }
  }

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setUploading(true)
    const formData = new FormData(e.currentTarget)
    const key = localStorage.getItem('admin_key')

    try {
      const res = await fetch('/api/photos', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}` },
        body: formData,
      })
      if (res.ok) {
        alert('Uploaded!')
        loadData()
        ;(e.target as HTMLFormElement).reset()
      } else {
        alert('Upload failed')
      }
    } catch (e) {
      alert('Upload failed')
    }
    setUploading(false)
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <form onSubmit={handleLogin} className="bg-card p-8 rounded-lg w-96">
          <h1 className="text-2xl font-light mb-6">Admin Login</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            className="w-full bg-muted p-3 rounded mb-4 text-foreground"
          />
          <button
            type="submit"
            className="w-full bg-accent text-accent-foreground p-3 rounded font-medium"
          >
            Login
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-neutral-800 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-light">Gallery Admin</h1>
          <button
            onClick={() => {
              localStorage.removeItem('admin_key')
              setAuthed(false)
            }}
            className="text-sm text-neutral-400 hover:text-white"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-4">
        <div className="flex gap-4 mb-6">
          {['photos', 'series', 'upload'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded ${
                activeTab === tab
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'photos' && (
          <div>
            <h2 className="text-xl mb-4">Photos ({photos.length})</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {photos.map((photo) => (
                <div key={photo.id} className="bg-card rounded overflow-hidden group">
                  <div className="relative">
                    <img
                      src={`/api/files/${photo.thumbnailPath}`}
                      alt={photo.title}
                      className="w-full aspect-square object-cover"
                    />
                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => {
                          const title = prompt('Title:', photo.title)
                          if (title === null) return
                          const location = prompt('Location:', photo.location || '')
                          const key = localStorage.getItem('admin_key')
                          fetch(`/api/photos/${photo.id}`, {
                            method: 'PUT',
                            headers: {
                              'Content-Type': 'application/json',
                              Authorization: `Bearer ${key}`,
                            },
                            body: JSON.stringify({
                              title,
                              location: location || null,
                            }),
                          }).then(() => loadData())
                        }}
                        className="px-3 py-1 bg-accent text-accent-foreground rounded text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (!confirm('Delete this photo?')) return
                          const key = localStorage.getItem('admin_key')
                          fetch(`/api/photos/${photo.id}`, {
                            method: 'DELETE',
                            headers: { Authorization: `Bearer ${key}` },
                          }).then(() => loadData())
                        }}
                        className="px-3 py-1 bg-red-600 text-white rounded text-xs"
                      >
                        Del
                      </button>
                    </div>
                  </div>
                  <div className="p-2">
                    <p className="text-sm truncate">{photo.title}</p>
                    <p className="text-xs text-neutral-500">
                      {photo.series?.title || 'No series'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'series' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl">Series ({series.length})</h2>
              <button
                onClick={() => {
                  const title = prompt('Series title:')
                  const slug = prompt('Slug (URL-friendly, e.g. "tibet-train"):')
                  if (!title || !slug) return
                  const key = localStorage.getItem('admin_key')
                  fetch('/api/series', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${key}`,
                    },
                    body: JSON.stringify({
                      title,
                      slug,
                      isPublished: false,
                      order: series.length,
                    }),
                  }).then(() => loadData())
                }}
                className="px-4 py-2 bg-accent text-accent-foreground rounded text-sm"
              >
                + New Series
              </button>
            </div>
            <div className="space-y-2">
              {series.map((s) => (
                <div
                  key={s.id}
                  className="bg-card p-4 rounded flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">{s.title}</p>
                    <p className="text-sm text-neutral-500">/{s.slug}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-neutral-400">
                      {s._count?.photos || 0} photos
                    </span>
                    <button
                      onClick={() => {
                        const key = localStorage.getItem('admin_key')
                        fetch(`/api/series/${s.id}`, {
                          method: 'DELETE',
                          headers: { Authorization: `Bearer ${key}` },
                        }).then(() => loadData())
                      }}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'upload' && (
          <form onSubmit={handleUpload} className="bg-card p-6 rounded max-w-2xl">
            <h2 className="text-xl mb-4">Upload Photo</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1">File</label>
                <input
                  type="file"
                  name="file"
                  accept="image/*"
                  required
                  className="w-full bg-muted p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  className="w-full bg-muted p-2 rounded text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Series</label>
                <select
                  name="seriesId"
                  className="w-full bg-muted p-2 rounded text-foreground"
                >
                  <option value="">No series</option>
                  {series.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Location</label>
                <input
                  type="text"
                  name="location"
                  className="w-full bg-muted p-2 rounded text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  className="w-full bg-muted p-2 rounded text-foreground"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isPublished"
                  value="true"
                  id="publish"
                />
                <label htmlFor="publish">Publish immediately</label>
              </div>
              <button
                type="submit"
                disabled={uploading}
                className="w-full bg-accent text-accent-foreground p-3 rounded font-medium disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
