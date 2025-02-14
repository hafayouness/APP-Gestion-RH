import React from "react";

const DeleteContract = ({ isOpen, onClose, onDelete }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-5 rounded-lg shadow-lg">
        <h2 className="text-lg font-bold mb-3 text-red-500">
          Confirmer la suppression
        </h2>
        <p>Êtes-vous sûr de vouloir supprimer cet utilisateur ?</p>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">
            Annuler
          </button>
          <button
            onClick={onDelete}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteContract;
