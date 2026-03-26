import { useState, useEffect } from "react";
import { Receptionist, ReceptionistPayload } from "@/domain/entities/Receptionist";
import { X, Loader2 } from "lucide-react";

interface ReceptionistFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: ReceptionistPayload) => Promise<void>;
  initialData?: Receptionist | null;
}

export function ReceptionistFormModal({ isOpen, onClose, onSubmit, initialData }: ReceptionistFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ReceptionistPayload>({
    name: "",
    phone: "",
    shift: "Morning",
    status: "Active"
  });

  useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        name: initialData.name,
        phone: initialData.phone,
        shift: initialData.shift,
        status: initialData.status
      });
    } else if (isOpen && !initialData) {
      setFormData({
        name: "",
        phone: "",
        shift: "Morning",
        status: "Active"
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      // Error handled in hook via Toast
    } finally {
      setLoading(false);
    }
  };

  const isEdit = !!initialData;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden shadow-slate-900/20 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
            {isEdit ? "Edit Receptionist" : "Add Receptionist"}
          </h3>
          <button 
            type="button"
            onClick={onClose} 
            disabled={loading}
            className="p-2 -mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors disabled:opacity-50"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 block">Full Name</label>
              <input 
                required
                type="text"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                disabled={loading}
                className="w-full h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 px-3 text-sm disabled:opacity-50"
              />
            </div>
            
            <div className="col-span-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 block">Phone</label>
              <input 
                required
                type="tel"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                disabled={loading}
                className="w-full h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 px-3 text-sm disabled:opacity-50"
              />
            </div>

            <div className="col-span-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 block">Shift</label>
              <select 
                value={formData.shift}
                onChange={e => setFormData({...formData, shift: e.target.value})}
                disabled={loading}
                className="w-full h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 px-3 text-sm disabled:opacity-50"
              >
                <option value="Morning">Morning</option>
                <option value="Evening">Evening</option>
                <option value="Night">Night</option>
              </select>
            </div>

            <div className="col-span-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 block">Status</label>
              <select 
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value as "Active" | "Inactive"})}
                disabled={loading}
                className="w-full h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 px-3 text-sm disabled:opacity-50"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 mt-2">
            <button 
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 font-semibold text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-lg shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Receptionist"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
