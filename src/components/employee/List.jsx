

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import DataTable from 'react-data-table-component';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { columns as baseColumns } from '../../utils/employeeHelper';
import API from '../../services/api';

const List = () => {
  const [employee, setEmployee] = useState([]);
  const [filterEmployees, setFilterEmployees] = useState([]);
  const [nameQuery, setNameQuery] = useState('');
  const [deptQuery, setDeptQuery] = useState('');
  const [empIdQuery, setEmpIdQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  // 🔹 Fetch Employees
  const fetchEmployees = useCallback(async () => {
    try {
      const res = await API.get('/employee', {
        headers: { authorization: `Bearer ${localStorage.getItem('token')}` },
        params: { v: Date.now() }, // cache-buster
      });

      if (res.data?.success) {
        const prepareData = (res.data.employeeData || []).map((emp, index) => ({
          sNo: index + 1,
          id: emp._id,
          employeeId: String(emp.employeeId ?? ''),
          name: String(emp.userId?.name ?? ''),
          dob: emp.dob,
          department: String(emp.department?.dep_name ?? ''),
          image: emp.userId?.profileImage,
        }));

        setEmployee(prepareData);
        setFilterEmployees(prepareData);
      }
    } catch (error) {
      console.error('Fetch employees failed:', error);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Refresh on add/edit
  useEffect(() => {
    if (location.state?.refresh) {
      fetchEmployees();
      window.history.replaceState({}, document.title);
    }
  }, [location.state, fetchEmployees]);

  // Refetch when tab gains focus
  useEffect(() => {
    const onFocus = () => fetchEmployees();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [fetchEmployees]);

  // 🔹 Department dropdown options
  const departments = useMemo(() => {
    const set = new Set();
    employee.forEach((e) => e.department && set.add(e.department));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [employee]);

  // 🔹 Filtering logic
  useEffect(() => {
    const nameQ = nameQuery.trim().toLowerCase();
    const empIdQ = empIdQuery.trim().toLowerCase();

    const filtered = employee.filter((emp) => {
      const nameOk = nameQ ? (emp.name || '').toLowerCase().includes(nameQ) : true;
      const deptOk = deptQuery ? emp.department === deptQuery : true;
      const empIdOk = empIdQ ? (emp.employeeId || '').toLowerCase().includes(empIdQ) : true;
      return nameOk && deptOk && empIdOk;
    });

    setFilterEmployees(filtered);
  }, [employee, nameQuery, deptQuery, empIdQuery]);

  const clearFilters = () => {
    setNameQuery('');
    setDeptQuery('');
    setEmpIdQuery('');
    setFilterEmployees(employee);
  };

  // Delete Employee Handler
  const handleDelete = async (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "This employee's data will be permanently deleted!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem('token');
          const res = await API.delete(`/employee/delete/${id}`, {
            headers: { authorization: `Bearer ${token}` },
          });

          if (res.data?.success) {
            Swal.fire('Deleted!', 'Employee has been deleted.', 'success');
            fetchEmployees();
          } else {
            Swal.fire('Error!', res.data?.message || 'Delete failed', 'error');
          }
        } catch (error) {
          Swal.fire(
            'Error!',
            error.response?.data?.message || 'Server error occurred',
            'error'
          );
        }
      }
    });
  };

  // 🔹 Add S.No and Employee ID columns + extend Action
  const columns = useMemo(() => {
    const sNoCol = {
      name: 'S.No',
      selector: (row) => row.sNo,
      sortable: true,
      width: '90px',
      center: true,
    };

    const empIdCol = {
      name: 'Employee ID',
      selector: (row) => row.employeeId,
      sortable: true,
      width: '150px',
    };

    const updatedColumns = baseColumns.map((col) => {
      if (col.name === 'Action') {
        return {
          ...col,
          width: '600px', // Wider for Delete button
          cell: (row) => (
            <div className="flex gap-2 justify-center">
              <Link
                to={`/admin-dashboard/employee/views/${row.id}`}
                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
              >
                View
              </Link>
              <Link
                to={`/admin-dashboard/employee/edit/${row.id}`}
                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm"
              >
                Edit
              </Link>
              <Link
                to={`/admin-dashboard/employee/salary/${row.id}`}
                className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-sm"
              >
                Salary
              </Link>
              <Link
                to={`/admin-dashboard/employee/leave/${row.id}`}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
              >
                Leave
              </Link>
              <button
                onClick={() => handleDelete(row.id)}
                className="bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-800 text-sm"
              >
                Delete
              </button>
            </div>
          ),
        };
      }
      return col;
    });

    return [sNoCol, empIdCol, ...updatedColumns];
  }, [baseColumns]);

  return (
    <div className="ml-3 mr-3">
      <div className="text-center">
        <h3 className="text-2xl font-bold">Manage Employee</h3>
      </div>

      {/* 🔹 Filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between m-3">
        <div className="flex gap-2 flex-1 flex-wrap">
          <input
            type="text"
            placeholder="Search by Name"
            className="py-1 px-5 border-black border"
            value={nameQuery}
            onChange={(e) => setNameQuery(e.target.value)}
          />
          <input
            type="text"
            placeholder="Search by Employee ID"
            className="py-1 px-5 border-black border"
            value={empIdQuery}
            onChange={(e) => setEmpIdQuery(e.target.value)}
          />
          <select
            className="py-1 px-3 border-black border"
            value={deptQuery}
            onChange={(e) => setDeptQuery(e.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map((dep) => (
              <option key={dep} value={dep}>
                {dep}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={clearFilters}
            className="px-4 border border-black"
          >
            Clear
          </button>
        </div>

        <Link
          to="/admin-dashboard/add-employee"
          className="bg-teal-500 rounded px-5 py-2 text-white font-semibold inline-block"
        >
          Add New Employee
        </Link>
      </div>

      {/* 🔹 Data Table */}
      <div className="mt-5 overflow-x-auto">
        <DataTable
          title="Manage Employees"
          columns={columns}
          data={filterEmployees}
          pagination
          responsive
          highlightOnHover
          pointerOnHover
          striped
          fixedHeader
          noDataComponent="No employees found."
        />
      </div>
    </div>
  );
};

export default List;
