import React, { useState } from "react";
import { KeyRound, EyeOff, Eye, CheckCircle, Mail } from "lucide-react";
import api from "../utils/api";

const ResetPasswordPage = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [passwords, setPasswords] = useState({
    email: "",
    current: "",
    new: "",
    confirm: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const passwordRequirements = [
    { text: "8 caractères minimum", met: passwords.new.length >= 8 },
    { text: "Une lettre majuscule", met: /[A-Z]/.test(passwords.new) },
    { text: "Une lettre minuscule", met: /[a-z]/.test(passwords.new) },
    { text: "Un chiffre", met: /[0-9]/.test(passwords.new) },
    { text: "Un caractère spécial", met: /[!@#$%^&*]/.test(passwords.new) },
  ];

  const canSubmit =
    passwords.new &&
    passwords.confirm &&
    passwords.new === passwords.confirm &&
    passwordRequirements.every((req) => req.met);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!passwords.current || !passwords.new || !passwords.confirm) {
      setError("Tous les champs doivent être remplis.");
      setLoading(false);
      return;
    }

    if (passwords.new !== passwords.confirm) {
      setError("Les mots de passe ne correspondent pas.");
      setLoading(false);
      return;
    }

    try {
      const response = await api.post("/password/reset", {
        email: email,
        current_password: passwords.current,
        new_password: passwords.new,
        new_password_confirmation: passwords.confirm,
      });
      console.log(response);
      setIsSubmitted(true);
    } catch (error) {
      console.error("Erreur :", error);
      setError(
        error.response?.data?.message ||
          "Une erreur est survenue. Veuillez réessayer."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <KeyRound className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Changer votre mot de passe
          </h1>
          <p className="text-gray-600">
            Créez un nouveau mot de passe sécurisé pour votre compte
          </p>
        </div>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse e-mail
              </label>
              <div className="relative">
                <input
                  type="email"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors pl-12"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemple@email.com"
                  required
                />
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe actuel
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? "text" : "password"}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors pr-12"
                  value={passwords.current}
                  onChange={(e) =>
                    setPasswords({ ...passwords, current: e.target.value })
                  }
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("current")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.current ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? "text" : "password"}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors pr-12"
                  value={passwords.new}
                  onChange={(e) =>
                    setPasswords((prev) => ({ ...prev, new: e.target.value }))
                  }
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("new")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmer le nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors pr-12"
                  value={passwords.confirm}
                  onChange={(e) =>
                    setPasswords((prev) => ({
                      ...prev,
                      confirm: e.target.value,
                    }))
                  }
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("confirm")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.confirm ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Exigences du mot de passe
              </h3>
              <ul className="space-y-2">
                {passwordRequirements.map((req, index) => (
                  <li
                    key={index}
                    className={`text-sm flex items-center gap-2 ${
                      req.met ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    <CheckCircle
                      size={16}
                      className={req.met ? "opacity-100" : "opacity-40"}
                    />
                    {req.text}
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="submit"
              disabled={!canSubmit || loading}
              className={`w-full py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 font-medium ${
                canSubmit && !loading
                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {loading ? "Chargement..." : "Changer le mot de passe"}
            </button>
          </form>
        ) : (
          <div className="text-center space-y-4">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Mot de passe modifié avec succès
            </h2>
            <p className="text-gray-600">
              Vous avez changé votre mot de passe avec succès.
            </p>
            <div className="mt-6 text-center">
              <a
                href="/login"
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                Retour à la connexion
              </a>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 text-center text-red-500 text-sm">
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
