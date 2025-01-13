import logo from "./logo.svg";
import "./App.css";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import { UserPlus, LogIn } from "react-feather";

function App() {
  return (
    <div className="">
      <Router>
        <Routes>
         
          <Route
            path="/"
            element={
              <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 space-y-8">
                  <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-gray-900">
                      Bienvenue sur l'application
                    </h1>
                    <p className="text-gray-600">
                      Rejoignez notre communauté pour accéder à toutes les
                      fonctionnalités
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <Link
                      to="/register"
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <UserPlus className="h-5 w-5" />
                      Créer un compte
                    </Link>

                    <Link
                      to="/login"
                      className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <LogIn className="h-5 w-5" />
                      Se connecter
                    </Link>
                  </div>

                  <div className="text-center text-sm text-gray-500">
                    En vous inscrivant, vous acceptez nos conditions
                    d'utilisation et notre politique de confidentialité
                  </div>
                </div>
              </div>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
