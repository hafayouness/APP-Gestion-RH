import React, { useEffect, useState } from "react";
import api from "../utils/api";
import {
  User,
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Calendar,
  MapPin,
  Save,
} from "lucide-react";

import { Link } from "react-router-dom";

const ListeUtilisateurs = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null); // État pour l'utilisateur sélectionné
  const [editedUser, setEditedUser] = useState(null); // État pour l'utilisateur en cours de modification

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get("/users");
        const data = response.data;

        if (data.success) {
          setUsers(data.users || []);
        } else {
          setError(
            data.message || "Impossible de récupérer les données utilisateurs."
          );
        }
      } catch (error) {
        setError(
          "Une erreur s'est produite lors de la récupération des données."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedUser({ ...editedUser, [name]: value });
  };

  const saveChanges = async () => {
    try {
      const response = await api.put(`/users/${selectedUser.id}`, editedUser);
      if (response.data.success) {
        setUsers(
          users.map((user) => (user.id === selectedUser.id ? editedUser : user))
        );
        setSelectedUser(editedUser);
        setEditedUser(null);
      } else {
        setError("Erreur lors de la mise à jour des informations.");
      }
    } catch (error) {
      setError("Une erreur s'est produite lors de la mise à jour.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-indigo-500 font-semibold">Chargement...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (selectedUser) {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="relative h-48 bg-gradient-to-r from-indigo-500 to-purple-600">
          <button
            onClick={() => setSelectedUser(null)}
            className="absolute top-4 left-4 flex items-center px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Retour
          </button>
          <div className="mt-6 flex justify-end">
            <button
              onClick={saveChanges}
              className="absolute top-4 right-4 flex items-center px-4 py-2 bg-green-500 backdrop-blur-md rounded-full text-white hover:bg-green-600 transition-colors duration-200"
            >
              <Save className="h-5 w-5 mr-2" />
              Sauvegarder
            </button>
          </div>
        </div>

        <div className="relative px-8 pb-8">
          <div className="flex flex-col items-center -mt-20">
            <img
              src={selectedUser.profile?.photo || "/default-avatar.png"}
              alt=""
              className="h-32 w-32 rounded-full border-4 border-white shadow-lg object-cover"
            />
            <div className="mt-4 text-center">
              <h2 className="text-2xl font-bold">{selectedUser.name}</h2>
              <p className="mt-1 text-lg text-indigo-600">
                {selectedUser.role_id}
              </p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <div className="flex items-center text-gray-700 mb-2">
                  <Mail className="h-5 w-5 mr-2" />
                  <span className="font-medium">Email</span>
                </div>
                <input
                  type="email"
                  name="email"
                  value={editedUser?.email || selectedUser.email}
                  onChange={handleEditChange}
                  className="text-gray-600 border border-gray-300 rounded-md p-2"
                />
              </div>
              <div>
                <div className="flex items-center text-gray-700 mb-2">
                  <Phone className="h-5 w-5 mr-2" />
                  <span className="font-medium">Téléphone</span>
                </div>
                <input
                  type="text"
                  name="phone"
                  value={editedUser?.phone || selectedUser.phone}
                  onChange={handleEditChange}
                  className="text-gray-600 border border-gray-300 rounded-md p-2"
                />
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <div className="flex items-center text-gray-700 mb-2">
                  <User className="h-5 w-5 mr-2" />
                  <span className="font-medium">Nom</span>
                </div>
                <input
                  type="text"
                  name="name"
                  value={editedUser?.name || selectedUser.name}
                  onChange={handleEditChange}
                  className="text-gray-600 border border-gray-300 rounded-md p-2"
                />
              </div>
              <div>
                <div className="flex items-center text-gray-700 mb-2">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span className="font-medium">Adresse</span>
                </div>
                <input
                  type="text"
                  name="address"
                  value={
                    editedUser?.profile?.address ||
                    selectedUser.profile?.address
                  }
                  onChange={handleEditChange}
                  className="text-gray-600 border border-gray-300 rounded-md p-2"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rôle
                </th>
                <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date d'entrée
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedUser(user)} // Sélectionner un utilisateur
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        {user?.profile?.photo ? (
                          <img
                            src={user.profile.photo}
                            alt="Profile"
                            className="w-10 h-10 rounded-full object-cover bg-white"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                            <User size={24} className="text-white" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {user.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.email}</div>
                    <div className="text-sm text-gray-500">{user.phone}</div>
                  </td>
                  <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.role_id}
                  </td>
                  <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ListeUtilisateurs;
