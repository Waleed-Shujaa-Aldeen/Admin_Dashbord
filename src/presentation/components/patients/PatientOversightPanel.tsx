"use client";

import { useEffect, useState } from "react";
import { X, Clock, NotepadText, DollarSign, Stethoscope, FileText, Upload } from "lucide-react";
import { Patient, PatientHistoryEvent } from "@/domain/entities/Patient";

interface PatientOversightPanelProps {
  patient: Patient | null;
  isOpen: boolean;
  onClose: () => void;
  fetchHistory: (id: string) => Promise<PatientHistoryEvent[]>;
  fetchClinicNotes: (id: string) => Promise<string>;
  saveClinicNotes: (id: string, notes: string) => Promise<void>;
  adjustBalance: (id: string, payload: { newBalance: number, reason: string }) => Promise<Patient | void>;
}

type TabType = 'Notes' | 'Balance' | 'History';

export function PatientOversightPanel({ 
  patient, isOpen, onClose, fetchHistory, fetchClinicNotes, saveClinicNotes, adjustBalance 
}: PatientOversightPanelProps) {
  
  const [activeTab, setActiveTab] = useState<TabType>('Notes');
  
  // States
  const [notes, setNotes] = useState("");
  const [originalNotes, setOriginalNotes] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  
  const [historyEvents, setHistoryEvents] = useState<PatientHistoryEvent[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  // Balance States
  const [newBalanceInput, setNewBalanceInput] = useState("");
  const [balanceReason, setBalanceReason] = useState("");
  const [isSavingBalance, setIsSavingBalance] = useState(false);

  useEffect(() => {
    if (isOpen && patient) {
      // Reset and fetch specific tab data based on active tab
      if (activeTab === 'Notes') {
        fetchClinicNotes(patient.id).then(fetchedNotes => {
          setNotes(fetchedNotes);
          setOriginalNotes(fetchedNotes);
        });
      } else if (activeTab === 'History') {
        setIsLoadingHistory(true);
        fetchHistory(patient.id).then(res => {
          setHistoryEvents(res);
          setIsLoadingHistory(false);
        });
      }
      
      if (activeTab === 'Balance') {
        setNewBalanceInput(patient.balance.toString());
        setBalanceReason("");
      }
    }
  }, [isOpen, patient, activeTab, fetchClinicNotes, fetchHistory]);

  if (!isOpen || !patient) return null;

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    await saveClinicNotes(patient.id, notes);
    setOriginalNotes(notes);
    setIsSavingNotes(false);
  };

  const handleAdjustBalance = async () => {
    if (!newBalanceInput || !balanceReason) return;
    setIsSavingBalance(true);
    await adjustBalance(patient.id, { 
      newBalance: parseFloat(newBalanceInput), 
      reason: balanceReason 
    });
    setBalanceReason("");
    setIsSavingBalance(false);
  };

  const renderHistoryIcon = (category: string) => {
    switch (category) {
      case 'Medical': return <Stethoscope className="size-4 text-emerald-600 dark:text-emerald-400" />;
      case 'Financial': return <DollarSign className="size-4 text-amber-600 dark:text-amber-400" />;
      case 'Administrative': return <FileText className="size-4 text-blue-600 dark:text-blue-400" />;
      default: return <Clock className="size-4 text-slate-500" />;
    }
  };

  const renderHistoryBg = (category: string) => {
    switch (category) {
      case 'Medical': return 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800';
      case 'Financial': return 'bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800';
      case 'Administrative': return 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800';
      default: return 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm rtl:space-x-reverse transition-all">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/80">
          <div>
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-[#3b82f6]/10 text-[#3b82f6] flex items-center justify-center font-bold text-sm shrink-0">
                {patient.initials}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  {patient.name}
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border ${
                    patient.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-200/50' :
                    patient.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-200/50' :
                    'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    {patient.status}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">{patient.id} • {patient.phone}</p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <X className="size-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 gap-6 shrink-0 bg-white dark:bg-slate-900">
          {(['Notes', 'Balance', 'History'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === tab 
                  ? 'border-[#3b82f6] text-[#3b82f6]' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {tab === 'Notes' && <NotepadText className="size-4" />}
              {tab === 'Balance' && <DollarSign className="size-4" />}
              {tab === 'History' && <Clock className="size-4" />}
              {tab}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30 dark:bg-slate-900">
          
          {/* TAB: Clinic Notes */}
          {activeTab === 'Notes' && (
            <div className="flex flex-col gap-4">
              <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 rounded-xl p-4">
                <p className="text-xs font-bold text-amber-800 dark:text-amber-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-amber-500"></span>
                  Internal Administrative Notes
                </p>
                <textarea 
                  className="w-full min-h-[160px] p-4 bg-white/60 dark:bg-slate-900/50 border border-amber-200/80 dark:border-amber-700/30 rounded-lg text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all resize-y"
                  placeholder="Review internal clinic notes (e.g. VIP status, behavior protocols, payment arrangements). Not visible to patients."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <div className="flex justify-end">
                <button 
                  onClick={handleSaveNotes}
                  disabled={notes === originalNotes || isSavingNotes}
                  className="px-5 h-9 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white font-bold text-sm rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isSavingNotes ? <span className="size-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></span> : <Upload className="size-3.5" />}
                  Save Notes
                </button>
              </div>
            </div>
          )}

          {/* TAB: Financial Balance */}
          {activeTab === 'Balance' && (
            <div className="flex flex-col gap-6">
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Current Outstanding Balance</p>
                <p className={`text-4xl font-black mt-2 ${patient.balance > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                  ${patient.balance.toFixed(2)}
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-5 flex flex-col gap-4">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Adjust Account Balance</h4>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500">New Balance Amount ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="h-10 px-3 w-full max-w-[200px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6]"
                    value={newBalanceInput}
                    onChange={(e) => setNewBalanceInput(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500">Reason for Adjustment (Required for Auditing)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Payment received on 11/14, Error correction"
                    className="h-10 px-3 w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6]"
                    value={balanceReason}
                    onChange={(e) => setBalanceReason(e.target.value)}
                  />
                </div>

                <button 
                  onClick={handleAdjustBalance}
                  disabled={!balanceReason || isSavingBalance || newBalanceInput === patient.balance.toString()}
                  className="mt-2 h-10 bg-[#3b82f6] hover:bg-blue-600 text-white font-bold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  Confirm Balance Adjustment
                </button>
              </div>
            </div>
          )}

          {/* TAB: History Timeline */}
          {activeTab === 'History' && (
            <div className="flex flex-col">
              {isLoadingHistory ? (
                <div className="py-12 flex flex-col items-center text-slate-400">
                  <Clock className="size-6 animate-spin mb-2" />
                  <p className="text-sm font-semibold">Loading patient history...</p>
                </div>
              ) : historyEvents.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-sm">No historical records found for this patient.</div>
              ) : (
                <div className="ms-4 ltr:border-l-2 rtl:border-r-2 border-slate-200 dark:border-slate-800 space-y-8 py-2">
                  {historyEvents.map((event) => (
                    <div key={event.id} className="relative ps-6 rtl:pr-6 rtl:ps-0 group">
                      <div className={`absolute top-0 ltr:-left-3.5 rtl:-right-3.5 size-7 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center ${renderHistoryBg(event.category)}`}>
                        {renderHistoryIcon(event.category)}
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{event.title}</h4>
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{new Date(event.date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-1 bg-white dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                          {event.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
