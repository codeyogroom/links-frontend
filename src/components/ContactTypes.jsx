import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, Search, Tag, X } from 'lucide-react';
import api from '../api';
import Loader from './Loader';

function ContactTypes() {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', order: '', status: 'Enable' });
  const [editId, setEditId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchTypes(); }, []);

  const fetchTypes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/contact-types');
      setTypes(res.data || []);
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setForm({ name: '', order: types.length + 1, status: 'Enable' });
    setEditId(null);
    setShowModal(true);
  };

  const openEditModal = (t) => {
    setForm({ name: t.name, order: t.order, status: t.status === 'Active' ? 'Enable' : 'Disable' });
    setEditId(t._id);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name) return alert('Please enter a Contact Type name');
    try {
      const payload = {
        name: form.name,
        order: form.order !== '' ? Number(form.order) : types.length + 1,
        status: form.status === 'Enable' ? 'Active' : 'Inactive',
      };
      if (editId) {
        await api.put(`/admin/contact-types/${editId}`, payload);
      } else {
        await api.post('/admin/contact-types', payload);
      }
      setShowModal(false);
      fetchTypes();
    } catch(err) {
      alert(err.response?.data?.message || err.message || 'Failed to save');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/admin/contact-types/${deleteId}`);
      setShowDeleteModal(false);
      setDeleteId(null);
      fetchTypes();
    } catch(err) { 
      console.error(err); 
    }
  };

  const filtered = types.filter(t => t.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Tag className="text-blue-600" size={24} />
            Contact Types
          </h1>
          <p className="text-xs text-slate-500 mt-1">Classify stakeholder roles (e.g. Sales, Project Manager, Account Director, Billing).</p>
        </div>

        <button 
          onClick={openAddModal} 
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-xs shadow-xs hover:shadow transition self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>New Contact Type</span>
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        
        {/* Search bar */}
        <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
          <div className="relative max-w-sm w-full">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              className="w-full pl-8 pr-3 py-1.5 border border-slate-200 bg-slate-50 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
              placeholder="Search contact types..."
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>
          <span className="text-xs text-slate-500">{filtered.length} total</span>
        </div>

        {loading ? (
          <div className="py-12"><Loader /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Contact Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Sort Order</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(t => (
                  <tr key={t._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">{t.name}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        t.status === 'Active' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        <span className={`w-1 h-1 rounded-full ${t.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                        {t.status === 'Active' ? 'Enabled' : 'Disabled'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-600">{t.order}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button onClick={() => openEditModal(t)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition" title="Edit">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => { setDeleteId(t._id); setShowDeleteModal(true); }} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={4} className="py-10 text-center text-slate-400">No contact types found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200/80">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">{editId ? 'Edit Contact Type' : 'Add New Contact Type'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Contact Type Name <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                  placeholder="e.g. Primary Account Manager, Invoicing Contact..." 
                  value={form.name} 
                  onChange={e => setForm({ ...form, name: e.target.value })} 
                  autoFocus 
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Sort Order</label>
                <input 
                  type="number" 
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                  placeholder="1" 
                  value={form.order} 
                  onChange={e => setForm({ ...form, order: e.target.value })} 
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Status</label>
                <select 
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                  value={form.status} 
                  onChange={e => setForm({ ...form, status: e.target.value })} 
                >
                  <option value="Enable">Enable</option>
                  <option value="Disable">Disable</option>
                </select>
              </div>
            </div>
            <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-100 flex justify-end space-x-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold">Cancel</button>
              <button onClick={handleSave} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-slate-200/80 p-6">
            <h3 className="text-sm font-bold mb-2 text-slate-900">Confirm Deletion</h3>
            <p className="text-xs text-slate-500 mb-6">Are you sure you want to delete this contact type? This action cannot be reversed.</p>
            <div className="flex justify-end space-x-2">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold">Cancel</button>
              <button onClick={handleDelete} className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ContactTypes;
