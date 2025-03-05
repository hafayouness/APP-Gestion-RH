import { useState } from "react";
import api from "../utils/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const UpdateContract = ({ contract, onClose }) => {
  const [formData, setFormData] = useState({
    name: contract?.user?.name || "",
    email: contract?.user?.email || "",
    type: contract?.type || "CDI",
    start_date: contract?.start_date || "",
    end_date: contract?.end_date || "",
  });

  // const handleChange = (e) => {
  //   setFormData({ ...formData, [e.target.name]: e.target.value });
  // };
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "type" && value === "CDI") {
      setFormData({ ...formData, type: value, end_date: "" });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/contract/${contract.id}/update`, formData);
      toast.success("Contrat mis à jour avec succès !");
      onClose();
      window.location.reload();
    } catch (err) {
      toast.error("Erreur lors de la mise à jour du contrat.");
      console.error("Erreur de mise à jour:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-5 rounded-lg shadow-lg w-96">
        <h2 className="text-lg font-bold mb-6 text-center text-blue-500">
          Modifier le contrat
        </h2>

        <label className="block mb-2">Type de Contrat :</label>
        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-4"
        >
          <option value="CDI">CDI</option>
          <option value="CDD">CDD</option>
          <option value="Stage">Stage</option>
        </select>
        <label className="block mb-2">Date de début :</label>
        <input
          type="date"
          name="start_date"
          value={formData.start_date}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-4"
        />
        {/* <label className="block mb-2">Date de fin :</label>
        <input
          type="date"
          name="end_date"
          value={formData.end_date}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-4"
        /> */}

        {formData.type !== "CDI" && (
          <>
            <label className="block mb-2">Date de fin :</label>
            <input
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              className="w-full p-2 border rounded mb-4"
            />
          </>
        )}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Enregistrer
          </button>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};
