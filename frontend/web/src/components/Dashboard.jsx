import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from './Sidebar';
import {
  AlertTriangle,
  MapPin,
  Shield,
  Clock,
  BarChart2,
  Server,
  RefreshCw,
} from 'lucide-react';

const API_BASE_URL = '';

const Dashboard = () => {
  const [disasters, setDisasters] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [materials, setMaterials] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const [disastersResponse, volunteersResponse, materialsResponse] =
        await Promise.all([
          fetch(`${API_BASE_URL}/api/disasters/`),
          fetch(`${API_BASE_URL}/api/volunteers/`),
          fetch(`${API_BASE_URL}/api/materials/`),
        ]);

      if (
        !disastersResponse.ok ||
        !volunteersResponse.ok ||
        !materialsResponse.ok
      ) {
        throw new Error('Failed to load dashboard data.');
      }

      const [disastersData, volunteersData, materialsData] =
        await Promise.all([
          disastersResponse.json(),
          volunteersResponse.json(),
          materialsResponse.json(),
        ]);

      setDisasters(disastersData);
      setVolunteers(volunteersData);
      setMaterials(materialsData);
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
    fetchDashboardData();
  }, []);

  const availableVolunteers = useMemo(() => {
    return volunteers.filter(
      (volunteer) =>
        String(volunteer.availability_status).toLowerCase() === 'available'
    ).length;
  }, [volunteers]);

  const overviewCards = [
    {
      icon: <AlertTriangle className="w-6 h-6 text-red-400" />,
      label: 'Active Incidents',
      value: disasters.length,
      subtext: 'From disaster database',
      color: 'text-red-400',
    },
    {
      icon: <Shield className="w-6 h-6 text-blue-400" />,
      label: 'Response Teams',
      value: volunteers.length,
      subtext: `${availableVolunteers} available`,
      color: 'text-blue-400',
    },
    {
      icon: <Server className="w-6 h-6 text-yellow-400" />,
      label: 'Resources',
      value: materials.length,
      subtext: 'Material types tracked',
      color: 'text-yellow-400',
    },
    {
      icon: <Clock className="w-6 h-6 text-green-400" />,
      label: 'Avg. Response Time',
      value: 'N/A',
      subtext: 'No response-time data',
      color: 'text-green-400',
    },
  ];

  const getSeverityLabel = (severity) => {
    const level = Number(severity);

    if (level >= 8) return 'High';
    if (level >= 5) return 'Medium';
    return 'Low';
  };

  const severityColors = {
    High: 'bg-red-500/20 border-red-500',
    Medium: 'bg-yellow-500/20 border-yellow-500',
    Low: 'bg-green-500/20 border-green-500',
  };

  const activeAlerts = disasters
    .slice()
    .sort(
      (a, b) => Number(b.severity_level) - Number(a.severity_level)
    )
    .map((disaster) => ({
      type: disaster.disaster_name,
      location: `${disaster.latitude}, ${disaster.longitude}`,
      date: disaster.start_date,
      severity: getSeverityLabel(disaster.severity_level),
    }));

  return (
    <div className="bg-[#0F172A] min-h-screen text-white flex">
      <Sidebar />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-400 mt-1">
              Crisis Care operational overview
            </p>
          </div>

          <button
            onClick={fetchDashboardData}
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

        {/* Overview Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {overviewCards.map((card, index) => (
            <div
              key={index}
              className="bg-[#1E293B] p-5 rounded-xl shadow-lg border border-gray-700 hover:border-blue-600 transition-all duration-300"
            >
              <div className="flex justify-between items-center mb-3">
                {card.icon}

                <div className="text-right">
                  <div className="text-sm text-gray-400">
                    {card.label}
                  </div>

                  <div
                    className={`text-3xl font-bold ${card.color}`}
                  >
                    {loading ? '...' : card.value}
                  </div>

                  <div className="text-xs text-gray-300">
                    {card.subtext}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Disaster Map & Alerts */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          {/* Disaster Map */}
          <div className="col-span-2 bg-[#1E293B] rounded-xl p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-blue-400" />
                Disaster Map
              </h2>

              <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs">
                Database Data
              </div>
            </div>

            <div className="bg-[#0F172A] h-80 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-10 h-10 mx-auto mb-3 text-gray-600" />

                <p className="text-gray-400">
                  Interactive map coming soon
                </p>

                <p className="text-gray-600 text-sm mt-1">
                  {loading
                    ? 'Loading disaster locations...'
                    : `${disasters.length} disaster locations available`}
                </p>
              </div>
            </div>
          </div>

          {/* Active Alerts */}
          <div className="bg-[#1E293B] rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
              Active Alerts
            </h2>

            {loading ? (
              <div className="text-center py-8 text-gray-400">
                Loading alerts...
              </div>
            ) : activeAlerts.length > 0 ? (
              <div className="space-y-3">
                {activeAlerts.map((alert, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      severityColors[alert.severity]
                    } hover:bg-opacity-30 transition-all`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-white">
                          {alert.type}
                        </div>

                        <div className="text-xs text-gray-300">
                          {alert.location}
                        </div>

                        <div className="text-xs text-gray-500 mt-1">
                          Started: {alert.date || 'Not specified'}
                        </div>
                      </div>

                      <span className="text-xs text-gray-400">
                        {alert.severity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                No active disaster records.
              </div>
            )}
          </div>
        </div>

        {/* Resource Status */}
        <div className="bg-[#1E293B] rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <BarChart2 className="w-5 h-5 mr-2 text-green-400" />
            Resource Status
          </h2>

          {loading ? (
            <div className="text-center py-6 text-gray-400">
              Loading resources...
            </div>
          ) : materials.length > 0 ? (
            <div className="grid grid-cols-2 gap-6">
              {materials.map((material) => (
                <div key={material.material_id}>
                  <div className="flex justify-between text-sm mb-2">
                    <span>{material.material_name}</span>

                    <span className="text-gray-400">
                      {material.material_type || 'Uncategorized'}
                    </span>
                  </div>

                  <div className="bg-[#0F172A] rounded-full h-2.5">
                    <div
                      className="bg-blue-500 h-2.5 rounded-full"
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div className="text-xs text-gray-500 mt-1">
                    Unit: {material.unit_of_measurement || 'Not specified'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-400">
              No resources available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;