import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronUp, ChevronDown, Monitor, Smartphone, Tablet, Save, Layers, ArrowLeft } from 'lucide-react';
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
        setStudyTypes(stRes.data || []);
        setClients(compRes.data || []);
        setProjects(projRes.data || []);
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
      const devices = [];
      if (formData.supportedDevices.desktop) devices.push('Desktop');
      if (formData.supportedDevices.mobile) devices.push('Mobile');
      if (formData.supportedDevices.tablet) devices.push('Tablet');

      const payload = {
          ...formData,
          supportedDevices: devices,
          studyTypeId: formData.studyTypeId || undefined,
          cpc: formData.cpc !== '' ? Number(formData.cpc) : 0,
          reqCompletes: formData.reqCompletes !== '' ? Number(formData.reqCompletes) : 0,
          ir: formData.ir !== '' ? Number(formData.ir) : 0,
          pointsToAward: formData.pointsToAward !== '' ? Number(formData.pointsToAward) : 0,
          conversionRate: formData.conversionRate !== '' ? Number(formData.conversionRate) : 1,
          clientId: formData.clientId || undefined,
          clientContactId: formData.clientContactId || undefined,
          parentProjectId: formData.parentProjectId || undefined
      };

      await api.post('/admin/projects', payload);
      alert("Project created successfully");
      navigate('/projects');
    } catch(err) {
      console.error(err);
      alert(err.response?.data?.message || err.message || "Failed to create project");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Layers className="text-blue-600" size={24} />
            Create New Project
          </h1>
          <p className="text-xs text-slate-500 mt-1">Initialize research parameters, target sample limits, device rules, and pricing structure.</p>
        </div>

        <button 
          onClick={() => navigate('/projects')}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition self-start sm:self-auto"
        >
          <ArrowLeft size={14} /> Back to Projects
        </button>
      </div>

      <div className="space-y-4">
        
        {/* 1. Setup Requirements */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div 
            className="bg-slate-50/80 px-5 py-3.5 flex justify-between items-center cursor-pointer text-xs font-bold text-slate-800 hover:bg-slate-100/70 transition-colors border-b border-slate-200/80" 
            onClick={() => toggleSection('setup')}
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Setup Requirements
            </span>
            {openSections.setup ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </div>
          {openSections.setup && (
            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Project Name <span className="text-rose-500">*</span></label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Parent Project</label>
                  <select name="parentProjectId" value={formData.parentProjectId} onChange={handleChange} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                    <option value="">Self Parent</option>
                    {projects.map(p => (
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Study Type</label>
                  <select name="studyTypeId" value={formData.studyTypeId} onChange={handleChange} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                    <option value="">Please Select</option>
                    {studyTypes.map(st => <option key={st._id} value={st._id}>{st.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Country</label>
                  <select name="country" value={formData.country} onChange={handleChange} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                    <option value="">Select Country</option>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Language</label>
                  <select name="language" value={formData.language} onChange={handleChange} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                    <option value="">Select Language</option>
                    {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Survey Link <span className="text-rose-500">*</span></label>
                  <textarea name="surveyLink" value={formData.surveyLink} onChange={handleChange} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-2.5 h-20 text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-y"></textarea>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Survey Test Link</label>
                  <textarea name="surveyTestLink" value={formData.surveyTestLink} onChange={handleChange} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-2.5 h-20 text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-y"></textarea>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">CPC ($)</label>
                  <input type="number" step="0.01" name="cpc" value={formData.cpc} onChange={handleChange} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Invoice Currency</label>
                  <select name="invoiceCurrency" value={formData.invoiceCurrency} onChange={handleChange} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                    <option>US Dollar</option>
                    <option>Indian Rupee</option>
                    <option>EURO</option>
                    <option>Pound Sterling</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Conversion Rate</label>
                  <input type="number" step="0.01" name="conversionRate" value={formData.conversionRate} onChange={handleChange} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2. Expected Metrics & Data */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div 
            className="bg-slate-50/80 px-5 py-3.5 flex justify-between items-center cursor-pointer text-xs font-bold text-slate-800 hover:bg-slate-100/70 transition-colors border-b border-slate-200/80" 
            onClick={() => toggleSection('metrics')}
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Expected Metrics & Target
            </span>
            {openSections.metrics ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </div>
          {openSections.metrics && (
            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Req. Completes (N) <span className="text-rose-500">*</span></label>
                  <input type="number" name="reqCompletes" value={formData.reqCompletes} onChange={handleChange} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Max. Completes</label>
                  <select name="maxCompletes" value={formData.maxCompletes} onChange={handleChange} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                    <option value="">No Max Limit</option>
                    <option value="Buffer">QuotaBuffer_Completes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">LOI (Length of Interview)</label>
                  <input type="text" name="loi" value={formData.loi} onChange={handleChange} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">IR % (Incidence Rate) <span className="text-rose-500">*</span></label>
                  <input type="number" name="ir" value={formData.ir} onChange={handleChange} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Points to Award</label>
                  <input type="number" name="pointsToAward" value={formData.pointsToAward} onChange={handleChange} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Supported Devices</label>
                  <div className="flex items-center space-x-5 pt-1">
                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input type="checkbox" checked={formData.supportedDevices.desktop} onChange={() => handleDeviceChange('desktop')} className="rounded border-slate-300 text-blue-600 focus:ring-0" />
                      <Monitor size={17} className={formData.supportedDevices.desktop ? 'text-blue-600' : 'text-slate-400'} />
                      <span className="text-xs text-slate-700">Desktop</span>
                    </label>
                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input type="checkbox" checked={formData.supportedDevices.mobile} onChange={() => handleDeviceChange('mobile')} className="rounded border-slate-300 text-blue-600 focus:ring-0" />
                      <Smartphone size={17} className={formData.supportedDevices.mobile ? 'text-blue-600' : 'text-slate-400'} />
                      <span className="text-xs text-slate-700">Mobile</span>
                    </label>
                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input type="checkbox" checked={formData.supportedDevices.tablet} onChange={() => handleDeviceChange('tablet')} className="rounded border-slate-300 text-blue-600 focus:ring-0" />
                      <Tablet size={17} className={formData.supportedDevices.tablet ? 'text-blue-600' : 'text-slate-400'} />
                      <span className="text-xs text-slate-700">Tablet</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. People */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div 
            className="bg-slate-50/80 px-5 py-3.5 flex justify-between items-center cursor-pointer text-xs font-bold text-slate-800 hover:bg-slate-100/70 transition-colors border-b border-slate-200/80" 
            onClick={() => toggleSection('people')}
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              People & Organization
            </span>
            {openSections.people ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </div>
          {openSections.people && (
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Client Company</label>
                <select name="clientId" value={formData.clientId} onChange={handleChange} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                  <option value="">Please Select</option>
                  {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Project Manager</label>
                <select name="projectManager" value={formData.projectManager} onChange={handleChange} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                  <option value="Admin TTP">Admin TTP</option>
                  <option value="Sudhanshu Kumar">Sudhanshu Kumar</option>
                  <option value="Niharika Tiwari">Niharika Tiwari</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* 4. Timeline */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div 
            className="bg-slate-50/80 px-5 py-3.5 flex justify-between items-center cursor-pointer text-xs font-bold text-slate-800 hover:bg-slate-100/70 transition-colors border-b border-slate-200/80" 
            onClick={() => toggleSection('timeline')}
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Timeline
            </span>
            {openSections.timeline ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </div>
          {openSections.timeline && (
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Start Date</label>
                <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">End Date</label>
                <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
            </div>
          )}
        </div>

        {/* 5. Status */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div 
            className="bg-slate-50/80 px-5 py-3.5 flex justify-between items-center cursor-pointer text-xs font-bold text-slate-800 hover:bg-slate-100/70 transition-colors border-b border-slate-200/80" 
            onClick={() => toggleSection('status')}
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Project Status
            </span>
            {openSections.status ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </div>
          {openSections.status && (
            <div className="p-5 text-xs max-w-sm">
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Initial Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                <option value="Running">Running</option>
                <option value="Testing">Testing</option>
                <option value="On Hold">On Hold</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          )}
        </div>

      </div>

      {/* Form Footer */}
      <div className="flex items-center space-x-2.5 pt-2">
        <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold text-xs shadow-xs hover:shadow transition flex items-center">
          <Save size={14} className="mr-1.5" /> Save Project
        </button>
        <button onClick={() => navigate('/projects')} className="px-4 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-semibold text-xs transition">
          Cancel
        </button>
      </div>

    </div>
  );
}

export default AddProjectForm;
