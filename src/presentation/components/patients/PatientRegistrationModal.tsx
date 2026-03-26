"use client";

import { useState, useEffect } from "react";
import { UserPlus, Save, X } from "lucide-react";
import { Patient, PatientRegistrationPayload } from "@/domain/entities/Patient";

interface PatientRegistrationModalProps {
  isOpen: boolean;
  initialData?: Patient | null;
  onClose: () => void;
  onSubmit: (payload: PatientRegistrationPayload) => Promise<Patient | void>;
}

/** Generate a random temporary password for the patient account */
function generateTempPassword(): string {
  return `Patient@${Math.floor(100000 + Math.random() * 900000)}`;
}

type FormState = {
  fullName: string;
  phone: string;
  gender: number;
  location: string;
  dateOfBirth: string;
  bloodGroup: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
};

export function PatientRegistrationModal({
  isOpen,
  initialData,
  onClose,
  onSubmit,
}: PatientRegistrationModalProps) {
  const isEditing = !!initialData;

  const emptyForm = (): FormState => ({
    fullName: "",
    phone: "",
    gender: 0,
    location: "",
    dateOfBirth: "",
    bloodGroup: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
  });

  const [form, setForm] = useState<FormState>(emptyForm());
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setForm({
          fullName: initialData.name || "",
          phone: initialData.phone || "",
          gender:
            initialData.gender === "Male" ? 0 : initialData.gender === "Female" ? 1 : 2,
          location: initialData.location || "",
          dateOfBirth: initialData.dob || "",
          bloodGroup: initialData.bloodGroup || "",
          emergencyContactName: initialData.emergencyContactName || "",
          emergencyContactPhone: initialData.emergencyContactPhone || "",
        });
      } else {
        setForm(emptyForm());
      }
      setTouched({});
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  /* ─── Validation ─── */
  const errors: Partial<Record<keyof FormState, string>> = {};
  if (!form.fullName.trim()) errors.fullName = "Full name is required.";
  if (!/^\d{9}$/.test(form.phone)) errors.phone = "Phone must be exactly 9 digits.";
  if (!form.location.trim()) errors.location = "Location is required.";
  else if (form.location.length > 50) errors.location = "Location cannot exceed 50 characters.";
  if (form.dateOfBirth && new Date(form.dateOfBirth) >= new Date())
    errors.dateOfBirth = "Date of birth must be in the past.";
  if (form.bloodGroup && form.bloodGroup.length > 5)
    errors.bloodGroup = "Blood group cannot exceed 5 characters.";
  if (form.emergencyContactName && form.emergencyContactName.length > 100)
    errors.emergencyContactName = "Name cannot exceed 100 characters.";
  if (form.emergencyContactPhone && !/^\d{0,9}$/.test(form.emergencyContactPhone))
    errors.emergencyContactPhone = "Phone must be numeric, max 9 digits.";

  const isValid = Object.keys(errors).length === 0;

  const blur = (field: keyof FormState) =>
    setTouched((p) => ({ ...p, [field]: true }));

  const set = (field: keyof FormState, value: string | number) =>
    setForm((p) => ({ ...p, [field]: value }));

  const fieldClass = (field: keyof FormState) =>
    `h-11 px-3 w-full bg-white dark:bg-slate-900 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors ${
      touched[field] && errors[field]
        ? "border-red-400 focus:ring-red-200 dark:focus:ring-red-900/30 bg-red-50/50 dark:bg-red-500/5"
        : "border-slate-300 dark:border-slate-700 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6]"
    }`;

  const errorMsg = (field: keyof FormState) =>
    touched[field] && errors[field] ? (
      <span className="text-xs font-semibold text-red-500 flex items-center gap-1 mt-1">
        <span className="size-1.5 rounded-full bg-red-500 shrink-0" />
        {errors[field]}
      </span>
    ) : null;

  /* ─── Submit ─── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) {
      // Touch all fields to show all errors
      setTouched(
        Object.fromEntries(
          Object.keys(emptyForm()).map((k) => [k, true])
        ) as Record<keyof FormState, boolean>
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: PatientRegistrationPayload = {
        user: {
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          gender: form.gender,
          // Auto-generate a temp password so the backend gets what it needs
          // The patient can reset it later via the forgot-password flow
          ...(isEditing ? {} : { password: generateTempPassword() }),
        },
        location: form.location.trim(),
        ...(form.dateOfBirth ? { dateOfBirth: form.dateOfBirth } : {}),
        ...(form.bloodGroup ? { bloodGroup: form.bloodGroup.trim() } : {}),
        ...(form.emergencyContactName
          ? { emergencyContactName: form.emergencyContactName.trim() }
          : {}),
        ...(form.emergencyContactPhone
          ? { emergencyContactPhone: form.emergencyContactPhone.trim() }
          : {}),
      };

      await onSubmit(payload);
      onClose();
    } catch {
      // Error is handled by toast in usePatients
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex rtl:justify-start ltr:justify-end bg-slate-900/40 backdrop-blur-sm">
      <div className="w-full max-w-lg h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-s border-slate-200 dark:border-slate-800 rtl:border-s-0 rtl:border-e rtl:border-e-slate-200 dark:rtl:border-e-slate-800 animate-in slide-in-from-right rtl:slide-in-from-left duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-[#3b82f6]/10 text-[#3b82f6] rounded-xl flex items-center justify-center">
              {isEditing ? <Save className="size-5" /> : <UserPlus className="size-5" />}
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {isEditing ? "Edit Patient" : "Register Patient"}
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <form id="patient-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
            
            {/* ── Personal ── */}
            <section className="space-y-4">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
                Personal Details
              </h3>

              {/* Full Name */}
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  disabled={isSubmitting}
                  className={fieldClass("fullName")}
                  value={form.fullName}
                  onChange={(e) => set("fullName", e.target.value)}
                  onBlur={() => blur("fullName")}
                />
                {errorMsg("fullName")}
              </div>



              <div className="grid grid-cols-2 gap-4">
                {/* Phone */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Phone <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="9 digits"
                    disabled={isSubmitting}
                    className={fieldClass("phone")}
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    onBlur={() => blur("phone")}
                  />
                  {errorMsg("phone")}
                </div>

                {/* Gender */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Gender <span className="text-red-400">*</span>
                  </label>
                  <select
                    disabled={isSubmitting}
                    className={fieldClass("gender")}
                    value={form.gender}
                    onChange={(e) => set("gender", parseInt(e.target.value))}
                  >
                    <option value={0}>Male</option>
                    <option value={1}>Female</option>
                    <option value={2}>Other</option>
                  </select>
                </div>
              </div>
            </section>

            {/* ── Medical ── */}
            <section className="space-y-4">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
                Medical Info
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {/* Location */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Location <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Riyadh"
                    disabled={isSubmitting}
                    className={fieldClass("location")}
                    value={form.location}
                    onChange={(e) => set("location", e.target.value)}
                    onBlur={() => blur("location")}
                  />
                  {errorMsg("location")}
                </div>

                {/* Blood Group */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Blood Group
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. O+"
                    disabled={isSubmitting}
                    className={fieldClass("bloodGroup")}
                    value={form.bloodGroup}
                    onChange={(e) => set("bloodGroup", e.target.value)}
                    onBlur={() => blur("bloodGroup")}
                  />
                  {errorMsg("bloodGroup")}
                </div>
              </div>

              {/* DOB */}
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Date of Birth
                </label>
                <input
                  type="date"
                  disabled={isSubmitting}
                  className={fieldClass("dateOfBirth")}
                  value={form.dateOfBirth}
                  onChange={(e) => set("dateOfBirth", e.target.value)}
                  onBlur={() => blur("dateOfBirth")}
                />
                {errorMsg("dateOfBirth")}
              </div>
            </section>

            {/* ── Emergency ── */}
            <section className="space-y-4">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
                Emergency Contact
              </h3>

              {/* Emergency Name */}
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Contact Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Jane Doe"
                  disabled={isSubmitting}
                  className={fieldClass("emergencyContactName")}
                  value={form.emergencyContactName}
                  onChange={(e) => set("emergencyContactName", e.target.value)}
                  onBlur={() => blur("emergencyContactName")}
                />
                {errorMsg("emergencyContactName")}
              </div>

              {/* Emergency Phone */}
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 123456789"
                  disabled={isSubmitting}
                  className={fieldClass("emergencyContactPhone")}
                  value={form.emergencyContactPhone}
                  onChange={(e) => set("emergencyContactPhone", e.target.value)}
                  onBlur={() => blur("emergencyContactPhone")}
                />
                {errorMsg("emergencyContactPhone")}
              </div>
            </section>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 h-11 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="patient-form"
            disabled={isSubmitting || !isValid}
            className={`flex-1 h-11 text-sm font-bold text-white rounded-lg shadow-md transition-all flex items-center justify-center gap-2
              ${isSubmitting || !isValid
                ? "bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed shadow-none"
                : "bg-[#3b82f6] hover:bg-blue-600 shadow-blue-500/20 hover:shadow-lg"}`}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </span>
            ) : isEditing ? "Save Changes" : "Register Patient"}
          </button>
        </div>
      </div>
    </div>
  );
}
