import React, { useEffect, useState } from 'react'
import api from './api'
import { toast } from 'react-toastify'

export default function AdminDashboard() {
  const [pending, setPending] = useState([])
  const [bookings, setBookings] = useState([])
  const [lostFoundItems, setLostFoundItems] = useState([])
  const [maintenanceRequests, setMaintenanceRequests] = useState([])
  const [maintenanceStats, setMaintenanceStats] = useState(null)
  const [residentsCount, setResidentsCount] = useState(0)
  const [noticesCount, setNoticesCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const [bRes, allBookings, lostFound, rRes, nRes, mRes, mStats] = await Promise.all([
        api.get('/bookings?status=pending'),
        api.get('/bookings'),
        api.get('/lostfound'),
        api.get('/residents'),
        api.get('/notices'),
        api.get('/maintenance'),
        api.get('/maintenance/stats/monthly')
      ])
      setPending(bRes.data)
      setBookings(allBookings.data)
      setLostFoundItems(lostFound.data)
      setResidentsCount(rRes.data.length)
      setNoticesCount(nRes.data.length)
      setMaintenanceRequests(mRes.data)
      setMaintenanceStats(mStats.data)
    } catch (err) {
      console.error(err)
      toast.error('Failed to load admin data: ' + (err.response?.data?.error || 'Please try again later'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { 
    const loadWithRetry = async (retries = 3) => {
      try {
        await load()
      } catch (err) {
        if (retries > 0) {
          setTimeout(() => loadWithRetry(retries - 1), 2000)
        }
      }
    }
    loadWithRetry()
  }, [])

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/bookings/${id}/status`, { status })
      toast.success('Status updated successfully')
      load()
    } catch (err) {
      console.error(err)
      toast.error('Failed to update status: ' + (err.response?.data?.error || 'Please try again'))
    }
  }

  if (loading) return <div className="p-4">Loading...</div>

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold">Admin Dashboard</h2>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="p-3 bg-white shadow rounded">
          <div className="text-sm text-gray-500">Residents</div>
          <div className="text-3xl font-bold">{residentsCount}</div>
        </div>
        <div className="p-3 bg-white shadow rounded">
          <div className="text-sm text-gray-500">Notices</div>
          <div className="text-3xl font-bold">{noticesCount}</div>
        </div>
        <div className="p-3 bg-white shadow rounded">
          <div className="text-sm text-gray-500">Pending Bookings</div>
          <div className="text-3xl font-bold">{pending.length}</div>
        </div>
        <div className="p-3 bg-white shadow rounded">
          <div className="text-sm text-gray-500">Open Maintenance</div>
          <div className="text-3xl font-bold">{maintenanceRequests.filter(r => !['resolved', 'cancelled'].includes(r.status)).length}</div>
        </div>
      </div>

      <div className="mt-6 space-y-8">
        <div>
          <h3 className="text-xl font-semibold mb-3">Pending Bookings</h3>
          <div className="space-y-3">
            {pending.map(b => (
              <div key={b._id} className="p-3 bg-white shadow rounded">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold">{b.facility}</div>
                    <div className="text-sm text-gray-600">{new Date(b.date).toLocaleDateString()} — {b.from} to {b.to}</div>
                    <div className="text-xs text-gray-400">By: {b.user?.name} ({b.user?.email})</div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button onClick={() => updateStatus(b._id, 'approved')} className="px-3 py-1 bg-green-600 text-white rounded">Approve</button>
                    <button onClick={() => updateStatus(b._id, 'rejected')} className="px-3 py-1 bg-red-600 text-white rounded">Reject</button>
                  </div>
                </div>
              </div>
            ))}
            {pending.length === 0 && (
              <div className="text-sm text-gray-500">No pending bookings</div>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-3">All Bookings</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Facility</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.map(b => (
                  <tr key={b._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{b.facility}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(b.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{b.from} - {b.to}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{b.user?.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${b.status === 'approved' ? 'bg-green-100 text-green-800' :
                          b.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          b.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'}`}>
                        {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-3">Lost & Found Items</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Posted By</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {lostFoundItems.map(item => (
                  <tr key={item._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${item.type === 'lost' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.location}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${item.status === 'resolved' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.user?.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-3">Maintenance & Complaints</h3>
          
          {maintenanceStats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {maintenanceStats.map((stat) => (
                <div key={JSON.stringify(stat._id)} className="p-4 bg-white shadow rounded">
                  <div className="text-sm text-gray-500">
                    {stat._id.type} - {stat._id.category} ({stat._id.status})
                  </div>
                  <div className="text-2xl font-bold">{stat.count}</div>
                </div>
              ))}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested By</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {maintenanceRequests.map(request => (
                  <tr key={request._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{request.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${request.priority === 'high' ? 'bg-red-100 text-red-800' :
                          request.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'}`}>
                        {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${request.status === 'resolved' ? 'bg-green-100 text-green-800' :
                          request.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          request.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'}`}>
                        {request.status.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.user?.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
