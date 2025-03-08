import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Camera,
  Upload,
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Lock,
} from "lucide-react";
import api from "../utils/api";

const AjouterLesPersonnels = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role_id: "employer",
    phone: "",
    address: "",
    password: "",
    photo: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg"];
      const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error("Type de fichier non supporté. Utilisez JPEG, PNG ou JPG.");
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error("La taille du fichier ne doit pas dépasser 5MB.");
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setFormData((prevState) => ({
          ...prevState,
          photo: reader.result,
        }));
      };
      reader.onerror = (error) => {
        console.error("Erreur de lecture du fichier:", error);
        toast.error("Erreur lors du chargement de l'image.");
      };
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Le nom est requis";
    if (!formData.email.trim()) newErrors.email = "L'email est requis";
    if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Format d'email invalide";
    if (!formData.password) newErrors.password = "Le mot de passe est requis";
    if (formData.password.length < 6)
      newErrors.password =
        "Le mot de passe doit contenir au moins 6 caractères";
    if (!formData.phone.trim()) newErrors.phone = "Le téléphone est requis";
    if (!formData.address.trim()) newErrors.address = "L'adresse est requise";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) {
      toast.error("Veuillez corriger les erreurs dans le formulaire");
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post("/profile/ajouterProfile", formData);

      if (response.status === 200) {
        toast.success("Profile ajouté avec succès!");

        setFormData({
          name: "",
          email: "",
          role_id: "",
          phone: "",
          address: "",
          password: "",
          photo: "",
        });
      }
      navigate("/dashboard/liste-personnels");
    } catch (error) {
      console.error("Erreur:", error);
      if (error.response?.status === 422) {
        toast.error("Données invalides. Vérifiez les informations saisies.");
        if (error.response?.data?.errors) {
          setErrors(error.response.data.errors);
        }
      } else {
        toast.error(
          "Une erreur est survenue: " +
            (error.response?.data?.message ||
              error.message ||
              "Erreur inconnue")
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={5000} />
      <div className="flex min-h-screen">
        <div className="hidden lg:flex lg:w-1/3 bg-gradient-to-br from-violet-600 to-indigo-800 p-12 flex-col justify-between">
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="w-48 h-48 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center overflow-hidden border-4 border-white/30">
                {formData.photo ? (
                  <img
                    src={formData.photo}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Camera className="w-16 h-16 text-white/70" />
                )}
              </div>
              <label
                htmlFor="photo"
                className="absolute bottom-2 right-2 bg-white rounded-full p-3 cursor-pointer shadow-lg hover:bg-gray-50 transition-all group-hover:scale-110"
              >
                <Upload className="w-5 h-5 text-indigo-600" />
                <input
                  type="file"
                  id="photo"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                  disabled={isLoading}
                />
              </label>
            </div>
            <p className="text-white/70 mt-4 text-center">
              Ajoutez une photo de profil
            </p>
          </div>
        </div>

        <div className="flex-1 px-4 lg:px-12 py-8 overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 text-center">
                Ajouter les personnels
              </h2>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name Field */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <User className="w-4 h-4 mr-2 text-indigo-600" />
                    Nom
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className={`w-full px-4 py-3 border ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow`}
                    placeholder="Entrez votre nom"
                    disabled={isLoading}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <Mail className="w-4 h-4 mr-2 text-indigo-600" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className={`w-full px-4 py-3 border ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow`}
                    placeholder="employe@example.com"
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <Phone className="w-4 h-4 mr-2 text-indigo-600" />
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    className={`w-full px-4 py-3 border ${
                      errors.phone ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow`}
                    placeholder="123456789"
                    disabled={isLoading}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <Building2 className="w-4 h-4 mr-2 text-indigo-600" />
                    Rôle
                  </label>
                  <select
                    value={formData.role_id}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        role_id: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow bg-white"
                    disabled={isLoading}
                  >
                    <option value="employeur">Employeur</option>
                    <option value="employer">Employer</option>
                    <option value="manager">Manager</option>
                    <option value="stagiaire">Stagiaire</option>
                  </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <MapPin className="w-4 h-4 mr-2 text-indigo-600" />
                    Adresse
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    className={`w-full px-4 py-3 border ${
                      errors.address ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow`}
                    placeholder="123 Rue Exemple"
                    disabled={isLoading}
                  />
                  {errors.address && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.address}
                    </p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <Lock className="w-4 h-4 mr-2 text-indigo-600" />
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    className={`w-full px-4 py-3 border ${
                      errors.password ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow`}
                    placeholder="••••••••"
                    disabled={isLoading}
                  />
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full ${
                    isLoading
                      ? "bg-indigo-400"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  } text-white px-6 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors text-lg font-medium shadow-lg hover:shadow-xl flex justify-center`}
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Chargement...
                    </>
                  ) : (
                    "Ajouter les Personnels"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AjouterLesPersonnels;
