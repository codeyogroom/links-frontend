import React, { useState, useEffect } from 'react';
import api from '../api';
import Loader from './Loader';
import { Edit, Trash2, Save } from 'lucide-react';
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
      setCompanies(res.data);
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name) return alert('Company Name is required');
    try {
      if (editId) {
        await api.put(`/admin/companies/${editId}`, form);
      } else {
        await api.post('/admin/companies', form);
      }
      setShowForm(false);
      setForm(emptyForm);
      setEditId(null);
      fetchData();
    } catch(err) {
      console.error(err);
      alert('Failed to save company.');
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

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this company?")) {
      try {
        await api.delete(`/admin/companies/${id}`);
        fetchData();
      } catch(err) { alert('Error deleting company'); }
    }
  };

  return (
    <div className="bg-gray-50 p-4 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">{showForm ? (editId ? 'Edit Company' : 'Add Company') : 'Company List'}</h2>
        {!showForm && (
          <button 
            onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true); }}
            className="bg-gray-800 text-white px-3 py-1.5 text-sm rounded shadow-sm hover:bg-gray-700"
          >
            + New Company
          </button>
        )}
      </div>

      {showForm ? (
        <div className="bg-white p-6 rounded shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-sm">
            
            {/* Left Column (2/3 width) - Company Details */}
            <div className="lg:col-span-2 space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-red-500 mb-1">Company Type</label>
                  <select className="w-full border p-2 rounded focus:outline-none focus:border-blue-500" value={form.companyType} onChange={e => set('companyType', e.target.value)}>
                    <option value="">Company Type</option>
                    <option value="Client">Client</option>
                    <option value="Vendor">Vendor</option>
                    <option value="Both">Both</option>
                  </select>
                </div>
                <div>
                  <label className="block text-red-500 mb-1">Company Name</label>
                  <input type="text" className="w-full border p-2 rounded focus:outline-none focus:border-blue-500" value={form.name} onChange={e => set('name', e.target.value)} />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">ABRV Name</label>
                  <input type="text" className="w-full border p-2 rounded focus:outline-none focus:border-blue-500" value={form.abrvName} onChange={e => set('abrvName', e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-red-500 mb-1">Contact Number</label>
                  <input type="text" className="w-full border p-2 rounded focus:outline-none focus:border-blue-500" value={form.contactNumber} onChange={e => set('contactNumber', e.target.value)} />
                </div>
                <div>
                  <label className="block text-red-500 mb-1">Company Email</label>
                  <input type="email" className="w-full border p-2 rounded focus:outline-none focus:border-blue-500" value={form.email} onChange={e => set('email', e.target.value)} />
                </div>
                <div>
                  <label className="block text-red-500 mb-1">Company Invoice Email</label>
                  <input type="email" className="w-full border p-2 rounded focus:outline-none focus:border-blue-500" value={form.invoiceEmail} onChange={e => set('invoiceEmail', e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-700 mb-1">Company Tax ID</label>
                  <input type="text" className="w-full border p-2 rounded focus:outline-none focus:border-blue-500" value={form.taxId} onChange={e => set('taxId', e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-700 mb-1">Company Address</label>
                  <input type="text" className="w-full border p-2 rounded focus:outline-none focus:border-blue-500" value={form.address} onChange={e => set('address', e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-red-500 mb-1">Invoicing Method *</label>
                  <select className="w-full border p-2 rounded focus:outline-none focus:border-blue-500" value={form.invoicingMethod} onChange={e => set('invoicingMethod', e.target.value)}>
                    <option value="">Select</option>
                    <option value="Monthly Basis">Monthly Basis</option>
                    <option value="Project Basis">Project Basis</option>
                  </select>
                </div>
                <div>
                  <label className="block text-red-500 mb-1">Payment terms *</label>
                  <select className="w-full border p-2 rounded focus:outline-none focus:border-blue-500" value={form.paymentTerms} onChange={e => set('paymentTerms', e.target.value)}>
                    <option value="">Select days</option>
                    <option value="15">15</option>
                    <option value="30">30</option>
                    <option value="45">45</option>
                    <option value="60">60</option>
                    <option value="90">90</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-red-500 mb-1">City</label>
                  <input type="text" className="w-full border p-2 rounded focus:outline-none focus:border-blue-500" value={form.city} onChange={e => set('city', e.target.value)} />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Zip Code</label>
                  <input type="text" className="w-full border p-2 rounded focus:outline-none focus:border-blue-500" value={form.zipCode} onChange={e => set('zipCode', e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-red-500 mb-1">Country</label>
                  <select className="w-full border p-2 rounded focus:outline-none focus:border-blue-500" value={form.country} onChange={e => {
                    set('country', e.target.value);
                    set('state', '');
                  }}>
                    <option value="">Please Select</option>
                    {FULL_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-red-500 mb-1">State</label>
                  <select className="w-full border p-2 rounded focus:outline-none focus:border-blue-500" value={form.state} onChange={e => set('state', e.target.value)}>
                    <option value="">Please Select</option>
                    {form.country && (() => {
                      const selectedC = Country.getAllCountries().find(c => c.name === form.country);
                      return selectedC ? State.getStatesOfCountry(selectedC.isoCode).map(s => (
                        <option key={s.isoCode || s.name} value={s.name}>{s.name}</option>
                      )) : null;
                    })()}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-700 mb-1">Status</label>
                  <select className="w-full border p-2 rounded focus:outline-none focus:border-blue-500" value={form.status} onChange={e => set('status', e.target.value)}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Check Proxy?</label>
                  <select className="w-full border p-2 rounded focus:outline-none focus:border-blue-500" value={form.checkProxy} onChange={e => set('checkProxy', e.target.value)}>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Is DIY?</label>
                  <select className="w-full border border-blue-300 bg-blue-50 p-2 rounded focus:outline-none focus:border-blue-500" value={form.isDiy} onChange={e => set('isDiy', e.target.value)}>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <button onClick={handleSave} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-medium flex items-center">
                  <Save size={16} className="mr-2" /> Save
                </button>
                <button onClick={() => setShowForm(false)} className="border border-red-400 text-red-500 hover:bg-red-50 px-4 py-2 rounded font-medium">
                  Cancel
                </button>
              </div>

            </div>

            {/* Right Column (1/3 width) - End Links */}
            <div className="lg:col-span-1 space-y-4">
              <h3 className="text-lg font-bold text-gray-800 mb-4">End Links</h3>
              <div>
                <label className="block text-gray-700 mb-1">Complete Link</label>
                <textarea className="w-full border p-2 rounded focus:outline-none focus:border-blue-500 h-20" value={form.completeLink} onChange={e => set('completeLink', e.target.value)}></textarea>
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Disqualify Link</label>
                <textarea className="w-full border p-2 rounded focus:outline-none focus:border-blue-500 h-20" value={form.disqualifyLink} onChange={e => set('disqualifyLink', e.target.value)}></textarea>
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Quotafull Link</label>
                <textarea className="w-full border p-2 rounded focus:outline-none focus:border-blue-500 h-20" value={form.quotafullLink} onChange={e => set('quotafullLink', e.target.value)}></textarea>
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Security Term Link</label>
                <textarea className="w-full border p-2 rounded focus:outline-none focus:border-blue-500 h-20" value={form.securityTermLink} onChange={e => set('securityTermLink', e.target.value)}></textarea>
              </div>
            </div>

          </div>
        </div>
      ) : (
        <div className="bg-white p-4 rounded shadow-sm">
          {loading ? <Loader /> : <div className="overflow-x-auto border rounded mt-4">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-gray-100 border-b text-gray-600">
                <tr>
                  <th className="p-3 font-semibold">Company Name</th>
                  <th className="p-3 font-semibold">Type</th>
                  <th className="p-3 font-semibold">Contact No</th>
                  <th className="p-3 font-semibold">Email</th>
                  <th className="p-3 font-semibold">Country</th>
                  <th className="p-3 font-semibold">Status</th>
                  <th className="p-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {companies.map(c => (
                  <tr key={c._id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{c.name}</td>
                    <td className="p-3">{c.companyType}</td>
                    <td className="p-3">{c.contactNumber}</td>
                    <td className="p-3">{c.email}</td>
                    <td className="p-3">{c.country}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${c.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="cursor-pointer text-gray-400 hover:text-blue-500 mr-3 inline-flex items-center" onClick={() => openEdit(c)}><Edit size={16} /></span>
                      <span className="cursor-pointer text-gray-400 hover:text-red-500 inline-flex items-center" onClick={() => handleDelete(c._id)}><Trash2 size={16} /></span>
                    </td>
                  </tr>
                ))}
                {companies.length === 0 && (
                  <tr><td colSpan="7" className="p-4 text-center text-gray-500">No companies found. Add one above.</td></tr>
                )}
              </tbody>
            </table></div>}
        </div>
      )}
      
    </div>
  );
}

export default Companies;


