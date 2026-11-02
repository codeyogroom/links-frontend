import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronUp, ChevronDown, Monitor, Smartphone, Tablet, Save } from 'lucide-react';
import api from '../api';
import { COUNTRIES } from '../utils/countries';
import { LANGUAGES } from '../utils/languages';

function AddProjectForm() {
  const navigate = useNavigate();
  
  // Accordion state
  const [openSections, setOpenSections] = useState({
    setup: true, metrics: true, people: true, timeline: true, memo: true, status: true
  });
  
  const toggleSection = (sec) => setOpenSections(prev => ({ ...prev, [sec]: !prev[sec] }));

  // Form Data State
  const getToday = () => new Date().toISOString().split('T')[0];
  const getNextMonth = () => { const d = new Date(); d.setMonth(d.getMonth() + 1); return d.toISOString().split('T')[0]; };

  const [formData, setFormData] = useState({
    name: '', parentProjectId: '', studyTypeId: '', country: '', language: 'English',
    surveyLink: '', surveyTestLink: '', cpc: '0.00', invoiceCurrency: 'US Dollar', conversionRate: '1.00',
    reqCompletes: '', maxCompletes: '', loi: '0:10', ir: '', pointsToAward: '0',
    supportedDevices: { desktop: true, mobile: true, tablet: true },
    clientId: '', clientContactId: '', projectManager: '', salesPerson: '',
    startDate: getToday(), endDate: getNextMonth(), notes: '', projectBrief: '', status: 'Select Status'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDeviceChange = (device) => {
    setFormData(prev => ({
      ...prev,
      supportedDevices: { ...prev.supportedDevices, [device]: !prev.supportedDevices[device] }
    }));
  };

  // Dropdown options from API
  const [studyTypes, setStudyTypes] = useState([]);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        const [stRes, compRes, projRes] = await Promise.all([
          api.get('/admin/study-types'),
          api.get('/admin/companies'),
          api.get('/admin/projects')
        ]);
        setStudyTypes(stRes.data);
        setClients(compRes.data);
        setProjects(projRes.data);
      } catch (e) {
        console.error("Error fetching configs", e);
      }
    };
    fetchConfigs();
  }, []);

  const handleSave = async () => {
    if(!formData.name || !formData.surveyLink || !formData.reqCompletes || !formData.ir) {
        alert("Please fill in the required fields: Project Name, Survey Link, Req. Completes, and IR.");
        return;
    }

    try {
      // Convert device object to array of strings
      const devices = [];
      if (formData.supportedDevices.desktop) devices.push('Desktop');
      if (formData.supportedDevices.mobile) devices.push('Mobile');
      if (formData.supportedDevices.tablet) devices.push('Tablet');

      const payload = {
          ...formData,
          supportedDevices: devices,
          // nullify empty ObjectIds to prevent cast errors
          studyTypeId: formData.studyTypeId || undefined,
          cpc: formData.cpc !== '' ? Number(formData.cpc) : 0,
          reqCompletes: formData.reqCompletes !== '' ? Number(formData.reqCompletes) : 0,
          ir: formData.ir !== '' ? Number(formData.ir) : 0,
          pointsToAward: formData.pointsToAward !== '' ? Number(formData.pointsToAward) : 0,
          conversionRate: formData.conversionRate !== '' ? Number(formData.conversionRate) : 1,
          clientId: formData.clientId || undefined,
          clientContactId: formData.clientContactId || undefined,
          parentProjectId: formData.parentProjectId || undefined,
          startDate: formData.startDate || undefined,
          endDate: formData.endDate || undefined
      };

      await api.post('/admin/projects', payload);
      navigate('/projects'); // Return to list after saving
    } catch (e) {
      console.error("Error saving project", e);
      alert("Failed to save project.");
    }
  };

  return (
    <div className="bg-[#f0f2f5] min-h-screen p-6">
      <div className="max-w-4xl mx-auto bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Add Project</h2>
        
        <div className="space-y-4">
          
          {/* 1. Setup Requirements */}
          <div className="border rounded">
            <div className="bg-gray-100 p-3 flex justify-between items-center cursor-pointer text-sm font-bold text-gray-700" onClick={() => toggleSection('setup')}>
              <span>Setup Requirements</span>
              {openSections.setup ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
            {openSections.setup && (
              <div className="p-4 space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-600 mb-1">Project Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border p-2 rounded focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">Parent Project</label>
                    <select name="parentProjectId" value={formData.parentProjectId} onChange={handleChange} className="w-full border p-2 rounded focus:outline-none focus:border-blue-500">
                      <option value="">Self Parent</option>
                      {projects.map(p => (
                        <option key={p._id} value={p._id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-600 mb-1">Study Type</label>
                    <select name="studyTypeId" value={formData.studyTypeId} onChange={handleChange} className="w-full border p-2 rounded focus:outline-none focus:border-blue-500">
                      <option value="">Please Select</option>
                      {studyTypes.map(st => <option key={st._id} value={st._id}>{st.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">Country</label>
                    <select name="country" value={formData.country} onChange={handleChange} className="w-full border p-2 rounded focus:outline-none focus:border-blue-500">
                      <option value="">Select Country</option>
                      {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">Language</label>
                    <select name="language" value={formData.language} onChange={handleChange} className="w-full border p-2 rounded focus:outline-none focus:border-blue-500">
                      <option value="">Select Language</option>
                      {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-600 mb-1">Survey Link</label>
                    <textarea name="surveyLink" value={formData.surveyLink} onChange={handleChange} className="w-full border p-2 rounded h-20 focus:outline-none focus:border-blue-500"></textarea>
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">Survey Test Link</label>
                    <textarea name="surveyTestLink" value={formData.surveyTestLink} onChange={handleChange} className="w-full border p-2 rounded h-20 focus:outline-none focus:border-blue-500"></textarea>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-600 mb-1">CPC $</label>
                    <input type="number" step="0.01" name="cpc" value={formData.cpc} onChange={handleChange} className="w-full border p-2 rounded focus:outline-none focus:border-blue-500" />
                    <p className="text-[10px] text-gray-500 mt-1">(Must be between $0.1 to $1000)</p>
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">Invoice Currency</label>
                    <select name="invoiceCurrency" value={formData.invoiceCurrency} onChange={handleChange} className="w-full border p-2 rounded focus:outline-none focus:border-blue-500">
                      <option>US Dollar</option>
                      <option>Indian Rupee</option>
                      <option>EURO</option>
                      <option>Pound Sterling</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">Conversion Rate</label>
                    <input type="number" step="0.01" name="conversionRate" value={formData.conversionRate} onChange={handleChange} className="w-full border p-2 rounded focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. Expected Metrics & Data */}
          <div className="border rounded">
            <div className="bg-gray-100 p-3 flex justify-between items-center cursor-pointer text-sm font-bold text-gray-700" onClick={() => toggleSection('metrics')}>
              <span>Expected Metrics & Data</span>
              {openSections.metrics ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
            {openSections.metrics && (
              <div className="p-4 space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-600 mb-1">Req. Completes :</label>
                    <input type="number" name="reqCompletes" value={formData.reqCompletes} onChange={handleChange} className="w-full border p-2 rounded focus:outline-none focus:border-blue-500" />
                    <p className="text-[10px] text-gray-500 mt-1">(Must be between 1 to 99,999)</p>
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">Max. Completes</label>
                    <select name="maxCompletes" value={formData.maxCompletes} onChange={handleChange} className="w-full border p-2 rounded focus:outline-none focus:border-blue-500">
                      <option value="">Select Max Completes</option>
                      <option value="Buffer">QuotaBuffer_Completes</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">LOI</label>
                    <input type="text" name="loi" value={formData.loi} onChange={handleChange} className="w-full border p-2 rounded focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">IR</label>
                    <input type="number" name="ir" value={formData.ir} onChange={handleChange} className="w-full border p-2 rounded focus:outline-none focus:border-blue-500" />
                    <p className="text-[10px] text-gray-500 mt-1">% (Must be between 1 to 100)</p>
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1"># of points to award</label>
                    <input type="number" name="pointsToAward" value={formData.pointsToAward} onChange={handleChange} className="w-full border p-2 rounded focus:outline-none focus:border-blue-500" />
                    <p className="text-[10px] text-gray-500 mt-1">[Value Of 01 Reward Point = 0.01 (In USD)]</p>
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-2">Supported Devices :</label>
                    <div className="flex items-center space-x-4">
                      <label className="flex flex-col items-center cursor-pointer">
                        <Monitor size={24} className={`mb-1 ${formData.supportedDevices.desktop ? 'text-blue-500' : 'text-gray-400'}`} />
                        <input type="checkbox" checked={formData.supportedDevices.desktop} onChange={() => handleDeviceChange('desktop')} className="mt-1" />
                      </label>
                      <label className="flex flex-col items-center cursor-pointer">
                        <Smartphone size={24} className={`mb-1 ${formData.supportedDevices.mobile ? 'text-blue-500' : 'text-gray-400'}`} />
                        <input type="checkbox" checked={formData.supportedDevices.mobile} onChange={() => handleDeviceChange('mobile')} className="mt-1" />
                      </label>
                      <label className="flex flex-col items-center cursor-pointer">
                        <Tablet size={24} className={`mb-1 ${formData.supportedDevices.tablet ? 'text-blue-500' : 'text-gray-400'}`} />
                        <input type="checkbox" checked={formData.supportedDevices.tablet} onChange={() => handleDeviceChange('tablet')} className="mt-1" />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. People */}
          <div className="border rounded">
            <div className="bg-gray-100 p-3 flex justify-between items-center cursor-pointer text-sm font-bold text-gray-700" onClick={() => toggleSection('people')}>
              <span>People</span>
              {openSections.people ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
            {openSections.people && (
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-gray-600 mb-1">Client</label>
                  <select name="clientId" value={formData.clientId} onChange={handleChange} className="w-full border p-2 rounded focus:outline-none focus:border-blue-500">
                    <option value="">Please Select</option>
                    {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">Client Contact</label>
                  <select name="clientContactId" value={formData.clientContactId} onChange={handleChange} className="w-full border p-2 rounded focus:outline-none focus:border-blue-500">
                    <option value="">Select Client Contact</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">Project Manager</label>
                  <select name="projectManager" value={formData.projectManager} onChange={handleChange} className="w-full border p-2 rounded focus:outline-none focus:border-blue-500">
                    <option value="">Please Select</option>
                    <option>Admin TTP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">Sales Person</label>
                  <select name="salesPerson" value={formData.salesPerson} onChange={handleChange} className="w-full border p-2 rounded focus:outline-none focus:border-blue-500">
                    <option value="">Please Select</option>
                    <option>Admin TTP</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* 4. Timeline */}
          <div className="border rounded">
            <div className="bg-gray-100 p-3 flex justify-between items-center cursor-pointer text-sm font-bold text-gray-700" onClick={() => toggleSection('timeline')}>
              <span>Timeline</span>
              {openSections.timeline ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
            {openSections.timeline && (
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-gray-600 mb-1">Start Date</label>
                  <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full border p-2 rounded focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">End Date</label>
                  <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="w-full border p-2 rounded focus:outline-none focus:border-blue-500" />
                </div>
              </div>
            )}
          </div>

          {/* 5. Memorandum */}
          <div className="border rounded">
            <div className="bg-gray-100 p-3 flex justify-between items-center cursor-pointer text-sm font-bold text-gray-700" onClick={() => toggleSection('memo')}>
              <span>Memorandum</span>
              {openSections.memo ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
            {openSections.memo && (
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-gray-600 mb-1">Notes</label>
                  <textarea name="notes" value={formData.notes} onChange={handleChange} className="w-full border p-2 rounded h-24 focus:outline-none focus:border-blue-500"></textarea>
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">Project Brief (All Partner)</label>
                  <textarea name="projectBrief" value={formData.projectBrief} onChange={handleChange} className="w-full border p-2 rounded h-24 focus:outline-none focus:border-blue-500"></textarea>
                </div>
              </div>
            )}
          </div>

          {/* 6. Status */}
          <div className="border rounded mb-6">
            <div className="bg-gray-100 p-3 flex justify-between items-center cursor-pointer text-sm font-bold text-gray-700" onClick={() => toggleSection('status')}>
              <span>Status</span>
              {openSections.status ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
            {openSections.status && (
              <div className="p-4 text-xs w-1/3">
                <label className="block text-gray-600 mb-1">Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full border p-2 rounded focus:outline-none focus:border-blue-500">
                  <option>Select Status</option>
                  <option>Running</option>
                  <option>On Hold</option>
                  <option>Closed</option>
                  <option>Archived</option>
                </select>
              </div>
            )}
          </div>

        </div>

        {/* Form Footer */}
        <div className="mt-6 flex space-x-3 pt-4 border-t">
          <button onClick={handleSave} className="bg-[#4b8df8] hover:bg-blue-600 text-white px-6 py-2 rounded text-sm font-bold flex items-center shadow">
            <Save size={16} className="mr-2" /> Save
          </button>
          <button onClick={() => navigate('/projects')} className="bg-white border border-red-300 text-red-500 hover:bg-red-50 px-6 py-2 rounded text-sm font-bold shadow-sm">
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}

export default AddProjectForm;




