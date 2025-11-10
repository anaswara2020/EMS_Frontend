import React, { useEffect, useState } from 'react';
import {
  FaBuilding,
  FaCheckCircle,
  FaFileAlt,
  FaHourglass,
  FaMoneyBillWave,
  FaTimesCircle,
  FaUsers,
} from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import API from '../../services/api';
import SummeryCard from './SummeryCard';

const AdminSummery = () => {
  const [summery, setSummery] = useState(null);

  useEffect(() => {
    const fetchSummery = async () => {
      try {
        const response = await API.get('/dashboard/summery', {
          headers: { authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setSummery(response.data);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      }
    };

    fetchSummery();
  }, []);

  if (!summery) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-semibold text-gray-500">Loading dashboard data...</p>
      </div>
    );
  }

  //  Chart Data
  const leaveData = [
    { name: 'Applied', value: summery.leaveSummery.applied },
    { name: 'Approved', value: summery.leaveSummery.approved },
    { name: 'Pending', value: summery.leaveSummery.pending },
    { name: 'Rejected', value: summery.leaveSummery.rejected },
  ];

  const COLORS = ['#14b8a6', '#22c55e', '#eab308', '#ef4444'];

  const salaryData = [
    { month: 'Jan', salary: 0 },
    { month: 'Feb', salary: 0 },
    { month: 'Mar', salary: 0 },
    { month: 'Apr', salary: 0 },
    { month: 'May', salary: 0 },
    { month: 'Jun', salary: summery.totalSalary || 0 },
    { month: 'Jul', salary: 0 },
    { month: 'Aug', salary: 0 },
    { month: 'Sep', salary: 0 },
    { month: 'Oct', salary: 0 },
    { month: 'Nov', salary: 0 },
    { month: 'Dec', salary: 0 },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <h3 className="text-3xl font-bold text-gray-800 mb-6">Dashboard Overview</h3>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <SummeryCard icon={<FaUsers />} text="Total Employees" number={summery.totalEmployee} color="bg-teal-600" />
        <SummeryCard icon={<FaBuilding />} text="Total Departments" number={summery.totalDepartments} color="bg-yellow-600" />
        <SummeryCard icon={<FaMoneyBillWave />} text="Monthly Pay" number={summery.totalSalary} color="bg-red-600" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
        {/* Bar Chart */}
        <div className="bg-white rounded-lg shadow-md p-5">
          <h4 className="text-xl font-semibold text-gray-700 mb-4">Monthly Salary Trend</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salaryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="salary" fill="#14b8a6" barSize={40} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-lg shadow-md p-5">
          <h4 className="text-xl font-semibold text-gray-700 mb-4">Leave Status Overview</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={leaveData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label={({ name, value }) => `${name} (${value})`}
              >
                {leaveData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Leave Details Cards */}
      <div className="mt-12">
        <h4 className="text-2xl font-bold text-center mb-6 text-gray-800">Leave Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <SummeryCard icon={<FaFileAlt />} text="Leave Applied" number={summery.leaveSummery.applied} color="bg-teal-600" />
          <SummeryCard icon={<FaCheckCircle />} text="Leave Approved" number={summery.leaveSummery.approved} color="bg-green-600" />
          <SummeryCard icon={<FaHourglass />} text="Leave Pending" number={summery.leaveSummery.pending} color="bg-yellow-600" />
          <SummeryCard icon={<FaTimesCircle />} text="Leave Rejected" number={summery.leaveSummery.rejected} color="bg-red-600" />
        </div>
      </div>
    </div>
  );
};

export default AdminSummery;
