import { Suspense } from 'react'
import LoginForm from '@/app/components/LoginForm'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block mb-4">
            <img 
              src="/images/logo.png" 
              alt="DCP Logo" 
              className="mx-auto h-24 w-24 rounded-md object-contain"
            />
          </Link>
          <h1 className="mb-2 text-3xl font-bold">Welcome Back</h1>
          <p className="text-slate-600">Sign in to your account</p>
        </div>

        <div className="rounded-2xl border bg-white p-8 shadow-sm">
          <Suspense fallback={
            <div className="text-center py-8">
              <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-slate-900 border-r-transparent"></div>
              <p className="text-slate-600">Loading...</p>
            </div>
          }>
            <LoginForm />
          </Suspense>
        </div>

        <p className="mt-6 text-center text-sm text-slate-600">
          Don't have an account?{' '}
          <Link href="/signup" className="font-semibold text-slate-900 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

