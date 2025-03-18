import React, { useState, useEffect } from "react";

import {
  Clock,
  LogIn,
  LogOut,
  Coffee,
  Calendar,
  PieChart,
  User,
  Clock3,
  ChevronDown,
  AlertTriangle,
  Award,
  BarChart2,
  History,
} from "lucide-react";

import api from "../utils/api";

const PointagePersonels = () => {
  const [showPointageMenu, setShowPointageMenu] = useState(false);
  const [showTable, setShowTable] = useState(true);
  const [activeTab, setActiveTab] = useState("pointage");
  const [attendances, setAttendances] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [weeklyStats, setWeeklyStats] = useState(null);
  const [notification, setNotification] = useState(null);
  const [history, setHistory] = useState([]);
  const [showNotification, setShowNotification] = useState(true);
  const [currentStatus, setCurrentStatus] = useState({
    status: "Non pointé",
    since: null,
    color: "gray",
  });

  useEffect(() => {
    fetchUserData();

    fetchAttendances();

    fetchStats();

    checkCurrentStatus();

    fetchHistory();

    const interval = setInterval(() => {
      checkCurrentStatus();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await api.get("/user");
      setUser(response.data);
    } catch (err) {
      console.error("Erreur lors du chargement des données utilisateur", err);
    }
  };

  const fetchAttendances = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/attendance");
      setAttendances(Array.isArray(response.data) ? response.data : []);
      setIsLoading(false);
    } catch (err) {
      setError("Erreur lors du chargement des pointages");
      setIsLoading(false);
      console.error(err);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get("/attendance/stats");
      setWeeklyStats(response.data);
    } catch (err) {
      console.error("Erreur lors du chargement des statistiques", err);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await api.get("/attendance/history");
      setHistory(response.data.histories.data || []);
    } catch (err) {
      console.error("Erreur lors du chargement de l'historique", err);
    }
  };

  const checkCurrentStatus = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const todayAttendance = attendances.find(
        (att) => new Date(att.date).toISOString().split("T")[0] === today
      );

      if (!todayAttendance || !todayAttendance.check_in) {
        setCurrentStatus({
          status: "Non pointé",
          since: null,
          color: "gray",
        });
        return;
      }

      if (todayAttendance.check_out) {
        setCurrentStatus({
          status: "Journée terminée",
          since: new Date(todayAttendance.check_out),
          color: "blue",
        });
        return;
      }

      if (todayAttendance.pause_start && !todayAttendance.pause_end) {
        setCurrentStatus({
          status: "En pause",
          since: new Date(todayAttendance.pause_start),
          color: "orange",
        });
        return;
      }

      setCurrentStatus({
        status: "Au travail",
        since: new Date(todayAttendance.check_in),
        color: "green",
      });
    } catch (err) {
      console.error("Erreur lors de la vérification du statut", err);
    }
  };

  const handlePointage = async (type) => {
    setShowPointageMenu(false);
    setIsLoading(true);
    try {
      let response;

      switch (type) {
        case "entree":
          response = await api.post("/attendance/check-in");
          break;
        case "debutPause":
          response = await api.post("/attendance/start-pause");
          break;
        case "finPause":
          response = await api.post("/attendance/end-pause");
          break;
        case "sortie":
          response = await api.post("/attendance/check-out");
          break;
        default:
          throw new Error("Type de pointage non reconnu");
      }

      if (response.data.success) {
        setNotification({
          type: "success",
          message: response.data.message,
        });

        fetchAttendances();
        fetchStats();
        checkCurrentStatus();
        fetchHistory();
      } else {
        setNotification({
          type: "error",
          message: response.data.message,
        });
      }

      if (response.data.warning) {
        setNotification({
          type: "warning",
          message: response.data.warning,
        });
      } else if (response.data.status) {
        setNotification({
          type: "info",
          message: response.data.status,
        });
      }

      setIsLoading(false);
    } catch (err) {
      setNotification({
        type: "error",
        message: "Une erreur est survenue lors du pointage",
      });
      setIsLoading(false);
      console.error(err);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  const calculateDuration = (since) => {
    if (!since) return "";

    const now = new Date();
    const sinceDate = new Date(since);
    const diffMs = now - sinceDate;

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h${minutes < 10 ? "0" + minutes : minutes}`;
  };

  const renderNotification = () => {
    if (!notification) return null;

    const colors = {
      success: "bg-green-100 text-green-800 border-green-300",
      error: "bg-red-100 text-red-800 border-red-300",
      warning: "bg-yellow-100 text-yellow-800 border-yellow-300",
      info: "bg-blue-100 text-blue-800 border-blue-300",
    };

    const icons = {
      success: <Award className="w-5 h-5" />,
      error: <AlertTriangle className="w-5 h-5" />,
      warning: <AlertTriangle className="w-5 h-5" />,
      info: <Clock className="w-5 h-5" />,
    };

    return (
      <div
        className={`rounded-lg border p-4 mb-6 flex items-start  gap-3 ${
          colors[notification.type]
        }`}
      >
        <div className="flex-shrink-0">{icons[notification.type]}</div>
        <div className="">
          <p className="font-medium">{notification.message}</p>
          <button
            onClick={() => setNotification(null)}
            className="text-sm underline mt-1"
          >
            Fermer
          </button>
        </div>
      </div>
    );
  };

  const renderTabs = () => (
    <div className="flex border-b border-gray-200 mb-6">
      <button
        onClick={() => setActiveTab("pointage")}
        className={`py-3 px-6 font-medium text-sm ${
          activeTab === "pointage"
            ? "border-b-2 border-blue-600 text-blue-600"
            : "text-gray-600 hover:text-gray-800"
        }`}
      >
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>Pointage</span>
        </div>
      </button>
      <button
        onClick={() => setActiveTab("stats")}
        className={`py-3 px-6 font-medium text-sm ${
          activeTab === "stats"
            ? "border-b-2 border-blue-600 text-blue-600"
            : "text-gray-600 hover:text-gray-800"
        }`}
      >
        <div className="flex items-center gap-2">
          <BarChart2 className="w-4 h-4" />
          <span>Statistiques</span>
        </div>
      </button>
      <button
        onClick={() => setActiveTab("history")}
        className={`py-3 px-6 font-medium text-sm ${
          activeTab === "history"
            ? "border-b-2 border-blue-600 text-blue-600"
            : "text-gray-600 hover:text-gray-800"
        }`}
      >
        <div className="flex items-center gap-2">
          <History className="w-4 h-4" />
          <span>Historique</span>
        </div>
      </button>
    </div>
  );

  const renderPointageTab = () => (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600 border-b-2 border-gray-100">
                Date
              </th>
              <th className="px-6 py-4 text-center  text-sm font-semibold text-gray-600 border-b-2 border-gray-100">
                Entrée
              </th>
              <th className="px-6 py-4 text-center  text-sm font-semibold text-gray-600 border-b-2 border-gray-100">
                Début Pause
              </th>
              <th className="px-6 py-4 text-center  text-sm font-semibold text-gray-600 border-b-2 border-gray-100">
                Fin Pause
              </th>
              <th className="px-6 py-4 text-center  text-sm font-semibold text-gray-600 border-b-2 border-gray-100">
                Sortie
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600 border-b-2 border-gray-100">
                Heures
              </th>
            </tr>
          </thead>
          <tbody>
            {attendances.length > 0 ? (
              attendances.map((entry, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium text-center ">
                    {formatDate(entry.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 ">
                    <span className="flex items-center gap-2 text-center justify-center">
                      <LogIn className="w-4 h-4 text-green-600 " />
                      {formatTime(entry.check_in)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center ">
                    <span className="flex items-center gap-2 justify-center">
                      <Coffee className="w-4 h-4 text-orange-500" />
                      {formatTime(entry.pause_start)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <span className="flex items-center gap-2 justify-center">
                      <Clock3 className="w-4 h-4 text-blue-500" />
                      {formatTime(entry.pause_end)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <span className="flex items-center gap-2 justify-center">
                      <LogOut className="w-4 h-4 text-red-600" />
                      {formatTime(entry.check_out)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">
                    {entry.total_minutes_worked ? (
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          entry.completed_hours
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {Math.floor(entry.total_minutes_worked / 60)}h
                        {entry.total_minutes_worked % 60}
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  {isLoading ? "Chargement..." : "Aucun pointage trouvé"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );

  const renderStatsTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {weeklyStats ? (
        <>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-md">
            <div className="flex items-center gap-3 text-gray-700 mb-3">
              <div className="p-2 bg-blue-200 rounded-full">
                <Clock className="w-5 h-5 text-blue-700" />
              </div>
              <h3 className="font-semibold text-lg">Heures Cette Semaine</h3>
            </div>
            <p className="text-3xl font-bold text-blue-700">
              {weeklyStats.weekly_stats.total_time}
            </p>
            <div className="mt-3 bg-white bg-opacity-50 rounded-lg p-3">
              <div className="flex justify-between mb-1 text-sm">
                <span>Progression</span>
                <span>{weeklyStats.weekly_stats.completion_percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${Math.min(
                      weeklyStats.weekly_stats.completion_percentage,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-md">
            <div className="flex items-center gap-3 text-gray-700 mb-3">
              <div className="p-2 bg-green-200 rounded-full">
                <Award className="w-5 h-5 text-green-700" />
              </div>
              <h3 className="font-semibold text-lg">Balance de Compensation</h3>
            </div>
            <p className="text-3xl font-bold text-green-700">
              {weeklyStats.compensation_hours}h
              {weeklyStats.compensation_minutes}
            </p>
            <p className="text-sm text-green-600 mt-1">
              Minutes disponibles pour compensation
            </p>
          </div>
        </>
      ) : (
        <div className="col-span-2 text-center py-10 text-gray-500">
          Chargement des statistiques...
        </div>
      )}
    </div>
  );

  const renderHistoryTab = () => (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg text-gray-700">
        Historique des Actions
      </h3>

      {history.length > 0 ? (
        <div className="space-y-3">
          {history.map((item, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-medium">{item.description}</span>
                  <div className="text-sm text-gray-600 mt-1">
                    {new Date(item.created_at).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>

                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.action_type.includes("check_in")
                      ? "bg-green-100 text-green-800"
                      : item.action_type.includes("check_out")
                      ? "bg-red-100 text-red-800"
                      : item.action_type.includes("pause")
                      ? "bg-orange-100 text-orange-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {item.action_type}
                </span>
              </div>

              {item.metadata && Object.keys(item.metadata).length > 0 && (
                <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  {Object.entries(item.metadata).map(([key, value]) => (
                    <div key={key}>
                      <span className="font-medium">{key}: </span>
                      {typeof value === "object"
                        ? JSON.stringify(value)
                        : value}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-500">
          Aucune action dans l'historique
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Système de Pointage
          </h1>
          <p className="text-gray-600 mb-8 max-w-lg mx-auto">
            Suivez vos heures de travail facilement et efficacement
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <div className="relative inline-block">
              <button
                onClick={() => setShowPointageMenu(!showPointageMenu)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition duration-300 flex items-center gap-2"
              >
                <Clock className="w-5 h-5" />
                Pointage
                <ChevronDown className="w-4 h-4 ml-1" />
              </button>

              {showPointageMenu && (
                <div className="absolute mt-2 w-56 bg-white rounded-lg shadow-xl py-2 z-10 border border-gray-100">
                  <button
                    onClick={() => handlePointage("entree")}
                    className="w-full px-4 py-3 text-left hover:bg-blue-50 flex items-center gap-3 transition duration-200"
                    disabled={isLoading}
                  >
                    <div className="p-2 bg-green-100 rounded-full">
                      <LogIn className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="font-medium">Entrée</span>
                  </button>
                  <button
                    onClick={() => handlePointage("debutPause")}
                    className="w-full px-4 py-3 text-left hover:bg-blue-50 flex items-center gap-3 transition duration-200"
                    disabled={isLoading}
                  >
                    <div className="p-2 bg-orange-100 rounded-full">
                      <Coffee className="w-4 h-4 text-orange-500" />
                    </div>
                    <span className="font-medium">Début Pause</span>
                  </button>
                  <button
                    onClick={() => handlePointage("finPause")}
                    className="w-full px-4 py-3 text-left hover:bg-blue-50 flex items-center gap-3 transition duration-200"
                    disabled={isLoading}
                  >
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Clock3 className="w-4 h-4 text-blue-500" />
                    </div>
                    <span className="font-medium">Fin Pause</span>
                  </button>
                  <button
                    onClick={() => handlePointage("sortie")}
                    className="w-full px-4 py-3 text-left hover:bg-blue-50 flex items-center gap-3 transition duration-200"
                    disabled={isLoading}
                  >
                    <div className="p-2 bg-red-100 rounded-full">
                      <LogOut className="w-4 h-4 text-red-600" />
                    </div>
                    <span className="font-medium">Sortie</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {renderNotification()}

        <div className="bg-white rounded-xl shadow-xl p-8 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div
              className={`bg-gradient-to-br from-${currentStatus.color}-50 to-${currentStatus.color}-100 p-6 rounded-xl shadow-md`}
            >
              <div className="flex items-center gap-3 text-gray-700 mb-3">
                <div
                  className={`p-2 bg-${currentStatus.color}-200 rounded-full`}
                >
                  <User className={`w-5 h-5 text-${currentStatus.color}-700`} />
                </div>
                <h3 className="font-semibold text-lg">Statut Actuel</h3>
              </div>
              <p
                className={`text-3xl font-bold text-${currentStatus.color}-700`}
              >
                {currentStatus.status}
              </p>
              {currentStatus.since && (
                <p className={`text-sm text-${currentStatus.color}-600 mt-1`}>
                  Depuis {calculateDuration(currentStatus.since)}
                </p>
              )}
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-md">
              <div className="flex items-center gap-3 text-gray-700 mb-3">
                <div className="p-2 bg-blue-200 rounded-full">
                  <Clock className="w-5 h-5 text-blue-700" />
                </div>
                <h3 className="font-semibold text-lg">Date</h3>
              </div>
              <p className="text-3xl font-bold text-blue-700">
                {new Date().toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                })}
              </p>
              <p className="text-sm text-blue-600 mt-1">
                {new Date().toLocaleDateString("fr-FR", { weekday: "long" })}
              </p>
            </div>

            {weeklyStats && (
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-md">
                <div className="flex items-center gap-3 text-gray-700 mb-3">
                  <div className="p-2 bg-green-200 rounded-full">
                    <PieChart className="w-5 h-5 text-green-700" />
                  </div>
                  <h3 className="font-semibold text-lg">Cette Semaine</h3>
                </div>
                <p className="text-3xl font-bold text-green-700">
                  {weeklyStats.weekly_stats.total_time}
                </p>
                <p className="text-sm text-green-600 mt-1">
                  {weeklyStats.weekly_stats.completion_percentage}% des heures
                  requises
                </p>
              </div>
            )}
          </div>

          {renderTabs()}

          {activeTab === "pointage" && renderPointageTab()}
          {activeTab === "stats" && renderStatsTab()}
          {activeTab === "history" && renderHistoryTab()}
        </div>
      </div>
    </div>
  );
};

export default PointagePersonels;
