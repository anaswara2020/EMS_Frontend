import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../services/api';
import Swal from 'sweetalert2';

const EditDepartment = () => {
  const { id } = useParams();
  const [department, setDepartment] = useState({ dep_name: '', description: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 🔹 Fetch department data on load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.get(`/department/${id}`, {
          headers: {
            authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (res.data.success) {
          setDepartment({
            dep_name: res.data.data.dep_name,
            description: res.data.data.description,
          });
        }
      } catch (error) {
        setError(
          error.response?.data.message ||
            'Something went wrong. Please try again.'
        );
      }
    };

    fetchData();
  }, [id]);

  // 🔹 Handle input changes
  const handleChange = (e) => {
    setDepartment({ ...department, [e.target.id]: e.target.value });
  };

  // 🔹 Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!department.dep_name.trim() || !department.description.trim()) {
      setError('Please fill all fields');
      return;
    }

    // Confirm update
    const confirmResult = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to update this department?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#14b8a6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Update',
      cancelButtonText: 'No, Go Back',
    });

    //  If user clicks "Cancel", go back
    if (!confirmResult.isConfirmed) {
      Swal.fire({
        icon: 'info',
        title: 'Cancelled',
        text: 'No changes were made.',
        showConfirmButton: false,
        timer: 1200,
      }).then(() => navigate(-1)); // Go back
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await API.put(`/department/${id}`, department, {
        headers: { authorization: `Bearer ${token}` },
      });

      setDepartment({ dep_name: '', description: '' });
      setError('');

      Swal.fire({
        icon: 'success',
        title: 'Department updated successfully!',
        showConfirmButton: false,
        timer: 1500,
      }).then(() => navigate('/admin-dashboard/departments'));
    } catch (error) {
      setError(
        error.response?.data.message ||
          'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white mx-auto p-8 w-full max-w-xl rounded shadow-md">
        <h3 className="text-center text-2xl font-bold mb-6">Edit Department</h3>

        {error && (
          <div className="mb-4 text-red-600 bg-red-100 border border-red-300 rounded px-3 py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1">
            <label htmlFor="dep_name">Department Name</label>
            <input
              type="text"
              id="dep_name"
              placeholder="Enter Department"
              value={department.dep_name}
              className="p-2 border border-gray-300 rounded"
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col mt-5 gap-2">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={department.description}
              placeholder="Description"
              className="p-5 border border-gray-300 rounded"
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="flex justify-between items-center mt-6 gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-1/2 bg-gray-400 text-white rounded p-3 hover:bg-gray-500 transition"
            >
              Back
            </button>

            <button
              type="submit"
              disabled={loading}
              className={`w-1/2 rounded p-3 text-white transition ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700'
              }`}
            >
              {loading ? 'Updating...' : 'Update Department'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDepartment;
