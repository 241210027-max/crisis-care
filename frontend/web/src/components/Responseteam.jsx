import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';

const API_BASE_URL = '';

const ResponseTeams = () => {
  const [activeTab, setActiveTab] = useState('status');
  const [volunteers, setVolunteers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const [volunteersResponse, assignmentsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/volunteers/`),
        fetch(`${API_BASE_URL}/api/assignments/`),
      ]);

      if (!volunteersResponse.ok || !assignmentsResponse.ok) {
        throw new Error('Failed to load response team data.');
      }

      const volunteersData = await volunteersResponse.json();
      const assignmentsData = await assignmentsResponse.json();

      setVolunteers(volunteersData);
      setAssignments(assignmentsData);
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
    fetchData();
  }, []);

  const getAssignmentForVolunteer = (volunteerId) => {
    return assignments.find(
      (assignment) => assignment.volunteer === volunteerId
    );
  };

  const getAvailabilityClass = (status) => {
    if (status === 'Busy') {
      return 'bg-red-900/50 text-red-300';
    }

    if (status === 'Available') {
      return 'bg-green-900/50 text-green-300';
    }

    return 'bg-yellow-900/50 text-yellow-300';
  };

  const handleDeleteAssignment = async (assignmentId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/assignments/${assignmentId}/`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to remove assignment.');
      }

      await fetchData();
    } catch (err) {
      console.error(err);
      setError('Unable to remove the assignment.');
    }
  };

  return (
    <div className="flex bg-[#0F172A] min-h-screen text-white">
      <Sidebar />

      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6 text-blue-300">
          Response Teams
        </h1>

        <div className="flex mb-4 space-x-4">
          <button
            className={`
              px-4 py-2 rounded-lg transition-all flex items-center
              ${
                activeTab === 'status'
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#1E293B] text-gray-400 hover:bg-slate-800'
              }
            `}
            onClick={() => setActiveTab('status')}
          >
            Team Status
          </button>

          <button
            className={`
              px-4 py-2 rounded-lg transition-all flex items-center
              ${
                activeTab === 'optimization'
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#1E293B] text-gray-400 hover:bg-slate-800'
              }
            `}
            onClick={() => setActiveTab('optimization')}
          >
            Path Optimization
          </button>
        </div>

        {activeTab === 'status' && (
          <div className="bg-[#1E293B] rounded-lg p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-blue-400">
                Team Status Overview
              </h2>

              <button
                onClick={fetchData}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
              >
                Refresh
              </button>
            </div>

            {loading && (
              <div className="text-gray-400 py-8 text-center">
                Loading response teams...
              </div>
            )}

            {error && (
              <div className="bg-red-900/30 border border-red-800 text-red-300 rounded-lg p-4 mb-4">
                {error}
              </div>
            )}

            {!loading && !error && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#0F172A] text-gray-400">
                    <tr>
                      <th className="p-3 text-left">Team ID</th>
                      <th className="p-3 text-left">Volunteer</th>
                      <th className="p-3 text-left">
                        Assigned Incident
                      </th>
                      <th className="p-3 text-left">Skills</th>
                      <th className="p-3 text-left">Availability</th>
                      <th className="p-3 text-left">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {volunteers.length === 0 ? (
                      <tr>
                        <td
                          colSpan="6"
                          className="p-6 text-center text-gray-500"
                        >
                          No response teams found.
                        </td>
                      </tr>
                    ) : (
                      volunteers.map((volunteer) => {
                        const assignment = getAssignmentForVolunteer(
                          volunteer.volunteer_id
                        );

                        const skills = volunteer.skills
                          ? volunteer.skills
                              .split(',')
                              .map((skill) => skill.trim())
                              .filter(Boolean)
                          : [];

                        return (
                          <tr
                            key={volunteer.volunteer_id}
                            className="border-b border-slate-700 hover:bg-slate-800 transition-colors"
                          >
                            <td className="p-3">
                              TEAM-{String(volunteer.volunteer_id).padStart(
                                2,
                                '0'
                              )}
                            </td>

                            <td className="p-3">
                              <div className="font-medium">
                                {volunteer.first_name}{' '}
                                {volunteer.last_name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {volunteer.email}
                              </div>
                            </td>

                            <td className="p-3">
                              {assignment
                                ? assignment.disaster_name
                                : 'No Active Assignment'}
                            </td>

                            <td className="p-3">
                              <div className="flex flex-wrap gap-2">
                                {skills.length > 0 ? (
                                  skills.map((skill) => (
                                    <span
                                      key={skill}
                                      className="bg-blue-900/50 text-blue-300 px-2 py-1 rounded-full text-xs"
                                    >
                                      {skill}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-gray-500 text-sm">
                                    Not specified
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="p-3">
                              <span
                                className={`
                                  px-2 py-1 rounded-full text-xs
                                  ${getAvailabilityClass(
                                    volunteer.availability_status
                                  )}
                                `}
                              >
                                {volunteer.availability_status ||
                                  'Unknown'}
                              </span>
                            </td>

                            <td className="p-3">
                              {assignment ? (
                                <button
                                  onClick={() =>
                                    handleDeleteAssignment(
                                      assignment.assignment_id
                                    )
                                  }
                                  className="bg-red-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-red-700 transition-colors"
                                >
                                  Reassign
                                </button>
                              ) : (
                                <span className="text-gray-500 text-xs">
                                  Available
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'optimization' && (
          <div className="bg-[#1E293B] rounded-lg p-6 shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-blue-400">
              Path Optimization Tool
            </h2>

            <div className="bg-[#0F172A] p-6 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Incident Location
                  </label>

                  <input
                    type="text"
                    placeholder="Enter location"
                    className="w-full bg-[#1E293B] border border-slate-700 rounded-lg p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Disaster Type
                  </label>

                  <select
                    className="w-full bg-[#1E293B] border border-slate-700 rounded-lg p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option>Flood</option>
                    <option>Earthquake</option>
                    <option>Cyclone</option>
                    <option>Landslide</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 bg-[#1E293B] rounded-lg h-64 flex items-center justify-center">
                <p className="text-gray-500">
                  Optimal Route Visualization Placeholder
                </p>
              </div>

              <div className="mt-6 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-blue-300">
                    Recommended Response Team
                  </h3>
                  <p className="text-gray-400">
                    Select an incident to calculate recommendation
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-blue-300">
                    Estimated Travel Time
                  </h3>
                  <p className="text-gray-400">Not calculated</p>
                </div>

                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                  Optimize and Deploy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResponseTeams;