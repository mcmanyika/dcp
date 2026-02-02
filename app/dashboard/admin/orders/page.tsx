'use client'

import { useState, useEffect } from 'react'
import ProtectedRoute from '@/app/components/ProtectedRoute'
import AdminRoute from '@/app/components/AdminRoute'
import DashboardNav from '@/app/components/DashboardNav'
import Link from 'next/link'
import { getAllPurchases, updatePurchase, getProductById } from '@/lib/firebase/firestore'
import type { Purchase, PaymentStatus, ShipmentStatus } from '@/types'

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
  })
}

export default function AdminOrdersPage() {
  return (
    <ProtectedRoute>
      <AdminRoute>
        <div className="min-h-screen bg-slate-50">
          <div className="border-b bg-white">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Order Management</h1>
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
            <OrdersManagement />
          </div>
        </div>
      </AdminRoute>
    </ProtectedRoute>
  )
}

function OrdersManagement() {
  const [orders, setOrders] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>('all')
  const [shipmentFilter, setShipmentFilter] = useState<ShipmentStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Purchase | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [productImages, setProductImages] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    status: 'succeeded' as PaymentStatus,
    shipmentStatus: 'pending' as ShipmentStatus,
    trackingNumber: '',
  })
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      setLoading(true)
      setError('')
      const allOrders = await getAllPurchases()
      setOrders(allOrders)

      // Fetch product images
      const imageMap: Record<string, string> = {}
      for (const order of allOrders) {
        if (order.productId && !imageMap[order.productId]) {
          try {
            const product = await getProductById(order.productId)
            if (product?.image) {
              imageMap[order.productId] = product.image
            }
          } catch (err) {
            console.error(`Error fetching product ${order.productId}:`, err)
          }
        }
      }
      setProductImages(imageMap)
    } catch (err: any) {
      setError(err.message || 'Failed to load orders')
      console.error('Error loading orders:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (order: Purchase) => {
    setSelectedOrder(order)
    setFormData({
      status: order.status,
      shipmentStatus: order.shipmentStatus || 'pending',
      trackingNumber: order.trackingNumber || '',
    })
    setShowModal(true)
  }

  const handleUpdate = async () => {
    if (!selectedOrder) return

    setUpdating(true)
    try {
      await updatePurchase(selectedOrder.id, {
        status: formData.status,
        shipmentStatus: formData.shipmentStatus,
        trackingNumber: formData.trackingNumber.trim() || undefined,
      })
      await loadOrders()
      setShowModal(false)
      setSelectedOrder(null)
    } catch (err: any) {
      setError(err.message || 'Failed to update order')
      console.error('Error updating order:', err)
    } finally {
      setUpdating(false)
    }
  }

  const filteredOrders = orders.filter((order) => {
    if (statusFilter !== 'all' && order.status !== statusFilter) return false
    if (shipmentFilter !== 'all' && order.shipmentStatus !== shipmentFilter) return false
    if (searchQuery && !order.productName.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const statusCounts = {
    all: orders.length,
    succeeded: orders.filter((o) => o.status === 'succeeded').length,
    pending: orders.filter((o) => o.status === 'pending').length,
    failed: orders.filter((o) => o.status === 'failed').length,
    canceled: orders.filter((o) => o.status === 'canceled').length,
  }

  const shipmentCounts = {
    all: orders.length,
    pending: orders.filter((o) => o.shipmentStatus === 'pending' || !o.shipmentStatus).length,
    processing: orders.filter((o) => o.shipmentStatus === 'processing').length,
    shipped: orders.filter((o) => o.shipmentStatus === 'shipped').length,
    delivered: orders.filter((o) => o.shipmentStatus === 'delivered').length,
    cancelled: orders.filter((o) => o.shipmentStatus === 'cancelled').length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-slate-900 border-r-transparent"></div>
          <p className="text-slate-600">Loading orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="grid gap-4 sm:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-900">Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search orders..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 sm:text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-900">Payment Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as PaymentStatus | 'all')}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 sm:text-sm"
            >
              <option value="all">All ({statusCounts.all})</option>
              <option value="succeeded">Succeeded ({statusCounts.succeeded})</option>
              <option value="pending">Pending ({statusCounts.pending})</option>
              <option value="failed">Failed ({statusCounts.failed})</option>
              <option value="canceled">Canceled ({statusCounts.canceled})</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-900">Shipment Status</label>
            <select
              value={shipmentFilter}
              onChange={(e) => setShipmentFilter(e.target.value as ShipmentStatus | 'all')}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 sm:text-sm"
            >
              <option value="all">All ({shipmentCounts.all})</option>
              <option value="pending">Pending ({shipmentCounts.pending})</option>
              <option value="processing">Processing ({shipmentCounts.processing})</option>
              <option value="shipped">Shipped ({shipmentCounts.shipped})</option>
              <option value="delivered">Delivered ({shipmentCounts.delivered})</option>
              <option value="cancelled">Cancelled ({shipmentCounts.cancelled})</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchQuery('')
                setStatusFilter('all')
                setShipmentFilter('all')
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

      {/* Orders Table */}
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Order
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Product
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Payment Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Shipment Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Date
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-600">
                    {searchQuery || statusFilter !== 'all' || shipmentFilter !== 'all'
                      ? 'No orders match your filters'
                      : 'No orders found'}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const createdAt = toDate(order.createdAt)
                  const paymentStatusColors = {
                    succeeded: 'bg-green-100 text-green-700',
                    pending: 'bg-yellow-100 text-yellow-700',
                    failed: 'bg-red-100 text-red-700',
                    canceled: 'bg-slate-100 text-slate-700',
                  }
                  const shipmentStatusColors = {
                    pending: 'bg-yellow-100 text-yellow-700',
                    processing: 'bg-blue-100 text-blue-700',
                    shipped: 'bg-purple-100 text-purple-700',
                    delivered: 'bg-green-100 text-green-700',
                    cancelled: 'bg-red-100 text-red-700',
                  }

                  return (
                    <tr key={order.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {productImages[order.productId] && (
                            <img
                              src={productImages[order.productId]}
                              alt={order.productName}
                              className="h-10 w-10 rounded object-cover"
                            />
                          )}
                          <div className="text-xs font-medium text-slate-900">
                            #{order.id.slice(0, 8)}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        {order.userId.slice(0, 8)}...
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs font-medium text-slate-900">{order.productName}</div>
                        {order.trackingNumber && (
                          <div className="text-xs text-slate-500">Tracking: {order.trackingNumber}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold text-slate-900">
                        ${order.amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full px-2 py-1 text-xs font-semibold capitalize ${
                            paymentStatusColors[order.status]
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full px-2 py-1 text-xs font-semibold capitalize ${
                            shipmentStatusColors[order.shipmentStatus || 'pending']
                          }`}
                        >
                          {order.shipmentStatus || 'pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        {formatDate(createdAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleEdit(order)}
                          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Edit Order</h2>
              <button
                onClick={() => {
                  setShowModal(false)
                  setSelectedOrder(null)
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4 space-y-2 text-sm">
              <p><span className="font-semibold">Order ID:</span> {selectedOrder.id}</p>
              <p><span className="font-semibold">Product:</span> {selectedOrder.productName}</p>
              <p><span className="font-semibold">Amount:</span> ${selectedOrder.amount.toFixed(2)}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-900">
                  Payment Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as PaymentStatus })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="pending">Pending</option>
                  <option value="succeeded">Succeeded</option>
                  <option value="failed">Failed</option>
                  <option value="canceled">Canceled</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-900">
                  Shipment Status
                </label>
                <select
                  value={formData.shipmentStatus}
                  onChange={(e) => setFormData({ ...formData, shipmentStatus: e.target.value as ShipmentStatus })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-900">
                  Tracking Number (Optional)
                </label>
                <input
                  type="text"
                  value={formData.trackingNumber}
                  onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                  placeholder="Enter tracking number"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleUpdate}
                  disabled={updating}
                  className="flex-1 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? 'Updating...' : 'Update Order'}
                </button>
                <button
                  onClick={() => {
                    setShowModal(false)
                    setSelectedOrder(null)
                  }}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

