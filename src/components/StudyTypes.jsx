import React, { useState, useEffect } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import api from '../api';
import Loader from './Loader';

function StudyTypes() {
  
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
      const res = await api.get('/admin/study-types');
      setTypes(res.data);
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
    if (!form.name) return alert('Please enter a Study Type name');
    try {
      const payload = {
        name: form.name,
        order: form.order !== '' ? Number(form.order) : types.length + 1,
        status: form.status === 'Enable' ? 'Active' : 'Inactive',
      };
      if (editId) {
        await api.put(`/admin/study-types/${editId}`, payload);
      } else {
        await api.post('/admin/study-types', payload);
      }
      setShowModal(false);
      fetchTypes();
    } catch(err) {
      alert(err.response?.data?.message || err.message || 'Failed to save');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/admin/study-types/${deleteId}`);
      setShowDeleteModal(false);
      setDeleteId(null);
      fetchTypes();
    } catch(err) { console.error(err); }
  };

  const filtered = types.filter(t => t.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-white p-4 rounded shadow-sm">
      <div className="flex justify-between items-center mb-4 border-b pb-4">
        <h2 className="text-xl font-bold text-gray-800">Study Type</h2>
        <button onClick={openAddModal} className="bg-gray-800 text-white px-3 py-1.5 text-sm rounded shadow-sm hover:bg-gray-700">
          + New Study Type
        </button>
      </div>

      <div className="flex justify-between items-center mb-3 text-sm">
        <div><select className="border rounded px-2 py-1"><option>25</option></select> entries per page</div>
        <div className="flex items-center gap-2">Search: <input className="border rounded px-2 py-1" value={search} onChange={e => setSearch(e.target.value)} /></div>
      </div>

      {loading ? <Loader /> : <div className="overflow-x-auto border rounded">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 border-b text-gray-600">
            <tr>
              <th className="p-3 font-semibold">Study Type</th>
              <th className="p-3 font-semibold">Status</th>
              <th className="p-3 font-semibold">Sort Order</th>
              <th className="p-3 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(t => (
              <tr key={t._id} className="border-b hover:bg-gray-50">
                <td className="p-3">{t.name}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${t.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {t.status === 'Active' ? 'Enable' : 'Disable'}
                  </span>
                </td>
                <td className="p-3 text-blue-500">{t.order}</td>
                <td className="p-3">
                  <span className="cursor-pointer text-gray-400 hover:text-blue-500 mr-3 inline-flex items-center" onClick={() => openEditModal(t)}><Edit size={16} /></span>
                  <span className="cursor-pointer text-gray-400 hover:text-red-500 inline-flex items-center" onClick={() => { setDeleteId(t._id); setShowDeleteModal(true); }}><Trash2 size={16} /></span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={4} className="p-4 text-center text-gray-400">No study types found.</td></tr>
            )}
          </tbody>
        </table></div>}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-blue-900/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h3 className="text-lg font-bold mb-5 text-gray-800">{editId ? 'Edit Study Type' : 'Add New Study Type'}</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-1">Study Type Name <span className="text-red-500">*</span></label>
              <input type="text" className="w-full border rounded p-2 focus:outline-none focus:border-blue-500 text-sm" placeholder="e.g. Healthcare, B2B..." value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} autoFocus />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-1">Sort Order</label>
              <input type="number" className="w-full border rounded p-2 focus:outline-none focus:border-blue-500 text-sm" placeholder="e.g. 1" value={form.order} onChange={e => setForm({ ...form, order: e.target.value })} />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
              <select className="w-full border rounded p-2 focus:outline-none focus:border-blue-500 text-sm" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="Enable">Enable</option>
                <option value="Disable">Disable</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded text-sm">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm font-medium">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-blue-900/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h3 className="text-lg font-bold mb-2 text-gray-800">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded text-sm">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm font-medium">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudyTypes;



