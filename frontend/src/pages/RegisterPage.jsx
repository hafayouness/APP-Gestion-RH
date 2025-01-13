import React, { useState } from "react";
import { Upload, Eye, EyeOff } from "lucide-react";
import api from "../utils/api";

const RegisterPage = () => {
  const [imagePreview, setImagePreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role_id: "",
    phone: "",
    address: "",
    photo: null,
  });

  const validateForm = () => {
    const newErrors = {};
    if (formData.name.length < 2) {
      newErrors.name = "Le nom doit contenir au moins 2 caractères";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Veuillez entrer une adresse email valide";
    }
    if (formData.password.length < 8) {
      newErrors.password =
        "Le mot de passe doit contenir au moins 8 caractères";
    }

    if (!formData.role_id) {
      newErrors.role_id = "Veuillez sélectionner un rôle";
    }
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone = "Veuillez entrer un numéro de téléphone valide";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleChangeImage = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setImagePreview(base64String);
        setFormData((prev) => ({
          ...prev,
          photo: base64String,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post("/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role_id: formData.role_id,
        phone: formData.phone,
        address: formData.address,
        photo: formData.photo,
      });

      console.log("Réponse du serveur:", response.data);
      setSubmitSuccess(true);

      // Réinitialisation du formulaire
      setFormData({
        name: "",
        email: "",
        password: "",
        role_id: "",
        phone: "",
        address: "",
        photo: null,
      });
      setImagePreview(null);
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({
          submit:
            error.response?.data?.message ||
            "Une erreur est survenue lors de l'inscription.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 ">
      <div className="max-w-xl w-full space-y-8  ">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Cree un Compte
          </h2>
        </div>
        <div className="p-4">
          {submitSuccess && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-800 p-4">
              <strong className="font-bold">Succès : </strong>
              Inscription réussie ! Vous allez être redirigé...
            </div>
          )}

          {errors.submit && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-800 p-4 mt-2">
              <strong className="font-bold">Erreur : </strong>
              {errors.submit}
            </div>
          )}
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="flex flex-col items-center">
            <div className="relative w-32 h-32 group">
              <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-indigo-100">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Aperçu"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <Upload className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
              <label
                htmlFor="profile-image"
                className="absolute inset-0 w-full h-full rounded-full bg-black bg-opacity-40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <span className="text-sm">Changer la photo</span>
              </label>
              <input
                type="file"
                id="profile-image"
                accept="image/*"
                className="hidden"
                onChange={handleChangeImage}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Nom complet
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="mt-1  px-1 py-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                onChange={handleChange}
                value={formData.name}
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 px-1 py-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                onChange={handleChange}
                value={formData.email}
              />
            </div>

            <div className="relative">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  onChange={handleChange}
                  className="mt-1 py-1 px-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={formData.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            {/* Rôle */}
            <div>
              <label
                htmlFor="role"
                className="block  text-sm font-medium text-gray-700"
              >
                Rôle
              </label>
              <select
                id="role"
                name="role_id"
                className="mt-1 py-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 placeholder-slate-300"
                onChange={handleChange}
                value={formData.role_id}
              >
                <option value="">choisie un role</option>
                <option value="admin">Admin</option>
                <option value="emplyer">Employer</option>
                <option value="manager">Manager</option>
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700"
            >
              Téléphone
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              className="mt-1 py-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-1"
              onChange={handleChange}
              value={formData.phone}
            />
          </div>

          <div>
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700"
            >
              Adresse
            </label>
            <textarea
              id="address"
              name="address"
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              onChange={handleChange}
              value={formData.address}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                isSubmitting
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors`}
            >
              {isSubmitting ? (
                <span className="inline-flex items-center">
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
                  Inscription en cours...
                </span>
              ) : (
                "S'inscrire"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
