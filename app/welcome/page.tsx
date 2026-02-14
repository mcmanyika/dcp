'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, Suspense } from 'react'
import DonationModal from '@/app/components/DonationModal'

function WelcomeContent() {
  const { user, userProfile, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextUrl = searchParams.get('next')
  const [donationModalOpen, setDonationModalOpen] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  // Auto-show donation modal on first visit
  useEffect(() => {
    if (!loading && user) {
      const hasSeenDonateModal = sessionStorage.getItem('welcome_donate_shown')
      if (!hasSeenDonateModal) {
        const timer = setTimeout(() => {
          setDonationModalOpen(true)
          sessionStorage.setItem('welcome_donate_shown', '1')
        }, 1500) // slight delay so user reads the welcome message first
        return () => clearTimeout(timer)
      }
    }
  }, [loading, user])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-slate-900 border-r-transparent" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  const displayName = userProfile?.name || user?.displayName || 'Member'
  const firstName = displayName.split(' ')[0]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Full-width Header */}
      <div className="bg-slate-900 text-white">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16 text-center">
          <Link href="/">
            <img
              src="/images/logo.png"
              alt="DCP Logo"
              className="mx-auto mb-6 h-16 w-16 rounded-lg object-contain hover:opacity-80 transition-opacity cursor-pointer"
            />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Welcome to the Defend the Constitution Platform
          </h1>
          <p className="mt-3 text-sm text-slate-400">
            &ldquo;Defending the Constitution is Defending Our Future&rdquo;
          </p>
        </div>
      </div>

      {/* Message Body */}
      <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm">
          <p className="text-base sm:text-lg text-slate-700 leading-relaxed mb-6">
            Dear <strong className="text-slate-900">{displayName}</strong>,
          </p>

          <p className="text-base text-slate-700 leading-relaxed mb-6">
            Thank you for joining the <strong>Defend the Constitution Platform (DCP)</strong>.
          </p>

          <p className="text-base text-slate-700 leading-relaxed mb-6">
            By choosing to become part of this Platform, you have joined a community of citizens
            committed to a simple but profound principle:{' '}
            <strong className="text-slate-900">Zimbabwe must be governed according to its Constitution.</strong>
          </p>

          <p className="text-base text-slate-700 leading-relaxed mb-6">
            The DCP is a non-partisan, citizen-anchored constitutional movement. We do not exist to
            compete for political office, but to protect the rules that make democratic politics
            possible. Our work is guided by the People&rsquo;s Resolution &mdash; the shared commitment
            that constitutional legitimacy, popular sovereignty, and the rule of law must remain the
            foundation of our national life.
          </p>

          <p className="text-base text-slate-700 leading-relaxed mb-4">
            Your membership strengthens a collective effort to:
          </p>

          <ul className="mb-6 space-y-3">
            {[
              'Defend constitutional term limits and democratic safeguards',
              'Promote full implementation of the Constitution',
              'Support lawful civic participation and public accountability',
              'Build a culture of constitutionalism across society',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="text-base text-slate-700">{item}</span>
              </li>
            ))}
          </ul>

          <p className="text-base text-slate-700 leading-relaxed mb-6">
            We encourage you to stay engaged, participate in programmes and dialogues in your
            community, and share accurate information from our official platforms. The strength of
            this movement lies not in personalities, but in citizens acting together in defence of a
            common national covenant.
          </p>

          {/* Highlight Quote */}
          <div className="mb-6 rounded-lg border-l-4 border-emerald-500 bg-emerald-50 py-4 px-5">
            <p className="text-base sm:text-lg font-semibold italic text-slate-900">
              Defending the Constitution is defending our future.
            </p>
          </div>

          <p className="text-base text-slate-700 leading-relaxed mb-8">
            Your solidarity contribution of <strong className="text-slate-900">USD5 per month</strong> or{' '}
            <strong className="text-slate-900">USD60 per annum</strong> will help us reach as many of
            our compatriots at home.
          </p>

          {/* Signature */}
          <div className="mb-8 border-t border-slate-100 pt-6">
            <p className="text-base text-slate-700 mb-1">Warm regards,</p>
            <p className="text-base font-bold text-slate-900">Senator Jameson Zvidzai Timba</p>
            <p className="text-sm text-slate-500">Convenor</p>
            <p className="text-sm text-slate-500">Defend the Constitution Platform (DCP)</p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={nextUrl || '/membership-application'}
              className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
            >
              {nextUrl ? 'Continue →' : 'Apply for Membership →'}
            </Link>
            <button
              onClick={() => setDonationModalOpen(true)}
              className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
            >
              Donate
            </button>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Donation Modal */}
      <DonationModal isOpen={donationModalOpen} onClose={() => setDonationModalOpen(false)} />

      {/* Footer */}
      <div className="border-t bg-slate-100 py-6 text-center">
        <p className="text-xs text-slate-500">
          &copy; {new Date().getFullYear()} Defend the Constitution Platform. All rights reserved.
        </p>
      </div>
    </div>
  )
}

export default function WelcomePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-slate-900 border-r-transparent" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    }>
      <WelcomeContent />
    </Suspense>
  )
}
