"use client";

import { useState } from "react";
import Header from "@/presentation/components/layout/Header";
import { useUsers } from "@/application/services/useUsers";
import { UserDataTable } from "@/presentation/components/users/UserDataTable";
import { UserFormModal } from "@/presentation/components/users/UserFormModal";
import { UserPlus } from "lucide-react";

export default function UsersPage() {
  const { users, loading, addUser, editUser, removeUser } = useUsers();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <>
      <Header title="Administrative Users" />
      <div className="px-6 lg:px-10 pb-12">
        <header className="py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">User Management</h2>
            <p className="text-slate-500 text-sm mt-1">Manage system administrators, permissions, and clinic access.</p>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#0384c4] text-white px-5 h-10 rounded-lg flex items-center gap-2 hover:bg-[#0384c4]/90 shadow-md shadow-[#0384c4]/20 transition-all font-bold text-sm shrink-0 rtl:mr-auto ltr:ml-auto"
          >
            <UserPlus className="size-4" />
            Add User
          </button>
        </header>

        <UserDataTable 
          users={users}
          loading={loading}
          onEdit={editUser}
          onDelete={removeUser}
        />

        <UserFormModal 
          isOpen={isAddModalOpen}
          initialData={null}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={async (payload) => {
            await addUser(payload);
          }}
        />
      </div>
    </>
  );
}
