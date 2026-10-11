import { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import RatingForm from '../../components/store/RatingForm';

const UserDashboard = () => {
  const [stores, setStores] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [searchAddress, setSearchAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  const fetchStores = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchName) params.append('name', searchName);
      if (searchAddress) params.append('address', searchAddress);

      const response = await api.get(`/stores?${params.toString()}`);
      setStores(response.data);
    } catch (error) {
      console.error('Error fetching stores:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => fetchStores(), 400);
    return () => clearTimeout(timeoutId);
  }, [searchName, searchAddress]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedStores = useMemo(() => {
    return [...stores].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (sortConfig.key === 'averageRating' || sortConfig.key === 'myRating') {
        aVal = aVal !== null && aVal !== undefined ? parseFloat(aVal) : -1;
        bVal = bVal !== null && bVal !== undefined ? parseFloat(bVal) : -1;
      } else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [stores, sortConfig]);

  const renderSortIndicator = (key) => {
    if (sortConfig.key !== key) return <span className="text-gray-400 text-xs ml-1">⇅</span>;
    return sortConfig.direction === 'asc' 
      ? <span className="text-indigo-600 text-xs ml-1 font-bold">▲</span> 
      : <span className="text-indigo-600 text-xs ml-1 font-bold">▼</span>;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Store Directory</h1>
          <p className="text-gray-500 text-sm">Explore registered stores and submit or modify your ratings</p>
        </div>
        
        {/* View Toggle */}
        <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg p-1 self-start">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Grid View
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              viewMode === 'table' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Table View
          </button>
        </div>
      </div>

      {/* Search & Sort Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Search by Name</label>
          <input 
            type="text" 
            placeholder="e.g. Supermart, Bakery..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Search by Address</label>
          <input 
            type="text" 
            placeholder="e.g. 123 Main St, Avenue..."
            value={searchAddress}
            onChange={(e) => setSearchAddress(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Sort Stores</label>
          <select 
            value={`${sortConfig.key}-${sortConfig.direction}`}
            onChange={(e) => {
              const [key, direction] = e.target.value.split('-');
              setSortConfig({ key, direction });
            }}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border text-sm"
          >
            <option value="name-asc">Name (A → Z)</option>
            <option value="name-desc">Name (Z → A)</option>
            <option value="averageRating-desc">Overall Rating (High → Low)</option>
            <option value="averageRating-asc">Overall Rating (Low → High)</option>
            <option value="myRating-desc">My Rating (Highest First)</option>
          </select>
        </div>
      </div>

      {/* Stores Display */}
      {loading ? (
        <p className="text-center text-gray-500 py-10">Loading stores...</p>
      ) : sortedStores.length === 0 ? (
        <p className="text-center text-gray-500 bg-white p-8 rounded-lg border">No stores found matching your search.</p>
      ) : viewMode === 'table' ? (
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th 
                    onClick={() => handleSort('name')}
                    className="p-3 cursor-pointer hover:bg-gray-100 select-none font-semibold text-gray-600"
                  >
                    Store Name {renderSortIndicator('name')}
                  </th>
                  <th 
                    onClick={() => handleSort('address')}
                    className="p-3 cursor-pointer hover:bg-gray-100 select-none font-semibold text-gray-600"
                  >
                    Address {renderSortIndicator('address')}
                  </th>
                  <th 
                    onClick={() => handleSort('averageRating')}
                    className="p-3 cursor-pointer hover:bg-gray-100 select-none font-semibold text-gray-600"
                  >
                    Overall Rating {renderSortIndicator('averageRating')}
                  </th>
                  <th 
                    onClick={() => handleSort('myRating')}
                    className="p-3 cursor-pointer hover:bg-gray-100 select-none font-semibold text-gray-600"
                  >
                    Your Submitted Rating {renderSortIndicator('myRating')}
                  </th>
                  <th className="p-3 font-semibold text-gray-600">Rate / Modify</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedStores.map(store => (
                  <tr key={store.id} className="hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-900">{store.name}</td>
                    <td className="p-3 text-gray-500 max-w-[200px] truncate">{store.address}</td>
                    <td className="p-3 font-semibold text-indigo-600">★ {store.averageRating} / 5</td>
                    <td className="p-3">
                      {store.myRating ? (
                        <span className="text-yellow-600 font-medium">★ {store.myRating} / 5</span>
                      ) : (
                        <span className="text-gray-400 text-xs">Not rated yet</span>
                      )}
                    </td>
                    <td className="p-3">
                      <RatingForm 
                        storeId={store.id} 
                        initialRating={store.myRating} 
                        onRatingUpdate={fetchStores}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sortedStores.map(store => (
            <div key={store.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex flex-col">
              <div className="mb-4 flex-grow">
                <h3 className="text-xl font-bold text-gray-900">{store.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{store.address}</p>
                
                <div className="mt-3 flex items-center space-x-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
                    Overall: ★ {store.averageRating} / 5
                  </span>
                  {store.myRating && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                      Your Rating: {store.myRating}★
                    </span>
                  )}
                </div>
              </div>
              
              <div className="border-t pt-4 mt-auto">
                <p className="text-xs font-medium text-gray-700 mb-2">
                  {store.myRating ? 'Modify your rating:' : 'Submit a rating:'}
                </p>
                <RatingForm 
                  storeId={store.id} 
                  initialRating={store.myRating} 
                  onRatingUpdate={fetchStores}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;