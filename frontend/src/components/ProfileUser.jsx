import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { Mail, MapPin, Phone, User } from "lucide-react";

const ProfileUser = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await api.get("/user");
        setUser(response.data.user);
        console.log(response.data.user);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération de l'utilisateur courant :",
          error
        );
        setError("Erreur lors de la récupération de l'utilisateur courant.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden mt-10">
      {loading ? (
        <div className="p-8 text-center">
          <p>Chargement du profil...</p>
        </div>
      ) : error || !user ? (
        <div className="p-8 text-center">
          <p className="text-red-500">
            {error || "Impossible de charger le profil utilisateur."}
          </p>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="relative h-48 bg-gradient-to-r from-indigo-500 to-purple-600">
            <div className="flex items-center justify-center gap-10 -mt-15">
              <div className="mt-5 ml-10 ">
                <img
                  src={
                    user.profile && user.profile.photo
                      ? user.profile.photo
                      : "/default-avatar.png"
                  }
                  alt="Profile"
                  className="h-32 w-32 rounded-full border-4 border-white shadow-lg object-cover"
                />
              </div>
              <div className="mt-4 text-center">
                <h2 className="text-2xl font-bold text-white">
                  {user.name || "Utilisateur"}
                </h2>
                <p className="mt-1 text-lg text-gray-300 font-medium">
                  {user.role_id || "Rôle non défini"}
                </p>
              </div>
            </div>
          </div>

          <div className="relative px-8 pb-8">
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center text-gray-700 mb-2">
                    <Mail className="h-5 w-5 mr-2" />
                    <span className="font-medium">Email</span>
                  </div>
                  <p className="text-gray-600">
                    {user.email || "Non spécifié"}
                  </p>
                </div>
                <div>
                  <div className="flex items-center text-gray-700 mb-2">
                    <Phone className="h-5 w-5 mr-2" />
                    <span className="font-medium">Téléphone</span>
                  </div>
                  <p className="text-gray-600">
                    {user.phone || "Non spécifié"}
                  </p>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center text-gray-700 mb-2">
                    <User className="h-5 w-5 mr-2" />
                    <span className="font-medium">Nom</span>
                  </div>
                  <p className="text-gray-600">{user.name || "Non spécifié"}</p>
                </div>
                <div>
                  <div className="flex items-center text-gray-700 mb-2">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span className="font-medium">Adresse</span>
                  </div>
                  <p className="text-gray-600">
                    {user.profile && user.profile.address
                      ? user.profile.address
                      : "Non spécifiée"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfileUser;
