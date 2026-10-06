import React, { useEffect, useMemo, useState } from 'react';
import {
  Package,
  Boxes,
  Truck,
  Search,
  Filter,
  X,
} from 'lucide-react';
import Sidebar from './Sidebar';

const API_BASE_URL = '';

const Resources = () => {
  const [activeTab, setActiveTab] = useState('tracking');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResourceTypes, setSelectedResourceTypes] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchResources = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${API_BASE_URL}/api/materials/`);

      if (!response.ok) {
        throw new Error('Failed to load resources.');
      }

      const data = await response.json();
      setResources(data);
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
    fetchResources();
  }, []);

  const resourceTypes = useMemo(() => {
    return [...new Set(resources.map((resource) => resource.material_type))]
      .filter(Boolean)
      .sort();
  }, [resources]);

  const toggleResourceTypeFilter = (type) => {
    setSelectedResourceTypes((previous) =>
      previous.includes(type)
        ? previous.filter((item) => item !== type)
        : [...previous, type]
    );
  };

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const matchesSearch =
        !searchQuery ||
        Object.values(resource).some((value) =>
          String(value)
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        );

      const matchesTypeFilter =
        selectedResourceTypes.length === 0 ||
        selectedResourceTypes.includes(resource.material_type);

      return matchesSearch && matchesTypeFilter;
    });
  }, [resources, searchQuery, selectedResourceTypes]);

  return (
    <div className="flex bg-[#0F172A] min-h-screen text-white">
      <Sidebar />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold flex items-center">
            <Package className="w-8 h-8 mr-3 text-blue-400" />
            Resources Management
          </h1>

          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search resources..."
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

            {/* Filter */}
            <div className="relative">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
                onClick={() => {
                  const filterPanel =
                    document.getElementById('resource-filter-panel');

                  if (filterPanel) {
                    filterPanel.classList.toggle('hidden');
                  }
                }}
              >
                <Filter className="w-5 h-5 mr-2" />
                Filters
              </button>

              <div
                id="resource-filter-panel"
                className="hidden absolute right-0 mt-2 w-48 bg-[#1E293B] rounded-lg shadow-lg border border-gray-700 p-3 z-10"
              >
                <div className="text-sm font-semibold mb-2">
                  Resource Types
                </div>

                {resourceTypes.map((type) => (
                  <label
                    key={type}
                    className="flex items-center space-x-2 mb-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedResourceTypes.includes(type)}
                      onChange={() => toggleResourceTypeFilter(type)}
                      className="form-checkbox h-4 w-4 text-blue-600 bg-gray-800 border-gray-700 rounded"
                    />

                    <span>{type}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex mb-6 space-x-4">
          <button
            className={`
              px-4 py-2 rounded-lg transition-all flex items-center
              ${
                activeTab === 'tracking'
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#1E293B] text-gray-400 hover:bg-[#2C3E5A]'
              }
            `}
            onClick={() => setActiveTab('tracking')}
          >
            <Boxes className="w-5 h-5 mr-2" />
            Resource Tracking
          </button>

          <button
            className={`
              px-4 py-2 rounded-lg transition-all flex items-center
              ${
                activeTab === 'allocation'
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#1E293B] text-gray-400 hover:bg-[#2C3E5A]'
              }
            `}
            onClick={() => setActiveTab('allocation')}
          >
            <Truck className="w-5 h-5 mr-2" />
            Resource Allocation
          </button>
        </div>

        {/* Resource Tracking */}
        {activeTab === 'tracking' && (
          <div className="bg-[#1E293B] rounded-xl p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <Boxes className="w-6 h-6 mr-2 text-green-400" />
                Available Resources

                {searchQuery && (
                  <span className="ml-3 text-sm text-gray-400">
                    ({filteredResources.length} results)
                  </span>
                )}
              </h2>

              <button
                onClick={fetchResources}
                className="text-gray-400 hover:text-white text-sm"
              >
                Refresh
              </button>
            </div>

            {loading && (
              <div className="text-center py-8 text-gray-400">
                Loading resources...
              </div>
            )}

            {error && (
              <div className="bg-red-900/30 border border-red-800 text-red-300 rounded-lg p-4">
                {error}
              </div>
            )}

            {!loading && !error && (
              <>
                {filteredResources.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredResources.map((resource) => (
                      <div
                        key={resource.material_id}
                        className="bg-[#0F172A] p-5 rounded-lg border border-gray-700 hover:border-blue-600 transition-all"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="font-semibold text-lg">
                              {resource.material_name}
                            </div>

                            <div className="text-sm text-gray-400 mt-1">
                              {resource.material_type || 'Uncategorized'}
                            </div>
                          </div>

                          <Package className="w-6 h-6 text-blue-400" />
                        </div>

                        <div className="border-t border-gray-700 pt-3 space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">
                              Material ID
                            </span>

                            <span>
                              #{resource.material_id}
                            </span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-gray-400">
                              Type
                            </span>

                            <span>
                              {resource.material_type || 'Not specified'}
                            </span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-gray-400">
                              Unit
                            </span>

                            <span>
                              {resource.unit_of_measurement ||
                                'Not specified'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    No resources found matching your search.
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Resource Allocation */}
        {activeTab === 'allocation' && (
          <div className="bg-[#1E293B] rounded-xl p-6 border border-gray-700">
            <div className="flex items-center mb-4">
              <Truck className="w-6 h-6 mr-2 text-blue-400" />

              <h2 className="text-xl font-semibold">
                Resource Allocation Dashboard
              </h2>
            </div>

            <div className="bg-[#0F172A] rounded-lg border border-gray-700 p-6 text-center">
              <Truck className="w-10 h-10 mx-auto mb-3 text-gray-500" />

              <h3 className="text-lg font-semibold">
                Allocation data unavailable
              </h3>

              <p className="text-gray-400 text-sm mt-2 max-w-lg mx-auto">
                The current backend API does not provide resource allocation,
                warehouse, quantity, route, or deployment information yet.
                This section will be connected when those APIs are available.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Resources;