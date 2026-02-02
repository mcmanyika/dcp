'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/app/components/Header'
import { getPetitionById, signPetition } from '@/lib/firebase/firestore'
import { useAuth } from '@/contexts/AuthContext'
import type { Petition } from '@/types'

export default function PetitionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, userProfile } = useAuth()
  const [petition, setPetition] = useState<Petition | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showSignModal, setShowSignModal] = useState(false)
  const [signing, setSigning] = useState(false)
  const [signError, setSignError] = useState('')
  const [signData, setSignData] = useState({
    name: userProfile?.name || user?.displayName || '',
    email: user?.email || '',
    anonymous: false,
  })

  useEffect(() => {
    if (params.id) {
      loadPetition(params.id as string)
    }
  }, [params.id])

  const loadPetition = async (id: string) => {
    try {
      setLoading(true)
      const data = await getPetitionById(id)
      if (!data || !data.isPublished || !data.isActive) {
        setError('Petition not found or no longer active')
        return
      }
      setPetition(data)
      setError('')
    } catch (err: any) {
      setError(err.message || 'Failed to load petition')
      console.error('Error loading petition:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSign = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!petition) return

    setSigning(true)
    setSignError('')

    try {
      await signPetition(petition.id, {
        userId: user?.uid,
        name: signData.name.trim(),
        email: signData.email.trim(),
        anonymous: signData.anonymous,
      })
      setShowSignModal(false)
      await loadPetition(petition.id)
    } catch (err: any) {
      setSignError(err.message || 'Failed to sign petition')
    } finally {
      setSigning(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="pt-24 pb-12">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-slate-900 border-r-transparent"></div>
              <p className="text-slate-600">Loading petition...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !petition) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="pt-24 pb-12">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
              <p className="text-red-600 mb-4">{error || 'Petition not found'}</p>
              <Link
                href="/petitions"
                className="inline-block rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
              >
                Back to Petitions
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const progress = Math.min((petition.currentSignatures / petition.goal) * 100, 100)
  const hasExpired = petition.expiresAt && new Date(petition.expiresAt instanceof Date ? petition.expiresAt : (petition.expiresAt as any)?.toDate?.() || new Date()) < new Date()
  const hasSigned = Boolean(user?.uid && petition.signatures.some((sig) => sig.userId === user.uid))

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="pt-24 pb-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Link
            href="/petitions"
            className="mb-6 inline-flex items-center text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            ← Back to Petitions
          </Link>

          <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
            {petition.image && (
              <div className="h-64 md:h-96 overflow-hidden">
                <img
                  src={petition.image}
                  alt={petition.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-8">
              <h1 className="text-3xl font-bold mb-4">{petition.title}</h1>
              <p className="text-lg text-slate-600 mb-6">{petition.description}</p>

              {petition.content && (
                <div className="prose max-w-none mb-8">
                  <div className="text-slate-700 whitespace-pre-wrap">{petition.content}</div>
                </div>
              )}

              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-semibold text-slate-900">
                    {petition.currentSignatures} / {petition.goal} signatures
                  </span>
                  <span className="text-lg text-slate-600">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div
                    className="bg-slate-900 h-3 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {hasExpired && (
                <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                  This petition has expired
                </div>
              )}

              {!hasExpired && petition.isActive && (
                <button
                  onClick={() => setShowSignModal(true)}
                  disabled={hasSigned}
                  className={`w-full rounded-lg px-6 py-3 text-base font-semibold text-white transition-colors ${
                    hasSigned
                      ? 'bg-green-600 cursor-not-allowed'
                      : 'bg-slate-900 hover:bg-slate-800'
                  }`}
                >
                  {hasSigned ? '✓ You have signed this petition' : 'Sign This Petition'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sign Modal */}
      {showSignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Sign Petition</h3>
                <button
                  onClick={() => {
                    setShowSignModal(false)
                    setSignError('')
                  }}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSign} className="space-y-4">
                {signError && (
                  <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
                    {signError}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={signData.name}
                    onChange={(e) => setSignData({ ...signData, name: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={signData.email}
                    onChange={(e) => setSignData({ ...signData, email: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    required
                  />
                </div>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={signData.anonymous}
                    onChange={(e) => setSignData({ ...signData, anonymous: e.target.checked })}
                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  <span className="ml-2 text-sm text-slate-700">Sign anonymously</span>
                </label>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={signing}
                    className="flex-1 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {signing ? 'Signing...' : 'Sign Petition'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSignModal(false)
                      setSignError('')
                    }}
                    className="rounded-lg border-2 border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

