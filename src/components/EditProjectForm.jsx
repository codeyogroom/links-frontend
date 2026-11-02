import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronUp, ChevronDown, Monitor, Smartphone, Tablet, RefreshCw, FileText, Link as LinkIcon, AlertCircle, PlayCircle, Shield, ShieldAlert, CheckSquare, X, Copy, Check, Mail } from 'lucide-react';
import api from '../api';
import { COUNTRIES } from '../utils/countries';
import { LANGUAGES } from '../utils/languages';

function EditProjectForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Accordion state
  const [openSections, setOpenSections] = useState({
    setup: true, metrics: true, people: true, timeline: true, memo: true, status: true, changeLog: false
  });
  const toggleSection = (sec) => setOpenSections(prev => ({ ...prev, [sec]: !prev[sec] }));

  // Form Data State
  const [formData, setFormData] = useState({
    name: '', parentProjectId: '', studyTypeId: '', country: '', language: '',
    surveyLink: '', surveyTestLink: '', cpc: '0.00', vendorMaxCpc: '0.00', invoiceCurrency: 'US Dollar', conversionRate: '1.00',
    surveyFriendlyName: '', pv: '0.00', setupCost: '0.00',
    reqCompletes: '', maxCompletes: '', loi: '0:10', ir: '', pointsToAward: '0',
    supportedDevices: { desktop: true, mobile: true, tablet: true },
    clientId: '', clientContactId: '', projectManager: '', salesPerson: '',
    startDate: '', endDate: '', notes: '', projectBrief: '', status: 'Running'
  });

  // Sidebar Security State
  const [security, setSecurity] = useState({
    validateBlankReferrer: false, validateStartEndIp: true, deviceValidation: false,
    geographicValidation: false, trafficAnonymization: false, threatIntelligence: false,
    botDetection: false, rdeProfanityCheck: false
  });
  const handleSecurityChange = (e) => setSecurity({ ...security, [e.target.name]: e.target.checked });

  // Dropdown options
  const [studyTypes, setStudyTypes] = useState([]);
  const [clients, setClients] = useState([]);
  const [allProjects, setAllProjects] = useState([]);

  // Project Stats State
  const [stats, setStats] = useState({
    totalHits: 0, redirects: 0, blocked: 0, completed: 0, disqualified: 0,
    quotaFull: 0, securityTerminate: 0, epc: 0, cr: 0, ir: 0,
    avgLoi: 0, medianLoi: 0, abandons: 0, lastCompleted: '-'
  });

  // End Pages & Link Codes Modal State
  const [showEndPagesModal, setShowEndPagesModal] = useState(false);
  const [showLinkCodesModal, setShowLinkCodesModal] = useState(false);
  const [showRedirectStatusModal, setShowRedirectStatusModal] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  const serverBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1').replace(/\/api\/v1\/?$/, '');

  const getAuthToken = (statusCode, projId) => {
    let hash = 0;
    const str = `${statusCode}_${projId || ''}_ttp_salt_2026`;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return (hex + hex + hex + hex).slice(0, 32);
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

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
        setAllProjects(projRes.data);
      } catch (e) {
        console.error("Error fetching configs", e);
      }
    };
    fetchConfigs();
  }, []);

  useEffect(() => {
    const fetchProjectAndStats = async () => {
      try {
        const [projRes, statsRes] = await Promise.all([
          api.get(`/admin/projects/${id}`),
          api.get(`/admin/projects/${id}/stats`)
        ]);
        const p = projRes.data;
        // Checkboxes conversion
        const sd = { desktop: false, mobile: false, tablet: false };
        p.supportedDevices?.forEach(d => {
          if (d === 'Desktop') sd.desktop = true;
          if (d === 'Mobile') sd.mobile = true;
          if (d === 'Tablet') sd.tablet = true;
        });
        setFormData({
          name: p.name || '', parentProjectId: p.parentProjectId || '', studyTypeId: p.studyTypeId?._id || p.studyTypeId || '', 
          country: p.country || '', language: p.language || '', surveyLink: p.surveyLink || '', 
          surveyTestLink: p.surveyTestLink || '', cpc: p.cpc || 0, vendorMaxCpc: p.vendorMaxCpc || 0, invoiceCurrency: p.invoiceCurrency || 'US Dollar', 
          conversionRate: p.conversionRate || 1, surveyFriendlyName: p.surveyFriendlyName || '', pv: p.pv || 0, setupCost: p.setupCost || 0,
          reqCompletes: p.reqCompletes || '', maxCompletes: p.maxCompletes || '', 
          loi: p.loi || '', ir: p.ir || '', pointsToAward: p.pointsToAward || 0, supportedDevices: sd, 
          clientId: p.clientId?._id || p.clientId || '', clientContactId: p.clientContactId?._id || p.clientContactId || '', projectManager: p.projectManager || '', 
          salesPerson: p.salesPerson || '', startDate: p.startDate ? p.startDate.split('T')[0] : '', 
          endDate: p.endDate ? p.endDate.split('T')[0] : '', notes: p.notes || '', 
          projectBrief: p.projectBrief || '', status: p.status || 'Running'
        });
        setStats(statsRes.data);
      } catch (e) { console.error("Error fetching project data", e); }
    };
    
    if (id) fetchProjectAndStats();
  }, [id]);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleDeviceChange = (device) => setFormData(prev => ({
    ...prev, supportedDevices: { ...prev.supportedDevices, [device]: !prev.supportedDevices[device] }
  }));

  const handleUpdate = async () => {
    try {
      const devices = [];
      if (formData.supportedDevices.desktop) devices.push('Desktop');
      if (formData.supportedDevices.mobile) devices.push('Mobile');
      if (formData.supportedDevices.tablet) devices.push('Tablet');

      const payload = {
          ...formData, supportedDevices: devices,
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

      await api.put(`/admin/projects/${id}`, payload);
      alert("Project updated successfully");
      navigate('/projects');
    } catch (e) {
      console.error("Error updating project", e);
      alert("Failed to update project.");
    }
  };

  return (
    <div className="pt-4">
      {/* Action Buttons Row */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between text-xs shadow-sm mb-4">
         <div className="flex space-x-2">
            <button onClick={() => setShowEndPagesModal(true)} className="bg-[#4eb3f7] hover:bg-blue-400 text-white px-3 py-1.5 rounded font-bold flex items-center shadow-sm"><FileText size={14} className="mr-1"/> End Pages</button>
            <button onClick={() => setShowLinkCodesModal(true)} className="bg-[#128a8a] hover:bg-teal-600 text-white px-3 py-1.5 rounded font-bold flex items-center shadow-sm"><LinkIcon size={14} className="mr-1"/> Link Codes</button>
            <button onClick={() => setShowRedirectStatusModal(true)} className="bg-[#5c6e80] hover:bg-gray-600 text-white px-3 py-1.5 rounded font-bold flex items-center shadow-sm"><AlertCircle size={14} className="mr-1"/> Redirect Status ID(s)</button>
            <button className="bg-[#ff8a65] hover:bg-orange-500 text-white px-3 py-1.5 rounded font-bold flex items-center shadow-sm"><Mail size={14} className="mr-1"/> RFQ</button>
         </div>
         <div className="flex items-center space-x-4">
             <span className="font-bold text-gray-700">True Up :</span>
             <span className="bg-green-100 text-green-700 px-4 py-1 rounded font-bold border border-green-200 uppercase">{formData.status}</span>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-12 flex space-x-6">
        
        {/* LEFT COLUMN - ACCORDION FORM */}
        <div className="flex-1 bg-white p-6 shadow-sm border rounded">
           <div className="space-y-4">
            
            {/* 1. Setup Requirements */}
            <div className="border rounded">
              <div className="bg-gray-50 p-3 flex justify-between items-center cursor-pointer text-sm font-bold text-gray-700" onClick={() => toggleSection('setup')}>
                <span>Setup Requirements</span>
                {openSections.setup ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
              {openSections.setup && (
                <div className="p-4 space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-gray-600 mb-1">Project Name</label><input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border p-2 rounded" /></div>
                    <div><label className="block text-gray-600 mb-1">Parent Project</label><select name="parentProjectId" value={formData.parentProjectId} onChange={handleChange} className="w-full border p-2 rounded"><option value="">Self Parent</option>{allProjects.filter(p => p._id !== id).map(p => <option key={p._id} value={p._id}>{p.name}</option>)}</select></div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-gray-600 mb-1">Study Type</label>
                      <select name="studyTypeId" value={formData.studyTypeId} onChange={handleChange} className="w-full border p-2 rounded">
                        <option value="">Please Select</option>
                        {studyTypes.map(st => <option key={st._id} value={st._id}>{st.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-600 mb-1">Country</label>
                      <select name="country" value={formData.country} onChange={handleChange} className="w-full border p-2 rounded">
                        <option value="">Select Country</option>
                        {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-600 mb-1">Language</label>
                      <select name="language" value={formData.language} onChange={handleChange} className="w-full border p-2 rounded">
                        <option value="">Select Language</option>
                        {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div><label className="block text-gray-600 mb-1">CPC $</label><input type="number" step="0.01" name="cpc" value={formData.cpc} onChange={handleChange} className="w-full border p-2 rounded" /></div>
                    <div><label className="block text-gray-600 mb-1">Vendor Max CPC $</label><input type="number" step="0.01" name="vendorMaxCpc" value={formData.vendorMaxCpc} onChange={handleChange} className="w-full border p-2 rounded" /></div>
                    <div><label className="block text-gray-600 mb-1">Invoice Currency</label><select name="invoiceCurrency" value={formData.invoiceCurrency} onChange={handleChange} className="w-full border p-2 rounded"><option>US Dollar</option></select></div>
                    <div><label className="block text-gray-600 mb-1">Conversion Rate</label><input type="number" step="0.01" name="conversionRate" value={formData.conversionRate} onChange={handleChange} className="w-full border p-2 rounded" /></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-gray-600 mb-1">Survey Friendly Name</label><input type="text" name="surveyFriendlyName" value={formData.surveyFriendlyName} onChange={handleChange} className="w-full border p-2 rounded" /></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div><label className="block text-gray-600 mb-1">PV $</label><input type="number" step="0.01" name="pv" value={formData.pv} onChange={handleChange} className="w-full border p-2 rounded" /></div>
                        <div><label className="block text-gray-600 mb-1">Setup Cost $</label><input type="number" step="0.01" name="setupCost" value={formData.setupCost} onChange={handleChange} className="w-full border p-2 rounded" /></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-gray-600 mb-1">Survey Link</label><textarea name="surveyLink" value={formData.surveyLink} onChange={handleChange} className="w-full border p-2 rounded h-20 text-[10px]"></textarea></div>
                    <div><label className="block text-gray-600 mb-1">Survey Test Link</label><textarea name="surveyTestLink" value={formData.surveyTestLink} onChange={handleChange} className="w-full border p-2 rounded h-20 text-[10px]"></textarea></div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Expected Metrics & Data */}
            <div className="border rounded">
              <div className="bg-gray-50 p-3 flex justify-between items-center cursor-pointer text-sm font-bold text-gray-700" onClick={() => toggleSection('metrics')}>
                <span>Expected Metrics & Data</span>
                {openSections.metrics ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
              {openSections.metrics && (
                <div className="p-4 space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-gray-600 mb-1">Req. Completes :</label><input type="number" name="reqCompletes" value={formData.reqCompletes} onChange={handleChange} className="w-full border p-2 rounded" /></div>
                    <div><label className="block text-gray-600 mb-1">Max. Completes</label><select name="maxCompletes" value={formData.maxCompletes} onChange={handleChange} className="w-full border p-2 rounded"><option>No Max Limit</option></select></div>
                    <div><label className="block text-gray-600 mb-1">LOI</label><input type="text" name="loi" value={formData.loi} onChange={handleChange} className="w-full border p-2 rounded" /></div>
                    <div><label className="block text-gray-600 mb-1">IR</label><input type="number" name="ir" value={formData.ir} onChange={handleChange} className="w-full border p-2 rounded" /></div>
                    <div><label className="block text-gray-600 mb-1"># of points to award</label><input type="number" name="pointsToAward" value={formData.pointsToAward} onChange={handleChange} className="w-full border p-2 rounded" /></div>
                    <div>
                      <label className="block text-gray-600 mb-2">Supported Devices :</label>
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center space-x-1 cursor-pointer"><input type="checkbox" checked={formData.supportedDevices.desktop} onChange={() => handleDeviceChange('desktop')} /><Monitor size={20} className={formData.supportedDevices.desktop ? 'text-blue-500' : 'text-gray-400'} /></label>
                        <label className="flex items-center space-x-1 cursor-pointer"><input type="checkbox" checked={formData.supportedDevices.mobile} onChange={() => handleDeviceChange('mobile')} /><Smartphone size={20} className={formData.supportedDevices.mobile ? 'text-blue-500' : 'text-gray-400'} /></label>
                        <label className="flex items-center space-x-1 cursor-pointer"><input type="checkbox" checked={formData.supportedDevices.tablet} onChange={() => handleDeviceChange('tablet')} /><Tablet size={20} className={formData.supportedDevices.tablet ? 'text-blue-500' : 'text-gray-400'} /></label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. People */}
            <div className="border rounded">
              <div className="bg-gray-50 p-3 flex justify-between items-center cursor-pointer text-sm font-bold text-gray-700" onClick={() => toggleSection('people')}>
                <span>People</span>
                {openSections.people ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
              {openSections.people && (
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-gray-600 mb-1">Client</label>
                    <select name="clientId" value={formData.clientId} onChange={handleChange} className="w-full border p-2 rounded">
                      <option value="">Please Select</option>
                      {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div><label className="block text-gray-600 mb-1">Client Contact</label><select name="clientContactId" value={formData.clientContactId} onChange={handleChange} className="w-full border p-2 rounded"><option value="">Select Client Contact</option></select></div>
                  <div><label className="block text-gray-600 mb-1">Project Manager</label><select name="projectManager" value={formData.projectManager} onChange={handleChange} className="w-full border p-2 rounded"><option>Admin TTP</option></select></div>
                  <div><label className="block text-gray-600 mb-1">Sales Person</label><select name="salesPerson" value={formData.salesPerson} onChange={handleChange} className="w-full border p-2 rounded"><option>Admin TTP</option></select></div>
                </div>
              )}
            </div>

            {/* 4. Timeline */}
            <div className="border rounded">
              <div className="bg-gray-50 p-3 flex justify-between items-center cursor-pointer text-sm font-bold text-gray-700" onClick={() => toggleSection('timeline')}>
                <span>Timeline</span>
                {openSections.timeline ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
              {openSections.timeline && (
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div><label className="block text-gray-600 mb-1">Start Date</label><input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full border p-2 rounded" /></div>
                  <div><label className="block text-gray-600 mb-1">End Date</label><input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="w-full border p-2 rounded" /></div>
                </div>
              )}
            </div>

            {/* 5. Memorandum */}
            <div className="border rounded">
              <div className="bg-gray-50 p-3 flex justify-between items-center cursor-pointer text-sm font-bold text-gray-700" onClick={() => toggleSection('memo')}>
                <span>Memorandum</span>
                {openSections.memo ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
              {openSections.memo && (
                <div className="p-4 space-y-4 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-gray-600 mb-1">Notes</label><textarea name="notes" value={formData.notes} onChange={handleChange} className="w-full border p-2 rounded h-24"></textarea></div>
                    <div><label className="block text-gray-600 mb-1">Project Brief (All Partner)</label><textarea name="projectBrief" value={formData.projectBrief} onChange={handleChange} className="w-full border p-2 rounded h-24"></textarea></div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded border text-gray-600 leading-tight">
                        Notes For Project Invoicing:<br/>
                        PO: {`{{PO Number}}`}<br/>
                        CID: {`{{CID Number}}`}<br/>
                        Client Email: {`{{Email Address}}`}<br/>
                        Notes: {`{{Notes}}`}
                    </div>
                </div>
              )}
            </div>

            {/* 6. Status */}
            <div className="border rounded mb-4">
              <div className="bg-gray-50 p-3 flex justify-between items-center cursor-pointer text-sm font-bold text-gray-700" onClick={() => toggleSection('status')}>
                <span>Status</span>
                {openSections.status ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
              {openSections.status && (
                <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div><label className="block text-gray-600 mb-1">Status</label><select name="status" value={formData.status} onChange={handleChange} className="w-full border p-2 rounded"><option>Running</option><option>Closed</option></select></div>
                  <div><label className="block text-gray-600 mb-1">Invoice Status</label><select className="w-full border p-2 rounded"><option>Pending</option></select></div>
                  <div><label className="block text-gray-600 mb-1">Invoice Number</label><input type="text" className="w-full border p-2 rounded" value="0" readOnly /></div>
                </div>
              )}
            </div>
            
            {/* Form Footer Buttons */}
            <div className="flex space-x-2 pt-2 pb-4">
              <button onClick={handleUpdate} className="bg-[#4eb3f7] hover:bg-blue-400 text-white px-5 py-1.5 rounded text-sm font-bold shadow-sm">Update</button>
              <button className="bg-[#5c6e80] hover:bg-gray-600 text-white px-5 py-1.5 rounded text-sm font-bold shadow-sm">Clone</button>
              <button onClick={() => navigate('/projects')} className="bg-white border border-red-300 text-red-500 hover:bg-red-50 px-5 py-1.5 rounded text-sm font-bold shadow-sm">Cancel</button>
            </div>

            {/* Change Log */}
            <div className="border rounded mb-6">
              <div className="bg-white p-3 flex justify-between items-center cursor-pointer text-sm text-gray-700" onClick={() => toggleSection('changeLog')}>
                <span>Change Log</span>
                {openSections.changeLog ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </div>

           </div>
        </div>

        {/* RIGHT COLUMN - SIDEBAR */}
        <div className="w-80 flex flex-col space-y-6">
            
            {/* Security Panel */}
            <div className="bg-white border rounded shadow-sm">
                <div className="bg-gray-50 border-b p-3 text-sm font-bold text-gray-700">Basic Security</div>
                <div className="p-4 text-xs space-y-3">
                    <label className="flex justify-between items-center text-green-600 cursor-pointer">Validate Blank Referrer <input type="checkbox" name="validateBlankReferrer" checked={security.validateBlankReferrer} onChange={handleSecurityChange}/></label>
                    <label className="flex justify-between items-center text-green-600 cursor-pointer">Validate Start/End IP <input type="checkbox" name="validateStartEndIp" checked={security.validateStartEndIp} onChange={handleSecurityChange}/></label>
                    
                    <div className="pt-2 border-t mt-2">
                        <div className="flex justify-between text-[#4b8df8] font-bold mb-2">veritasIdentity <span className="text-green-500 font-normal">$ Billed Monthly</span></div>
                        <label className="flex justify-between items-center text-gray-800 font-medium cursor-pointer mb-2">Device Validation <input type="checkbox" name="deviceValidation" checked={security.deviceValidation} onChange={handleSecurityChange}/></label>
                        <label className="flex justify-between items-center text-gray-800 font-medium cursor-pointer mb-2">Geographic Validation <input type="checkbox" name="geographicValidation" checked={security.geographicValidation} onChange={handleSecurityChange}/></label>
                        
                        <label className="flex justify-between items-center text-gray-800 font-medium cursor-pointer mb-1 mt-3">Traffic Anonymization Controls <input type="checkbox" name="trafficAnonymization" checked={security.trafficAnonymization} onChange={handleSecurityChange}/></label>
                        <p className="text-[9px] text-gray-500 mb-2 leading-tight">VPN/Proxy Detection</p>
                        
                        <label className="flex justify-between items-center text-gray-800 font-medium cursor-pointer mb-1">Threat Intelligence <input type="checkbox" name="threatIntelligence" checked={security.threatIntelligence} onChange={handleSecurityChange}/></label>
                        <p className="text-[9px] text-gray-500 mb-2 leading-tight">Known Threat Sources, Malicious Actor Detection, Tor Network Detection</p>
                        
                        <label className="flex justify-between items-center text-gray-800 font-medium cursor-pointer mb-1">Bot & Automated Traffic Detection <input type="checkbox" name="botDetection" checked={security.botDetection} onChange={handleSecurityChange}/></label>
                        <p className="text-[9px] text-gray-500 mb-2 leading-tight">Anonymous Traffic Detection</p>

                        <label className="flex justify-between items-center text-gray-800 font-medium cursor-pointer mt-3 pt-3 border-t">RDE/Profanity Check <input type="checkbox" name="rdeProfanityCheck" checked={security.rdeProfanityCheck} onChange={handleSecurityChange}/></label>
                    </div>
                </div>
            </div>

            {/* Statistics Panel */}
            <div className="bg-white border rounded shadow-sm">
              <div className="bg-gray-50 border-b p-3 font-bold text-gray-700 text-sm">Statistics</div>
              <div className="p-4 text-center text-xs">
                
                {/* Row 1 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
                  <div>
                    <p className="text-gray-500 mb-1">Total Hits</p>
                    <p className="text-xl text-blue-500 font-light">{stats.totalHits}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Redirects</p>
                    <p className="text-xl text-blue-500 font-light">{stats.redirects}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Blocked</p>
                    <p className="text-xl text-red-600 font-light flex items-center justify-center">{stats.blocked} <ShieldAlert size={14} className="ml-1 text-red-500"/></p>
                  </div>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                  <div>
                    <p className="text-gray-500 mb-1">Completed</p>
                    <p className="text-xl text-green-500 font-light">{stats.completed}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Disqualified</p>
                    <p className="text-xl text-orange-500 font-light">{stats.disqualified}</p>
                  </div>
                </div>

                {/* Row 3 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                  <div>
                    <p className="text-gray-500 mb-1">Quota Full</p>
                    <p className="text-xl text-yellow-600 font-light">{stats.quotaFull}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Security Terminate</p>
                    <p className="text-xl text-red-500 font-light">{stats.securityTerminate}</p>
                  </div>
                </div>

                <hr className="my-4"/>

                {/* Row 4 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
                  <div>
                    <p className="text-gray-500 mb-1">EPC</p>
                    <p className="text-lg text-gray-800 font-light">${stats.epc}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">CR</p>
                    <p className="text-lg text-gray-800 font-light">{stats.cr}%</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">IR</p>
                    <p className="text-lg text-gray-800 font-light">{stats.ir}%</p>
                  </div>
                </div>

                <hr className="my-4"/>

                {/* Row 5 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
                  <div>
                    <p className="text-gray-500 mb-1">Average LOI</p>
                    <p className="text-lg text-gray-800 font-light">{stats.avgLoi} <span className="text-xs">min</span></p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Median LOI</p>
                    <p className="text-lg text-gray-800 font-light">{stats.medianLoi} <span className="text-xs">min</span></p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Abandons</p>
                    <p className="text-lg text-red-500 font-light">{stats.abandons}%</p>
                  </div>
                </div>

                <hr className="my-4"/>

                <div className="text-left mt-2">
                  <p className="text-gray-500 mb-1">Last Completed</p>
                  <p className="text-sm font-bold text-gray-800">{stats.lastCompleted}</p>
                </div>

              </div>
            </div>

        </div>

      </div>

            {/* End Pages Modal */}
      {showEndPagesModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h3 className="text-base font-bold text-gray-800">Redirect End Pages & Variables</h3>
              <button 
                className="text-gray-400 hover:text-gray-700 transition" 
                onClick={() => setShowEndPagesModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6 text-xs">
              {/* Section 1: End Links */}
              <div>
                <h4 className="text-sm font-bold text-gray-800 border-b pb-1 mb-3">End Links</h4>
                <div className="space-y-3">
                  <div>
                    <span className="font-bold text-green-600 block mb-0.5">Complete:</span>
                    <div className="flex items-center justify-between bg-gray-50 border p-2 rounded">
                      <code className="text-gray-700 break-all select-all font-mono">
                        {`${serverBaseUrl}/redirect-process/?supp_code=55&authToken=${getAuthToken('1', id)}`}
                      </code>
                      <button onClick={() => copyToClipboard(`${serverBaseUrl}/redirect-process/?supp_code=55&authToken=${getAuthToken('1', id)}`, 'c1')} className="ml-2 text-gray-500 hover:text-blue-600">
                        {copiedKey === 'c1' ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="font-bold text-red-500 block mb-0.5">Terminate:</span>
                    <div className="flex items-center justify-between bg-gray-50 border p-2 rounded">
                      <code className="text-gray-700 break-all select-all font-mono">
                        {`${serverBaseUrl}/redirect-process/?supp_code=55&authToken=${getAuthToken('2', id)}`}
                      </code>
                      <button onClick={() => copyToClipboard(`${serverBaseUrl}/redirect-process/?supp_code=55&authToken=${getAuthToken('2', id)}`, 'c2')} className="ml-2 text-gray-500 hover:text-blue-600">
                        {copiedKey === 'c2' ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="font-bold text-orange-500 block mb-0.5">Quota Full:</span>
                    <div className="flex items-center justify-between bg-gray-50 border p-2 rounded">
                      <code className="text-gray-700 break-all select-all font-mono">
                        {`${serverBaseUrl}/redirect-process/?supp_code=55&authToken=${getAuthToken('3', id)}`}
                      </code>
                      <button onClick={() => copyToClipboard(`${serverBaseUrl}/redirect-process/?supp_code=55&authToken=${getAuthToken('3', id)}`, 'c3')} className="ml-2 text-gray-500 hover:text-blue-600">
                        {copiedKey === 'c3' ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="font-bold text-red-600 block mb-0.5">Security Term:</span>
                    <div className="flex items-center justify-between bg-gray-50 border p-2 rounded">
                      <code className="text-gray-700 break-all select-all font-mono">
                        {`${serverBaseUrl}/redirect-process/?supp_code=55&authToken=${getAuthToken('4', id)}`}
                      </code>
                      <button onClick={() => copyToClipboard(`${serverBaseUrl}/redirect-process/?supp_code=55&authToken=${getAuthToken('4', id)}`, 'c4')} className="ml-2 text-gray-500 hover:text-blue-600">
                        {copiedKey === 'c4' ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: S2S Postback Link */}
              <div>
                <h4 className="text-sm font-bold text-gray-800 border-b pb-1 mb-3">S2S Postback Link</h4>
                <div>
                  <span className="font-bold text-green-600 block mb-0.5">S2S Postback Link:</span>
                  <div className="flex items-center justify-between bg-gray-50 border p-2 rounded">
                    <code className="text-gray-700 break-all select-all font-mono">
                      {`${serverBaseUrl}/redirect-postback/?pid=[[TTPID]]&status_id=[[status]]`}
                    </code>
                    <button onClick={() => copyToClipboard(`${serverBaseUrl}/redirect-postback/?pid=[[TTPID]]&status_id=[[status]]`, 's2s')} className="ml-2 text-gray-500 hover:text-blue-600">
                      {copiedKey === 's2s' ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Section 3: Static Links */}
              <div>
                <h4 className="text-sm font-bold text-gray-800 border-b pb-1 mb-3">Static Links</h4>
                <div className="space-y-3">
                  <div>
                    <span className="font-bold text-green-600 block mb-0.5">Complete:</span>
                    <div className="flex items-center justify-between bg-gray-50 border p-2 rounded">
                      <code className="text-gray-700 break-all select-all font-mono">
                        {`${serverBaseUrl}/redirect-process/?supp_code=55&status=1&pid=[[TTPID]]`}
                      </code>
                      <button onClick={() => copyToClipboard(`${serverBaseUrl}/redirect-process/?supp_code=55&status=1&pid=[[TTPID]]`, 'st1')} className="ml-2 text-gray-500 hover:text-blue-600">
                        {copiedKey === 'st1' ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="font-bold text-red-500 block mb-0.5">Terminate:</span>
                    <div className="flex items-center justify-between bg-gray-50 border p-2 rounded">
                      <code className="text-gray-700 break-all select-all font-mono">
                        {`${serverBaseUrl}/redirect-process/?supp_code=55&status=2&pid=[[TTPID]]`}
                      </code>
                      <button onClick={() => copyToClipboard(`${serverBaseUrl}/redirect-process/?supp_code=55&status=2&pid=[[TTPID]]`, 'st2')} className="ml-2 text-gray-500 hover:text-blue-600">
                        {copiedKey === 'st2' ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="font-bold text-orange-500 block mb-0.5">Quota Full:</span>
                    <div className="flex items-center justify-between bg-gray-50 border p-2 rounded">
                      <code className="text-gray-700 break-all select-all font-mono">
                        {`${serverBaseUrl}/redirect-process/?supp_code=55&status=3&pid=[[TTPID]]`}
                      </code>
                      <button onClick={() => copyToClipboard(`${serverBaseUrl}/redirect-process/?supp_code=55&status=3&pid=[[TTPID]]`, 'st3')} className="ml-2 text-gray-500 hover:text-blue-600">
                        {copiedKey === 'st3' ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="font-bold text-red-600 block mb-0.5">Security Term:</span>
                    <div className="flex items-center justify-between bg-gray-50 border p-2 rounded">
                      <code className="text-gray-700 break-all select-all font-mono">
                        {`${serverBaseUrl}/redirect-process/?supp_code=55&status=4&pid=[[TTPID]]`}
                      </code>
                      <button onClick={() => copyToClipboard(`${serverBaseUrl}/redirect-process/?supp_code=55&status=4&pid=[[TTPID]]`, 'st4')} className="ml-2 text-gray-500 hover:text-blue-600">
                        {copiedKey === 'st4' ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-3 border-t flex justify-end">
              <button 
                onClick={() => setShowEndPagesModal(false)}
                className="bg-[#00b5ad] hover:bg-teal-600 text-white font-bold text-xs px-5 py-2 rounded shadow-sm transition"
              >
                Okay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Link Codes Modal */}
      {showLinkCodesModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-200">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h3 className="text-base font-bold text-gray-800">Redirect End Pages & Variables</h3>
              <button 
                className="text-gray-400 hover:text-gray-700 transition" 
                onClick={() => setShowLinkCodesModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
              {/* Left Column: Client Link Variable */}
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Client Link Variable</h4>
                <p className="text-gray-600 mb-2 leading-relaxed">
                  These variables shall be used only in client survey link.The values of the variable shall be replaced in begin pages and then passed to client survey link url.
                </p>
                <p className="font-semibold text-red-500 mb-4">
                  These variables are case sensitive
                </p>

                <div className="border rounded overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <tbody>
                      <tr className="border-b">
                        <td className="p-2.5 font-bold text-gray-800 w-1/3">ClientCode</td>
                        <td className="p-2.5 text-gray-700 font-mono flex items-center justify-between">
                          <span>{`{{CLIENTKEY}}`}</span>
                          <button onClick={() => copyToClipboard('{{CLIENTKEY}}', 'lc1')} className="text-gray-400 hover:text-blue-600">
                            {copiedKey === 'lc1' ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                          </button>
                        </td>
                      </tr>
                      <tr className="border-b bg-gray-50/50">
                        <td className="p-2.5 font-bold text-gray-800">ID</td>
                        <td className="p-2.5 text-gray-700 font-mono flex items-center justify-between">
                          <span>{`{{ID}}`}</span>
                          <button onClick={() => copyToClipboard('{{ID}}', 'lc2')} className="text-gray-400 hover:text-blue-600">
                            {copiedKey === 'lc2' ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                          </button>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2.5 font-bold text-gray-800">Ext</td>
                        <td className="p-2.5 text-gray-700 font-mono flex items-center justify-between">
                          <span>{`{{PASSTHRU}}`}</span>
                          <button onClick={() => copyToClipboard('{{PASSTHRU}}', 'lc3')} className="text-gray-400 hover:text-blue-600">
                            {copiedKey === 'lc3' ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                          </button>
                        </td>
                      </tr>
                      <tr className="border-b bg-gray-50/50">
                        <td className="p-2.5 font-bold text-gray-800">Re Connect ID</td>
                        <td className="p-2.5 text-gray-700 font-mono flex items-center justify-between">
                          <span>{`{{RECONNECTID}}`}</span>
                          <button onClick={() => copyToClipboard('{{RECONNECTID}}', 'lc4')} className="text-gray-400 hover:text-blue-600">
                            {copiedKey === 'lc4' ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                          </button>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2.5 font-bold text-gray-800">Zip</td>
                        <td className="p-2.5 text-gray-700 font-mono flex items-center justify-between">
                          <span>{`{{Zip}}`}</span>
                          <button onClick={() => copyToClipboard('{{Zip}}', 'lc5')} className="text-gray-400 hover:text-blue-600">
                            {copiedKey === 'lc5' ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                          </button>
                        </td>
                      </tr>
                      <tr className="border-b bg-gray-50/50">
                        <td className="p-2.5 font-bold text-gray-800">Age</td>
                        <td className="p-2.5 text-gray-700 font-mono flex items-center justify-between">
                          <span>{`{{Age}}`}</span>
                          <button onClick={() => copyToClipboard('{{Age}}', 'lc6')} className="text-gray-400 hover:text-blue-600">
                            {copiedKey === 'lc6' ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                          </button>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2.5 font-bold text-gray-800">Gender</td>
                        <td className="p-2.5 text-gray-700 font-mono flex items-center justify-between">
                          <span>{`{{Gender}}`}</span>
                          <button onClick={() => copyToClipboard('{{Gender}}', 'lc7')} className="text-gray-400 hover:text-blue-600">
                            {copiedKey === 'lc7' ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-gray-800">authToken</td>
                        <td className="p-2.5 text-gray-700 font-mono flex items-center justify-between">
                          <span>{`{{authToken}}`}</span>
                          <button onClick={() => copyToClipboard('{{authToken}}', 'lc8')} className="text-gray-400 hover:text-blue-600">
                            {copiedKey === 'lc8' ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Column: Vendor Link Variable */}
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Vendor Link Variable</h4>
                <p className="text-gray-600 mb-2 leading-relaxed">
                  These variables shall be used only with vendor endpages.The values shall be replaced in end pages and then passed to vendor end pages.
                </p>
                <p className="font-semibold text-red-500 mb-4">
                  These variables are case sensitive
                </p>

                <div className="border rounded overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <tbody>
                      <tr className="border-b">
                        <td className="p-2.5 font-bold text-gray-800 w-1/3">Ext</td>
                        <td className="p-2.5 text-gray-700 font-mono flex items-center justify-between">
                          <span>{`{{PASSTHRU}}`}</span>
                          <button onClick={() => copyToClipboard('{{PASSTHRU}}', 'lv1')} className="text-gray-400 hover:text-blue-600">
                            {copiedKey === 'lv1' ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                          </button>
                        </td>
                      </tr>
                      <tr className="border-b bg-gray-50/50">
                        <td className="p-2.5 font-bold text-gray-800">Re Connect ID</td>
                        <td className="p-2.5 text-gray-700 font-mono flex items-center justify-between">
                          <span>{`{{RECONNECTID}}`}</span>
                          <button onClick={() => copyToClipboard('{{RECONNECTID}}', 'lv2')} className="text-gray-400 hover:text-blue-600">
                            {copiedKey === 'lv2' ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-gray-800">Panellist ID</td>
                        <td className="p-2.5 text-gray-700 font-mono flex items-center justify-between">
                          <span>{`{{panellist_id}}`}</span>
                          <button onClick={() => copyToClipboard('{{panellist_id}}', 'lv3')} className="text-gray-400 hover:text-blue-600">
                            {copiedKey === 'lv3' ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-3 border-t flex justify-end">
              <button 
                onClick={() => setShowLinkCodesModal(false)}
                className="bg-[#00b5ad] hover:bg-teal-600 text-white font-bold text-xs px-5 py-2 rounded shadow-sm transition"
              >
                Okay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Redirect Status ID(s) Modal */}
      {showRedirectStatusModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-gray-200">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h3 className="text-base font-bold text-gray-800">Redirect Status ID(s)</h3>
              <button 
                className="text-gray-400 hover:text-gray-700 transition" 
                onClick={() => setShowRedirectStatusModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 text-sm text-gray-800 space-y-2 font-normal">
              <div>6 : Completed</div>
              <div>7 : Disqualified</div>
              <div>8 : Quota FULL</div>
              <div>9 : Redirected</div>
              <div>10 : Rejected - Failed SECURITY</div>
              <div>11 : Rejected - Inconsistency</div>
              <div>12 : Rejected - Poor OPEN ENDS</div>
              <div>13 : Rejected - Quality issues</div>
              <div>14 : Rejected - Speeding</div>
              <div>31 : Rejected - Blank Referrer</div>
              <div>32 : Rejected - IP Mismatch</div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-3 border-t flex justify-end">
              <button 
                onClick={() => setShowRedirectStatusModal(false)}
                className="bg-[#5c6e80] hover:bg-gray-700 text-white font-bold text-xs px-5 py-2 rounded shadow-sm transition"
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

export default EditProjectForm;

