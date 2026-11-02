import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Save, Users, Plus, Search, Mail, Phone, Building } from 'lucide-react';
import api from '../api';
import Loader from './Loader';

const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia","Australia","Austria",
  "Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan",
  "Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cabo Verde","Cambodia",
  "Cameroon","Canada","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo (Congo-Brazzaville)",
  "Costa Rica","Croatia","Cuba","Cyprus","Czechia","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador",
  "Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia","Fiji","Finland","France",
  "Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau",
  "Guyana","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland",
  "Israel","Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","Kuwait","Kyrgyzstan",
  "Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Madagascar",
  "Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia",
  "Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepal",
  "Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway","Oman","Pakistan",
  "Palau","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar",
  "Romania","Russia","Rwanda","Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines","Samoa","San Marino",
  "Sao Tome and Principe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia",
  "Solomon Islands","Somalia","South Africa","South Korea","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden",
  "Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor-Leste","Togo","Tonga","Trinidad and Tobago",
  "Tunisia","Turkey","Turkmenistan","Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States",
  "Uruguay","Uzbekistan","Vanuatu","Vatican City","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"
];

function Contacts() {
  const [showForm, setShowForm] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contactTypes, setContactTypes] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [editId, setEditId] = useState(null);

  const emptyForm = {
    contactTypeId: '', companyId: '', salutation: '', firstName: '', middleName: '',
    lastName: '', gender: '', dateOfBirth: '', email: '', contactNo: '',
    address: '', city: '', zipCode: '', country: '', state: '', status: 'Active'
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchContacts();
    fetchContactTypes();
    fetchCompanies();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/contacts');
      setContacts(res.data || []);
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchContactTypes = async () => {
    try {
      const res = await api.get('/admin/contact-types');
      setContactTypes(res.data || []);
    } catch(err) {
      console.error(err);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await api.get('/admin/companies');
      setCompanies(res.data || []);
    } catch(err) {
      console.error(err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.contactNo) {
      return alert('Please fill in required fields: First Name, Last Name, Email, Contact No');
    }

    try {
      const payload = {
        ...form,
        contactTypeId: form.contactTypeId || null,
        companyId: form.companyId || null,
        dateOfBirth: form.dateOfBirth || null
      };

      if (editId) {
        await api.put(`/admin/contacts/${editId}`, payload);
      } else {
        await api.post('/admin/contacts', payload);
      }
      setShowForm(false);
      setEditId(null);
      setForm(emptyForm);
      fetchContacts();
    } catch(err) {
      alert(err.response?.data?.message || err.message || 'Error saving contact');
    }
  };

  const openEdit = (c) => {
    setForm({
      contactTypeId: c.contactTypeId?._id || c.contactTypeId || '',
      companyId: c.companyId?._id || c.companyId || '',
      salutation: c.salutation || '',
      firstName: c.firstName || '',
      middleName: c.middleName || '',
      lastName: c.lastName || '',
      gender: c.gender || '',
      dateOfBirth: c.dateOfBirth ? c.dateOfBirth.split('T')[0] : '',
      email: c.email || '',
      contactNo: c.contactNo || '',
      address: c.address || '',
      city: c.city || '',
      zipCode: c.zipCode || '',
      country: c.country || '',
      state: c.state || '',
      status: c.status || 'Active'
    });
    setEditId(c._id);
    setShowForm(true);
  };

  const confirmDelete = (id) => { setDeleteId(id); setShowDeleteModal(true); };

  const handleDelete = async () => {
    try {
      await api.delete(`/admin/contacts/${deleteId}`);
      setShowDeleteModal(false);
      setDeleteId(null);
      fetchContacts();
    } catch(err) { 
      alert('Error deleting contact'); 
    }
  };

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const filtered = contacts.filter(c =>
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Users className="text-blue-600" size={24} />
            {showForm ? (editId ? 'Edit Contact' : 'New Contact Person') : 'Contacts Directory'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">Manage partner personnel, project managers, client stakeholders, and vendor representatives.</p>
        </div>

        {!showForm ? (
          <button 
            onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true); }}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-xs shadow-xs hover:shadow transition self-start sm:self-auto"
          >
            <Plus size={15} />
            <span>New Contact</span>
          </button>
        ) : (
          <button 
            onClick={() => setShowForm(false)}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition self-start sm:self-auto"
          >
            Back to Contacts
          </button>
        )}
      </div>

      {showForm ? (
        <form className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 md:p-8 space-y-6 text-xs" onSubmit={handleSave}>
          {/* Row 1: Contact Type + Company */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Contact Role Type</label>
              <select className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" value={form.contactTypeId} onChange={e => set('contactTypeId', e.target.value)}>
                <option value="">Please Select</option>
                {contactTypes.map(ct => (
                  <option key={ct._id} value={ct._id}>{ct.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Affiliated Company</label>
              <select className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" value={form.companyId} onChange={e => set('companyId', e.target.value)}>
                <option value="">Please Select</option>
                {companies.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* Row 2: Name fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Salutation</label>
              <input className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" value={form.salutation} onChange={e => set('salutation', e.target.value)} placeholder="Mr. / Ms. / Dr." />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">First Name <span className="text-rose-500">*</span></label>
              <input className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" value={form.firstName} onChange={e => set('firstName', e.target.value)} />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Last Name <span className="text-rose-500">*</span></label>
              <input className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" value={form.lastName} onChange={e => set('lastName', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Gender</label>
              <select className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" value={form.gender} onChange={e => set('gender', e.target.value)}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Date Of Birth</label>
              <input type="date" className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Status</label>
              <select className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* Row 3: Contact details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Email Address <span className="text-rose-500">*</span></label>
              <input type="email" className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Contact No <span className="text-rose-500">*</span></label>
              <input type="text" className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" value={form.contactNo} onChange={e => set('contactNo', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">City</label>
              <input type="text" className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" value={form.city} onChange={e => set('city', e.target.value)} />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Country</label>
              <select className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" value={form.country} onChange={e => set('country', e.target.value)}>
                <option value="">Select Country</option>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Zip Code</label>
              <input type="text" className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" value={form.zipCode} onChange={e => set('zipCode', e.target.value)} />
            </div>
          </div>

          <div className="flex items-center space-x-2.5 pt-4">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold text-xs shadow-xs hover:shadow transition flex items-center">
              <Save size={14} className="mr-1.5" /> Save Contact
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-semibold text-xs transition">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          
          <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
            <div className="relative max-w-sm w-full">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                className="w-full pl-8 pr-3 py-1.5 border border-slate-200 bg-slate-50 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                placeholder="Search by name or email..."
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
                    <th className="py-3 px-4">Contact Name</th>
                    <th className="py-3 px-4">Role Type</th>
                    <th className="py-3 px-4">Company</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Country</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map(c => (
                    <tr key={c._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">{c.firstName} {c.lastName}</td>
                      <td className="py-3 px-4">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium border border-slate-200">
                          {c.contactTypeId?.name || 'General'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700">{c.companyId?.name || 'N/A'}</td>
                      <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">{c.contactNo}</td>
                      <td className="py-3 px-4 text-slate-600">{c.email}</td>
                      <td className="py-3 px-4 text-slate-600">{c.country}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          c.status === 'Active' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          <span className={`w-1 h-1 rounded-full ${c.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button onClick={() => openEdit(c)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition" title="Edit">
                            <Edit size={14} />
                          </button>
                          <button onClick={() => confirmDelete(c._id)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition" title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={8} className="py-10 text-center text-slate-400">No contacts found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4">
          <div className="p-6 bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-slate-200/80">
            <h3 className="mb-2 text-sm font-bold text-slate-900">Confirm Deletion</h3>
            <p className="mb-6 text-xs text-slate-500">Are you sure you want to delete this contact? This action cannot be undone.</p>
            <div className="flex justify-end space-x-2">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-100 transition">Cancel</button>
              <button onClick={handleDelete} className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Contacts;
