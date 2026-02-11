'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createContactSubmission, createNotification } from '@/lib/firebase/firestore'

export default function ContactForm() {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // Pre-fill form if user is logged in
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.displayName || prev.name,
        email: user.email || prev.email,
      }))
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    // Validation
    if (!formData.name.trim()) {
      setError('Please enter your name')
      setLoading(false)
      return
    }
    if (!formData.email.trim()) {
      setError('Please enter your email')
      setLoading(false)
      return
    }
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }
    if (!formData.message.trim()) {
      setError('Please enter a message')
      setLoading(false)
      return
    }

    try {
      // Write directly to Firestore from client
      await createContactSubmission({
        name: formData.name.trim(),
        email: formData.email.trim(),
        message: formData.message.trim(),
        userId: user?.uid,
      })

      // Create admin notification for new contact message
      try {
        await createNotification({
          type: 'new_contact',
          title: 'New Contact Message',
          message: `${formData.name.trim()} (${formData.email.trim()}) sent a message.`,
          link: '/dashboard/admin/contacts',
        })
      } catch (e) { /* non-critical */ }

      setSuccess(true)
      setFormData({
        name: user?.displayName || '',
        email: user?.email || '',
        message: '',
      })
      setTimeout(() => setSuccess(false), 5000)
    } catch (err: any) {
      console.error('Error submitting contact form:', err)
      setError(err.message || 'Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-2 text-xs text-red-800">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md bg-green-50 border border-green-200 p-2 text-xs text-green-800">
          Thank you! Your message has been sent successfully.
        </div>
      )}
      <div>
        <input
          type="text"
          placeholder="Your Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 sm:text-sm"
          required
        />
      </div>
      <div>
        <input
          type="email"
          placeholder="Your Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 sm:text-sm"
          required
        />
      </div>
      <div>
        <textarea
          rows={3}
          placeholder="Your Message"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 sm:text-sm"
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed sm:text-sm"
      >
        {loading ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  )
}

