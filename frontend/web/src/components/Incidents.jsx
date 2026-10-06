import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Filter,
  Search,
  MoreHorizontal,
  ChevronDown,
  X,
} from 'lucide-react';
import Sidebar from './Sidebar';

const API_BASE_URL = '';

const Incidents = () => {
  const [activeTab, setActiveTab] = useState('reported-incidents');
  const [searchQuery, setSearchQuery] = useState('');
  const [disasters, setDisasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDisasters = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${API_BASE_URL}/api/disasters/`);

      if (!response.ok) {
        throw new Error('Failed to load disasters.');
      }

      const data = await response.json();
      setDisasters(data);
    } catch (err) {
      console.error(err);
      setError(
        'Unable to connect to the Crisis Care backend. Make sure Django is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisasters();
  }, []);

  const getSeverityLabel = (severity) => {
    const level = Number(severity);

    if (level >= 8) return 'Critical';
    if (level >= 5) return 'High';
    if (level >= 3) return 'Medium';
    return 'Low';
  };

  const getSeverityClasses = (severity) => {
    const label = getSeverityLabel(severity);

    switch (label) {
      case 'Critical':
        return 'bg-red-500/20 text-red-400 border-red-500';
      case 'High':
        return 'bg-orange-500/20 text-orange-400 border-orange-500';
      case 'Medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500';
      default:
        return 'bg-green-500/20 text-green-400 border-green-500';
    }
  };

  const filteredDisasters = useMemo(() => {
    if (!searchQuery) return disasters;

    const lowercaseQuery = searchQuery.toLowerCase();

    return disasters.filter((disaster) =>
      Object.values(disaster).some((value) =>
        String(value).toLowerCase().includes(lowercaseQuery)
      )
    );
  }, [disasters, searchQuery]);

  return (
    <div className="flex bg-[#0F172A] min-h-screen text-white">
      <Sidebar />

      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold flex items-center">
            <AlertTriangle className="w-8 h-8 mr-3 text-red-400" />
            Incidents Management
          </h1>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search disasters..."
                className="bg-[#1E293B] text-white pl-10 pr-10 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />

              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors">
              <Filter className="w-5 h-5 mr-2" />
              Filters
            </button>
          </div>
        </div>

        <div className="flex mb-6 space-x-4">
          <button
            className={`
              px-4 py-2 rounded-lg transition-all
              ${
                activeTab === 'reported-incidents'
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#1E293B] text-gray-400 hover:bg-[#2C3E5A]'
              }
            `}
            onClick={() => setActiveTab('reported-incidents')}
          >
            Reported Incidents
          </button>

          <button
            className={`
              px-4 py-2 rounded-lg transition-all
              ${
                activeTab === 'predicted-disasters'
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#1E293B] text-gray-400 hover:bg-[#2C3E5A]'
              }
            `}
            onClick={() => setActiveTab('predicted-disasters')}
          >
            Disaster Data
          </button>
        </div>

        {activeTab === 'reported-incidents' && (
          <div className="bg-[#1E293B] rounded-xl p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Reported Incidents
                {searchQuery && (
                  <span className="ml-3 text-sm text-gray-400">
                    ({filteredDisasters.length} results)
                  </span>
                )}
              </h2>

              <button
                onClick={fetchDisasters}
                className="text-gray-400 hover:text-white flex items-center"
              >
                Refresh
                <ChevronDown className="ml-2 w-4 h-4" />
              </button>
            </div>

            {loading && (
              <div className="text-center py-8 text-gray-400">
                Loading disaster data...
              </div>
            )}

            {error && (
              <div className="bg-red-900/30 border border-red-800 text-red-300 rounded-lg p-4">
                {error}
              </div>
            )}

            {!loading && !error && (
              <div className="overflow-x-auto">
                {filteredDisasters.length > 0 ? (
                  <table className="w-full">
                    <thead className="bg-[#0F172A] border-b border-gray-700">
                      <tr>
                        {[
                          'ID',
                          'Name',
                          'Type',
                          'Date',
                          'Severity',
                          'Location',
                          'Actions',
                        ].map((header) => (
                          <th
                            key={header}
                            className="p-3 text-left text-gray-400 font-medium"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {filteredDisasters.map((disaster) => (
                        <tr
                          key={disaster.disaster_id}
                          className="border-b border-gray-700 hover:bg-[#2C3E5A] transition-colors"
                        >
                          <td className="p-3">
                            INC-{String(disaster.disaster_id).padStart(3, '0')}
                          </td>

                          <td className="p-3 font-medium">
                            {disaster.disaster_name}
                          </td>

                          <td className="p-3">
                            {disaster.disaster_type}
                          </td>

                          <td className="p-3">
                            {disaster.start_date || 'Not specified'}
                          </td>

                          <td className="p-3">
                            <span
                              className={`
                                px-2 py-1 rounded-full text-xs border
                                ${getSeverityClasses(
                                  disaster.severity_level
                                )}
                              `}
                            >
                              {getSeverityLabel(disaster.severity_level)}
                              {' ('}
                              {disaster.severity_level}
                              {')'}
                            </span>
                          </td>

                          <td className="p-3 text-sm">
                            {disaster.latitude}, {disaster.longitude}
                          </td>

                          <td className="p-3">
                            <div className="flex items-center space-x-2">
                              <button className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-blue-700">
                                Details
                              </button>

                              <button className="text-gray-400 hover:text-white">
                                <MoreHorizontal className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    No disasters found matching your search.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'predicted-disasters' && (
          <div className="bg-[#1E293B] rounded-xl p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Disaster Data
              </h2>

              <button
                onClick={fetchDisasters}
                className="text-gray-400 hover:text-white flex items-center"
              >
                Refresh
                <ChevronDown className="ml-2 w-4 h-4" />
              </button>
            </div>

            {loading && (
              <div className="text-center py-8 text-gray-400">
                Loading disaster data...
              </div>
            )}

            {!loading && !error && (
              <div className="space-y-4">
                {filteredDisasters.length > 0 ? (
                  filteredDisasters.map((disaster) => (
                    <div
                      key={disaster.disaster_id}
                      className="bg-[#0F172A] p-4 rounded-lg flex justify-between items-center border border-gray-700 hover:border-blue-600 transition-all"
                    >
                      <div>
                        <div className="font-semibold text-white flex items-center">
                          <AlertTriangle className="w-5 h-5 mr-2 text-yellow-400" />
                          {disaster.disaster_name}
                        </div>

                        <div className="text-sm text-gray-400 mt-1">
                          Type: {disaster.disaster_type}
                        </div>

                        <div className="text-sm text-gray-400">
                          Date:{' '}
                          {disaster.start_date || 'Not specified'}
                        </div>

                        <div className="text-sm text-gray-400">
                          Coordinates: {disaster.latitude},{' '}
                          {disaster.longitude}
                        </div>
                      </div>

                      <span
                        className={`
                          px-3 py-1 rounded-full text-xs border
                          ${getSeverityClasses(
                            disaster.severity_level
                          )}
                        `}
                      >
                        Severity {disaster.severity_level}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    No disaster data found.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Incidents;