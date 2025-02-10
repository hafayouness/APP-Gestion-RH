import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { Mail, MapPin, Phone, User } from "lucide-react";

const ProfileUser = () => {
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get("/user");
        setUser(response.data.user);
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

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden mt-10">
      {/* Header */}
      <div className="relative h-48 bg-gradient-to-r from-indigo-500 to-purple-600">
        <div className="flex  items-center gap-10 -mt-15">
          <div className="mt-5 ml-10">
            <img
              src={user.profile.photo}
              alt="Profile"
              className="h-32 w-32 rounded-full border-4 border-white shadow-lg object-contain"
            />
            {/* <div className="absolute bottom-0 right-0 bg-white text-black p-2 rounded-full shadow-md">
              <Camera size={18} />
            </div> */}
          </div>
          <div className="mt-4 text-center">
            <h2 className="text-2xl font-bold text-white">{user.name}</h2>
            <p className="mt-1 text-lg text-gray-300 font-medium">
              {user.role_id}
            </p>
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="relative px-8 pb-8">
        {/* User Information */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <div className="flex items-center text-gray-700 mb-2">
                <Mail className="h-5 w-5 mr-2" />
                <span className="font-medium">Email</span>
              </div>
              <p className="text-gray-600">{user.email}</p>
            </div>
            <div>
              <div className="flex items-center text-gray-700 mb-2">
                <Phone className="h-5 w-5 mr-2" />
                <span className="font-medium">Téléphone</span>
              </div>
              <p className="text-gray-600">{user.phone}</p>
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex items-center text-gray-700 mb-2">
                <User className="h-5 w-5 mr-2" />
                <span className="font-medium">Nom</span>
              </div>
              <p className="text-gray-600">{user.name}</p>
            </div>
            <div>
              <div className="flex items-center text-gray-700 mb-2">
                <MapPin className="h-5 w-5 mr-2" />
                <span className="font-medium">Adresse</span>
              </div>
              <p className="text-gray-600">{user.profile.address}.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileUser;
