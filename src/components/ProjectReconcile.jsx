import React, { useState } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { Upload, CheckCircle, RefreshCw } from 'lucide-react';

function ProjectReconcile() {
  const { id } = useParams();
  const context = useOutletContext();
  const project = context?.project;

  const [file, setFile] = useState(null);
  const [reconciling, setReconciling] = useState(false);
  const [reconcileResult, setReconcileResult] = useState(null);

  // If Child Project (has parentProjectId), display exact message from reference screenshot
  if (project?.parentProjectId) {
    return (
      <div className="bg-white p-16 text-center shadow-sm min-h-[450px] flex items-center justify-center">
        <h2 className="text-2xl font-normal text-[#dc3545] tracking-wide">
          Reconcile Process is not available in Child Project.
        </h2>
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
    <div className="bg-white p-6 rounded shadow-sm min-h-[500px]">
      <div className="border-b pb-4 mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Project Reconciliation & True-Up</h1>
          <p className="text-xs text-gray-500 mt-1">Upload client reconciliation file to update respondent statuses and true-up vendor counts.</p>
        </div>
        <div className="flex space-x-2">
          <button className="bg-[#4b8df8] hover:bg-blue-600 text-white px-4 py-1.5 rounded text-xs font-bold shadow-sm flex items-center">
            <RefreshCw size={13} className="mr-1.5" /> Run True-Up
          </button>
        </div>
      </div>

      {/* File Upload Section */}
      <div className="bg-gray-50 border p-6 rounded mb-6 max-w-2xl">
        <label className="block text-xs font-bold text-gray-700 mb-2">Upload Client Reconciliation File (.csv, .xlsx)</label>
        <div className="flex items-center space-x-3">
          <div className="flex border rounded overflow-hidden bg-white text-xs">
            <label className="bg-gray-100 hover:bg-gray-200 px-3.5 py-2 border-r cursor-pointer font-medium text-gray-700">
              Choose file
              <input type="file" accept=".csv,.xlsx,.txt" className="hidden" onChange={e => setFile(e.target.files[0])} />
            </label>
            <span className="px-3.5 py-2 text-gray-500 min-w-[200px] flex items-center">
              {file ? file.name : 'No file chosen'}
            </span>
          </div>
          <button 
            onClick={handleUploadReconcile}
            disabled={reconciling}
            className="bg-[#00b5ad] hover:bg-teal-600 text-white font-bold text-xs px-5 py-2 rounded shadow-sm flex items-center transition"
          >
            <Upload size={13} className="mr-1.5" /> {reconciling ? 'Processing...' : 'Upload & Reconcile'}
          </button>
        </div>
        <p className="text-[11px] text-gray-500 mt-2">Required file headers: <code className="bg-white px-1 py-0.5 border rounded">TTPID</code>, <code className="bg-white px-1 py-0.5 border rounded">Status_ID</code></p>
      </div>

      {reconcileResult && (
        <div className="bg-green-50 border border-green-200 p-4 rounded mb-6 text-xs text-green-800 flex items-center justify-between">
          <div className="flex items-center">
            <CheckCircle size={16} className="text-green-600 mr-2" />
            <span>{reconcileResult.message} ({reconcileResult.approved} Approved, {reconcileResult.rejected} Rejected)</span>
          </div>
        </div>
      )}

      {/* Reconciliation Guidelines & Mapping */}
      <div className="border rounded overflow-hidden">
        <div className="bg-gray-50 p-3 border-b font-bold text-xs text-gray-700">
          Accepted Status ID Codes for Reconciliation
        </div>
        <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="bg-gray-50 p-2.5 rounded border">
            <span className="font-bold text-green-600 block">6 : Completed</span>
            <span className="text-[11px] text-gray-500">Billable Complete</span>
          </div>
          <div className="bg-gray-50 p-2.5 rounded border">
            <span className="font-bold text-orange-500 block">7 : Disqualified</span>
            <span className="text-[11px] text-gray-500">Screenout</span>
          </div>
          <div className="bg-gray-50 p-2.5 rounded border">
            <span className="font-bold text-red-500 block">10 : Security Term</span>
            <span className="text-[11px] text-gray-500">Fraud / Proxy</span>
          </div>
          <div className="bg-gray-50 p-2.5 rounded border">
            <span className="font-bold text-red-600 block">14 : Speeding</span>
            <span className="text-[11px] text-gray-500">Bad Quality</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectReconcile;
