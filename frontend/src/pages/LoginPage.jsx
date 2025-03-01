import { LogIn, Mail, Lock } from "lucide-react";
import React, { useState } from "react";
import api from "../utils/api";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setCredentials } from "../store/features/auth/authSlice";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      // [name]: value,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors("");
  };
  console.log("formData", formData);
  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Veuillez entrer une adresse email valide";
    }
    if (formData.password.length < 8) {
      newErrors.password =
        "Le mot de passe doit contenir au moins 8 caractères";
    }
    if (!formData.rememberMe) {
      newErrors.rememberMe =
        "Vous devez accepter les termes avant de vous connecter.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) {
      toast.error("Veuillez corriger les erreurs du formulaire.");
      return;
    }

    setIsSubmitting(true);
    setErrors("");

    try {
      const response = await api.post("/login", formData);
      dispatch(
        setCredentials({ user: response.data.user, token: response.data.token })
      );
      setSubmitSuccess(true);
      toast.success("Connexion réussie ! Redirection en cours...");
      navigate("/dashboard");
      setFormData({ email: "", password: "", rememberMe: false });
    } catch (error) {
      console.error("Erreur lors de connexion:", error);
      if (error.response?.status === 401) {
        setErrors({ submit: "Adresse email ou mot de passe incorrect." });
        toast.error("Adresse email ou mot de passe incorrect.");
      } else if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        toast.error("Erreur lors de la connexion. Vérifiez vos informations.");
      } else {
        setErrors({
          submit:
            error.response?.data?.message ||
            "Une erreur est survenue lors de la connexion.",
        });
        toast.error("Une erreur est survenue lors de la connexion.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <ToastContainer />
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <LogIn className="h-12 w-12 text-indigo-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Connexion à votre compte
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 ">
          Ou
          <a
            href="/register"
            className="font-medium text-indigo-600 hover:text-indigo-500 ml-2"
          >
            créez un nouveau compte
          </a>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Adresse e-mail
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block py-2 w-full pl-10 sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="vous@exemple.com"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Mot de passe
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="block py-2 w-full pl-10 sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Se souvenir de moi
                </label>
              </div>

              <div className="text-sm">
                <a
                  href="/forget-password"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Mot de passe oublié ?
                </a>
              </div>
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
                    connexion en cours...
                  </span>
                ) : (
                  "Se connecter"
                )}
              </button>
            </div>
          </form>

          <div className="p-4">
            {submitSuccess && (
              <div className="bg-green-100 border-l-4 border-green-500 text-green-800 p-4">
                <strong className="font-bold">Succès : </strong>
                connexion réussie ! Vous allez être redirigé...
              </div>
            )}

            {errors.submit && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-800 p-4 mt-2">
                <strong className="font-bold">Erreur : </strong>
                {errors.submit}
              </div>
            )}
            {errors.rememberMe && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-800 p-4 mt-2">
                <strong className="font-bold">Erreur : </strong>
                {errors.rememberMe}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
