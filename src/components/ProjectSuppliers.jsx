import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Download, Plus, Edit2, Search, Link as LinkIcon, Copy, X, Check, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import api from '../api';
import Loader from './Loader';

function ProjectSuppliers() {
  const { id } = useParams();
  const [suppliers, setSuppliers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(25);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showLinksModal, setShowLinksModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  const [formData, setFormData] = useState({
    companyId: '',
    successUrl: '',
    disqualifiedUrl: '',
    quotaFullUrl: '',
    securityTerminateUrl: '',
    cpc: '5.60',
    allocatedHits: 1500,
    allocatedCompletes: 150,
    status: 'Testing'
  });

  const serverBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1').replace(/\/api\/v1\/?$/, '');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [suppRes, compRes] = await Promise.all([
        api.get(`/admin/projects/${id}/suppliers`),
        api.get('/admin/companies')
      ]);
      setSuppliers(suppRes.data || []);
      setCompanies(compRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.companyId) return alert('Please select a Vendor/Company.');
    if (!formData.successUrl || !formData.disqualifiedUrl || !formData.quotaFullUrl || !formData.securityTerminateUrl) {
      return alert('Please provide all 4 Postback URLs (Success, Disqualified, Quota Full, Security Terminate).');
    }

    try {
      await api.post(`/admin/projects/${id}/suppliers`, {
        ...formData,
        cpc: Number(formData.cpc) || 0,
        allocatedHits: Number(formData.allocatedHits) || 1500,
        allocatedCompletes: Number(formData.allocatedCompletes) || 150
      });
      setShowAddModal(false);
      setFormData({
        companyId: '',
        successUrl: '',
        disqualifiedUrl: '',
        quotaFullUrl: '',
        securityTerminateUrl: '',
        cpc: '5.60',
        allocatedHits: 1500,
        allocatedCompletes: 150,
        status: 'Testing'
      });
      fetchData();
    } catch (e) {
      console.error(e);
      alert('Failed to add supplier: ' + (e.response?.data?.message || e.message));
    }
  };

  const getEntryLink = (supplier) => {
    const compId = supplier.companyId?._id || supplier.companyId || '';
    return `${serverBaseUrl}/api/v1/router/entry/${id}/${compId}?pid=[PID]`;
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadCsv = () => {
    if (suppliers.length === 0) return alert('No suppliers to download.');
    let csv = 'data:text/csv;charset=utf-8,ID,Panel,Hits,Completed,Disqualified,QuotaFull,SecurityTerm,CPC,Status,EntryLink\n';
    suppliers.forEach(s => {
      const hits = `${s.hits || 0}/${s.allocatedHits || 1500}`;
      const comp = `${s.completed || 0}/${s.allocatedCompletes || 150}`;
      const cpc = Number(s.cpc || 5.6).toFixed(2);
      const link = getEntryLink(s);
      csv += `"${s.supplierCode || s._id}","${s.companyId?.name || 'Company'}","${hits}","${comp}",${s.disqualified || 0},${s.quotaFull || 0},${s.securityTerminate || 0},"${cpc}","${s.status || 'Testing'}","${link}"\n`;
    });
    const encoded = encodeURI(csv);
    const a = document.createElement('a');
    a.href = encoded;
    a.download = `suppliers_project_${id}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const filtered = suppliers.filter(s => {
    if (!search) return true;
    const name = s.companyId?.name || '';
    const code = s.supplierCode || '';
    return name.toLowerCase().includes(search.toLowerCase()) || code.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 md:p-8">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users size={20} className="text-blue-600" />
            Manage Suppliers
          </h1>
          <p className="text-xs text-slate-500 mt-1">Configure vendor allocations, track conversion rates, and copy secure redirect links.</p>
        </div>
        <div className="flex items-center space-x-2.5 self-start sm:self-auto">
          <button 
            onClick={handleDownloadCsv}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center shadow-xs transition"
          >
            <Download size={14} className="mr-1.5" /> Export CSV
          </button>
          <button 
            onClick={() => setShowAddModal(true)} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center shadow-xs hover:shadow transition"
          >
            <Plus size={14} className="mr-1.5" /> Add Supplier
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 text-xs text-slate-600">
        <div className="flex items-center">
          <select 
            value={entriesPerPage}
            onChange={e => setEntriesPerPage(Number(e.target.value))}
            className="border border-slate-200 bg-slate-50 rounded-lg px-2.5 py-1.5 mr-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select> 
          <span>entries per page</span>
        </div>
        
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search suppliers..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 border border-slate-200 bg-slate-50 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-56 transition-all" 
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-12"><Loader /></div>
      ) : (
        <div className="overflow-x-auto border border-slate-200/80 rounded-xl shadow-xs">
          <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-3.5">ID</th>
                <th className="py-3 px-3.5">Panel</th>
                <th className="py-3 px-3.5">Hits</th>
                <th className="py-3 px-3.5">Completed</th>
                <th className="py-3 px-3.5 text-center">Disqualified</th>
                <th className="py-3 px-3.5 text-center">Quota Full</th>
                <th className="py-3 px-3.5 text-center">Security Term</th>
                <th className="py-3 px-3.5 text-center">IR</th>
                <th className="py-3 px-3.5">CPC</th>
                <th className="py-3 px-3.5">Last Activity</th>
                <th className="py-3 px-3.5">Status</th>
                <th className="py-3 px-3.5 text-center">Action</th>
                <th className="py-3 px-3.5 text-center">Test Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(s => {
                const hits = s.hits || 0;
                const allocatedHits = s.allocatedHits || 1500;
                const completed = s.completed || 0;
                const allocatedCompletes = s.allocatedCompletes || 150;
                const ir = hits > 0 ? Math.round((completed / hits) * 100) : 0;
                const cpcDisplay = Number(s.cpc || 5.6).toFixed(2);
                const supplierIdCode = s.supplierCode || (s._id ? s._id.slice(-5) : '16111');

                return (
                  <tr key={s._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3.5 font-mono font-semibold text-blue-600">{supplierIdCode}</td>
                    <td className="py-3 px-3.5 font-semibold text-slate-900">{s.companyId?.name || 'Internal Company'}</td>
                    <td className="py-3 px-3.5 text-slate-700 font-mono">{hits} / {allocatedHits}</td>
                    <td className="py-3 px-3.5 text-emerald-600 font-bold font-mono">{completed} / {allocatedCompletes}</td>
                    <td className="py-3 px-3.5 text-slate-600 text-center font-mono">{s.disqualified || 0}</td>
                    <td className="py-3 px-3.5 text-slate-600 text-center font-mono">{s.quotaFull || 0}</td>
                    <td className="py-3 px-3.5 text-rose-600 text-center font-mono">{s.securityTerminate || 0}</td>
                    <td className="py-3 px-3.5 text-amber-600 font-bold text-center font-mono">{ir}%</td>
                    <td className="py-3 px-3.5 font-mono font-medium text-slate-800">${cpcDisplay}</td>
                    <td className="py-3 px-3.5 text-slate-400 font-mono text-[11px]">-</td>
                    <td className="py-3 px-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        s.status === 'Running' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        <span className={`w-1 h-1 rounded-full ${s.status === 'Running' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                        {s.status || 'Testing'}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button 
                          className="p-1 text-slate-400 hover:text-blue-600 rounded hover:bg-slate-100" 
                          title="View Links"
                          onClick={() => { setSelectedSupplier(s); setShowLinksModal(true); }}
                        >
                          <LinkIcon size={14} />
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <button 
                        className="p-1 text-slate-400 hover:text-blue-600 rounded hover:bg-blue-50" 
                        title="Copy Test Link"
                        onClick={() => copyToClipboard(getEntryLink(s), s._id)}
                      >
                        {copiedKey === s._id ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="13" className="py-10 text-center text-slate-400">
                    No suppliers assigned yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      <div className="flex justify-between items-center mt-4 text-xs text-slate-500">
        <span>
          Showing {filtered.length > 0 ? 1 : 0} to {filtered.length} of {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'}
        </span>
        <div className="flex items-center space-x-1">
          <button className="p-1 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50">
            <ChevronLeft size={13} />
          </button>
          <span className="px-2.5 py-1 font-semibold text-slate-800 bg-slate-100 rounded-lg text-xs">1</span>
          <button className="p-1 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50">
            <ChevronRight size={13} />
          </button>
        </div>
      </div>

      {/* Add Supplier Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200/80">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Assign Supplier</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Select Vendor / Company <span className="text-rose-500">*</span></label>
                <select 
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
                  value={formData.companyId} 
                  onChange={e => setFormData({...formData, companyId: e.target.value})}
                >
                  <option value="">Please Select</option>
                  {companies.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-emerald-700 uppercase tracking-wider mb-1.5">Success Postback URL <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                    placeholder="https://vendor.com/postback?status=1&pid=[PID]" 
                    value={formData.successUrl} 
                    onChange={e => setFormData({...formData, successUrl: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-amber-700 uppercase tracking-wider mb-1.5">Disqualified Postback URL <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                    placeholder="https://vendor.com/postback?status=2&pid=[PID]" 
                    value={formData.disqualifiedUrl} 
                    onChange={e => setFormData({...formData, disqualifiedUrl: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-blue-700 uppercase tracking-wider mb-1.5">Quota Full Postback URL <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                    placeholder="https://vendor.com/postback?status=3&pid=[PID]" 
                    value={formData.quotaFullUrl} 
                    onChange={e => setFormData({...formData, quotaFullUrl: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-rose-700 uppercase tracking-wider mb-1.5">Security Terminate Postback URL <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                    placeholder="https://vendor.com/postback?status=4&pid=[PID]" 
                    value={formData.securityTerminateUrl} 
                    onChange={e => setFormData({...formData, securityTerminateUrl: e.target.value})} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">CPC ($)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                    value={formData.cpc} 
                    onChange={e => setFormData({...formData, cpc: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Allocated Hits</label>
                  <input 
                    type="number" 
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                    value={formData.allocatedHits} 
                    onChange={e => setFormData({...formData, allocatedHits: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Allocated Completes</label>
                  <input 
                    type="number" 
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                    value={formData.allocatedCompletes} 
                    onChange={e => setFormData({...formData, allocatedCompletes: e.target.value})} 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Status</label>
                <select 
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                >
                  <option value="Testing">Testing</option>
                  <option value="Running">Running</option>
                  <option value="Paused">Paused</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-100 flex justify-end space-x-2">
              <button 
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                Save Supplier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Supplier Entry Links Modal */}
      {showLinksModal && selectedSupplier && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl border border-slate-200/80">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Supplier Tracking Links</h3>
              <button onClick={() => setShowLinksModal(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <p className="font-semibold text-slate-800 mb-2">
                  Entry Link for {selectedSupplier.companyId?.name || 'Supplier'}:
                </p>
                <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200">
                  <code className="text-[11px] break-all text-slate-800 font-mono">
                    {getEntryLink(selectedSupplier)}
                  </code>
                  <button 
                    onClick={() => copyToClipboard(getEntryLink(selectedSupplier), 'modal_entry')} 
                    className="ml-2 text-slate-400 hover:text-blue-600 p-1"
                    title="Copy Link"
                  >
                    {copiedKey === 'modal_entry' ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  The vendor must replace <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-[10px]">[PID]</code> with their respondent panelist ID.
                </p>
              </div>
            </div>
            <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setShowLinksModal(false)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectSuppliers;
