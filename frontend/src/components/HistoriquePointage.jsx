import React, { useEffect, useState } from "react";
import api from "../utils/api";

const HistoriquePointage = () => {
  const [pointages, setPointages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getPointage = async () => {
      try {
        const response = await api.get("/attendance", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        });

        console.log("Réponse de l'API :", response.data);

        // Obtenir la date actuelle au format YYYY-MM-DD
        const today = new Date().toISOString().split("T")[0];

        let allAttendances = [];

        // Parcourir toutes les clés d'utilisateur
        Object.keys(response.data).forEach((userKey) => {
          const userData = response.data[userKey];

          // Ajouter les informations utilisateur à chaque pointage
          if (userData.attendances && userData.attendances.length > 0) {
            userData.attendances.forEach((attendance) => {
              // S'assurer que user est correctement défini
              attendance.user = attendance.user || userData.user;

              // Filtrer pour n'inclure que les pointages d'aujourd'hui
              if (attendance.check_in?.startsWith(today)) {
                allAttendances.push(attendance);
              }
            });
          }
        });

        // Supprimer les doublons en gardant le dernier pointage par employé
        const uniquePointages = {};
        allAttendances.forEach((pointage) => {
          const userId = pointage.user?.id;
          if (
            !uniquePointages[userId] ||
            new Date(pointage.check_in) >
              new Date(uniquePointages[userId].check_in)
          ) {
            uniquePointages[userId] = pointage;
          }
        });

        setPointages(Object.values(uniquePointages));
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors de la récupération des pointages", error);
        setLoading(false);
      }
    };

    getPointage();
  }, []);
  // useEffect(() => {
  //   const getPointage = async () => {
  //     try {
  //       const response = await api.get("/attendance", {
  //         headers: {
  //           Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
  //         },
  //       });

  //       console.log("Réponse de l'API :", response.data);

  //       const userKey = Object.keys(response.data)[0]; // Récupérer la clé utilisateur
  //       let attendances = response.data[userKey]?.attendances || [];

  //       // Obtenir la date actuelle au format YYYY-MM-DD
  //       const today = new Date().toISOString().split("T")[0];

  //       // Filtrer les pointages du jour actuel
  //       attendances = attendances.filter((pointage) =>
  //         pointage.check_in?.startsWith(today)
  //       );

  //       // Supprimer les doublons en gardant le dernier pointage par employé
  //       const uniquePointages = {};
  //       attendances.forEach((pointage) => {
  //         const userId = pointage.user?.id;
  //         if (
  //           !uniquePointages[userId] ||
  //           new Date(pointage.check_in) >
  //             new Date(uniquePointages[userId].check_in)
  //         ) {
  //           uniquePointages[userId] = pointage;
  //         }
  //       });

  //       setPointages(Object.values(uniquePointages));
  //       setLoading(false);
  //     } catch (error) {
  //       console.error("Erreur lors de la récupération des pointages", error);
  //       setLoading(false);
  //     }
  //   };

  //   getPointage();
  // }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleTimeString();
  };

  const calculateWorkedHours = (
    check_in,
    check_out,
    pause_duration_minutes
  ) => {
    if (!check_in || !check_out) {
      return "-";
    }

    const entreeTime = new Date(check_in);
    const sortieTime = new Date(check_out);

    if (isNaN(entreeTime.getTime()) || isNaN(sortieTime.getTime())) {
      return "-";
    }

    const workedMinutes = (sortieTime - entreeTime) / (1000 * 60);
    const totalWorkedMinutes = workedMinutes - (pause_duration_minutes || 0);

    const hours = Math.floor(totalWorkedMinutes / 60);
    const minutes = Math.floor(totalWorkedMinutes % 60);

    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white shadow-lg rounded-lg mt-10">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-700">
        Gestion du Pointage - Aujourd'hui
      </h1>

      {loading ? (
        <div className="p-4 text-center text-blue-500 font-semibold">
          Chargement...
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 text-center font-semibold text-gray-700 border-b">
                  ID
                </th>
                <th className="py-2 px-4 text-center font-semibold text-gray-700 border-b">
                  Nom
                </th>
                <th className="py-2 px-4 text-center font-semibold text-gray-700 border-b">
                  Entrée
                </th>
                <th className="py-2 px-4  font-semibold text-gray-700 border-b text-center">
                  Pause (minutes)
                </th>
                <th className="py-2 px-4  font-semibold text-gray-700 border-b text-center">
                  Sortie
                </th>
                <th className="py-2 px-4  font-semibold text-gray-700 border-b text-center">
                  Heures Travaillées
                </th>
              </tr>
            </thead>
            <tbody>
              {pointages.length > 0 ? (
                pointages.map((pointage) => (
                  <tr key={pointage.id} className="border-b">
                    <td className="py-2 px-4 text-center">{pointage.id}</td>
                    <td className="py-2 px-4 text-center">
                      {pointage.user?.name || "-"}
                    </td>
                    <td className="py-2 px-4 text-center">
                      {formatDate(pointage.check_in)}
                    </td>
                    <td className="py-2 px-4 text-center">
                      {pointage.pause_duration_minutes
                        ? `${pointage.pause_duration_minutes} min`
                        : "-"}
                    </td>
                    <td className="py-2 px-4 text-center">
                      {formatDate(pointage.check_out)}
                    </td>
                    <td className="py-2 px-4 text-center">
                      {calculateWorkedHours(
                        pointage.check_in,
                        pointage.check_out,
                        pointage.pause_duration_minutes
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    Aucun pointage pour aujourd'hui.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HistoriquePointage;
