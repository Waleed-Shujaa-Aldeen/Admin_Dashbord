import { Patient } from "@/domain/entities/Patient";

export function PatientTable({ patients, loading }: { patients: Patient[]; loading: boolean }) {
  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading patients...</div>;
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient ID</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Visit</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Balance</th>
              <th className="px-6 py-4 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {patients.map((patient) => (
              <tr key={patient.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 font-medium text-xs">
                      {patient.initials}
                    </div>
                    <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">{patient.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{patient.id}</td>
                <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{patient.lastVisit}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    patient.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    patient.status === 'Pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {patient.status}
                  </span>
                </td>
                <td className={`px-6 py-4 text-sm font-semibold text-right ${patient.balance > 0 ? 'text-red-500' : 'text-slate-900 dark:text-slate-100'}`}>
                  ${patient.balance.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
