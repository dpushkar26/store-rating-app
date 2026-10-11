import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../services/api';

// Validation Schemas
const userSchema = z.object({
  name: z.string().min(20, 'Min 20 characters').max(60, 'Max 60 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().regex(/^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])(?=.{8,16}$)/, '8-16 chars, 1 uppercase, 1 special character'),
  address: z.string().max(400, 'Max 400 characters').optional().or(z.literal('')),
  role: z.enum(['SYSTEM_ADMIN', 'NORMAL_USER', 'STORE_OWNER'])
});

const storeSchema = z.object({
  name: z.string().min(1, 'Required').max(100),
  email: z.string().email('Invalid email'),
  address: z.string().min(1, 'Required').max(400),
  ownerId: z.string().min(1, 'Required (Must be a STORE_OWNER user ID)')
});

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  
  // Data States
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  
  // Filter States
  const [userFilters, setUserFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [storeFilters, setStoreFilters] = useState({ name: '', email: '', address: '' });

  // Sorting States
  const [userSort, setUserSort] = useState({ sortBy: 'createdAt', order: 'desc' });
  const [storeSort, setStoreSort] = useState({ sortBy: 'name', order: 'asc' });

  // Forms
  const userForm = useForm({ resolver: zodResolver(userSchema) });
  const storeForm = useForm({ resolver: zodResolver(storeSchema) });

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/admin');
      setStats(res.data);
    } catch (err) { console.error('Failed to fetch stats', err); }
  };

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams();
      if (userFilters.name) params.append('name', userFilters.name);
      if (userFilters.email) params.append('email', userFilters.email);
      if (userFilters.address) params.append('address', userFilters.address);
      if (userFilters.role) params.append('role', userFilters.role);
      params.append('sortBy', userSort.sortBy);
      params.append('order', userSort.order);
      const res = await api.get(`/users?${params.toString()}`);
      setUsers(res.data);
    } catch (err) { console.error('Failed to fetch users', err); }
  };

  const fetchStores = async () => {
    try {
      const params = new URLSearchParams();
      if (storeFilters.name) params.append('name', storeFilters.name);
      if (storeFilters.email) params.append('email', storeFilters.email);
      if (storeFilters.address) params.append('address', storeFilters.address);
      params.append('sortBy', storeSort.sortBy);
      params.append('order', storeSort.order);
      const res = await api.get(`/stores?${params.toString()}`);
      setStores(res.data);
    } catch (err) { console.error('Failed to fetch stores', err); }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [userFilters, userSort]);

  useEffect(() => {
    fetchStores();
  }, [storeFilters, storeSort]);

  const handleUserSort = (field) => {
    if (userSort.sortBy === field) {
      setUserSort({ sortBy: field, order: userSort.order === 'asc' ? 'desc' : 'asc' });
    } else {
      setUserSort({ sortBy: field, order: 'asc' });
    }
  };

  const handleStoreSort = (field) => {
    if (storeSort.sortBy === field) {
      setStoreSort({ sortBy: field, order: storeSort.order === 'asc' ? 'desc' : 'asc' });
    } else {
      setStoreSort({ sortBy: field, order: 'asc' });
    }
  };

  const renderSortIndicator = (currentSort, field) => {
    if (currentSort.sortBy !== field) return <span className="text-gray-400 text-xs ml-1">⇅</span>;
    return currentSort.order === 'asc' 
      ? <span className="text-indigo-600 text-xs ml-1 font-bold">▲</span> 
      : <span className="text-indigo-600 text-xs ml-1 font-bold">▼</span>;
  };

  const onUserSubmit = async (data) => {
    try {
      await api.post('/users', data);
      userForm.reset();
      fetchUsers();
      fetchStats();
      alert('User created successfully');
    } catch (error) { 
      alert(error.response?.data?.message || 'Error creating user'); 
    }
  };

  const onStoreSubmit = async (data) => {
    try {
      await api.post('/stores', data);
      storeForm.reset();
      fetchStores();
      fetchStats();
      alert('Store created successfully');
    } catch (error) { 
      alert(error.response?.data?.message || 'Error creating store'); 
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Administrator</h1>
          <p className="text-sm text-gray-500">Manage platform users, stores, and oversee ratings</p>
        </div>
        <div className="space-x-2">
          {['overview', 'users', 'stores'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors ${
                activeTab === tab ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200 text-center">
            <h3 className="text-gray-500 font-medium text-lg">Total Users</h3>
            <p className="text-4xl font-bold text-indigo-600 mt-2">{stats.totalUsers}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200 text-center">
            <h3 className="text-gray-500 font-medium text-lg">Total Stores</h3>
            <p className="text-4xl font-bold text-indigo-600 mt-2">{stats.totalStores}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200 text-center">
            <h3 className="text-gray-500 font-medium text-lg">Total Ratings Submitted</h3>
            <p className="text-4xl font-bold text-indigo-600 mt-2">{stats.totalRatings}</p>
          </div>
        </div>
      )}

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow border border-gray-200">
            <h2 className="text-lg font-bold mb-4">Add New User</h2>
            <form onSubmit={userForm.handleSubmit(onUserSubmit)} className="space-y-4">
              <div>
                <input 
                  {...userForm.register('name')} 
                  placeholder="Full Name (20 - 60 chars)" 
                  className="w-full p-2 border rounded text-sm" 
                />
                {userForm.formState.errors.name && (
                  <p className="text-red-500 text-xs mt-1">{userForm.formState.errors.name.message}</p>
                )}
              </div>
              <div>
                <input 
                  {...userForm.register('email')} 
                  placeholder="Email Address" 
                  type="email" 
                  className="w-full p-2 border rounded text-sm" 
                />
                {userForm.formState.errors.email && (
                  <p className="text-red-500 text-xs mt-1">{userForm.formState.errors.email.message}</p>
                )}
              </div>
              <div>
                <input 
                  {...userForm.register('password')} 
                  placeholder="Password (8-16 chars, 1 upper, 1 special)" 
                  type="password" 
                  className="w-full p-2 border rounded text-sm" 
                />
                {userForm.formState.errors.password && (
                  <p className="text-red-500 text-xs mt-1">{userForm.formState.errors.password.message}</p>
                )}
              </div>
              <div>
                <input 
                  {...userForm.register('address')} 
                  placeholder="Address (Max 400 chars)" 
                  className="w-full p-2 border rounded text-sm" 
                />
                {userForm.formState.errors.address && (
                  <p className="text-red-500 text-xs mt-1">{userForm.formState.errors.address.message}</p>
                )}
              </div>
              <div>
                <select {...userForm.register('role')} className="w-full p-2 border rounded text-sm">
                  <option value="NORMAL_USER">Normal User</option>
                  <option value="STORE_OWNER">Store Owner</option>
                  <option value="SYSTEM_ADMIN">System Admin</option>
                </select>
              </div>
              <button 
                type="submit" 
                disabled={userForm.formState.isSubmitting}
                className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700 font-medium text-sm disabled:opacity-50"
              >
                {userForm.formState.isSubmitting ? 'Creating...' : 'Create User'}
              </button>
            </form>
          </div>
          
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex flex-col gap-3 mb-4">
              <h2 className="text-lg font-bold">User Directory</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <input 
                  placeholder="Filter Name..." 
                  value={userFilters.name}
                  onChange={(e) => setUserFilters({...userFilters, name: e.target.value})} 
                  className="p-2 border rounded text-xs" 
                />
                <input 
                  placeholder="Filter Email..." 
                  value={userFilters.email}
                  onChange={(e) => setUserFilters({...userFilters, email: e.target.value})} 
                  className="p-2 border rounded text-xs" 
                />
                <input 
                  placeholder="Filter Address..." 
                  value={userFilters.address}
                  onChange={(e) => setUserFilters({...userFilters, address: e.target.value})} 
                  className="p-2 border rounded text-xs" 
                />
                <select 
                  value={userFilters.role}
                  onChange={(e) => setUserFilters({...userFilters, role: e.target.value})} 
                  className="p-2 border rounded text-xs"
                >
                  <option value="">All Roles</option>
                  <option value="NORMAL_USER">Normal Users</option>
                  <option value="STORE_OWNER">Store Owners</option>
                  <option value="SYSTEM_ADMIN">System Admins</option>
                </select>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th 
                      onClick={() => handleUserSort('name')} 
                      className="p-3 cursor-pointer select-none hover:bg-gray-100"
                    >
                      Name {renderSortIndicator(userSort, 'name')}
                    </th>
                    <th 
                      onClick={() => handleUserSort('email')} 
                      className="p-3 cursor-pointer select-none hover:bg-gray-100"
                    >
                      Email {renderSortIndicator(userSort, 'email')}
                    </th>
                    <th 
                      onClick={() => handleUserSort('address')} 
                      className="p-3 cursor-pointer select-none hover:bg-gray-100"
                    >
                      Address {renderSortIndicator(userSort, 'address')}
                    </th>
                    <th 
                      onClick={() => handleUserSort('role')} 
                      className="p-3 cursor-pointer select-none hover:bg-gray-100"
                    >
                      Role {renderSortIndicator(userSort, 'role')}
                    </th>
                    <th 
                      onClick={() => handleUserSort('rating')} 
                      className="p-3 cursor-pointer select-none hover:bg-gray-100"
                    >
                      Store Rating {renderSortIndicator(userSort, 'rating')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-4 text-center text-gray-500">No users found.</td>
                    </tr>
                  ) : (
                    users.map(u => (
                      <tr key={u.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <p className="font-medium text-gray-900">{u.name}</p>
                          <span className="text-[11px] text-gray-400 font-mono">ID: {u.id}</span>
                        </td>
                        <td className="p-3 text-gray-600">{u.email}</td>
                        <td className="p-3 text-gray-500 text-xs max-w-[140px] truncate">{u.address || '—'}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            u.role === 'SYSTEM_ADMIN' ? 'bg-purple-100 text-purple-800' :
                            u.role === 'STORE_OWNER' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {u.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-3">
                          {u.role === 'STORE_OWNER' ? (
                            u.rating !== null ? (
                              <span className="font-bold text-amber-600">★ {u.rating} / 5</span>
                            ) : (
                              <span className="text-gray-400 text-xs">No store/ratings</span>
                            )
                          ) : (
                            <span className="text-gray-400 text-xs">N/A</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* STORES TAB */}
      {activeTab === 'stores' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow border border-gray-200">
            <h2 className="text-lg font-bold mb-4">Add New Store</h2>
            <form onSubmit={storeForm.handleSubmit(onStoreSubmit)} className="space-y-4">
              <div>
                <input 
                  {...storeForm.register('name')} 
                  placeholder="Store Name" 
                  className="w-full p-2 border rounded text-sm" 
                />
                {storeForm.formState.errors.name && (
                  <p className="text-red-500 text-xs mt-1">{storeForm.formState.errors.name.message}</p>
                )}
              </div>
              <div>
                <input 
                  {...storeForm.register('email')} 
                  placeholder="Store Contact Email" 
                  type="email" 
                  className="w-full p-2 border rounded text-sm" 
                />
                {storeForm.formState.errors.email && (
                  <p className="text-red-500 text-xs mt-1">{storeForm.formState.errors.email.message}</p>
                )}
              </div>
              <div>
                <input 
                  {...storeForm.register('address')} 
                  placeholder="Store Address" 
                  className="w-full p-2 border rounded text-sm" 
                />
                {storeForm.formState.errors.address && (
                  <p className="text-red-500 text-xs mt-1">{storeForm.formState.errors.address.message}</p>
                )}
              </div>
              <div>
                <input 
                  {...storeForm.register('ownerId')} 
                  placeholder="Owner ID (UUID of Store Owner)" 
                  className="w-full p-2 border rounded text-sm font-mono text-xs" 
                />
                {storeForm.formState.errors.ownerId && (
                  <p className="text-red-500 text-xs mt-1">{storeForm.formState.errors.ownerId.message}</p>
                )}
                <p className="text-xs text-gray-500 mt-1 leading-tight">
                  Hint: Copy the Owner ID from the Users tab for a user with the Store Owner role.
                </p>
              </div>
              <button 
                type="submit" 
                disabled={storeForm.formState.isSubmitting}
                className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700 font-medium text-sm disabled:opacity-50"
              >
                {storeForm.formState.isSubmitting ? 'Creating...' : 'Create Store'}
              </button>
            </form>
          </div>
          
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex flex-col gap-3 mb-4">
              <h2 className="text-lg font-bold">Store Directory</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <input 
                  placeholder="Filter Store Name..." 
                  value={storeFilters.name}
                  onChange={(e) => setStoreFilters({...storeFilters, name: e.target.value})} 
                  className="p-2 border rounded text-xs" 
                />
                <input 
                  placeholder="Filter Contact Email..." 
                  value={storeFilters.email}
                  onChange={(e) => setStoreFilters({...storeFilters, email: e.target.value})} 
                  className="p-2 border rounded text-xs" 
                />
                <input 
                  placeholder="Filter Address..." 
                  value={storeFilters.address}
                  onChange={(e) => setStoreFilters({...storeFilters, address: e.target.value})} 
                  className="p-2 border rounded text-xs" 
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th 
                      onClick={() => handleStoreSort('name')} 
                      className="p-3 cursor-pointer select-none hover:bg-gray-100"
                    >
                      Store Name {renderSortIndicator(storeSort, 'name')}
                    </th>
                    <th 
                      onClick={() => handleStoreSort('email')} 
                      className="p-3 cursor-pointer select-none hover:bg-gray-100"
                    >
                      Contact Email {renderSortIndicator(storeSort, 'email')}
                    </th>
                    <th 
                      onClick={() => handleStoreSort('address')} 
                      className="p-3 cursor-pointer select-none hover:bg-gray-100"
                    >
                      Address {renderSortIndicator(storeSort, 'address')}
                    </th>
                    <th 
                      onClick={() => handleStoreSort('rating')} 
                      className="p-3 cursor-pointer select-none hover:bg-gray-100"
                    >
                      Avg Rating {renderSortIndicator(storeSort, 'rating')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stores.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-4 text-center text-gray-500">No stores found.</td>
                    </tr>
                  ) : (
                    stores.map(s => (
                      <tr key={s.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium text-gray-900">{s.name}</td>
                        <td className="p-3 text-gray-600">{s.email}</td>
                        <td className="p-3 text-gray-500 text-xs truncate max-w-[160px]">{s.address}</td>
                        <td className="p-3 font-bold text-indigo-600">★ {s.averageRating} / 5</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;