"use client";

import { useState } from "react";
import Header from "@/presentation/components/layout/Header";
import { useDoctors } from "@/application/services/useDoctors";
import { useReceptionists } from "@/application/services/useReceptionists";
import { DoctorDataTable } from "@/presentation/components/staff/DoctorDataTable";
import { DoctorFormModal } from "@/presentation/components/staff/DoctorFormModal";
import { ReceptionistDataTable } from "@/presentation/components/staff/ReceptionistDataTable";
import { ReceptionistFormModal } from "@/presentation/components/staff/ReceptionistFormModal";
import { UserPlus, ShieldPlus } from "lucide-react";
import { useAuth } from "@/application/providers/AuthProvider";

export default function StaffPage() {
  const { canManageDoctors, canManageReceptionists } = useAuth();
  const [activeTab, setActiveTab] = useState<"doctors" | "receptionists">("doctors");

  // Doctors State
  const { 
    doctors, 
    loading: doctorsLoading, 
    addDoctor, 
    editDoctor, 
    removeDoctor 
  } = useDoctors();
  const [isAddDoctorModalOpen, setIsAddDoctorModalOpen] = useState(false);

  // Receptionists State
  const { 
    receptionists, 
    loading: receptionistsLoading, 
    addReceptionist, 
    editReceptionist, 
    removeReceptionist 
  } = useReceptionists();
  const [isAddReceptionistModalOpen, setIsAddReceptionistModalOpen] = useState(false);

  return (
    <>
      <Header title="Staff Management" />
      <div className="px-6 lg:px-10 pb-12">
        <header className="py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Clinic Staff</h2>
            <p className="text-slate-500 text-sm mt-1">Manage all clinic personnel including doctors and receptionists.</p>
          </div>
          
          {activeTab === "doctors" && canManageDoctors && (
            <button 
              onClick={() => setIsAddDoctorModalOpen(true)}
              className="bg-[#3b82f6] text-white px-5 h-10 rounded-lg flex items-center gap-2 hover:bg-blue-600 shadow-md shadow-blue-500/20 transition-all font-bold text-sm shrink-0 rtl:mr-auto ltr:ml-auto"
            >
              <ShieldPlus className="size-4" />
              Add Provider
            </button>
          )}

          {activeTab === "receptionists" && canManageReceptionists && (
            <button 
              onClick={() => setIsAddReceptionistModalOpen(true)}
              className="bg-indigo-600 text-white px-5 h-10 rounded-lg flex items-center gap-2 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all font-bold text-sm shrink-0 rtl:mr-auto ltr:ml-auto"
            >
              <UserPlus className="size-4" />
              Add Receptionist
            </button>
          )}
        </header>

        {/* Custom Tabs */}
        <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800">
          <button 
            onClick={() => setActiveTab("doctors")}
            className={`pb-3 px-4 text-sm font-bold transition-colors ${
              activeTab === "doctors" 
                ? "text-[#3b82f6] border-b-2 border-[#3b82f6]" 
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            Medical Providers
          </button>
          <button 
            onClick={() => setActiveTab("receptionists")}
            className={`pb-3 px-4 text-sm font-bold transition-colors ${
              activeTab === "receptionists" 
                ? "text-indigo-600 border-b-2 border-indigo-600" 
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            Receptionists
          </button>
        </div>

        {activeTab === "doctors" ? (
          <DoctorDataTable 
            doctors={doctors}
            loading={doctorsLoading}
            onEdit={editDoctor}
            onDelete={removeDoctor}
          />
        ) : (
          <ReceptionistDataTable 
            receptionists={receptionists}
            loading={receptionistsLoading}
            onEdit={editReceptionist}
            onDelete={removeReceptionist}
          />
        )}

        {/* Global Modals */}
        <DoctorFormModal 
          isOpen={isAddDoctorModalOpen}
          initialData={null}
          onClose={() => setIsAddDoctorModalOpen(false)}
          onSubmit={async (payload) => {
            await addDoctor(payload);
          }}
        />

        <ReceptionistFormModal
          isOpen={isAddReceptionistModalOpen}
          initialData={null}
          onClose={() => setIsAddReceptionistModalOpen(false)}
          onSubmit={async (payload) => {
            await addReceptionist(payload);
          }}
        />
      </div>
    </>
  );
}
