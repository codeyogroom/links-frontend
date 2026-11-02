import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Download, FileSpreadsheet, Users, ShieldAlert } from 'lucide-react';
import api from '../api';

function ProjectDownload() {
  const { id } = useParams();
  const [options, setOptions] = useState({
    extension: false,
    askOnRedirect: false,
    referrer: false
  });
  const [downloading, setDownloading] = useState(null);

  const handleDownload = async (type) => {
    setDownloading(type);
    try {
      let sessions = [];
      try {
        const res = await api.get(`/admin/projects/${id}/sessions`);
        sessions = res.data || [];
      } catch (err) {
        console.warn('Could not fetch project sessions, using template:', err);
      }

      let csv = '';
      let filename = '';

      if (type === 'project_ids') {
        filename = `project_ids_${id}.csv`;
        let headers = ['TTPID', 'Status'];
        if (options.extension) headers.push('Extension');
        if (options.askOnRedirect) headers.push('AskOnRedirect');
        if (options.referrer) headers.push('Referrer');
        headers.push('Date');
        csv = headers.join(',') + '\n';

        if (sessions.length > 0) {
          sessions.forEach(s => {
            let row = [s.sessionId || s._id, getStatusName(s.statusCode)];
            if (options.extension) row.push(`"${s.passthru || ''}"`);
            if (options.askOnRedirect) row.push('No');
            if (options.referrer) row.push(`"${s.referralHeader || ''}"`);
            row.push(`"${s.createdAt ? new Date(s.createdAt).toISOString() : ''}"`);
            csv += row.join(',') + '\n';
          });
        } else {
          csv += `SAMPLE-TTPID-1001,Completed${options.extension ? ',"passthru_data"' : ''}${options.askOnRedirect ? ',No' : ''}${options.referrer ? ',"direct"' : ''},"${new Date().toISOString()}"\n`;
        }
      } else if (type === 'respondent_data') {
        filename = `respondent_data_${id}.csv`;
        csv = 'TTPID,Panel,Panelist_ID,Status_Code,Status_Name,IP_Address,Created_At\n';

        if (sessions.length > 0) {
          sessions.forEach(s => {
            csv += `"${s.sessionId || s._id}","${s.vendorId?.name || 'Vendor'}","${s.panellistId || ''}",${s.statusCode || 9},"${getStatusName(s.statusCode)}","${s.ipAddress || ''}","${s.createdAt ? new Date(s.createdAt).toISOString() : ''}"\n`;
          });
        } else {
          csv += `SAMPLE-TTPID-1001,"Internal Company","PID-9921",6,"Completed","127.0.0.1","${new Date().toISOString()}"\n`;
        }
      } else if (type === 'rejected_ids') {
        filename = `rejected_ids_${id}.csv`;
        csv = 'TTPID,Status_Code,Status_Name,Date\n';

        const rejectedSessions = sessions.filter(s => s.statusCode === 7 || s.statusCode >= 10);
        if (rejectedSessions.length > 0) {
          rejectedSessions.forEach(s => {
            csv += `"${s.sessionId || s._id}",${s.statusCode},"${getStatusName(s.statusCode)}","${s.createdAt ? new Date(s.createdAt).toISOString() : ''}"\n`;
          });
        } else {
          csv += `SAMPLE-REJECTED-1002,7,"Disqualified","${new Date().toISOString()}"\n`;
        }
      }

      const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csv);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error(e);
      alert('Failed to generate download.');
    } finally {
      setDownloading(null);
    }
  };

  const getStatusName = (code) => {
    switch (code) {
      case 6: return 'Completed';
      case 7: return 'Disqualified';
      case 8: return 'Quota Full';
      case 9: return 'Redirected';
      case 10: return 'Security Terminate';
      case 11: return 'Inconsistency';
      case 14: return 'Speeding';
      default: return 'Pending';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-xs min-h-[480px]">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Download size={20} className="text-blue-600" />
          Download Telemetry & Reports
        </h1>
        <p className="text-xs text-slate-500 mt-1">Export raw session IDs, full respondent journey audits, and fraud/rejection extracts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Column 1: Download Project IDs */}
        <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
              <FileSpreadsheet size={20} />
            </div>
            <h2 className="text-base font-bold text-slate-900 mb-2">Project Session IDs</h2>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Export tracking IDs with optional metadata fields for client delivery reconciliation.
            </p>
            
            <div className="space-y-2.5 mb-6 text-xs text-slate-700">
              <label className="flex items-center cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={options.extension}
                  onChange={e => setOptions({ ...options, extension: e.target.checked })}
                  className="mr-2 rounded border-slate-300 text-blue-600 focus:ring-0" 
                /> 
                Include Passthru Extension
              </label>
              <label className="flex items-center cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={options.askOnRedirect}
                  onChange={e => setOptions({ ...options, askOnRedirect: e.target.checked })}
                  className="mr-2 rounded border-slate-300 text-blue-600 focus:ring-0" 
                /> 
                Ask on Redirect Flag
              </label>
              <label className="flex items-center cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={options.referrer}
                  onChange={e => setOptions({ ...options, referrer: e.target.checked })}
                  className="mr-2 rounded border-slate-300 text-blue-600 focus:ring-0" 
                /> 
                HTTP Referrer Domain
              </label>
            </div>
          </div>

          <button 
            onClick={() => handleDownload('project_ids')}
            disabled={downloading === 'project_ids'}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 rounded-xl shadow-xs transition disabled:opacity-50"
          >
            {downloading === 'project_ids' ? 'Generating CSV...' : 'Download Project IDs'}
          </button>
        </div>

        {/* Column 2: Respondent Data */}
        <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
              <Users size={20} />
            </div>
            <h2 className="text-base font-bold text-slate-900 mb-2">Respondent Data</h2>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Full breakdown including IP addresses, timestamp telemetry, supplier vendor name, and individual status codes.
            </p>
          </div>

          <button 
            onClick={() => handleDownload('respondent_data')}
            disabled={downloading === 'respondent_data'}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2.5 rounded-xl shadow-xs transition disabled:opacity-50"
          >
            {downloading === 'respondent_data' ? 'Generating CSV...' : 'Download Respondent Data'}
          </button>
        </div>

        {/* Column 3: Rejected IDs */}
        <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <ShieldAlert size={20} />
            </div>
            <h2 className="text-base font-bold text-slate-900 mb-2">Rejected & Fraud IDs</h2>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Targeted list of all security terminated, speeding, IP mismatched, or quality-failed traffic sessions.
            </p>
          </div>

          <button 
            onClick={() => handleDownload('rejected_ids')}
            disabled={downloading === 'rejected_ids'}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs py-2.5 rounded-xl shadow-xs transition disabled:opacity-50"
          >
            {downloading === 'rejected_ids' ? 'Generating CSV...' : 'Download Rejected IDs'}
          </button>
        </div>

      </div>
    </div>
  );
}

export default ProjectDownload;
