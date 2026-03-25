import { useState, useEffect } from "react";
import { AlertCircle, CalendarRange, Trash2, ShieldAlert, Loader2, Info, CheckCircle2, UserX } from "lucide-react";
import { useDoctors } from "@/application/services/useDoctors";
import { useDateExceptions } from "@/application/services/useDateExceptions";
import { ExceptionReason } from "@/domain/entities/DateException";
import { AppointmentRepository } from "@/infrastructure/api/AppointmentRepository";
import { Appointment } from "@/domain/entities/Appointment";
import { TimeUtility } from "@/application/utils/TimeUtility";

export function DateExceptionsManager() {
  const { doctors, loading: loadingDoctors } = useDoctors();
  const { addExceptionRange, removeException, useExceptionsList } = useDateExceptions();

  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
  const { data: exceptions = [], isLoading: loadingExceptions } = useExceptionsList(selectedDoctorId);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState<ExceptionReason>("Vacation");
  
  // Impact Check State
  const [checkingImpact, setCheckingImpact] = useState(false);
  const [impactedApps, setImpactedApps] = useState<Appointment[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorId || !startDate || !endDate || !reason) return;
    
    if (startDate > endDate) {
      alert("End date must be after start date.");
      return;
    }

    try {
      setCheckingImpact(true);
      const apps = await AppointmentRepository.checkImpact(selectedDoctorId, startDate, endDate);
      setImpactedApps(apps);
      
      const isWithin24h = TimeUtility.isWithin24Hours(startDate);
      setIsEmergency(isWithin24h);
      
      setShowConfirmModal(true);
    } catch (err) {
    } finally {
      setCheckingImpact(false);
    }
  };

  const confirmAndAdd = async () => {
    try {
      await addExceptionRange(selectedDoctorId, startDate, endDate, reason);
      setStartDate("");
      setEndDate("");
      setShowConfirmModal(false);
    } catch (err) {}
  };

  const handleDelete = async (exceptionId: string) => {
    if (window.confirm("Authorize permanent deletion of this exception?")) {
      await removeException(selectedDoctorId, exceptionId);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-950 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-5">
          <div className="size-14 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center text-red-600 border border-red-100 dark:border-red-800/30">
            <CalendarRange className="size-7" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight italic">Emergency Exception Hub</h2>
            <p className="text-sm font-bold text-slate-500 flex items-center gap-1.5 uppercase tracking-widest mt-0.5">
              <span className="size-2 bg-red-500 rounded-full animate-pulse" /> Personnel Attendance & Overrides
            </p>
          </div>
        </div>
      </div>

      <div className="p-8 flex flex-col gap-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-end p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="lg:col-span-1 flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Provider</label>
            <select 
              className="h-12 w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 text-sm font-bold shadow-sm focus:ring-2 focus:ring-red-500/10 outline-none"
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              disabled={loadingDoctors}
            >
              <option value="">-- Select Provider --</option>
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>{doc.fullName}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Lockout Start</label>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-12 w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 text-sm font-bold"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Lockout End</label>
            <input 
              type="date" 
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-12 w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 text-sm font-bold"
            />
          </div>

          <button 
            onClick={handleInitialSubmit}
            disabled={!selectedDoctorId || !startDate || checkingImpact}
            className="h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs uppercase tracking-widest rounded-xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {checkingImpact ? <Loader2 className="size-4 animate-spin" /> : <ShieldAlert className="size-4" />}
            Analyze Impact
          </button>
        </div>

        {selectedDoctorId && (
          <div className="flex flex-col gap-4">
             <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Info className="size-4" /> Active Exceptions Timeline
                </h3>
             </div>

             <div className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-950 shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Effective Date</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Classification</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 text-center">Security</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-900">
                    {loadingExceptions ? (
                      <tr><td colSpan={3} className="px-6 py-12 text-center text-slate-400 italic">Syncing records...</td></tr>
                    ) : exceptions.map((exp) => (
                      <tr key={exp.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-black text-slate-700 dark:text-slate-200">{exp.date}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2 py-1 bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase rounded text-slate-500">
                            {exp.reason}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button 
                            onClick={() => handleDelete(exp.id)}
                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </div>
        )}
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col gap-8 relative overflow-hidden">
            
            {isEmergency && (
               <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-red-600 via-orange-500 to-red-600 animate-pulse" />
            )}

            <div className="flex flex-col items-center text-center gap-4">
              <div className={`size-20 rounded-3xl flex items-center justify-center border shadow-lg ${isEmergency ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-950 dark:border-red-900' : 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950 dark:border-blue-900'}`}>
                {isEmergency ? <ShieldAlert className="size-10" /> : <Info className="size-10" />}
              </div>
              <div>
                <h3 className={`text-2xl font-black italic tracking-tighter ${isEmergency ? 'text-red-600' : 'text-slate-900 dark:text-white'}`}>
                  {isEmergency ? "Emergency Admin Override" : "Confirm Exception Impact"}
                </h3>
                <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-widest">
                  Analyzing Date Lockout Protocol
                </p>
              </div>
            </div>

            {isEmergency && (
              <div className="p-5 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900 rounded-3xl">
                <div className="flex gap-4">
                  <AlertCircle className="size-6 text-red-600 shrink-0" />
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-black text-red-700 dark:text-red-400 uppercase tracking-tight italic">24h Lockout Violation detected</span>
                    <span className="text-xs font-bold text-red-600/80 leading-relaxed">
                      You are modifying the schedule in &lt;24 hours. This bypasses standard patient cancellation buffers and will trigger instant emergency notifications.
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className={`p-6 rounded-3xl border flex flex-col gap-4 ${impactedApps.length > 0 ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30' : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30'}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-slate-500 flex items-center gap-2">
                  <UserX className="size-4" /> Affected Appointments
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-black italic ${impactedApps.length > 0 ? 'bg-amber-200 text-amber-800' : 'bg-emerald-200 text-emerald-800'}`}>
                  {impactedApps.length} Found
                </span>
              </div>
              
              {impactedApps.length > 0 ? (
                <div className="flex flex-col gap-2 max-h-32 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-amber-200">
                  {impactedApps.map(app => (
                    <div key={app.id} className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300 bg-white/50 dark:bg-slate-800/50 p-2 rounded-lg border border-amber-100 dark:border-amber-900/20">
                      <span>{app.patientName}</span>
                      <span className="text-slate-400 uppercase text-[10px]">{app.time}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-3 text-emerald-600">
                  <CheckCircle2 className="size-5" />
                  <span className="text-xs font-bold tracking-tight uppercase">Perfect Alignment: No existing appointments conflict with this date.</span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={confirmAndAdd}
                className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all ${isEmergency ? 'bg-red-600 text-white shadow-red-500/30' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-slate-900/20'}`}
              >
                {isEmergency ? "Authorize Emergency Override" : "Finalize Deployment"}
              </button>
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="w-full py-3 text-slate-400 hover:text-slate-600 font-bold text-xs uppercase tracking-widest transition-all"
              >
                Abort Protocol
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
