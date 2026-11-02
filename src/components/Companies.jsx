import React, { useState, useEffect } from 'react';
import api from '../api';
import Loader from './Loader';
import { Edit, Trash2, Save, Building2, Plus, Search, ChevronLeft, ChevronRight, Globe, Mail, Phone } from 'lucide-react';
import { Country, State } from 'country-state-city';
import { COUNTRIES } from '../utils/countries';

const FULL_COUNTRIES = [
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

function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState('');
  
  const emptyForm = {
    companyType: '', name: '', abrvName: '', contactNumber: '', email: '', invoiceEmail: '',
    taxId: '', address: '', invoicingMethod: '', paymentTerms: '', city: '', zipCode: '',
    country: '', state: '', status: 'Active', checkProxy: 'Yes', isDiy: 'No',
    completeLink: '', disqualifyLink: '', quotafullLink: '', securityTermLink: ''
  };

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/companies');
      setCompanies(res.data || []);
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleCountryChange = (cName) => {
    set('country', cName);
    set('state', '');
  };

  const getStates = () => {
    if (!form.country) return [];
    const cObj = Country.getAllCountries().find(c => c.name.toLowerCase() === form.country.toLowerCase());
    if (cObj) {
      return State.getStatesOfCountry(cObj.isoCode).map(s => s.name);
    }
    return [];
  };

  const handleSave = async () => {
    if (!form.companyType || !form.name || !form.contactNumber || !form.email || !form.invoiceEmail || !form.invoicingMethod || !form.paymentTerms || !form.city || !form.country) {
      return alert("Please fill all required fields marked with *");
    }

    try {
      const payload = { ...form };
      if (editId) {
        await api.put(`/admin/companies/${editId}`, payload);
      } else {
        await api.post('/admin/companies', payload);
      }
      setShowForm(false);
      setEditId(null);
      fetchData();
    } catch(err) {
      alert(err.response?.data?.message || err.message || "Failed to save company");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this company?")) return;
    try {
      await api.delete(`/admin/companies/${id}`);
      fetchData();
    } catch(err) {
      alert("Failed to delete company");
    }
  };

  const openEdit = (c) => {
    setForm({
      companyType: c.companyType || '',
      name: c.name || '',
      abrvName: c.abrvName || '',
      contactNumber: c.contactNumber || '',
      email: c.email || '',
      invoiceEmail: c.invoiceEmail || '',
      taxId: c.taxId || '',
      address: c.address || '',
      invoicingMethod: c.invoicingMethod || '',
      paymentTerms: c.paymentTerms || '',
      city: c.city || '',
      zipCode: c.zipCode || '',
      country: c.country || '',
      state: c.state || '',
      status: c.status || 'Active',
      checkProxy: c.checkProxy || 'Yes',
      isDiy: c.isDiy || 'No',
      completeLink: c.completeLink || '',
      disqualifyLink: c.disqualifyLink || '',
      quotafullLink: c.quotafullLink || '',
      securityTermLink: c.securityTermLink || ''
    });
    setEditId(c._id);
    setShowForm(true);
  };

  const filtered = companies.filter(c => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (c.name || '').toLowerCase().includes(term) || (c.companyType || '').toLowerCase().includes(term) || (c.email || '').toLowerCase().includes(term);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Building2 className="text-blue-600" size={24} />
            {showForm ? (editId ? 'Edit Company' : 'New Company Profile') : 'Companies Directory'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">Manage client accounts, vendor partners, invoicing terms, and postback redirect end pages.</p>
        </div>

        {!showForm ? (
          <button 
            onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true); }}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-xs shadow-xs hover:shadow transition self-start sm:self-auto"
          >
            <Plus size={15} />
            <span>New Company</span>
          </button>
        ) : (
          <button 
            onClick={() => setShowForm(false)}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition self-start sm:self-auto"
          >
            Back to Directory
          </button>
        )}
      </div>

      {showForm ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-xs">
            
            {/* Left Column (2/3 width) - Company Details */}
            <div className="lg:col-span-2 space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Company Type <span className="text-rose-500">*</span></label>
                  <select className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" value={form.companyType} onChange={e => set('companyType', e.target.value)}>
                    <option value="">Select Type</option>
                    <option value="Client">Client</option>
                    <option value="Vendor">Vendor</option>
                    <option value="Both">Both (Client & Vendor)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Company Name <span className="text-rose-500">*</span></label>
                  <input type="text" className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" value={form.name} onChange={e => set('name', e.target.value)} />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">ABRV Name</label>
                  <input type="text" className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" value={form.abrvName} onChange={e => set('abrvName', e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Contact Number <span className="text-rose-500">*</span></label>
                  <input type="text" className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" value={form.contactNumber} onChange={e => set('contactNumber', e.target.value)} />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Company Email <span className="text-rose-500">*</span></label>
                  <input type="email" className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" value={form.email} onChange={e => set('email', e.target.value)} />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Invoice Email <span className="text-rose-500">*</span></label>
                  <input type="email" className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" value={form.invoiceEmail} onChange={e => set('invoiceEmail', e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Company Tax ID</label>
                  <input type="text" className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" value={form.taxId} onChange={e => set('taxId', e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Address</label>
                  <input type="text" className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" value={form.address} onChange={e => set('address', e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Invoicing Method <span className="text-rose-500">*</span></label>
                  <select className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" value={form.invoicingMethod} onChange={e => set('invoicingMethod', e.target.value)}>
                    <option value="">Select Method</option>
                    <option value="Monthly Basis">Monthly Basis</option>
                    <option value="Project Basis">Project Basis</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Payment Terms <span className="text-rose-500">*</span></label>
                  <select className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" value={form.paymentTerms} onChange={e => set('paymentTerms', e.target.value)}>
                    <option value="">Select Terms</option>
                    <option value="15">Net 15 Days</option>
                    <option value="30">Net 30 Days</option>
                    <option value="45">Net 45 Days</option>
                    <option value="60">Net 60 Days</option>
                    <option value="90">Net 90 Days</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">City <span className="text-rose-500">*</span></label>
                  <input type="text" className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" value={form.city} onChange={e => set('city', e.target.value)} />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Zip Code</label>
                  <input type="text" className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" value={form.zipCode} onChange={e => set('zipCode', e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Country <span className="text-rose-500">*</span></label>
                  <select className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" value={form.country} onChange={e => handleCountryChange(e.target.value)}>
                    <option value="">Select Country</option>
                    {FULL_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">State / Province</label>
                  <select className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" value={form.state} onChange={e => set('state', e.target.value)}>
                    <option value="">Select State</option>
                    {getStates().map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-2.5 pt-4">
                <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold text-xs shadow-xs hover:shadow transition flex items-center">
                  <Save size={14} className="mr-1.5" /> Save Company
                </button>
                <button onClick={() => setShowForm(false)} className="px-4 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-semibold text-xs transition">
                  Cancel
                </button>
              </div>

            </div>

            {/* Right Column (1/3 width) - End Links */}
            <div className="lg:col-span-1 space-y-4 bg-slate-50/60 p-5 rounded-2xl border border-slate-200/80">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Default Postback End Links</h3>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Complete Link</label>
                <textarea className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 h-20" value={form.completeLink} onChange={e => set('completeLink', e.target.value)}></textarea>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Disqualify Link</label>
                <textarea className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 h-20" value={form.disqualifyLink} onChange={e => set('disqualifyLink', e.target.value)}></textarea>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Quotafull Link</label>
                <textarea className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 h-20" value={form.quotafullLink} onChange={e => set('quotafullLink', e.target.value)}></textarea>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Security Term Link</label>
                <textarea className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 h-20" value={form.securityTermLink} onChange={e => set('securityTermLink', e.target.value)}></textarea>
              </div>
            </div>

          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          
          <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
            <div className="relative max-w-sm w-full">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                className="w-full pl-8 pr-3 py-1.5 border border-slate-200 bg-slate-50 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                placeholder="Search companies..."
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
                    <th className="py-3 px-4">Company Name</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Country</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map(c => (
                    <tr key={c._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">{c.name}</td>
                      <td className="py-3 px-4">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium border border-slate-200">
                          {c.companyType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">{c.contactNumber}</td>
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
                          <button onClick={() => handleDelete(c._id)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition" title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={7} className="py-10 text-center text-slate-400">No companies found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Companies;
