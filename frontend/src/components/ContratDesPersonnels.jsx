import {
  ArrowLeft,
  Edit,
  FilePenLine,
  Filter,
  Mail,
  Printer,
  Search,
  Download,
  Trash,
  Trash2,
  User,
  Users,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../utils/api";
import { Modal, Button } from "flowbite-react";
import { AttestationContent } from "./AttestationContent";
import { UpdateContract } from "./UpdateContract";
import DeleteContract from "./DeleteContract";

const ContratDesPersonnels = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [contracts, setContracts] = useState([]);

  const [selectedType, setSelectedType] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);
  const isContractExpiringSoon = (end_date) => {
    const endDate = new Date(end_date);
    const today = new Date();
    const timeDiff = endDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)); // Différence en jours
    return daysDiff <= 30 && daysDiff >= 0; // Expire dans les 30 prochains jours
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const contractsResponse = await api.get("/contracts");
        setContracts(contractsResponse.data);
        const expiringContracts = contractsResponse.data.filter((contract) =>
          isContractExpiringSoon(contract.end_date)
        );

        if (expiringContracts.length > 0) {
          toast.warning(
            `Attention : ${expiringContracts.length} contrat(s) expire(nt) bientôt.`,
            { autoClose: 5000 }
          );
        }
      } catch (error) {
        console.error("Détails de l'erreur:", error);
        setError(`Erreur: ${error.message || "Erreur inconnue"}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch = contract.user?.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || contract.type === selectedType;
    return matchesSearch && matchesType;
  });

  const calculateDuration = (start_date, end_date) => {
    const start = new Date(start_date);
    const end = new Date(end_date);
    const diff = Math.abs(end.getTime() - start.getTime());
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return Math.floor(days / 30);
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const openDeleteModal = (contract) => {
    setSelectedUser(contract);
    setIsDeleteOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const openUpdateModal = (contract) => {
    setSelectedUser(contract);
    setIsUpdateOpen(true);
  };
  const handleDelete = async () => {
    if (!selectedUser || !selectedUser.id) {
      setDeleteError("Aucun contrat sélectionné pour la suppression !");
      return;
    }

    try {
      const response = await api.delete(`/contract/${selectedUser.id}`);
      console.log("Contrat supprimé avec succès :", response.data);

      setContracts((prevContracts) =>
        prevContracts.filter((c) => c.id !== selectedUser.id)
      );

      setIsDeleteOpen(false);
      setDeleteError(null);
    } catch (err) {
      console.error(
        "Erreur lors de la suppression :",
        err.response?.data || err.message
      );
      setDeleteError(
        "Erreur lors de la suppression du contrat. Veuillez réessayer."
      );
    }
  };
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-indigo-500 font-semibold">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="bg-blue-600 p-3 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Contrats du Personnels
            </h1>
          </div>
          <ToastContainer />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Rechercher un employé..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="">Tous les types de contrats</option>
                <option value="CDI">CDI</option>
                <option value="CDD">CDD</option>
                <option value="Stage">Stage</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date de début
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date de fin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durée
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredContracts.map((contract) => (
                  <tr key={contract.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 cursor-pointer">
                        {contract.user?.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          contract.type === "CDI"
                            ? "bg-green-100 text-green-800"
                            : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {contract.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {contract.start_date}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {contract.end_date}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {calculateDuration(
                          contract.start_date,
                          contract.end_date
                        )}{" "}
                        mois
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleUserClick(contract.user)}
                          className="text-blue-200"
                        >
                          <Download />
                        </button>
                        <button
                          onClick={() => openUpdateModal(contract)}
                          className="text-blue-500"
                        >
                          <Edit />
                        </button>
                        <button
                          className="text-red-500"
                          onClick={() => openDeleteModal(contract)}
                        >
                          <Trash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {isUpdateOpen && (
          <UpdateContract
            contract={selectedUser}
            onClose={() => setIsUpdateOpen(false)}
          />
        )}
        <DeleteContract
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onDelete={handleDelete}
          error={deleteError}
        />
        <Modal show={showModal} onClose={() => setShowModal(false)}>
          <Modal.Header className="p-4"></Modal.Header>
          <Modal.Body>
            {selectedUser && (
              <div id="attestation-content">
                <AttestationContent
                  user={selectedUser}
                  contract={contracts.find(
                    (c) => c.user?.id === selectedUser.id
                  )}
                />
              </div>
            )}
          </Modal.Body>
          <Modal.Footer className="flex justify-end">
            <Button onClick={handlePrint} className="bg-blue-500 text-white">
              <Printer className="mr-2 h-4 w-4" />
              Imprimer
            </Button>
            <Button color="gray" onClick={() => setShowModal(false)}>
              Fermer
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default ContratDesPersonnels;
