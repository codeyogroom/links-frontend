import React, { useState } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { Upload, CheckCircle2, RefreshCw, AlertTriangle, GitCompare, FileSpreadsheet } from 'lucide-react';

function ProjectReconcile() {
  const { id } = useParams();
  const context = useOutletContext();
  const project = context?.project;

  const [file, setFile] = useState(null);
  const [reconciling, setReconciling] = useState(false);
  const [reconcileResult, setReconcileResult] = useState(null);

  // If Child Project (has parentProjectId)
  if (project?.parentProjectId) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-12 md:p-16 text-center shadow-xs min-h-[420px] flex flex-col items-center justify-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 border border-rose-100">
          <AlertTriangle size={28} />
        </div>
        <h2 className="text-xl font-bold text-rose-600 mb-2">
          Reconcile Process is not available in Child Project.
        </h2>
        <p className="text-xs text-slate-500 max-w-md">
          Child projects inherit billing reconciliation and status adjustments directly from their parent project. Please open the parent project to run true-up operations.
        </p>
      </div>
    );
  }

  // Parent Project view
  const handleUploadReconcile = async () => {
    if (!file) return alert('Please select a reconciliation CSV/Excel file.');
    setReconciling(true);
    try {
      setTimeout(() => {
        setReconcileResult({
          totalProcessed: 24,
          approved: 22,
          rejected: 2,
          message: 'Reconciliation process completed successfully.'
        });
        setReconciling(false);
      }, 1000);
    } catch (e) {
      console.error(e);
      alert('Error processing reconciliation file.');
      setReconciling(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-xs min-h-[500px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <GitCompare size={20} className="text-blue-600" />
            Project Reconciliation & True-Up
          </h1>
          <p className="text-xs text-slate-500 mt-1">Upload client true-up sheets to synchronize finalized respondent outcomes and recalculate margins.</p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xs flex items-center transition">
            <RefreshCw size={13} className="mr-1.5" /> Run True-Up Sync
          </button>
        </div>
      </div>

      {/* File Upload Section */}
      <div className="bg-slate-50/70 border border-slate-200/80 p-6 rounded-2xl mb-8 max-w-2xl">
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
          Upload Client Reconciliation File (.csv, .xlsx)
        </label>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input 
            type="file" 
            accept=".csv,.xlsx,.txt" 
            onChange={e => setFile(e.target.files[0])}
            className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
          />
          <button 
            onClick={handleUploadReconcile}
            disabled={reconciling || !file}
            className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs flex items-center justify-center transition disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
          >
            <Upload size={13} className="mr-1.5" /> {reconciling ? 'Processing...' : 'Upload & Reconcile'}
          </button>
        </div>
        <p className="text-[11px] text-slate-500 mt-2.5">
          Expected file columns: <code className="bg-white px-1.5 py-0.5 border border-slate-200 rounded font-mono text-[10px]">TTPID</code>, <code className="bg-white px-1.5 py-0.5 border border-slate-200 rounded font-mono text-[10px]">Status_ID</code>
        </p>
      </div>

      {reconcileResult && (
        <div className="bg-emerald-50 border border-emerald-200/80 p-4 rounded-xl mb-6 text-xs text-emerald-900 flex items-center justify-between">
          <div className="flex items-center">
            <CheckCircle2 size={16} className="text-emerald-600 mr-2 flex-shrink-0" />
            <span>{reconcileResult.message} ({reconcileResult.approved} Approved, {reconcileResult.rejected} Rejected)</span>
          </div>
        </div>
      )}

      {/* Reconciliation Guidelines & Mapping */}
      <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="bg-slate-50/80 px-5 py-3 border-b border-slate-200/80 font-bold text-xs text-slate-800">
          Accepted Status ID Codes for Reconciliation
        </div>
        <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-50/60 p-3 rounded-xl border border-slate-200/60">
            <span className="font-bold text-emerald-600 block mb-0.5">6 : Completed</span>
            <span className="text-[10px] text-slate-500">Billable completion</span>
          </div>
          <div className="bg-slate-50/60 p-3 rounded-xl border border-slate-200/60">
            <span className="font-bold text-amber-600 block mb-0.5">7 : Disqualified</span>
            <span className="text-[10px] text-slate-500">Screener exit</span>
          </div>
          <div className="bg-slate-50/60 p-3 rounded-xl border border-slate-200/60">
            <span className="font-bold text-purple-600 block mb-0.5">8 : Quota FULL</span>
            <span className="text-[10px] text-slate-500">Target cap met</span>
          </div>
          <div className="bg-slate-50/60 p-3 rounded-xl border border-slate-200/60">
            <span className="font-bold text-rose-600 block mb-0.5">10+ : Rejected</span>
            <span className="text-[10px] text-slate-500">Security / Speeding</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectReconcile;
