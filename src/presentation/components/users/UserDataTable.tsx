import { useState } from "react";
import { User, UserPayload } from "@/domain/entities/User";
import { UserFormModal } from "./UserFormModal";
import { DeleteConfirmModal } from "@/presentation/components/staff/DeleteConfirmModal";
import { Pencil, Trash2, ShieldAlert, Key, Clock, User as UserIcon } from "lucide-react";

interface UserDataTableProps {
  users: User[];
  loading: boolean;
  onEdit: (id: string, payload: UserPayload) => Promise<User | void>;
  onDelete: (id: string) => Promise<void>;
}

export function UserDataTable({ users, loading, onEdit, onDelete }: UserDataTableProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUserForDelete, setSelectedUserForDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenEdit = (user: User) => {
    setSelectedUserForEdit(user);
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (user: User) => {
    setSelectedUserForDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUserForDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(selectedUserForDelete.id);
      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error("Deletion failed");
    } finally {
      setIsDeleting(false);
      setSelectedUserForDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
        <span className="size-8 border-4 border-slate-200 dark:border-slate-800 border-t-[#3b82f6] rounded-full animate-spin mb-4"></span>
        <p className="text-sm font-semibold text-slate-500">Loading user accounts...</p>
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
                <th className="px-6 py-4">Account Details</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4 hidden sm:table-cell">Last Login</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center ltr:text-right rtl:text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="size-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500 shrink-0">
                        <UserIcon className="size-5 text-[#0384c4]" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{user.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                      <ShieldAlert className="size-3.5" />
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <Clock className="size-3.5" />
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide border ${
                      user.status === "Active" 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' 
                        : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                    }`}>
                      <span className={`size-1.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2 ltr:ml-auto rtl:mr-auto w-fit">
                      <button 
                        onClick={() => handleOpenEdit(user)}
                        className="p-2 text-slate-400 hover:text-[#0384c4] hover:bg-[#0384c4]/10 rounded-lg transition-colors border border-transparent hover:border-[#0384c4]/20"
                        title="Edit User"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button 
                        onClick={() => handleOpenDelete(user)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-500/20"
                        title="Remove User"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Key className="size-8 text-slate-300 dark:text-slate-600 mb-2" />
                      <p className="font-semibold text-slate-900 dark:text-slate-100">No Users Found</p>
                      <p className="text-sm">Click "Add User" to create a new system administrator.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <UserFormModal 
        isOpen={isEditModalOpen} 
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUserForEdit(null);
        }} 
        initialData={selectedUserForEdit}
        onSubmit={async (payload: UserPayload) => {
          if (selectedUserForEdit) {
            await onEdit(selectedUserForEdit.id, payload);
          }
        }}
      />

      <DeleteConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => {
          if(!isDeleting) setIsDeleteModalOpen(false);
        }}
        onConfirm={handleConfirmDelete}
        doctorName={selectedUserForDelete?.name || ""}
        isDeleting={isDeleting}
      />
    </>
  );
}
