import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import {
  Shield,
  Bell,
  Webhook,
  Zap,
  CheckCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react';

const API_BASE_URL = '';

const Settings = () => {
  const [userRole, setUserRole] = useState('admin');

  const [notifications, setNotifications] = useState({
    sms: true,
    email: false,
    pushNotification: true,
  });

  const [backendStatus, setBackendStatus] = useState('Checking...');

  const checkBackendStatus = async () => {
    try {
      setBackendStatus('Checking...');

      const response = await fetch(`${API_BASE_URL}/api/disasters/`);

      if (!response.ok) {
        throw new Error('Backend unavailable');
      }

      setBackendStatus('Connected');
    } catch (error) {
      console.error('Backend status check failed:', error);
      setBackendStatus('Disconnected');
    }
  };

  useEffect(() => {
    checkBackendStatus();
  }, []);

  const SettingSection = ({ title, children, icon: Icon }) => (
    <div className="bg-slate-900 rounded-xl p-6 space-y-4 shadow-lg">
      <div className="flex items-center space-x-3 border-b border-slate-700 pb-3">
        <Icon className="text-blue-400" size={24} />
        <h2 className="text-xl font-semibold text-white">
          {title}
        </h2>
      </div>

      {children}
    </div>
  );

  const ToggleSwitch = ({ isActive, onChange }) => (
    <button
      type="button"
      onClick={onChange}
      aria-pressed={isActive}
      className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${
        isActive ? 'bg-blue-600' : 'bg-slate-700'
      }`}
    >
      <div
        className={`w-4 h-4 bg-white rounded-full transform transition-transform ${
          isActive ? 'translate-x-6' : 'translate-x-0'
        }`}
      />
    </button>
  );

  return (
    <div className="flex bg-[#0F172A] min-h-screen text-white">
      <Sidebar />

      <div className="container mx-auto max-w-4xl py-12 px-4">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-bold text-blue-400">
            System Configuration
          </h1>

          <button
            onClick={checkBackendStatus}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Check Connection
          </button>
        </div>

        <div className="space-y-8">
          {/* User Roles & Permissions */}
          <SettingSection title="User Roles & Permissions" icon={Shield}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Current Role
                </label>

                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
                >
                  <option value="admin">Admin</option>
                  <option value="responder">Responder</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>

              <div className="bg-slate-800 p-4 rounded-lg">
                <h3 className="font-semibold mb-3 text-blue-300">
                  Role Permissions
                </h3>

                {userRole === 'admin' && (
                  <ul className="text-sm text-gray-300 space-y-2">
                    <li className="flex items-center">
                      <CheckCircle
                        className="mr-2 text-green-500"
                        size={16}
                      />
                      Full System Access
                    </li>

                    <li className="flex items-center">
                      <CheckCircle
                        className="mr-2 text-green-500"
                        size={16}
                      />
                      Manage Users
                    </li>

                    <li className="flex items-center">
                      <CheckCircle
                        className="mr-2 text-green-500"
                        size={16}
                      />
                      Resource Allocation
                    </li>

                    <li className="flex items-center">
                      <CheckCircle
                        className="mr-2 text-green-500"
                        size={16}
                      />
                      Generate Alerts
                    </li>
                  </ul>
                )}

                {userRole === 'responder' && (
                  <ul className="text-sm text-gray-300 space-y-2">
                    <li className="flex items-center">
                      <CheckCircle
                        className="mr-2 text-green-500"
                        size={16}
                      />
                      View Incidents
                    </li>

                    <li className="flex items-center">
                      <CheckCircle
                        className="mr-2 text-green-500"
                        size={16}
                      />
                      Update Team Status
                    </li>

                    <li className="flex items-center">
                      <CheckCircle
                        className="mr-2 text-green-500"
                        size={16}
                      />
                      Resource Tracking
                    </li>

                    <li className="flex items-center">
                      <XCircle
                        className="mr-2 text-red-500"
                        size={16}
                      />
                      User Management
                    </li>
                  </ul>
                )}

                {userRole === 'viewer' && (
                  <ul className="text-sm text-gray-300 space-y-2">
                    <li className="flex items-center">
                      <CheckCircle
                        className="mr-2 text-green-500"
                        size={16}
                      />
                      View Dashboard
                    </li>

                    <li className="flex items-center">
                      <CheckCircle
                        className="mr-2 text-green-500"
                        size={16}
                      />
                      View Reports
                    </li>

                    <li className="flex items-center">
                      <XCircle
                        className="mr-2 text-red-500"
                        size={16}
                      />
                      Resource Allocation
                    </li>

                    <li className="flex items-center">
                      <XCircle
                        className="mr-2 text-red-500"
                        size={16}
                      />
                      Team Management
                    </li>
                  </ul>
                )}
              </div>
            </div>
          </SettingSection>

          {/* Notification Preferences */}
          <SettingSection title="Alert Preferences" icon={Bell}>
            <div className="space-y-4">
              <div className="bg-slate-800 p-4 rounded-lg flex justify-between items-center">
                <span>SMS Notifications</span>

                <ToggleSwitch
                  isActive={notifications.sms}
                  onChange={() =>
                    setNotifications((previous) => ({
                      ...previous,
                      sms: !previous.sms,
                    }))
                  }
                />
              </div>

              <div className="bg-slate-800 p-4 rounded-lg flex justify-between items-center">
                <span>Email Notifications</span>

                <ToggleSwitch
                  isActive={notifications.email}
                  onChange={() =>
                    setNotifications((previous) => ({
                      ...previous,
                      email: !previous.email,
                    }))
                  }
                />
              </div>

              <div className="bg-slate-800 p-4 rounded-lg flex justify-between items-center">
                <span>Push Notifications</span>

                <ToggleSwitch
                  isActive={notifications.pushNotification}
                  onChange={() =>
                    setNotifications((previous) => ({
                      ...previous,
                      pushNotification: !previous.pushNotification,
                    }))
                  }
                />
              </div>
            </div>
          </SettingSection>

          {/* Backend / Integration Status */}
          <SettingSection title="System Connectivity" icon={Webhook}>
            <div className="space-y-4">
              <div className="bg-slate-800 p-4 rounded-lg flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <Zap
                    className={
                      backendStatus === 'Connected'
                        ? 'text-green-500'
                        : 'text-red-500'
                    }
                    size={20}
                  />

                  <div>
                    <span className="font-medium">
                      Crisis Care Backend
                    </span>

                    <div className="text-xs text-gray-400 mt-1">
                      Django REST API
                    </div>
                  </div>
                </div>

                <span
                  className={`
                    font-semibold
                    ${
                      backendStatus === 'Connected'
                        ? 'text-green-500'
                        : backendStatus === 'Checking...'
                        ? 'text-yellow-400'
                        : 'text-red-500'
                    }
                  `}
                >
                  {backendStatus}
                </span>
              </div>

              <div className="bg-slate-800 p-4 rounded-lg">
                <div className="text-sm font-semibold text-blue-300 mb-2">
                  Additional Integrations
                </div>

                <p className="text-sm text-gray-400">
                  Kafka, Vertex AI, Gemini, and other external integrations
                  are not currently connected to the Crisis Care backend.
                  Their status is therefore not reported as connected.
                </p>
              </div>
            </div>
          </SettingSection>
        </div>

        <div className="mt-8 text-center text-slate-500">
          <p>Version 1.0.0 • Crisis Care</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;