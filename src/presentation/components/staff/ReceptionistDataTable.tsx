import { useState } from "react";
import { Receptionist, ReceptionistPayload } from "@/domain/entities/Receptionist";
import { ReceptionistFormModal } from "./ReceptionistFormModal";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { Pencil, Trash2, Phone, Clock, UserCheck } from "lucide-react";

interface ReceptionistDataTableProps {
  receptionists: Receptionist[];
  loading: boolean;
  onEdit: (id: string, payload: ReceptionistPayload) => Promise<Receptionist | void>;
  onDelete: (id: string) => Promise<void>;
}

import { useAuth } from "@/application/providers/AuthProvider";

export function ReceptionistDataTable({ receptionists, loading, onEdit, onDelete }: ReceptionistDataTableProps) {
  const { canManageReceptionists } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedReceptionistForEdit, setSelectedReceptionistForEdit] = useState<Receptionist | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedReceptionistForDelete, setSelectedReceptionistForDelete] = useState<Receptionist | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenEdit = (receptionist: Receptionist) => {
    setSelectedReceptionistForEdit(receptionist);
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (receptionist: Receptionist) => {
    setSelectedReceptionistForDelete(receptionist);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedReceptionistForDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(selectedReceptionistForDelete.id);
      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error("Deletion failed");
    } finally {
      setIsDeleting(false);
      setSelectedReceptionistForDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
        <span className="size-8 border-4 border-slate-200 dark:border-slate-800 border-t-[#3b82f6] rounded-full animate-spin mb-4"></span>
        <p className="text-sm font-semibold text-slate-500">Loading receptionists data...</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4">Receptionist Details</th>
                <th className="px-6 py-4">Shift</th>
                <th className="px-6 py-4 hidden sm:table-cell">Contact</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center ltr:text-right rtl:text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {receptionists.map((receptionist) => (
                <tr key={receptionist.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="size-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500 shrink-0">
                        <UserCheck className="size-5 text-indigo-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{receptionist.name}</p>
                        <p className="text-xs text-slate-500 md:hidden">{receptionist.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400">
                      <Clock className="size-3.5" />
                      {receptionist.shift} Shift
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <div className="flex flex-col gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Phone className="size-3.5" /> {receptionist.phone || <span className="text-slate-400 italic">No phone</span>}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide border ${
                      receptionist.status === "Active" 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' 
                        : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                    }`}>
                      <span className={`size-1.5 rounded-full ${receptionist.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                      {receptionist.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {canManageReceptionists ? (
                      <div className="flex items-center justify-end gap-2 ltr:ml-auto rtl:mr-auto w-fit">
                        <button 
                          onClick={() => handleOpenEdit(receptionist)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-200"
                          title="Edit Receptionist"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button 
                          onClick={() => handleOpenDelete(receptionist)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-500/20"
                          title="Remove Receptionist"
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
              {receptionists.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <UserCheck className="size-8 text-slate-300 dark:text-slate-600 mb-2" />
                      <p className="font-semibold text-slate-900 dark:text-slate-100">No Receptionists Found</p>
                      <p className="text-sm">Click "Add Receptionist" to create a new profile.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ReceptionistFormModal 
        isOpen={isEditModalOpen} 
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedReceptionistForEdit(null);
        }} 
        initialData={selectedReceptionistForEdit}
        onSubmit={async (payload: ReceptionistPayload) => {
          if (selectedReceptionistForEdit) {
            await onEdit(selectedReceptionistForEdit.id, payload);
          }
        }}
      />

      <DeleteConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => {
          if(!isDeleting) setIsDeleteModalOpen(false);
        }}
        onConfirm={handleConfirmDelete}
        doctorName={selectedReceptionistForDelete?.name || ""}
        isDeleting={isDeleting}
      />
    </>
  );
}
