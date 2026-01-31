'use client'

import ProtectedRoute from '@/app/components/ProtectedRoute'
import DashboardNav from '@/app/components/DashboardNav'
import Link from 'next/link'

export default function ResourcesPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <div className="border-b bg-white">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Resources</h1>
              <Link
                href="/"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>

        <DashboardNav />

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Educational Resources</h2>
              <p className="mt-1 text-sm text-slate-600">
                Access educational materials, guides, and information about the ED 2030 agenda and constitutional rights
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <ResourceCard
                title="Constitutional Rights Guide"
                description="Learn about your constitutional rights and how they apply in the context of ED 2030"
                icon="📚"
                href="#"
              />
              <ResourceCard
                title="ED 2030 Information"
                description="Comprehensive information about the ED 2030 agenda and its implications"
                icon="📋"
                href="#"
              />
              <ResourceCard
                title="Civic Engagement Toolkit"
                description="Tools and resources to help you engage with your local government"
                icon="🛠️"
                href="#"
              />
              <ResourceCard
                title="Legal Resources"
                description="Legal documents, templates, and guidance for lawful civic participation"
                icon="⚖️"
                href="#"
              />
              <ResourceCard
                title="Community Forums"
                description="Connect with other citizens and discuss local governance issues"
                icon="💬"
                href="#"
              />
              <ResourceCard
                title="Video Library"
                description="Educational videos and recorded sessions on constitutional governance"
                icon="🎥"
                href="#"
              />
            </div>

            <div className="mt-8 rounded-lg border border-slate-200 bg-white p-6">
              <h3 className="mb-4 text-lg font-bold">Quick Links</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <Link
                  href="#"
                  className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 hover:bg-slate-50 transition-colors"
                >
                  <span className="text-2xl">📄</span>
                  <div>
                    <p className="font-semibold">Download Resources</p>
                    <p className="text-sm text-slate-600">PDFs and documents</p>
                  </div>
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 hover:bg-slate-50 transition-colors"
                >
                  <span className="text-2xl">🔗</span>
                  <div>
                    <p className="font-semibold">External Links</p>
                    <p className="text-sm text-slate-600">Helpful websites</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

function ResourceCard({
  title,
  description,
  icon,
  href,
}: {
  title: string
  description: string
  icon: string
  href: string
}) {
  return (
    <Link
      href={href}
      className="group rounded-lg border border-slate-200 bg-white p-6 transition-all hover:border-slate-900 hover:shadow-lg"
    >
      <div className="mb-4 text-4xl">{icon}</div>
      <h3 className="mb-2 text-lg font-bold group-hover:text-slate-900 transition-colors">
        {title}
      </h3>
      <p className="text-sm text-slate-600">{description}</p>
    </Link>
  )
}

