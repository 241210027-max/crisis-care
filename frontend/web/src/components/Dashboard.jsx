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

import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const API_BASE_URL = '';

const DEFAULT_CENTER = [22.5, 79.0];

const getSeverityLabel = (severity) => {
  const level = Number(severity);

  if (level >= 8) return 'High';
  if (level >= 5) return 'Medium';
  return 'Low';
};

const severityColors = {
  High: {
    background: '#ef4444',
    border: '#fca5a5',
  },
  Medium: {
    background: '#eab308',
    border: '#fde047',
  },
  Low: {
    background: '#22c55e',
    border: '#86efac',
  },
};

const MapViewUpdater = ({ disasters }) => {
  const map = useMap();

  useEffect(() => {
    const validLocations = disasters
      .map((disaster) => [
        Number(disaster.latitude),
        Number(disaster.longitude),
      ])
      .filter(
        ([latitude, longitude]) =>
          Number.isFinite(latitude) &&
          Number.isFinite(longitude) &&
          latitude >= -90 &&
          latitude <= 90 &&
          longitude >= -180 &&
          longitude <= 180
      );

    if (validLocations.length === 1) {
      map.setView(validLocations[0], 5);
    } else if (validLocations.length > 1) {
      const bounds = validLocations;
      map.fitBounds(bounds, { padding: [30, 30] });
    }
  }, [disasters, map]);

  return null;
};

const DisasterMap = ({ disasters, loading }) => {
  const validDisasters = disasters.filter((disaster) => {
    const latitude = Number(disaster.latitude);
    const longitude = Number(disaster.longitude);

    return (
      Number.isFinite(latitude) &&
      Number.isFinite(longitude) &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180
    );
  });

  return (
    <div className="bg-[#0F172A] h-80 rounded-lg overflow-hidden">
      {loading ? (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 mx-auto mb-3 text-blue-400 animate-spin" />
            <p className="text-gray-400">Loading disaster locations...</p>
          </div>
        </div>
      ) : validDisasters.length === 0 ? (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-10 h-10 mx-auto mb-3 text-gray-600" />
            <p className="text-gray-400">
              No valid disaster coordinates available
            </p>
          </div>
        </div>
      ) : (
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={4}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <TileLayer
  attribution='&copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ'
  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
/>

          <MapViewUpdater disasters={validDisasters} />

          {validDisasters.map((disaster) => {
            const latitude = Number(disaster.latitude);
            const longitude = Number(disaster.longitude);
            const severity = getSeverityLabel(disaster.severity_level);
            const severityStyle = severityColors[severity];

            return (
              <CircleMarker
                key={disaster.disaster_id}
                center={[latitude, longitude]}
                radius={10}
                pathOptions={{
                  color: severityStyle.border,
                  fillColor: severityStyle.background,
                  fillOpacity: 0.85,
                  weight: 2,
                }}
              >
                <Popup>
                  <div className="text-gray-900 min-w-[180px]">
                    <h3 className="font-bold text-base mb-2">
                      {disaster.disaster_name}
                    </h3>

                    <p className="text-sm">
                      <strong>Type:</strong>{' '}
                      {disaster.disaster_type || 'Not specified'}
                    </p>

                    <p className="text-sm">
                      <strong>Severity:</strong> {severity}
                    </p>

                    <p className="text-sm">
                      <strong>Started:</strong>{' '}
                      {disaster.start_date || 'Not specified'}
                    </p>

                    <p className="text-sm mt-1">
                      <strong>Coordinates:</strong>
                      <br />
                      {latitude.toFixed(4)}, {longitude.toFixed(4)}
                    </p>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      )}
    </div>
  );
};

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

        <div className="grid grid-cols-3 gap-6 mb-6">
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

            <DisasterMap disasters={disasters} loading={loading} />
          </div>

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
                      alert.severity === 'High'
                        ? 'bg-red-500/20 border-red-500'
                        : alert.severity === 'Medium'
                          ? 'bg-yellow-500/20 border-yellow-500'
                          : 'bg-green-500/20 border-green-500'
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

        <div className="bg-[#1E293B] rounded-xl p-6 border border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold flex items-center">
              <BarChart2 className="w-5 h-5 mr-2 text-green-400" />
              Material Inventory
            </h2>

            <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/30 px-3 py-1 rounded-full">
              {materials.length} Materials Tracked
            </span>
          </div>

          {loading ? (
            <div className="text-center py-6 text-gray-400">
              Loading inventory...
            </div>
          ) : materials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {materials.map((material) => (
                <div
                  key={material.material_id}
                  className="bg-[#0F172A] rounded-xl p-4 border border-gray-700 hover:border-blue-500/50 transition-all"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-white text-base">
                        {material.material_name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Material ID: #{material.material_id}
                      </p>
                    </div>

                    <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {material.material_type || 'General'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-gray-700">
                    <div>
                      <p className="text-xs text-gray-500">
                        Unit of Measurement
                      </p>
                      <p className="text-sm text-gray-300 mt-1">
                        {material.unit_of_measurement || 'Not specified'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-green-400">
                      <span className="w-2 h-2 rounded-full bg-green-400"></span>
                      Tracked
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-400">
              No materials available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
