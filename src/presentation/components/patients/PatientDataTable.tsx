import { useState } from "react";
import { Patient } from "@/domain/entities/Patient";
import { Search, Filter, Clock, Pencil, Trash2, Mail, Phone } from "lucide-react";

interface PatientDataTableProps {
  patients: Patient[];
  loading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenOversight: (patient: Patient) => void;
  onEdit: (patient: Patient) => void;
  onDelete: (id: string) => void;
}

import { useAuth } from "@/application/providers/AuthProvider";

export function PatientDataTable({ patients, loading, searchQuery, onSearchChange, onOpenOversight, onEdit, onDelete }: PatientDataTableProps) {
  const { canDeleteRecords } = useAuth();
  
  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full group">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#3b82f6] transition-colors" />
          <input 
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6] outline-none transition-all text-sm font-medium text-slate-900 dark:text-slate-100 shadow-sm" 
            placeholder="Search patients by name, ID or phone..." 
            type="text" 
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300 shadow-sm">
            <Filter className="size-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="h-[400px] flex flex-col items-center justify-center">
            <span className="size-8 border-4 border-slate-200 dark:border-slate-800 border-t-[#3b82f6] rounded-full animate-spin mb-4"></span>
            <p className="text-sm font-semibold text-slate-500">Fetching records...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4">Patient Profile</th>
                  <th className="px-6 py-4 hidden md:table-cell">Contact</th>
                  <th className="px-6 py-4">Last Visit</th>
                  <th className="px-6 py-4">Account Status</th>
                  <th className="px-6 py-4 text-center ltr:text-right rtl:text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {patients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 bg-[#3b82f6]/10 text-[#3b82f6] rounded-full flex items-center justify-center font-bold text-sm shrink-0 border border-[#3b82f6]/20">
                          {patient.initials}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#3b82f6] transition-colors">{patient.name}</p>
                          <p className="text-xs font-semibold text-slate-400">ID: {patient.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="flex flex-col gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <Mail className="size-3.5" /> {patient.email || <span className="text-slate-400 italic">No email</span>}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Phone className="size-3.5" /> {patient.phone || <span className="text-slate-400 italic">No phone</span>}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{patient.lastVisit}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border ${
                          patient.status === "Active" ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' : 
                          patient.status === "Pending" ? 'bg-amber-50 text-amber-700 border-amber-200/60' :
                          'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          <span className={`size-1.5 rounded-full ${patient.status === 'Active' ? 'bg-emerald-500' : patient.status === 'Pending' ? 'bg-amber-500' : 'bg-slate-400'}`}></span>
                          {patient.status}
                        </span>
                        {patient.balance > 0 && (
                          <span className="text-[11px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                            Due: ${patient.balance.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1.5 ltr:ml-auto rtl:mr-auto w-fit">
                        <button 
                          onClick={() => onOpenOversight(patient)}
                          className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-1.5 flex items-center gap-1.5 rounded-md text-xs font-bold transition-all shadow-sm"
                          title="Patient Oversight & History"
                        >
                          <Clock className="size-3.5" />
                          Oversight
                        </button>
                        
                        <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1"></div>

                        <button 
                          onClick={() => onEdit(patient)}
                          className="p-1.5 text-slate-400 hover:text-[#3b82f6] hover:bg-[#3b82f6]/10 rounded transition-colors"
                          title="Edit Basic Profile"
                        >
                          <Pencil className="size-4" />
                        </button>
                        {canDeleteRecords && (
                          <button 
                            onClick={() => onDelete(patient.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                
                {patients.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      <p className="font-semibold text-slate-900 dark:text-slate-100 mt-2">No patients found</p>
                      <p className="text-sm">Try adjusting your search criteria.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
