import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
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
    <div className="bg-white p-6 rounded shadow-sm min-h-[450px]">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-200">
        
        {/* Column 1: Download Project IDs */}
        <div className="pr-8 pb-6 md:pb-0">
          <h2 className="text-xl font-normal text-gray-800 mb-4">Download Project IDs</h2>
          
          <div className="flex items-center space-x-6 mb-6 text-xs text-gray-700">
            <label className="flex items-center cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={options.extension}
                onChange={e => setOptions({ ...options, extension: e.target.checked })}
                className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-0" 
              /> 
              Extension
            </label>
            <label className="flex items-center cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={options.askOnRedirect}
                onChange={e => setOptions({ ...options, askOnRedirect: e.target.checked })}
                className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-0" 
              /> 
              Ask on Redirect
            </label>
            <label className="flex items-center cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={options.referrer}
                onChange={e => setOptions({ ...options, referrer: e.target.checked })}
                className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-0" 
              /> 
              Referrer
            </label>
          </div>

          <button 
            onClick={() => handleDownload('project_ids')}
            disabled={downloading === 'project_ids'}
            className="bg-[#4eb3f7] hover:bg-sky-400 text-white font-bold text-xs px-4 py-2 rounded shadow-sm transition disabled:bg-blue-300"
          >
            {downloading === 'project_ids' ? 'Generating...' : 'Download'}
          </button>
        </div>

        {/* Column 2: Respondent Data */}
        <div className="px-8 py-6 md:py-0">
          <h2 className="text-xl font-normal text-gray-800 mb-10">Respondent Data</h2>
          <button 
            onClick={() => handleDownload('respondent_data')}
            disabled={downloading === 'respondent_data'}
            className="bg-[#4eb3f7] hover:bg-sky-400 text-white font-bold text-xs px-4 py-2 rounded shadow-sm transition disabled:bg-blue-300"
          >
            {downloading === 'respondent_data' ? 'Generating...' : 'Download'}
          </button>
        </div>

        {/* Column 3: Rejected IDs */}
        <div className="pl-8 pt-6 md:pt-0">
          <h2 className="text-xl font-normal text-gray-800 mb-10">Rejected IDs</h2>
          <button 
            onClick={() => handleDownload('rejected_ids')}
            disabled={downloading === 'rejected_ids'}
            className="bg-[#4eb3f7] hover:bg-sky-400 text-white font-bold text-xs px-4 py-2 rounded shadow-sm transition disabled:bg-blue-300"
          >
            {downloading === 'rejected_ids' ? 'Generating...' : 'Download'}
          </button>
        </div>

      </div>
    </div>
  );
}

export default ProjectDownload;
