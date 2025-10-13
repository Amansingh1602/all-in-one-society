import React, { useState, useEffect, useContext } from 'react';
import { Card, Button, Input } from './ui';
import { AuthContext } from '../App';
import api from '../api';
import { toast } from 'react-toastify';

const CATEGORIES = [
  { id: 'plumbing', name: 'Plumbing' },
  { id: 'electrical', name: 'Electrical' },
  { id: 'housekeeping', name: 'Housekeeping' },
  { id: 'security', name: 'Security' },
  { id: 'elevator', name: 'Elevator' },
  { id: 'parking', name: 'Parking' },
  { id: 'gym', name: 'Gymnasium' },
  { id: 'swimming_pool', name: 'Swimming Pool' },
  { id: 'common_area', name: 'Common Area' },
  { id: 'other', name: 'Other' }
];

const PRIORITIES = [
  { id: 'low', name: 'Low', color: 'bg-gray-100 text-gray-800' },
  { id: 'medium', name: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'high', name: 'High', color: 'bg-orange-100 text-orange-800' },
  { id: 'urgent', name: 'Urgent', color: 'bg-red-100 text-red-800' }
];

export default function Maintenance() {
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'maintenance',
    category: '',
    priority: 'medium',
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const auth = useContext(AuthContext);

  // Load maintenance requests
  useEffect(() => {
    loadRequests();
    if (auth.user?.role === 'admin') {
      loadStats();
    }
  }, [auth.user, filterStatus, filterType]);

  const loadRequests = async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.append('status', filterStatus);
      if (filterType) params.append('type', filterType);
      
      const res = await api.get('/maintenance?' + params.toString());
      // Data is already sorted by backend (most recent first)
      setRequests(res.data);
    } catch (err) {
      toast.error('Failed to load maintenance requests');
    }
  };

  const loadStats = async () => {
    try {
      const now = new Date();
      const res = await api.get('/maintenance/stats/monthly', {
        params: {
          year: now.getFullYear(),
          month: now.getMonth() + 1
        }
      });
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/maintenance', formData);
      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        type: 'maintenance',
        category: '',
        priority: 'medium',
        location: ''
      });
      loadRequests();
      toast.success('Request submitted successfully');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status, adminComments) => {
    try {
      await api.patch(`/maintenance/${id}/status`, { status, adminComments });
      loadRequests();
      if (auth.user?.role === 'admin') {
        loadStats();
      }
      toast.success('Status updated successfully');
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const cancelRequest = async (id) => {
    try {
      if (window.confirm('Are you sure you want to cancel this request?')) {
        await api.post(`/maintenance/${id}/cancel`);
        loadRequests();
        toast.success('Request cancelled successfully');
      }
    } catch (err) {
      toast.error('Failed to cancel request');
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Maintenance & Complaints</h2>
          <p className="mt-1 text-sm text-gray-600">
            Submit and track maintenance requests or complaints
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'New Request'}
        </Button>
      </div>

      {auth.user?.role === 'admin' && stats && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <div className="p-4">
              <h3 className="text-lg font-medium">Monthly Overview</h3>
              <dl className="mt-2 grid grid-cols-1 gap-2">
                {stats.map((stat) => (
                  <div key={JSON.stringify(stat._id)} className="flex justify-between text-sm">
                    <dt className="text-gray-600">
                      {stat._id.type} - {stat._id.category} ({stat._id.status})
                    </dt>
                    <dd className="font-medium text-gray-900">{stat.count}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Card>
        </div>
      )}

      {showForm && (
        <Card className="mb-6">
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="maintenance">Maintenance</option>
                  <option value="complaint">Complaint</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <Input
                  label="Title"
                  value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Brief title for your request"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Detailed description of the issue"
                  required
                />
              </div>

              <div>
                <Input
                  label="Location"
                  value={formData.location}
                  onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Where is the issue located?"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Priority</label>
                <select
                  value={formData.priority}
                  onChange={e => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {PRIORITIES.map(priority => (
                    <option key={priority.id} value={priority.id}>{priority.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="w-full"
            >
              Submit Request
            </Button>
          </form>
        </Card>
      )}

      <div className="mb-4 flex gap-4">
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">All Types</option>
          <option value="maintenance">Maintenance</option>
          <option value="complaint">Complaint</option>
        </select>
      </div>

      <div className="space-y-4">
        {requests.map(request => (
          <Card key={request._id}>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-medium text-gray-900">{request.title}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${PRIORITIES.find(p => p.id === request.priority)?.color}`}>
                      {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {CATEGORIES.find(c => c.id === request.category)?.name} - {request.location}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      request.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      request.status === 'resolved' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'}`}>
                    {request.status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </span>
                  <p className="mt-1 text-xs text-gray-500">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <p className="mt-2 text-sm text-gray-600">{request.description}</p>

              {request.adminComments && (
                <div className="mt-2 text-sm">
                  <span className="font-medium text-gray-900">Admin Comments: </span>
                  <span className="text-gray-600">{request.adminComments}</span>
                </div>
              )}

              {request.assignedTo && (
                <div className="mt-2 text-sm">
                  <span className="font-medium text-gray-900">Assigned To: </span>
                  <span className="text-gray-600">{request.assignedTo.name}</span>
                </div>
              )}

              <div className="mt-4 flex justify-end gap-2">
                {auth.user?.role === 'admin' && request.status !== 'resolved' && request.status !== 'cancelled' && (
                  <>
                    {request.status === 'pending' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          const comments = window.prompt('Add any comments (optional):');
                          updateStatus(request._id, 'in_progress', comments);
                        }}
                      >
                        Mark In Progress
                      </Button>
                    )}
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => {
                        const comments = window.prompt('Add any resolution comments:');
                        if (comments) {
                          updateStatus(request._id, 'resolved', comments);
                        }
                      }}
                    >
                      Mark Resolved
                    </Button>
                  </>
                )}
                {(auth.user?.id === request.user._id || auth.user?.role === 'admin') && 
                 ['pending', 'in_progress'].includes(request.status) && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => cancelRequest(request._id)}
                  >
                    Cancel Request
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}

        {requests.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No requests</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new request.</p>
          </div>
        )}
      </div>
    </div>
  );
}
