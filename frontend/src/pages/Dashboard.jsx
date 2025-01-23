import React, { useEffect, useState } from "react";
import { Menu, User, Home, LogOut, Settings, ChevronDown } from "lucide-react";
import { Outlet } from "react-router-dom";
import api from "../utils/api";

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await api.get("/user");
        console.log(response);
        const data = response.data;
        console.log(data);
        console.log(data.user.name);

        if (data.success) {
          setUser(data.user || []);
        } else {
          setError(
            data.message || "Impossible de récupérer les données utilisateurs."
          );
        }
      } catch (error) {
        setError(
          "Une erreur s'est produite lors de la récupération des données."
        );
        console.error("Erreur de fetch:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  console.log(user.name);
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside
        className={`${
          isSidebarOpen ? "w-64" : "w-16"
        } bg-gray-100  text-white h-screen flex flex-col justify-between transition-all duration-300 fixed top-0 left-0 z-40`}
      >
        <div className="flex flex-col space-y-8 mt-20">
          <a
            href="#"
            className="flex items-center justify-center space-x-3 p-3  "
          >
            <Home size={20} color="gray" />
            {isSidebarOpen && (
              <span className="text-black">Tableau de bord</span>
            )}
          </a>
          {/* <a
            href="#"
            className="flex items-center justify-center space-x-3 p-3 "
          >
            <User size={20} color="gray" />
            {isSidebarOpen && <span className="text-black">Profil</span>}
          </a> */}
          {/* <a
            href="#"
            className="flex items-center justify-center space-x-3 p-3"
          >
            <Settings size={20} color="gray" />
            {isSidebarOpen && <span className="text-black">Paramètres</span>}
          </a> */}
        </div>

        {/* <div className="p-4">
          <a
            href="#"
            className="flex items-center justify-center space-x-3 p-3 hover:bg-red-600 rounded-lg"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span>Se déconnecter</span>}
          </a>
        </div> */}
      </aside>

      <div
        className={`flex-grow flex flex-col transition-all duration-300 ${
          isSidebarOpen ? "ml-64" : "ml-16"
        }`}
      >
        {/* Header */}
        <header className="bg-white shadow-sm fixed w-full top-0 left-0 z-50">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={toggleSidebar}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              <Menu size={24} className="text-gray-600" />
            </button>

            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                  {user?.profile?.photo ? (
                    <img
                      src={user.profile.photo}
                      alt="Profile"
                      className="w-12 h-12 rounded-full object-cover bg-white"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                      <User size={24} className="text-white" />
                    </div>
                  )}
                </div>
                <ChevronDown size={20} className="text-gray-600" />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg py-3 z-50">
                  <div className="px-4 pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
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
                      <div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {user?.name}
                          </p>
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="pt-2">
                    <button className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 w-full">
                      <Settings size={18} />
                      <span>Paramètres</span>
                    </button>
                    <button className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-gray-100 w-full">
                      <LogOut size={18} />
                      <span>Se déconnecter</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {isDropdownOpen && (
          <div
            className="fixed inset-0  bg-opacity-50 z-30"
            onClick={toggleDropdown}
          ></div>
        )}

        <main className="flex-grow p-4 mt-16">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
