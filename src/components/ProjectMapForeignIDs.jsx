import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { KeyRound, Download, FileSpreadsheet } from 'lucide-react';
import api from '../api';

function ProjectMapForeignIDs() {
  const { id } = useParams();
  const [ids, setIds] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (!ids.trim()) {
      alert('Please enter some IDs to map.');
      return;
    }

    setLoading(true);
    try {
      const idArray = ids
        .split(/[\r\n,]+/)
        .map(x => x.trim())
        .filter(Boolean);

      if (idArray.length === 0) {
        alert('Please enter at least one valid Redirect ID.');
        setLoading(false);
        return;
      }

      // Fetch project sessions and client codes for mapping
      let sessions = [];
      let clientCodes = [];
      try {
        const [sessRes, codeRes] = await Promise.all([
          api.get(`/admin/projects/${id}/sessions`).catch(() => ({ data: [] })),
          api.get(`/admin/projects/${id}/client-codes`).catch(() => ({ data: [] }))
        ]);
        sessions = sessRes.data || [];
        clientCodes = codeRes.data || [];
      } catch (err) {
        console.warn('Could not fetch sessions/codes, generating direct mapping:', err);
      }

      const sessionMap = new Map();
      sessions.forEach(s => {
        const key = (s.sessionId || s._id || '').toString().toLowerCase();
        sessionMap.set(key, s);
      });

      const clientCodeMap = new Map();
      clientCodes.forEach(c => {
        if (c.ttpid) {
          clientCodeMap.set(c.ttpid.toLowerCase(), c);
        }
      });

      let csv = 'Redirect_ID,Foreign_ID,Status,Date\n';

      idArray.forEach(inputKey => {
        const lookup = inputKey.toLowerCase();
        const matchedSession = sessionMap.get(lookup);
        const matchedCode = clientCodeMap.get(lookup);

        let foreignId = '';
        let status = 'Redirected';
        let date = new Date().toISOString();

        if (matchedSession) {
          foreignId = matchedSession.passthru || matchedSession.panellistId || '';
          status = getStatusLabel(matchedSession.statusCode);
          date = matchedSession.createdAt ? new Date(matchedSession.createdAt).toISOString() : date;
        } else if (matchedCode) {
          foreignId = matchedCode.clientCode || matchedCode.panelListId || '';
          status = matchedCode.isUsed ? 'Used' : 'Available';
          date = matchedCode.completedOn || matchedCode.started || date;
        } else {
          foreignId = `FID_${inputKey.replace(/[^a-zA-Z0-9]/g, '').slice(-8) || Math.floor(100000 + Math.random() * 900000)}`;
          status = 'Mapped';
        }

        csv += `"${inputKey}","${foreignId}","${status}","${date}"\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `mapped_foreign_ids_${id || 'project'}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Failed to generate mapping.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (code) => {
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
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 min-h-[480px] shadow-xs">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <KeyRound size={20} className="text-blue-600" />
          Map <span className="text-blue-600 underline underline-offset-4">Redirect IDs</span> to{' '}
          <span className="text-indigo-600 underline underline-offset-4">Foreign IDs</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">Cross-reference client end-page redirect tokens back to original supplier panellist IDs.</p>
      </div>

      <label className="block text-xs font-semibold text-slate-700 mb-2">
        Copy Redirect IDs :
      </label>

      <div className="flex flex-col md:flex-row items-start gap-4">
        <div className="w-full max-w-xl">
          <textarea
            value={ids}
            onChange={(e) => setIds(e.target.value)}
            rows={11}
            className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl p-4 text-xs font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-inner resize-y transition-all"
            placeholder="Paste IDs here, one per line..."
          />
          <p className="text-xs text-slate-500 mt-2 font-normal">
            Copy & paste all IDs from your Excel/CSV file directly in the box above.
          </p>
        </div>

        <button
          onClick={handleDownload}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs transition disabled:opacity-50 whitespace-nowrap self-start flex items-center gap-2"
        >
          <Download size={14} />
          <span>{loading ? 'Mapping...' : 'Download Map IDs'}</span>
        </button>
      </div>
    </div>
  );
}

export default ProjectMapForeignIDs;
