import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Download, Plus, Edit2, Search, Link as LinkIcon, Copy, X, Check, ChevronLeft, ChevronRight } from 'lucide-react';
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
      const suppId = s.supplierCode || (s._id ? s._id.slice(-5) : '');
      const panel = s.companyId?.name || 'Internal Company';
      csv += `"${suppId}","${panel}","${s.hits || 0}/${s.allocatedHits || 1500}","${s.completed || 0}/${s.allocatedCompletes || 150}","${s.disqualified || 0}","${s.quotaFull || 0}","${s.securityTerminate || 0}","${s.cpc || 0}","${s.status || 'Testing'}","${getEntryLink(s)}"\n`;
    });
    const encodedUri = encodeURI(csv);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `suppliers_project_${id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = suppliers.filter(s => {
    const name = s.companyId?.name || '';
    const code = s.supplierCode || '';
    const q = search.toLowerCase();
    return name.toLowerCase().includes(q) || code.toLowerCase().includes(q);
  });

  return (
    <div className="bg-white p-6 rounded shadow-sm">
      {/* Header controls */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-gray-800">Manage Suppliers</h1>
        <div className="flex space-x-2">
          <button 
            onClick={handleDownloadCsv}
            className="bg-[#4eb3f7] hover:bg-sky-400 text-white px-3.5 py-1.5 rounded text-xs font-bold flex items-center shadow-sm transition"
          >
            <Download size={14} className="mr-1.5" /> Supplier Links
          </button>
          <button 
            onClick={() => setShowAddModal(true)} 
            className="bg-black hover:bg-gray-800 text-white px-3.5 py-1.5 rounded text-xs font-bold flex items-center shadow-sm transition"
          >
            <Plus size={14} className="mr-1.5" /> Add Supplier
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex justify-between items-center mb-4 text-xs text-gray-600">
        <div className="flex items-center">
          <select 
            value={entriesPerPage}
            onChange={e => setEntriesPerPage(Number(e.target.value))}
            className="border p-1 rounded mr-1.5 bg-white text-xs focus:outline-none"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select> 
          entries per page
        </div>
        <div className="flex items-center">
          Search: 
          <input 
            type="text" 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border p-1.5 rounded ml-2 text-xs focus:outline-none focus:border-blue-500 w-48" 
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <Loader />
      ) : (
        <div className="overflow-x-auto border rounded">
          <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
            <thead>
              <tr className="border-b bg-gray-50 text-gray-700">
                <th className="py-3 px-3 font-semibold">ID <span className="text-[10px] text-gray-400">&#9662;</span></th>
                <th className="py-3 px-3 font-semibold">Panel <span className="text-[10px] text-gray-400">&#9830;</span></th>
                <th className="py-3 px-3 font-semibold">Hits <span className="text-[10px] text-gray-400">&#9830;</span></th>
                <th className="py-3 px-3 font-semibold">Completed <span className="text-[10px] text-gray-400">&#9830;</span></th>
                <th className="py-3 px-3 font-semibold">Dis Qualified <span className="text-[10px] text-gray-400">&#9830;</span></th>
                <th className="py-3 px-3 font-semibold">Quota Full <span className="text-[10px] text-gray-400">&#9830;</span></th>
                <th className="py-3 px-3 font-semibold">Security Term <span className="text-[10px] text-gray-400">&#9830;</span></th>
                <th className="py-3 px-3 font-semibold">IR <span className="text-[10px] text-gray-400">&#9830;</span></th>
                <th className="py-3 px-3 font-semibold">CPC <span className="text-[10px] text-gray-400">&#9830;</span></th>
                <th className="py-3 px-3 font-semibold">Last Completed <span className="text-[10px] text-gray-400">&#9830;</span></th>
                <th className="py-3 px-3 font-semibold">Status <span className="text-[10px] text-gray-400">&#9830;</span></th>
                <th className="py-3 px-3 font-semibold text-center">Action <span className="text-[10px] text-gray-400">&#9830;</span></th>
                <th className="py-3 px-3 font-semibold text-center">Test Links <span className="text-[10px] text-gray-400">&#9830;</span></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => {
                const hits = s.hits || 0;
                const allocatedHits = s.allocatedHits || 1500;
                const completed = s.completed || 0;
                const allocatedCompletes = s.allocatedCompletes || 150;
                const ir = hits > 0 ? Math.round((completed / hits) * 100) : 0;
                const cpcDisplay = Number(s.cpc || 5.6).toFixed(2);
                const supplierIdCode = s.supplierCode || (s._id ? s._id.slice(-5) : '16111');

                return (
                  <tr key={s._id} className="border-b hover:bg-gray-50/80 transition">
                    <td className="py-3 px-3 font-medium text-gray-800">{supplierIdCode}</td>
                    <td className="py-3 px-3 font-medium text-gray-900">{s.companyId?.name || 'Internal Company'}</td>
                    <td className="py-3 px-3 text-blue-600 font-medium">{hits}/{allocatedHits}</td>
                    <td className="py-3 px-3 text-blue-600 font-medium">{completed}/{allocatedCompletes}</td>
                    <td className="py-3 px-3 text-blue-600 text-center">{s.disqualified || 0}</td>
                    <td className="py-3 px-3 text-blue-600 text-center">{s.quotaFull || 0}</td>
                    <td className="py-3 px-3 text-blue-600 text-center">{s.securityTerminate || 0}</td>
                    <td className="py-3 px-3 text-orange-600 font-medium text-center">{ir}%</td>
                    <td className="py-3 px-3 font-medium text-gray-800">{cpcDisplay}</td>
                    <td className="py-3 px-3 text-gray-500">-</td>
                    <td className="py-3 px-3 text-blue-600 font-medium cursor-pointer">{s.status || 'Testing'}</td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button className="text-gray-500 hover:text-blue-600 p-0.5" title="Edit">
                          <Edit2 size={13} />
                        </button>
                        <button className="text-blue-600 hover:text-blue-800 p-0.5" title="Inspect">
                          <Search size={13} />
                        </button>
                        <button 
                          className="text-blue-500 hover:text-blue-700 p-0.5" 
                          title="View Links"
                          onClick={() => { setSelectedSupplier(s); setShowLinksModal(true); }}
                        >
                          <LinkIcon size={13} />
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button 
                        className="text-red-500 hover:text-red-700 p-1" 
                        title="Copy Test Link"
                        onClick={() => copyToClipboard(getEntryLink(s), s._id)}
                      >
                        {copiedKey === s._id ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="13" className="p-6 text-center text-gray-400">
                    No suppliers assigned yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
        <span>
          Showing {filtered.length > 0 ? 1 : 0} to {filtered.length} of {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'}
        </span>
        <div className="flex items-center space-x-1">
          <button className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded border">
            &laquo;
          </button>
          <button className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded border flex items-center">
            <ChevronLeft size={12} />
          </button>
          <button className="px-2.5 py-1 bg-blue-500 text-white rounded border font-medium">
            1
          </button>
          <button className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded border flex items-center">
            <ChevronRight size={12} />
          </button>
          <button className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded border">
            &raquo;
          </button>
        </div>
      </div>

      {/* Add Supplier Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h3 className="text-base font-bold text-gray-800">Assign Supplier</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-700">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Select Vendor / Company <span className="text-red-500">*</span></label>
                <select 
                  className="w-full border p-2 rounded focus:outline-none focus:border-blue-500 text-xs bg-white" 
                  value={formData.companyId} 
                  onChange={e => setFormData({...formData, companyId: e.target.value})}
                >
                  <option value="">Please Select</option>
                  {companies.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-green-700 mb-1">Success Postback URL <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    className="w-full border p-2 rounded text-xs focus:outline-none focus:border-blue-500" 
                    placeholder="https://vendor.com/postback?status=1&pid=[PID]" 
                    value={formData.successUrl} 
                    onChange={e => setFormData({...formData, successUrl: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block font-bold text-orange-600 mb-1">Disqualified Postback URL <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    className="w-full border p-2 rounded text-xs focus:outline-none focus:border-blue-500" 
                    placeholder="https://vendor.com/postback?status=2&pid=[PID]" 
                    value={formData.disqualifiedUrl} 
                    onChange={e => setFormData({...formData, disqualifiedUrl: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block font-bold text-yellow-700 mb-1">Quota Full Postback URL <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    className="w-full border p-2 rounded text-xs focus:outline-none focus:border-blue-500" 
                    placeholder="https://vendor.com/postback?status=3&pid=[PID]" 
                    value={formData.quotaFullUrl} 
                    onChange={e => setFormData({...formData, quotaFullUrl: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block font-bold text-red-600 mb-1">Security Terminate Postback URL <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    className="w-full border p-2 rounded text-xs focus:outline-none focus:border-blue-500" 
                    placeholder="https://vendor.com/postback?status=4&pid=[PID]" 
                    value={formData.securityTerminateUrl} 
                    onChange={e => setFormData({...formData, securityTerminateUrl: e.target.value})} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">CPC ($)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    className="w-full border p-2 rounded text-xs focus:outline-none focus:border-blue-500" 
                    value={formData.cpc} 
                    onChange={e => setFormData({...formData, cpc: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Allocated Hits</label>
                  <input 
                    type="number" 
                    className="w-full border p-2 rounded text-xs focus:outline-none focus:border-blue-500" 
                    value={formData.allocatedHits} 
                    onChange={e => setFormData({...formData, allocatedHits: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Allocated Completes</label>
                  <input 
                    type="number" 
                    className="w-full border p-2 rounded text-xs focus:outline-none focus:border-blue-500" 
                    value={formData.allocatedCompletes} 
                    onChange={e => setFormData({...formData, allocatedCompletes: e.target.value})} 
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Status</label>
                <select 
                  className="w-full border p-2 rounded text-xs focus:outline-none focus:border-blue-500 bg-white"
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

            <div className="bg-gray-50 px-6 py-3 border-t flex justify-end space-x-2">
              <button 
                onClick={() => setShowAddModal(false)}
                className="px-4 py-1.5 border rounded text-gray-600 hover:bg-gray-100 text-xs font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="px-4 py-1.5 bg-[#4eb3f7] hover:bg-sky-400 text-white rounded text-xs font-bold shadow-sm"
              >
                Save Supplier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Supplier Entry Links Modal */}
      {showLinksModal && selectedSupplier && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded shadow-xl w-full max-w-xl border border-gray-200">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h3 className="text-base font-bold text-gray-800">Supplier Tracking Links</h3>
              <button onClick={() => setShowLinksModal(false)} className="text-gray-400 hover:text-gray-700">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div className="bg-blue-50 p-4 rounded border border-blue-200">
                <p className="font-bold text-blue-900 mb-2">
                  Entry Link for {selectedSupplier.companyId?.name || 'Supplier'}:
                </p>
                <div className="flex items-center justify-between bg-white p-2.5 rounded border">
                  <code className="text-xs break-all text-gray-800 font-mono">
                    {getEntryLink(selectedSupplier)}
                  </code>
                  <button 
                    onClick={() => copyToClipboard(getEntryLink(selectedSupplier), 'modal_entry')} 
                    className="ml-2 text-gray-500 hover:text-blue-600 p-1"
                    title="Copy Link"
                  >
                    {copiedKey === 'modal_entry' ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                  </button>
                </div>
                <p className="text-[11px] text-gray-500 mt-2">
                  The vendor must replace <code className="bg-white px-1 py-0.5 rounded border">[PID]</code> with their panelist ID.
                </p>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-3 border-t flex justify-end">
              <button 
                onClick={() => setShowLinksModal(false)}
                className="px-4 py-1.5 bg-[#4eb3f7] hover:bg-sky-400 text-white rounded text-xs font-bold shadow-sm"
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
