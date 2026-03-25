import { useState, useEffect } from "react";
import { X, Save, UserPlus, Shield, User, MapPin, Stethoscope, Briefcase, Calendar, DollarSign } from "lucide-react";
import { Doctor, DoctorPayload, DoctorStatus } from "@/domain/entities/Doctor";

interface DoctorFormModalProps {
  isOpen: boolean;
  initialData?: Doctor | null;
  onClose: () => void;
  onSubmit: (payload: DoctorPayload) => Promise<void>;
}

/** Generate a random temporary password for the doctor account */
function generateTempPassword(): string {
  return `Doctor@${Math.floor(100000 + Math.random() * 900000)}`;
}

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  specialization: string;
  licenseNumber: string;
  biography: string;
  address: string;
  consultationFee: number;
  yearsOfExperience: number;
  licenseIssuedAt: string;
  licenseExpiryAt: string;
  status: DoctorStatus;
}

export function DoctorFormModal({ isOpen, initialData, onClose, onSubmit }: DoctorFormModalProps) {
  const isEditing = !!initialData;

  const [formData, setFormData] = useState<FormState>({
    fullName: "",
    specialization: "",
    email: "",
    phone: "",
    gender: "Male",
    licenseNumber: "",
    biography: "",
    address: "",
    consultationFee: 0,
    yearsOfExperience: 0,
    licenseIssuedAt: "",
    licenseExpiryAt: "",
    status: "Active",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        fullName: initialData.fullName,
        specialization: initialData.specialization,
        email: initialData.email,
        phone: initialData.phone,
        gender: initialData.gender || "Male",
        licenseNumber: initialData.licenseNumber,
        biography: initialData.biography,
        address: initialData.address,
        consultationFee: initialData.consultationFee,
        yearsOfExperience: initialData.yearsOfExperience,
        licenseIssuedAt: initialData.licenseIssuedAt?.split('T')[0] || "",
        licenseExpiryAt: initialData.licenseExpiryAt?.split('T')[0] || "",
        status: initialData.status,
      });
    } else {
      setFormData({
        fullName: "",
        specialization: "",
        email: "",
        phone: "",
        gender: "Male",
        licenseNumber: "",
        biography: "",
        address: "",
        consultationFee: 0,
        yearsOfExperience: 0,
        licenseIssuedAt: "",
        licenseExpiryAt: "",
        status: "Active",
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!/^\d{9}$/.test(formData.phone)) {
      alert("Phone number must be exactly 9 numeric digits.");
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: DoctorPayload = { 
        user: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          gender: formData.gender,
          // Auto-generate a temp password for new doctors to satisfy backend requirements
          ...(isEditing ? {} : { password: generateTempPassword() }),
        },
        specialization: formData.specialization,
        licenseNumber: formData.licenseNumber,
        biography: formData.biography,
        address: formData.address,
        consultationFee: formData.consultationFee,
        yearsOfExperience: formData.yearsOfExperience,
        ...(formData.licenseIssuedAt ? { licenseIssuedAt: formData.licenseIssuedAt } : {}),
        ...(formData.licenseExpiryAt ? { licenseExpiryAt: formData.licenseExpiryAt } : {}),
        status: formData.status,
        isAvailable: true, // Mandatory for new doctors
      };
      
      console.log("🚀 SUBMITTING DOCTOR PAYLOAD:", payload);
      await onSubmit(payload);
      onClose();
    } catch (error) {
      console.error("Failed to submit form", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FormState, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex rtl:justify-start ltr:justify-end bg-slate-900/20 backdrop-blur-sm transition-all duration-300">
      <div 
        className="w-full max-w-2xl h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-s border-s-slate-200 dark:border-s-slate-800 rtl:border-s-0 rtl:border-e rtl:border-e-slate-200 dark:rtl:border-e-slate-800 animate-in slide-in-from-right rtl:slide-in-from-left duration-300"
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-[#3b82f6]/10 text-[#3b82f6] rounded-xl flex items-center justify-center">
              {isEditing ? <Save className="size-5" /> : <UserPlus className="size-5" />}
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {isEditing ? "Edit Provider" : "Add New Provider"}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          <form id="doctor-form" onSubmit={handleSubmit} className="flex flex-col gap-8">
            
            {/* User Account Section */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 text-[#3b82f6]">
                <Shield className="size-5" />
                <h3 className="font-bold">User Account</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. Dr. Sarah Jenkins"
                    className="h-11 px-3 w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6] transition-all"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
                  <input 
                    required
                    type="email" 
                    placeholder="doctor@medlink.com"
                    className="h-11 px-3 w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6] transition-all"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Phone Number</label>
                  <input 
                    required
                    type="tel" 
                    placeholder="+1 (555) 000-0000"
                    className="h-11 px-3 w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6] transition-all"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Gender</label>
                  <select 
                    className="h-11 px-3 w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6] transition-all"
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                 <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Status</label>
                  <select 
                    className="h-11 px-3 w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6] transition-all"
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value as "Active" | "Inactive")}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Doctor Profile Section */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 text-[#3b82f6]">
                <Stethoscope className="size-5" />
                <h3 className="font-bold">Doctor Profile</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Specialization</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. Cardiology"
                    className="h-11 px-3 w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6] transition-all"
                    value={formData.specialization}
                    onChange={(e) => handleInputChange('specialization', e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">License Number</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. LIC-123456"
                    className="h-11 px-3 w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6] transition-all"
                    value={formData.licenseNumber}
                    onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Consultation Fee</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <input 
                      required
                      type="number" 
                      placeholder="0.00"
                      className="h-11 pl-9 pr-3 w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6] transition-all"
                      value={formData.consultationFee}
                      onChange={(e) => handleInputChange('consultationFee', Number(e.target.value))}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Years of Experience</label>
                  <input 
                    required
                    type="number" 
                    placeholder="0"
                    className="h-11 px-3 w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6] transition-all"
                    value={formData.yearsOfExperience}
                    onChange={(e) => handleInputChange('yearsOfExperience', Number(e.target.value))}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">License Issued At</label>
                  <input 
                    required
                    type="date" 
                    className="h-11 px-3 w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6] transition-all"
                    value={formData.licenseIssuedAt}
                    onChange={(e) => handleInputChange('licenseIssuedAt', e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">License Expiry At</label>
                  <input 
                    required
                    type="date" 
                    className="h-11 px-3 w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6] transition-all"
                    value={formData.licenseExpiryAt}
                    onChange={(e) => handleInputChange('licenseExpiryAt', e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Address</label>
                  <textarea 
                    required
                    rows={2}
                    placeholder="Full clinic or office address"
                    className="p-3 w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6] transition-all resize-none"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Biography</label>
                  <textarea 
                    required
                    rows={3}
                    placeholder="Short professional biography"
                    className="p-3 w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6] transition-all resize-none"
                    value={formData.biography}
                    onChange={(e) => handleInputChange('biography', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex gap-3">
          <button 
            type="button"
            onClick={onClose}
            className="flex-1 h-11 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg shadow-sm transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            form="doctor-form"
            disabled={isSubmitting}
            className="flex-1 h-11 px-4 text-sm font-bold text-white bg-[#3b82f6] hover:bg-blue-600 rounded-lg shadow-md shadow-blue-500/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Saving...
              </span>
            ) : isEditing ? "Save Changes" : "Register Doctor"}
          </button>
        </div>
      </div>
    </div>
  );
}
