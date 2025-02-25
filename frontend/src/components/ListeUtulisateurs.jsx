import React, { useEffect, useState } from "react";
import api from "../utils/api";
import {
  User,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Save,
  Camera,
  FilePenLine,
  Trash2,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ListeUtilisateurs = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editedUser, setEditedUser] = useState({
    email: "",
    phone: "",
    name: "",
    profile: { address: "" },
  });
  const [uploading, setUploading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get("/user");
        setCurrentUser(response.data.user);
        console.log(response.data.user);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération de l'utilisateur courant :",
          error
        );
        setError("Erreur lors de la récupération de l'utilisateur courant.");
      }
    };

    fetchUser();
  }, []);
  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
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

    if (name === "address") {
      setEditedUser((prev) => ({
        ...prev,
        profile: { ...prev.profile, address: value },
      }));
    } else {
      setEditedUser((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result;
        const isAuthorized =
          currentUser?.role_id === "admin" ||
          selectedUser.id === currentUser?.id;

        if (!isAuthorized) {
          alert("Vous n'avez pas la permission de modifier ce profil.");
          return;
        }

        try {
          setUploading(true);
          const response = await api.put(
            `profile/${selectedUser.id}/update`,
            { photo: base64Image },
            { headers: { "Content-Type": "application/json" } }
          );

          if (response.data.success) {
            setUsers(
              users.map((user) =>
                user.id === selectedUser.id
                  ? {
                      ...user,
                      profile: { ...user.profile, photo: base64Image },
                    }
                  : user
              )
            );
          }
        } catch (err) {
          console.error("Erreur lors de la mise à jour de la photo :", err);
          setError("Erreur lors de la mise à jour de la photo.");
        } finally {
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const validateEmail = (email) => {
    if (!email) return true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const saveChanges = async () => {
    const isAuthorized =
      currentUser?.role_id === "admin" || selectedUser.id === currentUser?.id;

    if (!isAuthorized) {
      alert("Vous n'avez pas la permission de modifier ce profil.");
      return;
    }

    if (editedUser.email && !validateEmail(editedUser.email)) {
      setError("Email invalide");
      return;
    }

    const updatedFields = {};
    if (editedUser.email) updatedFields.email = editedUser.email.trim();
    if (editedUser.phone) updatedFields.phone = editedUser.phone.trim();
    if (editedUser.name) updatedFields.name = editedUser.name.trim();
    if (editedUser.profile?.address)
      updatedFields.address = editedUser.profile.address.trim();

    if (Object.keys(updatedFields).length === 0) {
      setError("Aucune modification détectée.");
      return;
    }

    try {
      const response = await api.put(
        `profile/${selectedUser.id}/update`,
        updatedFields,
        {
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      alert("Informations mises à jour avec succès !");
      window.location.reload();

      if (response.data.success) {
        const updatedUser = { ...selectedUser, ...updatedFields };
        setUsers(
          users.map((user) =>
            user.id === selectedUser.id ? updatedUser : user
          )
        );
        setSelectedUser(updatedUser);
        setEditedUser({
          email: "",
          phone: "",
          name: "",
          profile: { address: "" },
        });
      } else {
        setError(response.data.message || "Erreur de mise à jour");
      }
    } catch (error) {
      const errorMessages = error.response?.data?.errors;
      const firstError = errorMessages
        ? Object.values(errorMessages)[0]?.[0]
        : "Erreur de mise à jour";
      setError(firstError);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-indigo-500 font-semibold">Chargement...</div>
      </div>
    );
  }

  const handleDelete = async () => {
    if (!selectedUser.id) {
      alert("ID utilisateur manquant");
      return;
    }
    if (
      window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")
    ) {
      try {
        const response = await api.delete(`/profile/${selectedUser.id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.status === 200) {
          const data = response.data;

          if (data.status === "success") {
            alert("Utilisateur supprimé avec succès");
            window.location.reload();
          } else {
            throw new Error("La suppression a échoué, statut inattendu.");
          }
        } else {
          throw new Error("La suppression a échoué, statut HTTP incorrect.");
        }
      } catch (error) {
        console.error("Erreur lors de la suppression de l'utilisateur", error);
        alert(
          `Une erreur est survenue lors de la suppression. Détails : ${error.message}`
        );
      }
    }
  };

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
          <div className="">
            <button
              onClick={saveChanges}
              className="absolute top-4 right-14 flex items-center  px-2 py-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors duration-200"
            >
              <FilePenLine className="h-5 w-5 " />
            </button>
            <button
              onClick={handleDelete}
              className="absolute top-4 right-4 flex items-center px-2 py-2 bg-red-500 backdrop-blur-md rounded-full text-white hover:bg-green-600 transition-colors duration-200 "
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="relative px-8 pb-8">
          <div className="flex flex-col items-center -mt-20">
            <div className="relative">
              <img
                src={selectedUser.profile?.photo || "/default-avatar.png"}
                alt="Profile"
                className="h-32 w-32 rounded-full border-4 border-white shadow-lg object-contain"
              />
              <label
                htmlFor="photo-upload"
                className="absolute bottom-0 right-0 bg-white text-black p-2 rounded-full cursor-pointer shadow-md"
              >
                <Camera size={18} />
              </label>
            </div>
            <div className="mt-4 text-center">
              <h2 className="text-2xl font-bold">{selectedUser.name}</h2>
              <p className="mt-1 text-lg text-indigo-600">
                {selectedUser.role_id}
              </p>
            </div>
          </div>
          <input
            id="photo-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />

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
                  value={editedUser.email || selectedUser.email || ""}
                  onChange={handleEditChange}
                  className="w-full text-gray-600 border border-gray-300 rounded-md p-2"
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
                  value={editedUser.phone || selectedUser.phone || ""}
                  onChange={handleEditChange}
                  className="w-full text-gray-600 border border-gray-300 rounded-md p-2"
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
                  value={editedUser.name || selectedUser.name || ""}
                  onChange={handleEditChange}
                  className="w-full text-gray-600 border border-gray-300 rounded-md p-2"
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
                    editedUser.profile?.address ||
                    selectedUser.profile?.address ||
                    ""
                  }
                  onChange={handleEditChange}
                  className="w-full text-gray-600 border border-gray-300 rounded-md p-2"
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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Gestion des personnels
        </h2>
        <input
          type="text"
          placeholder="Rechercher un utilisateur..."
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
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
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedUser(user)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        {user?.profile?.photo ? (
                          <img
                            src={user.profile.photo}
                            alt="Profile"
                            className="w-10 h-10 rounded-full object-contain bg-white"
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
