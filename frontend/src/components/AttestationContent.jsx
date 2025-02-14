export const AttestationContent = ({ user, contract }) => {
  if (!user || !contract) return null;
  const currentDate = new Date().toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const calculateDuration = (start_date, end_date) => {
    const start = new Date(start_date);
    const end = new Date(end_date);
    const diff = Math.abs(end.getTime() - start.getTime());
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return Math.floor(days / 30);
  };

  return (
    <div className="p-8 bg-white max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          ATTESTATION DE TRAVAIL
        </h1>
        <div className="w-32 h-1 bg-blue-600 mx-auto"></div>
      </div>

      <div className="space-y-8">
        <p className="text-lg text-gray-700 leading-relaxed">
          Je soussigné(e), Directeur des Ressources Humaines, certifie que :
        </p>

        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="grid grid-cols-1 gap-6">
            <div className="flex items-center">
              <span className="text-gray-600 font-semibold w-48">
                Nom et Prénom :
              </span>
              <span className="text-gray-800">{user.name}</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-600 font-semibold w-48">Email :</span>
              <span className="text-gray-800">{user.email}</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-600 font-semibold w-48">
                Type de Contrat :
              </span>
              <span
                className={`px-4 py-1 rounded-full text-sm font-semibold ${
                  contract.type === "CDI"
                    ? "bg-green-100 text-green-800"
                    : contract.type === "CDD"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-orange-100 text-orange-800"
                }`}
              >
                {contract.type}
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-600 font-semibold w-48">Durée :</span>
              <span className="text-gray-800">
                {calculateDuration(contract.start_date, contract.end_date)} mois
              </span>
            </div>
          </div>
        </div>

        <div className="text-gray-700 space-y-6">
          <p className="leading-relaxed">
            Cette attestation est délivrée à l'intéressé(e) pour servir et
            valoir ce que de droit.
          </p>

          <div className="text-right">
            <p>Fait à Agadir, le {currentDate}</p>
            <div className="mt-8">
              <p className="font-semibold">Signature et cachet</p>
              <div className="w-40 h-24 border border-dashed border-gray-300 rounded-lg mt-2 ml-auto"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16 pt-8 border-t border-gray-200">
        <div className="text-center text-sm text-gray-500">
          <p>
            Ce document est généré automatiquement et ne nécessite pas de
            signature manuscrite.
          </p>
        </div>
      </div>
    </div>
  );
};
