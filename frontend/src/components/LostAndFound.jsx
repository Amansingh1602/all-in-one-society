import React, { useState, useEffect, useContext } from 'react';
import { Card, Button, Input, Loading } from './ui';
import { AuthContext } from '../App';
import api from '../api';
import { toast } from 'react-toastify';
import ChatModal from './ChatModal';

export default function LostAndFound() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeChatItem, setActiveChatItem] = useState(null);
  const [formData, setFormData] = useState({
    type: 'lost',
    title: '',
    description: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    contact: '',
    image: null
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const auth = useContext(AuthContext);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const res = await api.get('/lostfound');
      // Data is already sorted by backend (most recent first)
      setItems(res.data);
    } catch (err) {
      toast.error('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formPayload = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null) {
          formPayload.append(key, formData[key]);
        }
      });

      await api.post('/lostfound', formPayload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Item posted successfully');
      setShowForm(false);
      setFormData({
        type: 'lost',
        title: '',
        description: '',
        location: '',
        date: new Date().toISOString().split('T')[0],
        contact: '',
        image: null
      });
      setPreviewUrl(null);
      loadItems();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to post item');
    } finally {
      setSubmitting(false);
    }
  };

  const markAsResolved = async (id) => {
    try {
      await api.patch(`/lostfound/${id}/status`, { status: 'resolved' });
      toast.success('Item marked as resolved');
      loadItems();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const removeItem = async (id) => {
    try {
      if (window.confirm('Are you sure you want to remove this item? This action cannot be undone.')) {
        await api.delete(`/lostfound/${id}`);
        toast.success('Item removed successfully');
        loadItems();
      }
    } catch (err) {
      toast.error('Failed to remove item');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Lost & Found</h2>
          <p className="mt-1 text-sm text-gray-600">
            Help reunite lost items with their owners
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Report Item'}
        </Button>
      </div>

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
                >
                  <option value="lost">Lost Item</option>
                  <option value="found">Found Item</option>
                </select>
              </div>

              <Input
                label="Title"
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Gold Ring, Phone, etc."
                required
              />

              <div className="md:col-span-2">
                <Input
                  type="text"
                  label="Location"
                  value={formData.location}
                  onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Where was it lost/found?"
                  required
                />
              </div>

              <Input
                type="date"
                label="Date"
                value={formData.date}
                onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
              />

              <Input
                label="Contact Information"
                value={formData.contact}
                onChange={e => setFormData(prev => ({ ...prev, contact: e.target.value }))}
                placeholder="How can people reach you?"
                required
              />

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Provide detailed description..."
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mt-1 block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-medium
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
                {previewUrl && (
                  <div className="mt-2">
                    <img src={previewUrl} alt="Preview" className="h-32 object-cover rounded-md" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" loading={submitting}>
                Submit
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map(item => (
          <Card key={item._id}>
            <div className="relative">
              {item.image && (
                <img
                  src={`http://localhost:5000${item.image}`}
                  alt={item.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              )}
              <div className="absolute top-2 right-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${item.type === 'lost' 
                    ? 'bg-red-100 text-red-800'
                    : 'bg-green-100 text-green-800'
                  }`}
                >
                  {item.type === 'lost' ? 'Lost' : 'Found'}
                </span>
              </div>
            </div>

            <div className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(item.date).toLocaleDateString()}
                  </p>
                </div>
                {item.status === 'resolved' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Resolved
                  </span>
                )}
              </div>

              <p className="mt-2 text-sm text-gray-600">{item.description}</p>

              <div className="mt-4 space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Location:</span> {item.location}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Contact:</span> {item.contact}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Posted by:</span> {item.user?.name}
                </p>
              </div>

              <div className="mt-4 flex gap-2">
                {item.status === 'open' ? (
                  auth.user?.id === item.user?.id || auth.user?.role === 'admin' ? (
                    <>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => markAsResolved(item._id)}
                      >
                        Mark as Resolved
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setActiveChatItem(item)}
                      >
                        View Messages
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setActiveChatItem(item)}
                    >
                      Contact About Item
                    </Button>
                  )
                ) : (
                  // Show remove button only to admins for resolved items
                  auth.user?.role === 'admin' && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => removeItem(item._id)}
                    >
                      Remove Item
                    </Button>
                  )
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {activeChatItem && (
        <ChatModal 
          item={activeChatItem} 
          onClose={() => setActiveChatItem(null)} 
        />
      )}

      {items.length === 0 && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No items</h3>
          <p className="mt-1 text-sm text-gray-500">
            Start by reporting a lost or found item.
          </p>
        </div>
      )}
    </div>
  );
}
