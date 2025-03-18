import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ButtonPointage = () => {
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();

  const canShowPointageButton = () => {
    if (!user || !user.role_id) return false;

    return (
      user.role_id === 2 ||
      user.role_id === 3 ||
      user.role_id === "employé" ||
      user.role_id === "stagiaire" ||
      user.role_id === "manager" ||
      user.role_id.toLowerCase() === "employer" ||
      user.role_id.toLowerCase() === "intern"
    );
  };

  const handlePointage = async () => {
    navigate("/dashboard/pointage");
  };

  if (!canShowPointageButton()) {
    return null;
  }

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <button
        onClick={handlePointage}
        className="flex items-center bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-full transition-colors shadow-lg"
      >
        <Clock className="mr-2 h-5 w-5" />
        Pointage
      </button>
    </div>
  );
};

export default ButtonPointage;
