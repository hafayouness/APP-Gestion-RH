// import React, { useState } from "react";
// import { Contact as FileContract } from "lucide-react";
// import api from "../utils/api";
// import { useNavigate } from "react-router-dom";

// const CreationContracts = () => {
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     start_date: "",
//     end_date: "",
//     type: "",
//   });
//   const [success, setSuccess] = useState(null);
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setSuccess(null);
//     setError(null);

//     try {
//       const response = await api.post("/contract", formData, {
//         withCredentials: "true",
//       });

//       const data = response.data;
//       console.log("data", data);
//       if (data.success) {
//         alert(`succes: ${data.message}`);
//         setSuccess(data.message);
//         setFormData(data);
//         navigate("/dashboard/contrat-personnel");

//         setFormData({
//           name: "",
//           email: "",
//           start_date: "",
//           end_date: "",
//           type: "",
//         });
//       } else {
//         setError(data.message);
//       }
//     } catch (err) {
//       console.log(err);
//       if (err.response && err.response.data.errors) {
//         const errorMessages = Object.values(err.response.data.errors)
//           .flat()
//           .join("\n");
//         setError(errorMessages);
//         setError("Une erreur s'est produite lors de la creation de contract .");
//       } else {
//         setError("Une erreur s'est produite lors de la création du contrat.");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };
//   return (
//     <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
//         <div className="flex items-center justify-center mb-8">
//           <FileContract className="h-12 w-12 text-blue-600" />
//         </div>
//         <h2 className="text-center text-2xl font-bold text-gray-900 mb-8">
//           Création de Contrat
//         </h2>

//         {error && (
//           <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
//             {error}
//           </div>
//         )}
//         {success && (
//           <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
//             {success}
//           </div>
//         )}
//         <form className="space-y-6" onSubmit={handleSubmit}>
//           <div>
//             <label
//               htmlFor="name"
//               className="block text-sm font-medium text-gray-700"
//             >
//               Nom complet
//             </label>
//             <input
//               type="text"
//               id="name"
//               required
//               className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
//               value={formData.name}
//               onChange={(e) =>
//                 setFormData({ ...formData, name: e.target.value })
//               }
//             />
//           </div>

//           <div>
//             <label
//               htmlFor="email"
//               className="block text-sm font-medium text-gray-700"
//             >
//               Email
//             </label>
//             <input
//               type="email"
//               id="email"
//               required
//               className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
//               value={formData.email}
//               onChange={(e) =>
//                 setFormData({ ...formData, email: e.target.value })
//               }
//             />
//           </div>

//           <div>
//             <label
//               htmlFor="startDate"
//               className="block text-sm font-medium text-gray-700"
//             >
//               Date de début
//             </label>
//             <input
//               type="date"
//               id="startDate"
//               required
//               className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
//               value={formData.start_date}
//               onChange={(e) =>
//                 setFormData({ ...formData, start_date: e.target.value })
//               }
//             />
//           </div>

//           <div>
//             <label
//               htmlFor="endDate"
//               className="block text-sm font-medium text-gray-700"
//             >
//               Date de fin
//             </label>
//             <input
//               type="date"
//               id="endDate"
//               required
//               className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
//               value={formData.end_date}
//               onChange={(e) =>
//                 setFormData({ ...formData, end_date: e.target.value })
//               }
//             />
//           </div>

//           <div>
//             <label
//               htmlFor="contractType"
//               className="block text-sm font-medium text-gray-700"
//             >
//               Type de contrat
//             </label>
//             <select
//               id="contractType"
//               required
//               className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
//               value={formData.type}
//               onChange={(e) =>
//                 setFormData({ ...formData, type: e.target.value })
//               }
//             >
//               <option value="">Sélectionnez un type</option>
//               <option value="CDI">CDI</option>
//               <option value="CDD">CDD</option>
//               <option value="Stage">Stage</option>
//             </select>
//           </div>

//           <button
//             type="submit"
//             disabled={loading}
//             className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
//               loading
//                 ? "bg-gray-400 cursor-not-allowed"
//                 : "bg-blue-600 hover:bg-blue-700"
//             } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors`}
//           >
//             {loading ? "Chargement..." : "Valider le contrat"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default CreationContracts;
import React, { useState, useEffect } from "react";
import { Contact as FileContract } from "lucide-react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";

const CreationContracts = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    start_date: "",
    end_date: "",
    type: "",
    duration: "",
  });
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Réinitialiser la date de fin lorsque le type est CDI
  useEffect(() => {
    if (formData.type === "CDI") {
      setFormData({
        ...formData,
        end_date: "", // Vider la date de fin pour les CDI
      });
    }
  }, [formData.type]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);

    // Créer une copie du formData pour l'envoi
    const dataToSend = { ...formData };

    // Si c'est un CDI, on ne veut pas envoyer de date de fin
    if (dataToSend.type === "CDI") {
      delete dataToSend.end_date;
    }

    try {
      const response = await api.post("/contract", dataToSend, {
        withCredentials: true,
      });

      const data = response.data;
      console.log("data", data);
      if (data.success) {
        alert(`succes: ${data.message}`);
        setSuccess(data.message);
        setFormData(data);
        navigate("/dashboard/contrat-personnel");

        setFormData({
          name: "",
          email: "",
          start_date: "",
          end_date: "",
          type: "",
        });
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.log(err);
      if (err.response && err.response.data.errors) {
        const errorMessages = Object.values(err.response.data.errors)
          .flat()
          .join("\n");
        setError(errorMessages);
        setError("Une erreur s'est produite lors de la creation de contract .");
      } else {
        setError("Une erreur s'est produite lors de la création du contrat.");
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-center mb-8">
          <FileContract className="h-12 w-12 text-blue-600" />
        </div>
        <h2 className="text-center text-2xl font-bold text-gray-900 mb-8">
          Création de Contrat
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Nom complet
            </label>
            <input
              type="text"
              id="name"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
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
              type="email"
              id="email"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          <div>
            <label
              htmlFor="contractType"
              className="block text-sm font-medium text-gray-700"
            >
              Type de contrat
            </label>
            <select
              id="contractType"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
            >
              <option value="">Sélectionnez un type</option>
              <option value="CDI">CDI</option>
              <option value="CDD">CDD</option>
              <option value="Stage">Stage</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="startDate"
              className="block text-sm font-medium text-gray-700"
            >
              Date de début
            </label>
            <input
              type="date"
              id="startDate"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              value={formData.start_date}
              onChange={(e) =>
                setFormData({ ...formData, start_date: e.target.value })
              }
            />
          </div>

          {formData.type !== "CDI" && (
            <div>
              <label
                htmlFor="endDate"
                className="block text-sm font-medium text-gray-700"
              >
                Date de fin
              </label>
              <input
                type="date"
                id="endDate"
                required={formData.type !== "CDI"}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                value={formData.end_date}
                onChange={(e) =>
                  setFormData({ ...formData, end_date: e.target.value })
                }
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors`}
          >
            {loading ? "Chargement..." : "Valider le contrat"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreationContracts;
