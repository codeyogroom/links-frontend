import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Save, Trash2, Link2, Upload, FileCheck, AlertCircle } from 'lucide-react';
import api from '../api';
import Loader from './Loader';

function ProjectClientLink() {
  const { id } = useParams();
  const [file, setFile] = useState(null);
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    fetchCodes();
  }, [id]);

  const fetchCodes = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/projects/${id}/client-codes`);
      setCodes(res.data || []);
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = () => {
    if (!file) return alert('Please select a file first.');
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        setIsImporting(true);
        const text = e.target.result;
        const rawCodes = text.split(/\r?\n|,/).map(c => c.trim()).filter(Boolean);
        
        if (rawCodes.length === 0) {
          alert('No valid codes found in file');
          setIsImporting(false);
          return;
        }

        await api.post(`/admin/projects/${id}/client-codes/import`, { codes: rawCodes });
        alert(`Successfully imported ${rawCodes.length} client codes.`);
        setFile(null);
        fetchCodes();
      } catch (err) {
        console.error(err);
        alert('Failed to import codes: ' + (err.response?.data?.message || err.message));
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsText(file);
  };

  const handleClearUnused = async () => {
    if (!window.confirm('Are you sure you want to delete all remaining (unused) client codes?')) return;
    try {
      await api.delete(`/admin/projects/${id}/client-codes/unused`);
      fetchCodes();
    } catch(e) {
      console.error(e);
      alert('Failed to clear unused codes');
    }
  };

  const totalCodes = codes.length;
  const usedCodesList = codes.filter(c => c.isUsed);
  const usedCodes = usedCodesList.length;
  const remainingCodes = totalCodes - usedCodes;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 md:p-8 min-h-[500px]">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Link2 size={20} className="text-blue-600" />
          Import Unique Client Links
        </h1>
        <p className="text-xs text-slate-500 mt-1">Batch import unique client entry tokens and monitor live allocation telemetry.</p>
      </div>

      {/* 3 Metric Banner Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-6 text-center">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Total Client Codes</span>
          <p className="text-3xl font-extrabold text-slate-900 font-mono">{totalCodes}</p>
        </div>

        <div className="bg-rose-50/50 border border-rose-200/60 rounded-2xl p-6 text-center">
          <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider block mb-1">Used Client Codes</span>
          <p className="text-3xl font-extrabold text-rose-600 font-mono">{usedCodes}</p>
        </div>

        <div className="bg-emerald-50/50 border border-emerald-200/60 rounded-2xl p-6 text-center relative">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block mb-1">Remaining Client Codes</span>
          <div className="flex justify-center items-center gap-2">
            <span className="text-3xl font-extrabold text-emerald-600 font-mono">{remainingCodes}</span>
            {remainingCodes > 0 && (
              <button 
                onClick={handleClearUnused}
                className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition"
                title="Clear unused codes"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Upload Box */}
      <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-5 mb-8 max-w-xl">
        <label className="block text-xs font-semibold text-slate-700 mb-2">Upload Link Codes File (.txt, .csv)</label>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="file"
            accept=".txt,.csv"
            onChange={handleFileChange}
            className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
          />
          <button
            onClick={handleImport}
            disabled={isImporting || !file}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs transition disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isImporting ? 'Importing...' : 'Import Codes'}
          </button>
        </div>
      </div>

      {/* Table of Used Codes */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Live Codes Usage History</h3>
        {loading ? (
          <div className="py-12"><Loader /></div>
        ) : (
          <div className="border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">TTPID</th>
                  <th className="py-3 px-4">Vendor Name</th>
                  <th className="py-3 px-4">Started</th>
                  <th className="py-3 px-4">Completed On</th>
                  <th className="py-3 px-4">Panelist ID</th>
                  <th className="py-3 px-4">Client Code</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usedCodesList.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-10 text-center text-slate-400">
                      <FileCheck size={28} className="mx-auto mb-2 opacity-40" />
                      <p className="text-xs font-medium text-slate-600">No Client Code is Used</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Codes will appear here as participants complete surveys.</p>
                    </td>
                  </tr>
                ) : (
                  usedCodesList.map((c, i) => (
                    <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-blue-600">{c.ttpid || '-'}</td>
                      <td className="py-3 px-4 text-slate-800 font-medium">{c.vendorName || '-'}</td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{c.started ? new Date(c.started).toLocaleString() : '-'}</td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{c.completedOn ? new Date(c.completedOn).toLocaleString() : '-'}</td>
                      <td className="py-3 px-4 font-mono text-slate-700">{c.panelListId || '-'}</td>
                      <td className="py-3 px-4 font-mono text-emerald-600 font-semibold">{c.clientCode}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

export default ProjectClientLink;
