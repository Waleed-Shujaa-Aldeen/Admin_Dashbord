import { Staff } from "@/domain/entities/Staff";

export function StaffCard({ staffMember }: { staffMember: Staff }) {
  const isStatusActive = staffMember.status === "Active";

  return (
    <div className={`bg-white dark:bg-slate-900 border rounded-xl p-5 hover:shadow-lg transition-shadow ${isStatusActive ? 'border-[#0384c4]/30 ring-2 ring-[#0384c4]/20' : 'border-[#0384c4]/10'}`}>
      <div className="flex items-start justify-between mb-4">
        <div 
          className="size-16 rounded-lg bg-cover bg-center border-2 border-[#0384c4]/10" 
          style={{ backgroundImage: `url('${staffMember.imageUrl}')` }}
        ></div>
        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
          isStatusActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
          staffMember.status === 'On Break' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
          'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
        }`}>
          {staffMember.status}
        </span>
      </div>
      <h3 className="font-bold text-lg mb-1 text-slate-900 dark:text-slate-100">{staffMember.name}</h3>
      <p className="text-[#0384c4] text-sm font-medium mb-4">{staffMember.role}</p>
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
        <span className="material-symbols-outlined text-sm">schedule</span>
        Shift: {staffMember.shiftHours}
      </div>
      <button className={`w-full py-2 rounded-lg transition-all text-sm font-semibold flex items-center justify-center gap-2 ${
        isStatusActive ? 'bg-[#0384c4] text-white hover:bg-[#0384c4]/90' : 'bg-[#0384c4]/5 hover:bg-[#0384c4] text-[#0384c4] hover:text-white border border-[#0384c4]/20'
      }`}>
        <span className="material-symbols-outlined text-sm">calendar_month</span>
        Manage Time-Off
      </button>
    </div>
  );
}
