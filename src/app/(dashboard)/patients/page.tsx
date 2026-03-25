"use client";

import { useState } from "react";
import Header from "@/presentation/components/layout/Header";
import { usePatients } from "@/application/services/usePatients";
import { PatientDataTable } from "@/presentation/components/patients/PatientDataTable";
import { PatientRegistrationModal } from "@/presentation/components/patients/PatientRegistrationModal";
import { PatientOversightPanel } from "@/presentation/components/patients/PatientOversightPanel";
import { Patient } from "@/domain/entities/Patient";
import { UserPlus } from "lucide-react";

export default function PatientsPage() {
  const { 
    patients, 
    loading, 
    searchQuery, 
    setSearchQuery, 
    addPatient, 
    editPatient,
    removePatient,
    fetchHistory,
    fetchClinicNotes,
    saveClinicNotes,
    adjustBalance,
    totalCount
  } = usePatients();

  // Registration & Edit Modal State
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [selectedPatientForEdit, setSelectedPatientForEdit] = useState<Patient | null>(null);

  const handleOpenEdit = (patient: Patient) => {
    setSelectedPatientForEdit(patient);
    setIsRegModalOpen(true);
  };

  // Oversight Panel State
  const [isOversightOpen, setIsOversightOpen] = useState(false);
  const [selectedPatientForOversight, setSelectedPatientForOversight] = useState<Patient | null>(null);

  const handleOpenOversight = (patient: Patient) => {
    setSelectedPatientForOversight(patient);
    setIsOversightOpen(true);
  };

  return (
    <>
      <Header title="Patient Directory" />
      <div className="px-6 lg:px-10 pb-12">
        <header className="py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-3">
              Patient Directory
              <span className="text-xs font-bold bg-[#3b82f6]/10 text-[#3b82f6] px-2.5 py-1 rounded-full">{totalCount} Total</span>
            </h2>
            <p className="text-slate-500 text-sm mt-1">Manage and view all registered clinic patients</p>
          </div>
          <button 
            onClick={() => setIsRegModalOpen(true)}
            className="bg-[#3b82f6] hover:bg-blue-600 shadow-md shadow-blue-500/20 text-white px-5 h-10 rounded-lg font-bold text-sm flex items-center justify-center gap-2 shrink-0 transition-all ltr:ml-auto rtl:mr-auto"
          >
            <UserPlus className="size-4" />
            Add New Patient
          </button>
        </header>

        <PatientDataTable 
          patients={patients} 
          loading={loading}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenOversight={handleOpenOversight}
          onEdit={handleOpenEdit}
          onDelete={removePatient}
        />

        {/* Global Modals */}
        <PatientRegistrationModal 
          isOpen={isRegModalOpen}
          initialData={selectedPatientForEdit}
          onClose={() => {
            setIsRegModalOpen(false);
            setSelectedPatientForEdit(null);
          }}
          onSubmit={async (payload) => {
            if (selectedPatientForEdit) {
              await editPatient(selectedPatientForEdit.id, payload);
            } else {
              await addPatient(payload);
            }
          }}
        />

        <PatientOversightPanel 
          isOpen={isOversightOpen}
          patient={selectedPatientForOversight}
          onClose={() => setIsOversightOpen(false)}
          fetchHistory={fetchHistory}
          fetchClinicNotes={fetchClinicNotes}
          saveClinicNotes={saveClinicNotes}
          adjustBalance={adjustBalance}
        />
      </div>
    </>
  );
}
