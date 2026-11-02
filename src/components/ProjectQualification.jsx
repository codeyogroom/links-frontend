import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, X, Plus, Filter, CheckCircle2 } from 'lucide-react';
import { useParams } from 'react-router-dom';
import api from '../api';
import Loader from './Loader';

const STANDARD_PRESETS = [
  {
    id: 'age',
    name: 'What is your age?',
    fieldType: 'Range',
    defaultRanges: [
      { start: 18, end: 24, valid: 1, optionText: '-' },
      { start: 25, end: 34, valid: 1, optionText: '-' },
      { start: 35, end: 44, valid: 1, optionText: '-' },
      { start: 45, end: 54, valid: 1, optionText: '-' },
      { start: 55, end: 64, valid: 1, optionText: '-' },
      { start: 65, end: 99, valid: 1, optionText: '-' }
    ]
  },
  {
    id: 'gender',
    name: 'What is your gender?',
    fieldType: 'Dropdown',
    defaultOptions: [
      { start: '-', end: '-', valid: 1, optionText: 'Male' },
      { start: '-', end: '-', valid: 1, optionText: 'Female' }
    ]
  }
];

function ProjectQualification() {
  const { id } = useParams();
  const [qualifications, setQualifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddStandardModal, setShowAddStandardModal] = useState(false);
  const [showAddCustomModal, setShowAddCustomModal] = useState(false);

  // Add Standard Form
  const [selectedStandard, setSelectedStandard] = useState('age');

  // Add Custom Form
  const [customForm, setCustomForm] = useState({
    questionName: '',
    fieldType: 'Dropdown',
    optionsText: '',
    rangeStart: '',
    rangeEnd: ''
  });

  useEffect(() => {
    fetchQualifications();
  }, [id]);

  const fetchQualifications = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/projects/${id}/qualifications`);
      setQualifications(res.data || []);
    } catch (e) {
      console.error('Error fetching qualifications:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStandard = async () => {
    const preset = STANDARD_PRESETS.find(p => p.id === selectedStandard);
    if (!preset) return;

    try {
      let payload = {
        questionType: preset.id === 'age' ? 'Age' : (preset.id === 'gender' ? 'Gender' : 'Standard'),
        questionName: preset.name,
        fieldType: preset.fieldType,
        isActive: true
      };

      if (preset.fieldType === 'Range') {
        payload.ranges = preset.defaultRanges;
      } else {
        payload.optionItems = preset.defaultOptions;
        payload.options = preset.defaultOptions.map(o => o.optionText);
      }

      await api.post(`/admin/projects/${id}/qualifications`, payload);
      setShowAddStandardModal(false);
      fetchQualifications();
    } catch (e) {
      console.error(e);
      alert('Failed to add qualification.');
    }
  };

  const handleAddCustom = async () => {
    if (!customForm.questionName.trim()) {
      return alert('Please enter question name.');
    }

    try {
      let payload = {
        questionType: 'Custom',
        questionName: customForm.questionName.trim(),
        fieldType: customForm.fieldType,
        isActive: true
      };

      if (customForm.fieldType === 'Range') {
        const start = Number(customForm.rangeStart) || 0;
        const end = Number(customForm.rangeEnd) || 100;
        payload.ranges = [{ start, end, valid: 1, optionText: '-' }];
      } else {
        const opts = customForm.optionsText
          .split(/\r?\n/)
          .map(o => o.trim())
          .filter(Boolean);
        payload.options = opts;
        payload.optionItems = opts.map(opt => ({ start: '-', end: '-', valid: 1, optionText: opt }));
      }

      await api.post(`/admin/projects/${id}/qualifications`, payload);
      setShowAddCustomModal(false);
      setCustomForm({
        questionName: '',
        fieldType: 'Dropdown',
        optionsText: '',
        rangeStart: '',
        rangeEnd: ''
      });
      fetchQualifications();
    } catch (e) {
      console.error(e);
      alert('Failed to add custom qualification.');
    }
  };

  const handleDelete = async (qualId) => {
    if (!window.confirm('Are you sure you want to delete this qualification?')) return;
    try {
      await api.delete(`/admin/qualifications/${qualId}`);
      fetchQualifications();
    } catch (e) {
      console.error(e);
      alert('Failed to delete qualification.');
    }
  };

  const handleDeleteRow = async (qual, rowIndex, isRange) => {
    try {
      let updatedPayload = { ...qual };
      if (isRange) {
        updatedPayload.ranges = (qual.ranges || []).filter((_, idx) => idx !== rowIndex);
      } else {
        updatedPayload.optionItems = (qual.optionItems || []).filter((_, idx) => idx !== rowIndex);
        updatedPayload.options = (qual.options || []).filter((_, idx) => idx !== rowIndex);
      }

      await api.put(`/admin/qualifications/${qual._id}`, updatedPayload);
      fetchQualifications();
    } catch (e) {
      console.error(e);
      alert('Failed to delete row.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Filter size={20} className="text-blue-600" />
            Project Qualification
          </h1>
          <p className="text-xs text-slate-500 mt-1">Define demographic criteria, screener rules, and range constraints for survey entry.</p>
        </div>
        <div className="flex items-center space-x-2.5 self-start sm:self-auto">
          <button 
            onClick={() => setShowAddCustomModal(true)} 
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center shadow-xs transition"
          >
            <Plus size={14} className="mr-1.5" /> Add Custom
          </button>
          <button 
            onClick={() => setShowAddStandardModal(true)} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center shadow-xs hover:shadow transition"
          >
            <Plus size={14} className="mr-1.5" /> Add Standard Preset
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-12"><Loader /></div>
      ) : qualifications.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center text-slate-400 text-xs shadow-xs">
          <Filter size={32} className="mx-auto mb-2 opacity-30" />
          <p className="font-semibold text-slate-700 text-sm">No qualifications configured</p>
          <p className="text-slate-400 mt-1">Click &quot;Add Standard Preset&quot; (Age/Gender) or &quot;Add Custom&quot; to establish participant screening.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {qualifications.map(q => {
            const isRange = q.fieldType === 'Range' || q.questionType === 'Age';
            const questionTitle = q.questionName || q.customQuestionName || (q.questionType === 'Age' ? 'What is your age?' : (q.questionType === 'Gender' ? 'What is your gender?' : 'Custom Qualification'));
            const badgeType = q.fieldType || (isRange ? 'Range' : 'Dropdown');

            let rows = [];
            if (isRange) {
              if (q.ranges && q.ranges.length > 0) {
                rows = q.ranges;
              } else if (q.rangeStart !== undefined && q.rangeEnd !== undefined) {
                rows = [{ start: q.rangeStart, end: q.rangeEnd, valid: 1, optionText: '-' }];
              }
            } else {
              if (q.optionItems && q.optionItems.length > 0) {
                rows = q.optionItems;
              } else if (q.options && q.options.length > 0) {
                rows = q.options.map(opt => ({ start: '-', end: '-', valid: 1, optionText: opt }));
              }
            }

            return (
              <div key={q._id} className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs bg-white">
                {/* Header Bar */}
                <div className="bg-slate-50/80 border-b border-slate-200/80 px-5 py-3.5 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      {q.isActive !== false ? 'Active' : 'Inactive'}
                    </span>

                    <span className="text-sm font-bold text-slate-900">
                      {questionTitle}
                    </span>

                    <span className="bg-blue-50 text-blue-700 border border-blue-200/80 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                      {badgeType}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button onClick={() => handleDelete(q._id)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition" title="Delete Rule">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        <th className="py-2.5 px-4 w-28">Status</th>
                        <th className="py-2.5 px-4 w-24">Start</th>
                        <th className="py-2.5 px-4 w-24">End</th>
                        <th className="py-2.5 px-4 w-24">Valid?</th>
                        <th className="py-2.5 px-4">Option Text</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-2.5 px-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <button
                                className="text-slate-300 hover:text-rose-500 transition"
                                onClick={() => handleDeleteRow(q, idx, isRange)}
                                title="Remove row"
                              >
                                <Trash2 size={13} />
                              </button>
                              <span className="text-xs font-semibold text-emerald-600">Active</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-4 font-mono font-semibold text-blue-600">{row.start !== undefined ? row.start : '-'}</td>
                          <td className="py-2.5 px-4 font-mono font-semibold text-blue-600">{row.end !== undefined ? row.end : '-'}</td>
                          <td className="py-2.5 px-4 font-mono font-semibold text-slate-700">{row.valid !== undefined ? row.valid : '1'}</td>
                          <td className="py-2.5 px-4 text-slate-800 font-medium">{row.optionText || '-'}</td>
                        </tr>
                      ))}
                      {rows.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-slate-400">
                            No options or ranges configured.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Add Standard Qualification */}
      {showAddStandardModal && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200/80">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Add Standard Qualification</h3>
              <button onClick={() => setShowAddStandardModal(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Select Demographic Question</label>
                <select 
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  value={selectedStandard}
                  onChange={e => setSelectedStandard(e.target.value)}
                >
                  <option value="age">What is your age? (Ranges: 18-24, 25-34, 35-44...)</option>
                  <option value="gender">What is your gender? (Dropdown: Male, Female)</option>
                </select>
              </div>

              <div className="bg-blue-50/60 p-3.5 rounded-xl border border-blue-200/60 text-blue-900 leading-relaxed text-[11px]">
                {selectedStandard === 'age' ? (
                  <p>Pre-fills 6 standard demographic age brackets (18-24, 25-34, 35-44, 45-54, 55-64, 65-99) with full validation.</p>
                ) : (
                  <p>Pre-fills standard gender options (Male, Female) with validation.</p>
                )}
              </div>
            </div>
            <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-100 flex justify-end space-x-2">
              <button 
                onClick={() => setShowAddStandardModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddStandard}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                Add Preset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Custom Qualification */}
      {showAddCustomModal && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200/80">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Add Custom Qualification</h3>
              <button onClick={() => setShowAddCustomModal(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Question Text</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                  placeholder="e.g. What is your household income?"
                  value={customForm.questionName}
                  onChange={e => setCustomForm({ ...customForm, questionName: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Field Type</label>
                <select 
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  value={customForm.fieldType}
                  onChange={e => setCustomForm({ ...customForm, fieldType: e.target.value })}
                >
                  <option value="Dropdown">Dropdown (Options)</option>
                  <option value="Range">Range (Min - Max)</option>
                </select>
              </div>

              {customForm.fieldType === 'Range' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Start Value</label>
                    <input 
                      type="number" 
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                      placeholder="18"
                      value={customForm.rangeStart}
                      onChange={e => setCustomForm({ ...customForm, rangeStart: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">End Value</label>
                    <input 
                      type="number" 
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                      placeholder="65"
                      value={customForm.rangeEnd}
                      onChange={e => setCustomForm({ ...customForm, rangeEnd: e.target.value })}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Allowed Options (One per line)</label>
                  <textarea 
                    rows={4}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-3 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-y font-mono" 
                    placeholder="Option 1&#10;Option 2&#10;Option 3"
                    value={customForm.optionsText}
                    onChange={e => setCustomForm({ ...customForm, optionsText: e.target.value })}
                  />
                </div>
              )}
            </div>
            <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-100 flex justify-end space-x-2">
              <button 
                onClick={() => setShowAddCustomModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddCustom}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                Save Qualification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectQualification;
