import { useState } from "react";
import { Doctor, DoctorPayload } from "@/domain/entities/Doctor";
import { DoctorFormModal } from "./DoctorFormModal";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { ManageScheduleModal } from "./ManageScheduleModal";
import { Pencil, Trash2, ShieldCheck, Mail, Phone, Activity, CalendarClock } from "lucide-react";

interface DoctorDataTableProps {
  doctors: Doctor[];
  loading: boolean;
  onEdit: (id: string, payload: DoctorPayload) => Promise<Doctor | void>;
  onDelete: (id: string) => Promise<void>;
}

import { useAuth } from "@/application/providers/AuthProvider";

export function DoctorDataTable({ doctors, loading, onEdit, onDelete }: DoctorDataTableProps) {
  const { canManageDoctors } = useAuth();
  
  // Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDoctorForEdit, setSelectedDoctorForEdit] = useState<Doctor | null>(null);

  // Delete State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDoctorForDelete, setSelectedDoctorForDelete] = useState<Doctor | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Schedule Modal State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedDoctorForSchedule, setSelectedDoctorForSchedule] = useState<Doctor | null>(null);

  // Handlers
  const handleOpenEdit = (doctor: Doctor) => {
    setSelectedDoctorForEdit(doctor);
    setIsEditModalOpen(true);
  };

  const handleOpenSchedule = (doctor: Doctor) => {
     setSelectedDoctorForSchedule(doctor);
     setIsScheduleModalOpen(true);
  };

  const handleOpenManageSchedule = (doctor: Doctor) => {
    setSelectedDoctorForSchedule(doctor);
    setIsScheduleModalOpen(true);
  };

  const handleOpenDelete = (doctor: Doctor) => {
    setSelectedDoctorForDelete(doctor);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDoctorForDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(selectedDoctorForDelete.id);
      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error("Deletion failed");
    } finally {
      setIsDeleting(false);
      setSelectedDoctorForDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
        <span className="size-8 border-4 border-slate-200 dark:border-slate-800 border-t-[#3b82f6] rounded-full animate-spin mb-4"></span>
        <p className="text-sm font-semibold text-slate-500">Loading providers data...</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4">Provider Details</th>
                <th className="px-6 py-4">Specialty</th>
                <th className="px-6 py-4 hidden sm:table-cell">Contact</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center ltr:text-right rtl:text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {doctors.map((doctor) => (
                <tr key={doctor.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="size-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500 shrink-0">
                        <ShieldCheck className="size-5 text-[#3b82f6]" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{doctor.fullName}</p>
                        <p className="text-xs text-slate-500 md:hidden">{doctor.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#3b82f6]/10 text-[#3b82f6]">
                      <Activity className="size-3.5" />
                      {doctor.specialization}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <div className="flex flex-col gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Mail className="size-3.5" /> {doctor.email || <span className="text-slate-400 italic">No email</span>}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Phone className="size-3.5" /> {doctor.phone || <span className="text-slate-400 italic">No phone</span>}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide border ${
                      doctor.status === "Active" 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' 
                        : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                    }`}>
                      <span className={`size-1.5 rounded-full ${doctor.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                      {doctor.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {canManageDoctors ? (
                      <div className="flex items-center justify-end gap-2 ltr:ml-auto rtl:mr-auto w-fit">
                        <button 
                          onClick={() => handleOpenManageSchedule(doctor)}
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors border border-transparent hover:border-emerald-200"
                          title="Manage Default Profile"
                        >
                          <CalendarClock className="size-4" />
                        </button>
                        <button 
                          onClick={() => handleOpenEdit(doctor)}
                          className="p-2 text-slate-400 hover:text-[#3b82f6] hover:bg-[#3b82f6]/10 rounded-lg transition-colors border border-transparent hover:border-[#3b82f6]/20"
                          title="Edit Provider"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button 
                          onClick={() => handleOpenDelete(doctor)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-500/20"
                          title="Remove Provider"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="text-right text-xs text-slate-400 italic">Read Only</div>
                    )}
                  </td>
                </tr>
              ))}
              {doctors.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <ShieldCheck className="size-8 text-slate-300 dark:text-slate-600 mb-2" />
                      <p className="font-semibold text-slate-900 dark:text-slate-100">No Providers Found</p>
                      <p className="text-sm">Click "Add Doctor" to create a new provider profile.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ManageScheduleModal 
        isOpen={isScheduleModalOpen}
        onClose={() => {
          setIsScheduleModalOpen(false);
          setSelectedDoctorForSchedule(null);
        }}
        doctorId={selectedDoctorForSchedule?.id || null}
        doctorName={selectedDoctorForSchedule?.fullName}
      />

      {/* Slide-over for Editing */}
      <DoctorFormModal 
        isOpen={isEditModalOpen} 
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedDoctorForEdit(null);
        }} 
        initialData={selectedDoctorForEdit}
        onSubmit={async (payload) => {
          if (selectedDoctorForEdit) {
            await onEdit(selectedDoctorForEdit.id, payload);
          }
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => {
          if(!isDeleting) setIsDeleteModalOpen(false);
        }}
        onConfirm={handleConfirmDelete}
        doctorName={selectedDoctorForDelete?.fullName || ""}
        isDeleting={isDeleting}
      />
    </>
  );
}
