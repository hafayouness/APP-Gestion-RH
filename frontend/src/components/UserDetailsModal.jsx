import React from "react";
import { X } from "lucide-react"; // Icon to close the modal

const UserDetailsModal = ({ user, onClose }) => {
  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white w-full max-w-md rounded-lg shadow-lg">
        {/* Modal header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">User Details</h2>
          <button
            className="p-2 hover:bg-gray-100 rounded-full"
            onClick={onClose}
            aria-label="Close Modal"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex items-center space-x-4">
            {/* User profile photo */}
            <img
              src={user.profile.photo || "https://via.placeholder.com/150"}
              alt="User's profile"
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <p className="text-lg font-bold">{user.name}</p>
              <p className="text-sm text-gray-500">{user.role_id}</p>
            </div>
          </div>

          <div className="space-y-2">
            <p>
              <span className="font-semibold">Email:</span> {user.email}
            </p>
            <p>
              <span className="font-semibold">Phone:</span> {user.phone}
            </p>
            <p>
              <span className="font-semibold">Address:</span>{" "}
              {user.profile.address}
            </p>
            <p>
              <span className="font-semibold">Status:</span> {user.status}
            </p>
            <p>
              <span className="font-semibold">Created At:</span>{" "}
              {new Date(user.created_at).toLocaleString()}
            </p>
            <p>
              <span className="font-semibold">Last Updated:</span>{" "}
              {new Date(user.updated_at).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Modal footer */}
        <div className="p-4 bg-gray-50 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;
