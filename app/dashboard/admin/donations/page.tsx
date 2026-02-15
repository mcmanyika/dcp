'use client'

import { useState, useEffect } from 'react'
import ProtectedRoute from '@/app/components/ProtectedRoute'
import AdminRoute from '@/app/components/AdminRoute'
import DashboardNav from '@/app/components/DashboardNav'
import Link from 'next/link'
import { getAllDonations, getAllUsers } from '@/lib/firebase/firestore'
import type { Donation, UserProfile } from '@/types'

function toDate(date: Date | any): Date | null {
  if (!date) return null
  if (date instanceof Date) return date
  if (date && typeof date === 'object' && 'toDate' in date) {
    return (date as any).toDate()
  }
  return new Date(date as string | number)
}

function formatDate(date: Date | null): string {
  if (!date) return 'N/A'
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function AdminDonationsPage() {
  return (
    <ProtectedRoute>
      <AdminRoute>
        <div className="min-h-screen bg-slate-50">
          <div className="border-b bg-white">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Donations</h1>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  ← Back to Dashboard
                </Link>
              </div>
            </div>
          </div>

          <DashboardNav />

          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
            <DonationsManagement />
          </div>
        </div>
      </AdminRoute>
    </ProtectedRoute>
  )
}

type StatusFilter = 'all' | 'succeeded' | 'pending' | 'failed' | 'canceled'

function DonationsManagement() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [users, setUsers] = useState<Record<string, UserProfile>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')
      const [allDonations, allUsers] = await Promise.all([
        getAllDonations(),
        getAllUsers(),
      ])
      setDonations(allDonations)

      // Build user lookup map
      const userMap: Record<string, UserProfile> = {}
      allUsers.forEach((u) => {
        userMap[u.uid] = u
      })
      setUsers(userMap)
    } catch (err: any) {
      setError(err.message || 'Failed to load donations')
      console.error('Error loading donations:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredDonations = donations.filter((donation) => {
    if (statusFilter !== 'all' && donation.status !== statusFilter) return false
    if (searchQuery) {
      const term = searchQuery.toLowerCase()
      const donor = users[donation.userId]
      const donorName = donor?.name?.toLowerCase() || ''
      const donorEmail = donor?.email?.toLowerCase() || ''
      const description = donation.description?.toLowerCase() || ''
      const id = donation.id.toLowerCase()
      if (
        !donorName.includes(term) &&
        !donorEmail.includes(term) &&
        !description.includes(term) &&
        !id.includes(term)
      ) {
        return false
      }
    }
    return true
  })

  const statusCounts = {
    all: donations.length,
    succeeded: donations.filter((d) => d.status === 'succeeded').length,
    pending: donations.filter((d) => d.status === 'pending').length,
    failed: donations.filter((d) => d.status === 'failed').length,
    canceled: donations.filter((d) => d.status === 'canceled').length,
  }

  const totalAmount = donations
    .filter((d) => d.status === 'succeeded')
    .reduce((sum, d) => sum + d.amount, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-slate-900 border-r-transparent"></div>
          <p className="text-slate-600">Loading donations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Donations</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{donations.length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Successful</p>
          <p className="mt-1 text-2xl font-bold text-green-600">{statusCounts.succeeded}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Revenue</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">${totalAmount.toFixed(2)}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pending / Failed</p>
          <p className="mt-1 text-2xl font-bold text-yellow-600">
            {statusCounts.pending} / {statusCounts.failed}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-900">Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by donor, email, description..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 sm:text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-900">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 sm:text-sm"
            >
              <option value="all">All ({statusCounts.all})</option>
              <option value="succeeded">Succeeded ({statusCounts.succeeded})</option>
              <option value="pending">Pending ({statusCounts.pending})</option>
              <option value="failed">Failed ({statusCounts.failed})</option>
              <option value="canceled">Canceled ({statusCounts.canceled})</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchQuery('')
                setStatusFilter('all')
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors sm:text-sm"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Donations Table */}
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Donation ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Donor
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Currency
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredDonations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-600">
                    {searchQuery || statusFilter !== 'all'
                      ? 'No donations match your filters'
                      : 'No donations found'}
                  </td>
                </tr>
              ) : (
                filteredDonations.map((donation) => {
                  const createdAt = toDate(donation.createdAt)
                  const donor = users[donation.userId]
                  const statusColors: Record<string, string> = {
                    succeeded: 'bg-green-100 text-green-700',
                    pending: 'bg-yellow-100 text-yellow-700',
                    failed: 'bg-red-100 text-red-700',
                    canceled: 'bg-slate-100 text-slate-700',
                  }

                  return (
                    <tr key={donation.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="text-xs font-medium text-slate-900">
                          #{donation.id.slice(0, 8)}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {donation.stripePaymentIntentId?.slice(0, 20)}...
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {donor ? (
                          <div>
                            <div className="text-xs font-medium text-slate-900">{donor.name}</div>
                            <div className="text-[10px] text-slate-500">{donor.email}</div>
                          </div>
                        ) : (
                          <div className="text-xs text-slate-500">
                            {donation.userId ? `${donation.userId.slice(0, 12)}...` : 'Anonymous'}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-slate-900">
                        ${donation.amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600 uppercase">
                        {donation.currency}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full px-2 py-1 text-xs font-semibold capitalize ${
                            statusColors[donation.status] || 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {donation.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600 max-w-[200px] truncate">
                        {donation.description || '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        {formatDate(createdAt)}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
