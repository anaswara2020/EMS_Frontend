// import React from 'react'
// import { FaUser } from 'react-icons/fa'
// import {useAuth} from '../../context/AuthContext'

// const SummeryCard = () => {
//     const {user}=useAuth()
//   return (
//     <div className='flex  bg-white h-16 p-2 m-3'>
//       <div className={`text-2xl bg-teal-500 p-4`}>
//          <FaUser/>
//       </div>
//       <div className='ml-6'>
//         <p className='text-lg font-semibold'>Wellcome back </p>
//         <p className='text-xl font-bold'>{user.name}</p>
//       </div>
//     </div>
//   )
// }

// export default SummeryCard
import React, { useMemo } from "react";
import { FaUser } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const SummeryCard = () => {
  const { user } = useAuth();

  // Time-based greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  }, []);

  // Safely pluck user info
  const name = user?.name || user?.user?.name || "Employee";
  const role = (user?.role || user?.user?.role || "").toString();
  const employeeId =
    user?.employeeId ||
    user?.employee?.employeeId ||
    user?.profile?.employeeId ||
    "";
  const department =
    user?.department?.dep_name ||
    user?.employee?.department?.dep_name ||
    user?.profile?.department?.dep_name ||
    "";

  // Image handling
  const API_BASE =
    import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
    "http://localhost:8000";
  const UPLOADS_BASE = `${API_BASE}/uploads`;
  const resolveImage = (raw) => {
    if (!raw) return `${UPLOADS_BASE}/placeholder.png`;

    const img = String(raw).trim();
    if (img.startsWith("http://") || img.startsWith("https://")) return img;
    if (img.startsWith("/uploads/")) return `${API_BASE}${img}`;
    if (img.startsWith("uploads/")) return `${API_BASE}/${img}`;
    if (img.includes("public/uploads/"))
      return `${API_BASE}/${img.replace("public/", "")}`;
    return `${UPLOADS_BASE}/${img}`;
  };

  const profileImage = resolveImage(
    user?.profileImage ||
      user?.user?.profileImage ||
      user?.employee?.userId?.profileImage ||
      ""
  );

  // Initials fallback
  const initials = useMemo(() => {
    const parts = name.split(" ").filter(Boolean);
    if (!parts.length) return "U";
    return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
  }, [name]);

  return (
    <div className="flex justify-center items-center min-h-[85vh] bg-gradient-to-br from-teal-50 via-white to-cyan-50">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative w-full max-w-3xl rounded-3xl bg-white shadow-lg ring-1 ring-gray-100 overflow-hidden"
      >
        {/* Gradient top border */}
        <div className="h-2 bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500" />

        <div className="p-6 md:p-10 text-center flex flex-col items-center">
          {/* Avatar */}
          <div className="relative mb-4">
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="h-28 w-28 md:h-32 md:w-32 rounded-full object-cover shadow-md ring-4 ring-teal-200"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = `${UPLOADS_BASE}/placeholder.png`;
                }}
              />
            ) : (
              <div className="h-28 w-28 md:h-32 md:w-32 rounded-full bg-teal-600 text-white flex items-center justify-center text-3xl font-semibold ring-4 ring-teal-200 shadow-md">
                {initials || <FaUser />}
              </div>
            )}
            <div className="absolute -bottom-1 right-2 bg-teal-500 text-white p-2 rounded-full shadow-lg">
              <FaUser />
            </div>
          </div>

          {/* Greeting and Name */}
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-800 text-3xl md:text-4xl font-bold tracking-tight"
          >
            {greeting}, {name.split(" ")[0]}
          </motion.h2>
          <p className="text-gray-600 mt-2 text-lg">
            Welcome back to your dashboard
          </p>

          {/* Details Row */}
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-gray-700 text-sm md:text-base">
            {employeeId && (
              <div className="bg-teal-50 border border-teal-100 px-4 py-2 rounded-lg shadow-sm">
                <span className="font-semibold text-teal-700">
                  Employee ID:
                </span>{" "}
                {employeeId}
              </div>
            )}
            {department && (
              <div className="bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-lg shadow-sm">
                <span className="font-semibold text-emerald-700">
                  Department:
                </span>{" "}
                {department}
              </div>
            )}
            {role && (
              <div className="bg-cyan-50 border border-cyan-100 px-4 py-2 rounded-lg shadow-sm">
                <span className="font-semibold text-cyan-700">Role:</span>{" "}
                {role}
              </div>
            )}
          </div>

          {/* Optional Buttons */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/employee-dashboard/user"
              className="px-5 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition"
            >
              View Profile
            </Link>
            <Link
              to="/employee-dashboard/leave"
              className="px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium transition"
            >
              Apply Leave
            </Link>
            {/* <Link
              to="/employee/payslips"
              className="px-5 py-2 rounded-lg bg-white border border-teal-200 text-teal-700 hover:bg-teal-50 font-medium transition"
            >
              Payslips
            </Link> */}
          </div>
        </div>

        {/* Bottom Accent */}
        <div className="h-2 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500" />
      </motion.div>
    </div>
  );
};

export default SummeryCard;
