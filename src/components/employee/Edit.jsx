
import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchDepartment } from '../../utils/employeeHelper';
import Swal from 'sweetalert2';

const Edit = () => {
  const [department, setDepartment] = useState([]);
  const [employee, setEmployee] = useState({
    name: '',
    dob: '',
    maritalStatus: '',
    designation: '',
    departmentId: '',
    salary: '',
    image: '',
  });
  const [previewImage, setPreviewImage] = useState('');
  const [error, setError] = useState('');
  const [inputError, setInputError] = useState({});
  const navigate = useNavigate();
  const { id } = useParams();

  // Base API path for image previews
  const API_BASE =
    (API?.defaults?.baseURL && API.defaults.baseURL.replace(/\/$/, '')) ||
    'http://localhost:8000';

  const UPLOADS_BASE = `${API_BASE}/uploads`;

  // Fetch departments
  useEffect(() => {
    const getDepartments = async () => {
      const data = await fetchDepartment();
      setDepartment(data);
    };
    getDepartments();
  }, []);

  // Fetch employee data
  useEffect(() => {
    const getEmployee = async () => {
      try {
        const res = await API.get(`/employee/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (res.data.success) {
          const emp = res.data.data;
          setEmployee({
            name: emp.name || emp.userId?.name || '',
            dob: emp.dob || '',
            maritalStatus: emp.maritalStatus || '',
            designation: emp.designation || '',
            departmentId: emp.department?._id || emp.departmentId || '',
            salary: emp.salary || '',
            image: emp.userId?.profileImage || '',
          });

          if (emp.userId?.profileImage) {
            const imgPath = emp.userId.profileImage.startsWith('uploads/')
              ? `${API_BASE}/${emp.userId.profileImage}`
              : emp.userId.profileImage.startsWith('/uploads/')
              ? `${API_BASE}${emp.userId.profileImage}`
              : `${UPLOADS_BASE}/${emp.userId.profileImage}`;
            setPreviewImage(imgPath);
          }
        }
      } catch (error) {
        console.error('Error fetching employee:', error.message);
        setError(
          error.response?.data?.message ||
            'Failed to fetch employee details. Try again.'
        );
      }
    };

    getEmployee();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setError('');

    if (name === 'image' && files?.[0]) {
      setEmployee((prev) => ({ ...prev, image: files[0] }));
      setPreviewImage(URL.createObjectURL(files[0]));
    } else {
      setEmployee((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validate = (data) => {
    const errors = {};
    if (!data.name || data.name.trim().length < 2)
      errors.name = 'Name is required (min 2 chars)';
    if (!data.dob) errors.dob = 'Date of Birth is required';
    if (!data.maritalStatus) errors.maritalStatus = 'Marital status is required';
    if (!data.designation) errors.designation = 'Designation is required';
    if (!data.departmentId)
      errors.department = 'Department is required';
    if (!data.salary || isNaN(data.salary) || Number(data.salary) <= 0)
      errors.salary = 'Valid salary is required';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate(employee);
    if (Object.keys(errors).length > 0) {
      setInputError(errors);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      Object.entries(employee).forEach(([key, val]) =>
        formData.append(key, val)
      );

      const res = await API.put(`/employee/edit/${id}`, formData, {
        headers: {
          authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Employee updated successfully!',
          timer: 1500,
          showConfirmButton: false,
        }).then(() => navigate('/admin-dashboard/employee'));
      }
    } catch (error) {
      setError(
        error.response?.data?.message || 'Something went wrong. Please try again.'
      );
    }
  };

  return (
    <div>
      <div className="max-w-5xl mx-auto p-6 bg-white shadow-md rounded mt-4">
        <h3 className="text-2xl font-semibold mb-4">Edit Employee</h3>
        {error && (
          <div className="mb-4 text-red-600 bg-red-100 border border-red-300 rounded px-3 py-2">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Name */}
            <div>
              <label className="block mb-1 font-medium">Name</label>
              <input
                type="text"
                name="name"
                placeholder="Insert Name"
                value={employee.name || ''}
                className="w-full border p-2 rounded"
                onChange={handleChange}
              />
              {inputError.name && (
                <span className="text-red-500 text-sm">{inputError.name}</span>
              )}
            </div>

            {/* DOB */}
            <div>
              <label className="block mb-1 font-medium">Date of Birth</label>
              <input
                type="date"
                name="dob"
                className="w-full border p-2 rounded"
                value={employee.dob ? employee.dob.slice(0, 10) : ''}
                onChange={handleChange}
              />
              {inputError.dob && (
                <span className="text-red-500 text-sm">{inputError.dob}</span>
              )}
            </div>

            {/* Marital Status */}
            <div>
              <label className="block mb-1 font-medium">Marital Status</label>
              <select
                name="maritalStatus"
                onChange={handleChange}
                value={employee.maritalStatus || ''}
                className="w-full border p-2 rounded"
              >
                <option value="">Select Status</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
              </select>
              {inputError.maritalStatus && (
                <span className="text-red-500 text-sm">
                  {inputError.maritalStatus}
                </span>
              )}
            </div>

            {/* Designation */}
            <div>
              <label className="block mb-1 font-medium">Designation</label>
              <input
                type="text"
                name="designation"
                placeholder="Designation"
                value={employee.designation || ''}
                className="w-full border p-2 rounded"
                onChange={handleChange}
              />
              {inputError.designation && (
                <span className="text-red-500 text-sm">
                  {inputError.designation}
                </span>
              )}
            </div>

            {/* Department */}
            <div>
              <label className="block mb-1 font-medium">Department</label>
              <select
                name="departmentId"
                value={employee.departmentId || ''}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              >
                <option value="">Select Department</option>
                {department.map((dep) => (
                  <option key={dep._id} value={dep._id}>
                    {dep.dep_name}
                  </option>
                ))}
              </select>
              {inputError.department && (
                <span className="text-red-500 text-sm">
                  {inputError.department}
                </span>
              )}
            </div>

            {/* Salary */}
            <div>
              <label className="block mb-1 font-medium">Salary</label>
              <input
                type="number"
                name="salary"
                placeholder="Salary"
                value={employee.salary || ''}
                className="w-full border p-2 rounded"
                onChange={handleChange}
              />
              {inputError.salary && (
                <span className="text-red-500 text-sm">{inputError.salary}</span>
              )}
            </div>

            {/* Image Upload */}
            <div className="col-span-2 mt-3">
              <label className="block mb-1 font-medium">Profile Image</label>
              {previewImage && (
                <img
                  src={previewImage}
                  alt="Profile Preview"
                  className="w-28 h-28 object-cover rounded-full border mb-2"
                />
              )}
              <input
                type="file"
                name="image"
                className="w-full border p-2 rounded"
                accept="image/*"
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Edit;
