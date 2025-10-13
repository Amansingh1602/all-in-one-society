import React, { createContext, useState, useEffect } from 'react'
import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom'
import api from './api'
import AdminDashboard from './Admin'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Card, Button, Input, Loading, ThemeToggle } from './components/ui'
import { ThemeProvider } from './contexts/ThemeContext'
import LostAndFound from './components/LostAndFound'
import Maintenance from './components/Maintenance'
import { validate, validateForm } from './utils/validation'

function useAuthProvider() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/auth/me').then(res => setUser(res.data)).catch(() => { localStorage.removeItem('token'); });
    }
  }, []);
  return { user, setUser };
}

function RequireAuth({ children }) {
  const auth = React.useContext(AuthContext);
  if (!auth.user) return <Navigate to="/login" />;
  return children;
}


function Login() {
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const auth = React.useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const submit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm(values, {
      email: [validate.required, validate.email],
      password: [validate.required, validate.minLength(6)]
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/login', values);
      localStorage.setItem('token', res.data.token);
      auth.setUser(res.data.user);
      toast.success('Logged in successfully');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md mx-auto p-8">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-gray-100">Welcome Back</h2>
          <form onSubmit={submit} className="space-y-6">
            <Input
              label="Email"
              name="email"
              type="email"
              value={values.email}
              onChange={handleChange}
              error={errors.email}
              autoComplete="email"
            />
            <Input
              label="Password"
              name="password"
              type="password"
              value={values.password}
              onChange={handleChange}
              error={errors.password}
              autoComplete="current-password"
            />
            <div className="flex gap-3 pt-4">
              <Button type="submit" loading={loading} className="flex-1">
                Login
              </Button>
              <Button variant="secondary" as={Link} to="/register" className="flex-1">
                Register
              </Button>
            </div>
          </form>
        </Card>
    </div>
  )
}

function Register() {
  const [values, setValues] = useState({ name: '', email: '', password: '', block: '', flat: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const submit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm(values, {
      name: [validate.required],
      email: [validate.required, validate.email],
      password: [validate.required, validate.minLength(6)],
      block: [validate.required],
      flat: [validate.required]
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', values);
      toast.success('Account created successfully. Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md mx-auto p-8">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-gray-100">Create Account</h2>
          <form onSubmit={submit} className="space-y-6">
            <Input
              label="Full Name"
              name="name"
              value={values.name}
              onChange={handleChange}
              error={errors.name}
              autoComplete="name"
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={values.email}
              onChange={handleChange}
              error={errors.email}
              autoComplete="email"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Block"
                name="block"
                value={values.block}
                onChange={handleChange}
                error={errors.block}
              />
              <Input
                label="Flat"
                name="flat"
                value={values.flat}
                onChange={handleChange}
                error={errors.flat}
              />
            </div>
            <Input
              label="Password"
              name="password"
              type="password"
              value={values.password}
              onChange={handleChange}
              error={errors.password}
              autoComplete="new-password"
            />
            <div className="pt-4">
              <Button type="submit" loading={loading} variant="success" className="w-full">
                Create Account
              </Button>
            </div>
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 pt-2">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
                Login here
              </Link>
            </p>
          </form>
        </Card>
    </div>
  )
}

function Home() {
  const auth = React.useContext(AuthContext);
  const navigate = useNavigate();
  
  return (
    <div className="px-8 py-16 mx-6">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 sm:text-5xl">
          Welcome to Society
        </h1>
        <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
          Streamline your society operations with our easy-to-use platform
        </p>
        {!auth.user && (
          <div className="mt-8 flex justify-center gap-6 px-6">
            <Button variant="primary" className="px-8 py-3" onClick={() => navigate('/register')}>
              Get Started
            </Button>
            <Button variant="secondary" className="px-8 py-3" onClick={() => navigate('/login')}>
              Login
            </Button>
          </div>
        )}
      </div>

      <div className={`mt-20 max-w-6xl mx-auto px-6 ${auth.user ? 'grid gap-8 md:grid-cols-3' : 'flex flex-col md:flex-row gap-8 justify-center items-stretch'}`}>
        <Card className={`hover:scale-105 transition-transform duration-300 ease-in-out cursor-pointer ${!auth.user ? 'w-full max-w-sm' : ''}`}>
          <div className="text-center p-8 flex flex-col h-full">
            <div className="h-12 w-12 mx-auto bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 rounded-lg flex items-center justify-center">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">Notices</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 px-2 flex-grow">Stay updated with society announcements and important information.</p>
            <div className="mt-auto pt-6">
              <Button variant="secondary" className="px-6 py-2 hover:!bg-red-600 hover:!text-white dark:hover:!bg-red-500 hover:scale-95 transition-all duration-200" onClick={() => navigate('/notices')}>View Notices</Button>
            </div>
          </div>
        </Card>

        <Card className={`hover:scale-105 transition-transform duration-300 ease-in-out cursor-pointer ${!auth.user ? 'w-full max-w-sm' : ''}`}>
          <div className="text-center p-8 flex flex-col h-full">
            <div className="h-12 w-12 mx-auto bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300 rounded-lg flex items-center justify-center">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">Facility Bookings</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 px-2 flex-grow">Book common facilities like halls and sports areas with ease.</p>
            <div className="mt-auto pt-6">
              <Button variant="secondary" className="px-6 py-2 hover:!bg-red-600 hover:!text-white dark:hover:!bg-red-500 hover:scale-95 transition-all duration-200" onClick={() => navigate('/bookings')}>View Bookings</Button>
            </div>
          </div>
        </Card>

        {auth.user && (
          <Card className="hover:scale-105 transition-transform duration-300 ease-in-out cursor-pointer">
            <div className="text-center p-8 flex flex-col h-full">
              <div className="h-12 w-12 mx-auto bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">Resident Directory</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 px-2 flex-grow">Access resident information and stay connected with your community.</p>
              <div className="mt-auto pt-6">
                <Button variant="secondary" className="px-6 py-2 hover:!bg-red-600 hover:!text-white dark:hover:!bg-red-500 hover:scale-95 transition-all duration-200" onClick={() => navigate('/residents')}>View Directory</Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

function Notices() {
  const [notices, setNotices] = useState([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [recipient, setRecipient] = useState('');
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [includesPoll, setIncludesPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [pollEndDate, setPollEndDate] = useState('');
  const [pollsData, setPollsData] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNotice, setExpandedNotice] = useState(null);
  const [showSenderInfo, setShowSenderInfo] = useState(null);
  const auth = React.useContext(AuthContext);

  useEffect(() => { 
    const loadData = async () => {
      const noticesRes = await api.get('/notices');
      // Data is already sorted by backend (most recent first)
      setNotices(noticesRes.data);
      
      // Load polls for notices that have them
      const pollsPromises = noticesRes.data
        .filter(n => n.hasPoll)
        .map(n => api.get(`/polls/notice/${n._id}`));
      
      if (pollsPromises.length > 0) {
        const pollsResponses = await Promise.all(pollsPromises);
        const pollsMap = {};
        pollsResponses.forEach(res => {
          pollsMap[res.data.notice] = res.data;
        });
        setPollsData(pollsMap);
      }
    };

    loadData();
    if (auth.user?.role === 'admin') {
      api.get('/residents').then(res => setResidents(res.data));
    }
  }, [auth.user]);

  // Filter notices based on search query
  const filteredNotices = notices.filter(notice => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const titleMatch = notice.title.toLowerCase().includes(query);
    const senderMatch = notice.author?.name?.toLowerCase().includes(query);
    return titleMatch || senderMatch;
  });

    const validateForm = () => {
    const errors = {};
    if (!title.trim()) errors.title = 'Title is required';
    if (!body.trim()) errors.body = 'Content is required';
    
    if (includesPoll) {
      if (!pollQuestion.trim()) errors.pollQuestion = 'Poll question is required';
      if (!pollEndDate) errors.pollEndDate = 'Poll end date is required';
      if (pollOptions.some(opt => !opt.trim())) {
        errors.pollOptions = 'All poll options must be filled';
      }
      if (new Date(pollEndDate) <= new Date()) {
        errors.pollEndDate = 'End date must be in the future';
      }
    }
    
    return errors;
  };  const create = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const payload = { title, body };
      if (recipient) payload.recipient = recipient;
      
      // Create notice
      const noticeRes = await api.post('/notices', payload);
      
      // If includes poll, create it
      if (includesPoll) {
        await api.post('/polls', {
          noticeId: noticeRes.data._id,
          question: pollQuestion,
          options: pollOptions.filter(opt => opt.trim()),
          endDate: pollEndDate
        });
      }
      
      // Reset form
      setTitle('');
      setBody('');
      setRecipient('');
      setIncludesPoll(false);
      setPollQuestion('');
      setPollOptions(['', '']);
      setPollEndDate('');
      
      // Reload notices and polls data
      const res = await api.get('/notices');
      setNotices(res.data);
      
      // Reload polls data for notices that have them
      const pollsPromises = res.data
        .filter(n => n.hasPoll)
        .map(n => api.get(`/polls/notice/${n._id}`));
      
      if (pollsPromises.length > 0) {
        const pollsResponses = await Promise.all(pollsPromises);
        const pollsMap = {};
        pollsResponses.forEach(res => {
          pollsMap[res.data.notice] = res.data;
        });
        setPollsData(pollsMap);
      }
      
      toast.success('Notice posted successfully');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to post notice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-2">
          <div className="px-4 sm:px-0">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Society Notices</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Stay updated with the latest announcements and information from the society management.
            </p>
          </div>

          {/* Search Input */}
          <div className="mt-4 px-4 sm:px-0">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search notices by title or sender name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="mt-4 space-y-4">
            {filteredNotices.map(n => (
              <Card key={n._id} className="cursor-pointer hover:shadow-md transition-shadow duration-200">
                <div className="px-4 py-5 sm:p-6">
                  {/* Collapsed view - show only sender name */}
                  {expandedNotice !== n._id ? (
                    <div 
                      onClick={() => setExpandedNotice(n._id)}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            <svg className="h-6 w-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-4">
                          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">{n.author?.name || 'Unknown Sender'}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{n.author?.role === 'admin' ? 'Administrator' : 'Resident'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(n.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                        </div>
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  ) : (
                    /* Expanded view - show full notice */
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{n.title}</h3>
                        <div className="flex items-center gap-4">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(n.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit'
                            })}
                          </div>
                          <button
                            onClick={() => setExpandedNotice(null)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                          {auth.user?.role === 'admin' && (
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (window.confirm('Are you sure you want to delete this notice?')) {
                                  try {
                                    await api.delete(`/notices/${n._id}`);
                                    toast.success('Notice deleted successfully');
                                    setNotices(notices.filter(notice => notice._id !== n._id));
                                  } catch (err) {
                                    toast.error(err.response?.data?.error || 'Failed to delete notice');
                                  }
                                }
                              }}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">{n.body}</p>
                      
                      {n.hasPoll && pollsData[n._id] && (
                    <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 border rounded">
                      <h4 className="text-lg font-bold mb-3">
                        Poll: {pollsData[n._id].question}
                      </h4>
                      <div className="space-y-2">
                        {pollsData[n._id].options.map((option, index) => {
                          return (
                            <div key={option._id} className="p-2 border rounded mb-2">
                              <div className="flex justify-between items-center">
                                <span>{option.text}</span>
                                <button 
                                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    try {
                                      const res = await api.post(`/polls/${pollsData[n._id]._id}/vote`, {
                                        optionId: option._id
                                      });
                                      setPollsData(prev => ({
                                        ...prev,
                                        [n._id]: res.data
                                      }));
                                      alert('Vote recorded!');
                                    } catch (err) {
                                      alert('Failed to vote: ' + (err.response?.data?.error || err.message));
                                    }
                                  }}
                                >
                                  Vote
                                </button>
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                Votes: {option.votes.length}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-2 pt-2 border-t text-xs text-gray-500">
                        Poll ends: {new Date(pollsData[n._id].endDate).toLocaleDateString()}
                      </div>
                    </div>
                  )}

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div 
                              className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowSenderInfo(showSenderInfo === n._id ? null : n._id);
                              }}
                            >
                              <svg className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{n.author?.name || 'Unknown'}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{n.author?.role === 'admin' ? 'Administrator' : 'Resident'}</p>
                          </div>
                        </div>
                        {n.recipient && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">Private Message</div>
                        )}
                      </div>

                      {/* Sender Info Modal */}
                      {showSenderInfo === n._id && (
                        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">Sender Information</h4>
                            <button
                              onClick={() => setShowSenderInfo(null)}
                              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <span className="font-medium text-gray-700 dark:text-gray-300">Name: </span>
                              <span className="text-gray-900 dark:text-gray-100">{n.author?.name || 'Unknown'}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700 dark:text-gray-300">Role: </span>
                              <span className="text-gray-900 dark:text-gray-100">{n.author?.role === 'admin' ? 'Administrator' : 'Resident'}</span>
                            </div>
                            {n.author?.email && (
                              <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">Email: </span>
                                <span className="text-gray-900 dark:text-gray-100">{n.author.email}</span>
                              </div>
                            )}
                            {n.author?.apartment && (
                              <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">Apartment: </span>
                                <span className="text-gray-900 dark:text-gray-100">{n.author.apartment}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ))}

            {filteredNotices.length === 0 && notices.length > 0 && (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No matching notices</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Try adjusting your search terms.</p>
              </div>
            )}

            {notices.length === 0 && (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No notices</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating a new notice.</p>
              </div>
            )}
          </div>
        </div>

        {(auth.user?.role === 'admin') && (
          <div className="mt-8 md:mt-0 space-y-6">
            {/* Notice Form */}
            <Card>
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">Post New Notice</h3>
                <form onSubmit={create} className="mt-4 space-y-4">
                  <div>
                    <Input
                      label="Title"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      error={errors.title}
                      placeholder="Enter notice title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Content</label>
                    <textarea
                      value={body}
                      onChange={e => setBody(e.target.value)}
                      rows={4}
                      className={`mt-1 block w-full rounded-md shadow-sm
                        ${errors.body 
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        }
                      `}
                      placeholder="Enter notice content"
                    />
                    {errors.body && (
                      <p className="mt-1 text-sm text-red-600">{errors.body}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Recipient</label>
                    <select
                      value={recipient}
                      onChange={e => setRecipient(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Everyone</option>
                      {residents.map(r => (
                        <option key={r._id} value={r._id}>{r.name} ({r.email})</option>
                      ))}
                    </select>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    loading={loading}
                    className="w-full"
                  >
                    Post Notice
                  </Button>
                </form>
              </div>
            </Card>

            {/* Poll Form */}
            <Card>
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">Create New Poll</h3>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  
                  // Validate poll form
                  const errors = {};
                  if (!title.trim()) errors.title = 'Title is required';
                  if (!body.trim()) errors.body = 'Brief description is required';
                  if (!pollQuestion.trim()) errors.pollQuestion = 'Poll question is required';
                  if (!pollEndDate) errors.pollEndDate = 'Poll end date is required';
                  if (pollOptions.some(opt => !opt.trim())) {
                    errors.pollOptions = 'All poll options must be filled';
                  }
                  if (new Date(pollEndDate) <= new Date()) {
                    errors.pollEndDate = 'End date must be in the future';
                  }

                  setErrors(errors);
                  if (Object.keys(errors).length > 0) return;

                  setLoading(true);
                  try {
                    // Create notice first
                    const noticeRes = await api.post('/notices', {
                      title,
                      body,
                      recipient: recipient || undefined
                    });

                    // Create poll
                    await api.post('/polls', {
                      noticeId: noticeRes.data._id,
                      question: pollQuestion,
                      options: pollOptions.filter(opt => opt.trim()),
                      endDate: pollEndDate
                    });

                    // Reset form
                    setTitle('');
                    setBody('');
                    setPollQuestion('');
                    setPollOptions(['', '']);
                    setPollEndDate('');
                    setRecipient('');

                    // Reload notices
                    const res = await api.get('/notices');
                    setNotices(res.data);
                    
                    toast.success('Poll created successfully');
                  } catch (err) {
                    toast.error(err.response?.data?.error || 'Failed to create poll');
                  } finally {
                    setLoading(false);
                  }
                }} className="mt-4 space-y-4">
                  <div>
                    <Input
                      label="Title"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      error={errors.title}
                      placeholder="Enter poll title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Brief Description</label>
                    <textarea
                      value={body}
                      onChange={e => setBody(e.target.value)}
                      rows={2}
                      className={`mt-1 block w-full rounded-md shadow-sm
                        ${errors.body 
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        }
                      `}
                      placeholder="Enter a brief description about this poll"
                    />
                    {errors.body && (
                      <p className="mt-1 text-sm text-red-600">{errors.body}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Poll Question</label>
                    <input
                      type="text"
                      value={pollQuestion}
                      onChange={(e) => setPollQuestion(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter your question"
                    />
                    {errors.pollQuestion && (
                      <p className="mt-1 text-sm text-red-600">{errors.pollQuestion}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Options</label>
                    <div className="mt-2 space-y-2">
                      {pollOptions.map((option, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...pollOptions];
                              newOptions[index] = e.target.value;
                              setPollOptions(newOptions);
                            }}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            placeholder={`Option ${index + 1}`}
                          />
                          {index > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                setPollOptions(pollOptions.filter((_, i) => i !== index));
                              }}
                              className="text-red-600 hover:text-red-800"
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    {errors.pollOptions && (
                      <p className="mt-1 text-sm text-red-600">{errors.pollOptions}</p>
                    )}
                    {pollOptions.length < 5 && (
                      <button
                        type="button"
                        onClick={() => setPollOptions([...pollOptions, ''])}
                        className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                      >
                        + Add Option
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">End Date</label>
                    <input
                      type="datetime-local"
                      value={pollEndDate}
                      onChange={(e) => setPollEndDate(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      min={new Date().toISOString().slice(0, 16)}
                    />
                    {errors.pollEndDate && (
                      <p className="mt-1 text-sm text-red-600">{errors.pollEndDate}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Recipient</label>
                    <select
                      value={recipient}
                      onChange={e => setRecipient(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Everyone</option>
                      {residents.map(r => (
                        <option key={r._id} value={r._id}>{r.name} ({r.email})</option>
                      ))}
                    </select>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    loading={loading}
                    className="w-full"
                  >
                    Create Poll
                  </Button>
                </form>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const facilities = [
    { id: 'community-hall', name: 'Community Hall' },
    { id: 'gym', name: 'Gymnasium' },
    { id: 'swimming-pool', name: 'Swimming Pool' },
    { id: 'tennis-court', name: 'Tennis Court' },
    { id: 'party-lawn', name: 'Party Lawn' }
  ];
  const [facility, setFacility] = useState('');
  const [date, setDate] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const auth = React.useContext(AuthContext);

  useEffect(() => { 
    api.get('/bookings').then(res => {
      // Filter out rejected bookings for non-admin users
      const filtered = auth.user?.role === 'admin' 
        ? res.data 
        : res.data.filter(b => b.status !== 'rejected');
      setBookings(filtered);
    });
  }, [auth.user]);

  const validateForm = () => {
    const errors = {};
    if (!facility) errors.facility = 'Please select a facility';
    if (!date) errors.date = 'Please select a date';
    if (!from) errors.from = 'Please enter start time';
    if (!to) errors.to = 'Please enter end time';
    
    // Validate date is not in past
    if (date && new Date(date) < new Date().setHours(0,0,0,0)) {
      errors.date = 'Cannot book for past dates';
    }

    return errors;
  };

  const create = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      await api.post('/bookings', { facility, date, from, to });
      setFacility(''); setDate(''); setFrom(''); setTo('');
      const res = await api.get('/bookings');
      setBookings(res.data);
      toast.success('Booking requested');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  }

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/bookings/${id}/status`, { status });
      const res = await api.get('/bookings');
      setBookings(res.data);
      toast.success('Booking updated');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update booking');
    }
  };

  const deleteBooking = async (id) => {
    try {
      if (window.confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
        await api.delete(`/bookings/${id}`);
        const res = await api.get('/bookings');
        const filtered = auth.user?.role === 'admin' 
          ? res.data 
          : res.data.filter(b => b.status !== 'rejected');
        setBookings(filtered);
        toast.success('Booking deleted successfully');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete booking');
    }
  };

  const cancelBooking = async (id) => {
    try {
      if (window.confirm('Are you sure you want to cancel this booking?')) {
        await api.post(`/bookings/${id}/cancel`);
        const res = await api.get('/bookings');
        const filtered = auth.user?.role === 'admin' 
          ? res.data 
          : res.data.filter(b => b.status !== 'rejected');
        setBookings(filtered);
        toast.success('Booking cancelled successfully');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to cancel booking');
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-6">
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-2">
          <div className="px-4 sm:px-0">
            <h2 className="text-2xl font-semibold text-gray-900">Facility Bookings</h2>
            <p className="mt-1 text-sm text-gray-600">
              View all bookings and their current status. Admins can approve or reject booking requests.
            </p>
          </div>
          
          <div className="mt-4 space-y-4">
            {bookings.map(b => (
              <Card key={b._id} className="overflow-hidden">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center
                        ${b.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                          b.status === 'approved' ? 'bg-green-100 text-green-600' :
                          b.status === 'cancelled' ? 'bg-gray-100 text-gray-600' :
                          'bg-red-100 text-red-600'}`}>
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d={b.status === 'pending' ? "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" :
                               b.status === 'approved' ? "M5 13l4 4L19 7" :
                               b.status === 'cancelled' ? "M6 18L18 6M6 6l12 12M19 19H5" :
                               "M6 18L18 6M6 6l12 12"} />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{b.facility}</h3>
                        <div className="text-sm text-gray-500">By: {b.user?.name || 'Unknown'}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(b.date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div className="text-sm text-gray-500">{b.from} - {b.to}</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end space-x-3">
                    {auth.user && auth.user.role === 'admin' && b.status === 'pending' && (
                      <>
                        <Button 
                          variant="success" 
                          size="sm"
                          onClick={() => updateStatus(b._id, 'approved')}
                        >
                          Approve
                        </Button>
                        <Button 
                          variant="danger" 
                          size="sm"
                          onClick={() => updateStatus(b._id, 'rejected')}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    {/* Show cancel button for approved bookings to both admin and booking owner */}
                    {b.status === 'approved' && (auth.user?.role === 'admin' || auth.user?.id === b.user?._id) && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => cancelBooking(b._id)}
                      >
                        Cancel Booking
                      </Button>
                    )}
                    {/* Show delete button for admins only */}
                    {auth.user?.role === 'admin' && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => deleteBooking(b._id)}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
            
            {bookings.length === 0 && (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new booking.</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 md:mt-0">
          <Card>
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">New Booking</h3>
              <form onSubmit={create} className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Facility</label>
                  <select
                    value={facility}
                    onChange={e => setFacility(e.target.value)}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                      errors.facility ? 'border-red-300' : ''
                    }`}
                  >
                    <option value="">Select a facility</option>
                    {facilities.map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                  {errors.facility && <p className="mt-1 text-sm text-red-600">{errors.facility}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <Input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    error={errors.date}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">From</label>
                    <Input
                      type="time"
                      value={from}
                      onChange={e => setFrom(e.target.value)}
                      error={errors.from}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">To</label>
                    <Input
                      type="time"
                      value={to}
                      onChange={e => setTo(e.target.value)}
                      error={errors.to}
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  variant="primary"
                  loading={loading}
                  className="w-full"
                >
                  Request Booking
                </Button>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Residents() {
  const [residents, setResidents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { 
    setLoading(true);
    api.get('/residents')
      .then(res => setResidents(res.data))
      .finally(() => setLoading(false));
  }, []);

  const filteredResidents = residents.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.block.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.flat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedResidents = filteredResidents.reduce((acc, resident) => {
    if (!acc[resident.block]) {
      acc[resident.block] = [];
    }
    acc[resident.block].push(resident);
    return acc;
  }, {});

  return (
    <div className="max-w-6xl mx-auto py-6">
      <div className="px-4 sm:px-0">
        <h2 className="text-2xl font-semibold text-gray-900">Resident Directory</h2>
        <p className="mt-1 text-sm text-gray-600">
          Connect with your neighbors and stay in touch with your community.
        </p>
      </div>

      <div className="mt-4 max-w-xl">
        <Input
          icon={
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
          type="search"
          placeholder="Search by name, email, or flat number..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <Loading />
      ) : filteredResidents.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No residents found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding residents to the directory.'}
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          {Object.entries(groupedResidents).sort().map(([block, residents]) => (
            <div key={block}>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Block {block}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {residents.sort((a, b) => a.flat.localeCompare(b.flat)).map(r => (
                  <Card key={r._id}>
                    <div className="p-4">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-lg font-medium text-gray-600">
                              {r.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{r.name}</p>
                          <p className="text-sm text-gray-500 truncate">{r.email}</p>
                          <p className="mt-1 text-sm text-gray-500">
                            Flat {r.flat}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export const AuthContext = createContext();

export default function App() {
  const auth = useAuthProvider();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const logout = () => { 
    localStorage.removeItem('token'); 
    auth.setUser(null); 
    toast.success('Logged out successfully');
  };

  return (
    <ThemeProvider>
      <AuthContext.Provider value={auth}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <nav className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-900/20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex justify-between items-center h-16">
              <Link to="/" className="flex items-center space-x-2">
                <svg className="h-8 w-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="font-bold text-xl text-gray-900 dark:text-gray-100">Society M</span>
              </Link>

              {/* Mobile menu button */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:text-white dark:hover:bg-blue-700 dark:hover:text-gray-200 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>

              {/* Desktop navigation */}
              <div className="hidden md:flex md:items-center md:space-x-4">
                <Link to="/" className="text-gray-600 hover:text-gray-900 dark:text-white dark:hover:text-gray-200 px-3 py-2 rounded-md text-sm font-medium dark:font-semibold hover:underline underline-offset-4 decoration-2">Home</Link>
                <Link to="/notices" className="text-gray-600 hover:text-gray-900 dark:text-white dark:hover:text-gray-200 px-3 py-2 rounded-md text-sm font-medium dark:font-semibold hover:underline underline-offset-4 decoration-2">Notices</Link>
                <Link to="/bookings" className="text-gray-600 hover:text-gray-900 dark:text-white dark:hover:text-gray-200 px-3 py-2 rounded-md text-sm font-medium dark:font-semibold hover:underline underline-offset-4 decoration-2">Bookings</Link>
                {auth.user && (
                  <Link to="/residents" className="text-gray-600 hover:text-gray-900 dark:text-white dark:hover:text-gray-200 px-3 py-2 rounded-md text-sm font-medium dark:font-semibold hover:underline underline-offset-4 decoration-2">Residents</Link>
                )}
                <Link to="/lost-found" className="text-gray-600 hover:text-gray-900 dark:text-white dark:hover:text-gray-200 px-3 py-2 rounded-md text-sm font-medium dark:font-semibold hover:underline underline-offset-4 decoration-2">Lost & Found</Link>
                <Link to="/maintenance" className="text-gray-600 hover:text-gray-900 dark:text-white dark:hover:text-gray-200 px-3 py-2 rounded-md text-sm font-medium dark:font-semibold hover:underline underline-offset-4 decoration-2">Maintenance</Link>
                {auth.user && auth.user.role === 'admin' && (
                  <Link to="/admin" className="text-gray-600 hover:text-gray-900 dark:text-white dark:hover:text-gray-200 px-3 py-2 rounded-md text-sm font-medium dark:font-semibold hover:underline underline-offset-4 decoration-2">Admin</Link>
                )}
                <ThemeToggle />
                {auth.user ? (
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-700 dark:text-white dark:font-semibold">{auth.user.name}</span>
                    <Button variant="secondary" className="hover:!bg-red-600 hover:!text-white dark:hover:!bg-red-500 transition-colors duration-200" onClick={logout} size="sm">Logout</Button>
                  </div>
                ) : (
                  <Button as={Link} to="/login" variant="primary" size="sm">Login</Button>
                )}
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:hidden`}>
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:text-gray-200 dark:hover:bg-blue-700 dark:font-semibold hover:underline underline-offset-4 decoration-2">Home</Link>
              <Link to="/notices" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:text-gray-200 dark:hover:bg-blue-700 dark:font-semibold hover:underline underline-offset-4 decoration-2">Notices</Link>
              <Link to="/bookings" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:text-gray-200 dark:hover:bg-blue-700 dark:font-semibold hover:underline underline-offset-4 decoration-2">Bookings</Link>
              {auth.user && (
                <Link to="/residents" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:text-gray-200 dark:hover:bg-blue-700 dark:font-semibold hover:underline underline-offset-4 decoration-2">Residents</Link>
              )}
              <Link to="/lost-found" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:text-gray-200 dark:hover:bg-blue-700 dark:font-semibold hover:underline underline-offset-4 decoration-2">Lost & Found</Link>
              <Link to="/maintenance" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:text-gray-200 dark:hover:bg-blue-700 dark:font-semibold hover:underline underline-offset-4 decoration-2">Maintenance</Link>
              {auth.user && auth.user.role === 'admin' && (
                <Link to="/admin" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:text-gray-200 dark:hover:bg-blue-700 dark:font-semibold hover:underline underline-offset-4 decoration-2">Admin</Link>
              )}
              <div className="px-3 py-2 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-white dark:font-semibold">Theme</span>
                <ThemeToggle />
              </div>
              {auth.user ? (
                <div className="px-3 py-2">
                  <div className="text-sm font-medium text-gray-700 dark:text-white dark:font-semibold mb-2">{auth.user.name}</div>
                  <Button variant="secondary" onClick={logout} size="sm" className="w-full hover:!bg-red-600 hover:!text-white dark:hover:!bg-red-500 transition-colors duration-200">Logout</Button>
                </div>
              ) : (
                <Button as={Link} to="/login" variant="primary" size="sm" className="w-full mx-3">Login</Button>
              )}
            </div>
          </div>
        </nav>

        <main className="max-w-6xl mx-auto p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/notices" element={<Notices />} />
            <Route path="/bookings" element={<RequireAuth><Bookings /></RequireAuth>} />
            <Route path="/residents" element={<RequireAuth><Residents /></RequireAuth>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin" element={auth.user && auth.user.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} />
            <Route path="/lost-found" element={<RequireAuth><LostAndFound /></RequireAuth>} />
            <Route path="/maintenance" element={<RequireAuth><Maintenance /></RequireAuth>} />
          </Routes>
        </main>
          <ToastContainer />
        </div>
      </AuthContext.Provider>
    </ThemeProvider>
  )
}
