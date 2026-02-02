'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/app/components/Header'
import { getPetitions, getPetitionById, signPetition } from '@/lib/firebase/firestore'
import { useAuth } from '@/contexts/AuthContext'
import type { Petition } from '@/types'

export default function PetitionsPage() {
  const [petitions, setPetitions] = useState<Petition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadPetitions()
  }, [])

  const loadPetitions = async () => {
    try {
      setLoading(true)
      const publishedPetitions = await getPetitions(true, true) // Only published and active
      setPetitions(publishedPetitions)
      setError('')
    } catch (err: any) {
      setError(err.message || 'Failed to load petitions')
      console.error('Error loading petitions:', err)
    } finally {
      setLoading(false)
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
              <p className="text-slate-600">Loading petitions...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="pt-24 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-4">Petitions</h1>
            <p className="text-slate-600">
              Make your voice heard. Sign petitions that matter to you.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {petitions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600">No active petitions at this time.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {petitions.map((petition) => (
                <PetitionCard key={petition.id} petition={petition} onSign={loadPetitions} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function PetitionCard({ petition, onSign }: { petition: Petition; onSign: () => void }) {
  const { user, userProfile } = useAuth()
  const [showSignModal, setShowSignModal] = useState(false)
  const [signing, setSigning] = useState(false)
  const [signError, setSignError] = useState('')
  const [signData, setSignData] = useState({
    name: userProfile?.name || user?.displayName || '',
    email: user?.email || '',
    anonymous: false,
  })

  const progress = Math.min((petition.currentSignatures / petition.goal) * 100, 100)
  const hasExpired = petition.expiresAt && new Date(petition.expiresAt instanceof Date ? petition.expiresAt : (petition.expiresAt as any)?.toDate?.() || new Date()) < new Date()

  const handleSign = async (e: React.FormEvent) => {
    e.preventDefault()
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
      onSign()
    } catch (err: any) {
      setSignError(err.message || 'Failed to sign petition')
    } finally {
      setSigning(false)
    }
  }

  const hasSigned = Boolean(user?.uid && petition.signatures.some((sig) => sig.userId === user.uid))

  return (
    <>
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden hover:shadow-lg transition-shadow">
        {petition.image && (
          <div className="h-48 overflow-hidden">
            <img
              src={petition.image}
              alt={petition.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="p-6">
          <h3 className="text-xl font-bold mb-2">{petition.title}</h3>
          <p className="text-slate-600 text-sm mb-4 line-clamp-3">{petition.description}</p>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-slate-900">
                {petition.currentSignatures} / {petition.goal} signatures
              </span>
              <span className="text-sm text-slate-600">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-slate-900 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {hasExpired && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
              This petition has expired
            </div>
          )}

          <div className="flex gap-2">
            <Link
              href={`/petitions/${petition.id}`}
              className="flex-1 rounded-lg border-2 border-slate-300 px-4 py-2 text-center text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              View Details
            </Link>
            {!hasExpired && (
              <button
                onClick={() => setShowSignModal(true)}
                disabled={hasSigned || !petition.isActive}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors ${
                  hasSigned
                    ? 'bg-green-600 cursor-not-allowed'
                    : petition.isActive
                    ? 'bg-slate-900 hover:bg-slate-800'
                    : 'bg-slate-400 cursor-not-allowed'
                }`}
              >
                {hasSigned ? 'Signed ✓' : 'Sign'}
              </button>
            )}
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
    </>
  )
}

