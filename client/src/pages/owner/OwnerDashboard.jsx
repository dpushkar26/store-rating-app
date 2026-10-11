import { useState, useEffect } from 'react';
import api from '../../services/api';

const OwnerDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await api.get('/dashboard/owner');
                setDashboardData(response.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load dashboard');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    if (loading) return <div className="text-center mt-10">Loading your store data...</div>;
    if (error) return <div className="text-center mt-10 text-red-600 font-medium">{error}</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{dashboardData.storeName}</h1>
                <p className="text-gray-500">Store Owner Dashboard</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow border border-gray-200 flex flex-col items-center justify-center">
                    <h3 className="text-lg font-medium text-gray-500">Average Rating</h3>
                    <p className="text-5xl font-bold text-indigo-600 mt-2">
                        {dashboardData.averageRating} <span className="text-2xl text-gray-400">/ 5</span>
                    </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border border-gray-200 flex flex-col items-center justify-center">
                    <h3 className="text-lg font-medium text-gray-500">Total Ratings Received</h3>
                    <p className="text-5xl font-bold text-gray-900 mt-2">{dashboardData.totalRatings}</p>
                </div>
            </div>

            {/* Ratings Table */}
            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Recent Ratings</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating Given</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {dashboardData.recentRaters.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">No ratings received yet.</td>
                                </tr>
                            ) : (
                                dashboardData.recentRaters.map((rater, idx) => (
                                    <tr key={idx}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{rater.userName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rater.userEmail}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <span className="text-yellow-500">{'★'.repeat(rater.score)}</span>
                                            <span className="text-gray-300">{'★'.repeat(5 - rater.score)}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(rater.date).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default OwnerDashboard;