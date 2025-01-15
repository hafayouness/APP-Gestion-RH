import React, { useState } from "react";
import { KeyRound, ArrowRight, Shield } from "lucide-react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";

const ForgetPawssord = () => {
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    setLoading(true);
    setError("");
    try {
      const response = await api.post("/password/email", { email });
      console.log("response", response);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Une erreur est survenue.");
      }
      setIsSubmitted(true);
    } catch (error) {
      setError(error.message);
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
            Réinitialisation du mot de passe
          </h1>
          <p className="text-gray-600">
            Entrez votre adresse e-mail pour recevoir un lien de
            réinitialisation
          </p>
        </div>

        {!isSubmitted ? (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Adresse e-mail
              </label>
              <input
                type="email"
                id="email"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="exemple@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className={`w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center justify-center gap-2 font-medium ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              {loading ? "Envoi en cours..." : "Réinitialiser le mot de passe"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        ) : (
          <div className="text-center space-y-4">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              E-mail envoyé !
            </h2>
            <p className="text-gray-600">
              Si un compte existe avec l'adresse {email} , vous recevrez un
              e-mail avec les instructions pour réinitialiser votre mot de
              passe.
            </p>
            <button
              onClick={() => setIsSubmitted(false)}
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Retour
            </button>
          </div>
        )}

        <div className="mt-6 text-center">
          <a
            href="/login"
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            Retour à la connexion
          </a>
        </div>
      </div>
    </div>
  );
};

export default ForgetPawssord;
