import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from './Sidebar';
import {
  AlertTriangle,
  BarChart2,
  RefreshCw,
  Activity,
  MapPin,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const API_BASE_URL = '';

const Analytics = () => {
  const [activeTab, setActiveTab] = useState('post-disaster');
  const [disasters, setDisasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${API_BASE_URL}/api/disasters/`);

      if (!response.ok) {
        throw new Error('Failed to load disaster data.');
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
    fetchAnalyticsData();
  }, []);

  const disasterTypeData = useMemo(() => {
    const counts = {};

    disasters.forEach((disaster) => {
      const type = disaster.disaster_type || 'Unknown';

      counts[type] = (counts[type] || 0) + 1;
    });

    return Object.entries(counts).map(([type, count]) => ({
      type,
      count,
    }));
  }, [disasters]);

  const severityData = useMemo(() => {
    return disasters.map((disaster) => ({
      name: disaster.disaster_name,
      severity: Number(disaster.severity_level) || 0,
    }));
  }, [disasters]);

  const severityLabel = (severity) => {
    const level = Number(severity);

    if (level >= 8) return 'High';
    if (level >= 5) return 'Medium';
    return 'Low';
  };

  const severityClass = (severity) => {
    const label = severityLabel(severity);

    if (label === 'High') {
      return 'bg-red-900/50 text-red-300';
    }

    if (label === 'Medium') {
      return 'bg-yellow-900/50 text-yellow-300';
    }

    return 'bg-green-900/50 text-green-300';
  };

  return (
    <div className="flex bg-[#0F172A] min-h-screen text-white">
      <Sidebar />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-blue-300">
              Analytics
            </h1>

            <p className="text-gray-400 mt-1">
              Analytics based on available Crisis Care data
            </p>
          </div>

          <button
            onClick={fetchAnalyticsData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Refresh
          </button>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-300 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex mb-4 space-x-4">
          <button
            className={`
              px-4 py-2 rounded-lg transition-all flex items-center
              ${
                activeTab === 'post-disaster'
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#1E293B] text-gray-400 hover:bg-slate-800'
              }
            `}
            onClick={() => setActiveTab('post-disaster')}
          >
            <BarChart2 className="w-5 h-5 mr-2" />
            Disaster Analysis
          </button>

          <button
            className={`
              px-4 py-2 rounded-lg transition-all flex items-center
              ${
                activeTab === 'predictive'
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#1E293B] text-gray-400 hover:bg-slate-800'
              }
            `}
            onClick={() => setActiveTab('predictive')}
          >
            <Activity className="w-5 h-5 mr-2" />
            Predictive Insights
          </button>
        </div>

        {/* Disaster Analysis */}
        {activeTab === 'post-disaster' && (
          <div className="bg-[#1E293B] rounded-lg p-6 shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-blue-400">
              Disaster Analysis
            </h2>

            {loading ? (
              <div className="text-center py-12 text-gray-400">
                Loading analytics...
              </div>
            ) : disasters.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                No disaster data available.
              </div>
            ) : (
              <>
                {/* Charts */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Disaster Type Chart */}
                  <div className="bg-[#0F172A] rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-3 text-blue-300">
                      Disasters by Type
                    </h3>

                    <div className="bg-[#1E293B] h-64 rounded-lg">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={disasterTypeData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#475569"
                          />

                          <XAxis
                            dataKey="type"
                            stroke="#64748b"
                          />

                          <YAxis
                            allowDecimals={false}
                            stroke="#64748b"
                          />

                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#0F172A',
                              borderColor: '#1E293B',
                            }}
                            labelStyle={{
                              color: '#ffffff',
                            }}
                          />

                          <Bar
                            dataKey="count"
                            fill="#3b82f6"
                            radius={[6, 6, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Severity Chart */}
                  <div className="bg-[#0F172A] rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-3 text-blue-300">
                      Disaster Severity
                    </h3>

                    <div className="bg-[#1E293B] h-64 rounded-lg">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={severityData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#475569"
                          />

                          <XAxis
                            dataKey="name"
                            stroke="#64748b"
                          />

                          <YAxis
                            allowDecimals={false}
                            stroke="#64748b"
                          />

                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#0F172A',
                              borderColor: '#1E293B',
                            }}
                            labelStyle={{
                              color: '#ffffff',
                            }}
                          />

                          <Bar
                            dataKey="severity"
                            fill="#f43f5e"
                            radius={[6, 6, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Disaster Records */}
                <div className="mt-6 bg-[#0F172A] rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3 text-blue-400">
                    Disaster Records
                  </h3>

                  <div className="space-y-3">
                    {disasters.map((disaster) => (
                      <div
                        key={disaster.disaster_id}
                        className="bg-[#1E293B] p-4 rounded-lg flex justify-between items-center"
                      >
                        <div>
                          <div className="font-semibold text-blue-300 flex items-center">
                            <AlertTriangle className="w-5 h-5 mr-2" />
                            {disaster.disaster_name}
                          </div>

                          <div className="text-sm text-gray-400 mt-1">
                            Type: {disaster.disaster_type}
                          </div>

                          <div className="text-sm text-gray-400">
                            Date:{' '}
                            {disaster.start_date || 'Not specified'}
                          </div>
                        </div>

                        <div className="text-right">
                          <span
                            className={`px-3 py-1 rounded-full text-xs ${severityClass(
                              disaster.severity_level
                            )}`}
                          >
                            {severityLabel(disaster.severity_level)}{' '}
                            ({disaster.severity_level})
                          </span>

                          <div className="text-xs text-gray-500 mt-2 flex items-center justify-end">
                            <MapPin className="w-3 h-3 mr-1" />
                            {disaster.latitude},{' '}
                            {disaster.longitude}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Predictive Insights */}
        {activeTab === 'predictive' && (
          <div className="bg-[#1E293B] rounded-lg p-6 shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-blue-400">
              Predictive Disaster Insights
            </h2>

            <div className="bg-[#0F172A] rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Activity className="w-6 h-6 mr-3 text-yellow-400" />

                <h3 className="text-lg font-semibold">
                  Predictive analytics unavailable
                </h3>
              </div>

              <p className="text-gray-400 leading-relaxed">
                The current Crisis Care backend does not yet provide
                historical forecasting, probability, risk-score, or
                machine-learning prediction data. Therefore, this
                dashboard does not display fabricated predictions.
              </p>

              <div className="mt-5 bg-[#1E293B] rounded-lg p-4 border border-gray-700">
                <div className="text-sm text-gray-300">
                  Available data:
                </div>

                <ul className="list-disc list-inside mt-2 space-y-2 text-sm text-gray-400">
                  <li>Disaster name and type</li>
                  <li>Disaster start date</li>
                  <li>Severity level</li>
                  <li>Latitude and longitude</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;