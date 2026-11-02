import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, X, Plus } from 'lucide-react';
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
        customQuestionName: customForm.questionName.trim(),
        fieldType: customForm.fieldType,
        isActive: true
      };

      if (customForm.fieldType === 'Range') {
        if (!customForm.rangeStart || !customForm.rangeEnd) {
          return alert('Please enter Start and End range.');
        }
        payload.ranges = [{
          start: customForm.rangeStart,
          end: customForm.rangeEnd,
          valid: 1,
          optionText: '-'
        }];
        payload.rangeStart = customForm.rangeStart;
        payload.rangeEnd = customForm.rangeEnd;
      } else {
        const opts = customForm.optionsText
          .split('\n')
          .map(s => s.trim())
          .filter(Boolean);

        if (opts.length === 0) {
          return alert('Please enter at least one option.');
        }
        payload.optionItems = opts.map(opt => ({
          start: '-',
          end: '-',
          valid: 1,
          optionText: opt
        }));
        payload.options = opts;
      }

      await api.post(`/admin/projects/${id}/qualifications`, payload);
      setShowAddCustomModal(false);
      setCustomForm({ questionName: '', fieldType: 'Dropdown', optionsText: '', rangeStart: '', rangeEnd: '' });
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
    <div className="max-w-7xl mx-auto px-4 pt-4 pb-12">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-gray-800">Project Qualification</h1>
        <div className="flex space-x-2">
          <button 
            onClick={() => setShowAddCustomModal(true)} 
            className="bg-[#4eb3f7] hover:bg-sky-400 text-white px-3.5 py-1.5 rounded text-xs font-bold flex items-center shadow-sm transition"
          >
            + Add Custom Qualification
          </button>
          <button 
            onClick={() => setShowAddStandardModal(true)} 
            className="bg-black hover:bg-gray-800 text-white px-3.5 py-1.5 rounded text-xs font-bold flex items-center shadow-sm transition"
          >
            + Add Qualification
          </button>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : qualifications.length === 0 ? (
        <div className="bg-white border rounded p-8 text-center text-gray-400 text-sm">
          No qualifications added yet. Click &quot;+ Add Qualification&quot; or &quot;+ Add Custom Qualification&quot; to set rules.
        </div>
      ) : (
        <div className="space-y-6">
          {qualifications.map(q => {
            const isRange = q.fieldType === 'Range' || q.questionType === 'Age';
            const questionTitle = q.questionName || q.customQuestionName || (q.questionType === 'Age' ? 'What is your age?' : (q.questionType === 'Gender' ? 'What is your gender?' : 'Custom Qualification'));
            const badgeType = q.fieldType || (isRange ? 'Range' : 'Dropdown');

            // Normalize rows for table display
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
              <div key={q._id} className="border border-gray-200 rounded overflow-hidden shadow-sm bg-white">
                {/* Header Bar */}
                <div className="bg-[#d9edf7] border-b border-[#bce8f1] px-4 py-2 flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-blue-600 font-bold text-xs border-b border-dashed border-blue-600 cursor-pointer mr-2.5">
                      {q.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                    <button className="mr-2 text-amber-600 hover:text-amber-700 p-0.5" title="Edit">
                      <Edit2 size={13} />
                    </button>
                    <button onClick={() => handleDelete(q._id)} className="text-red-500 hover:text-red-700 p-0.5" title="Delete Rule">
                      <Trash2 size={13} />
                    </button>

                    <span className="text-sm font-bold text-gray-800 ml-6">
                      {questionTitle}
                    </span>
                    <span className="ml-2.5 bg-[#00c0ef] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {badgeType}
                    </span>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b bg-gray-50/50 text-gray-700">
                        <th className="py-2.5 px-4 w-28"></th>
                        <th className="py-2.5 px-4 font-semibold text-gray-600 w-24">Start</th>
                        <th className="py-2.5 px-4 font-semibold text-gray-600 w-24">End</th>
                        <th className="py-2.5 px-4 font-semibold text-gray-600 w-24">Valid?</th>
                        <th className="py-2.5 px-4 font-semibold text-gray-600">Option Text</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, idx) => (
                        <tr key={idx} className="border-b hover:bg-gray-50/80 transition">
                          <td className="py-2.5 px-4 whitespace-nowrap">
                            <Trash2 
                              size={12} 
                              className="text-red-500 inline mr-1.5 cursor-pointer hover:text-red-700" 
                              onClick={() => handleDeleteRow(q, idx, isRange)}
                            />
                            <span className="text-blue-500 text-xs font-medium cursor-pointer border-b border-dashed border-blue-400">
                              Active
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-blue-600 font-bold">{row.start !== undefined ? row.start : '-'}</td>
                          <td className="py-2.5 px-4 text-blue-600 font-bold">{row.end !== undefined ? row.end : '-'}</td>
                          <td className="py-2.5 px-4 text-blue-600 font-bold">{row.valid !== undefined ? row.valid : '1'}</td>
                          <td className="py-2.5 px-4 text-gray-800 font-medium">{row.optionText || '-'}</td>
                        </tr>
                      ))}
                      {rows.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-4 text-center text-gray-400">
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded shadow-xl w-full max-w-md border border-gray-200">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h3 className="text-base font-bold text-gray-800">Add Standard Qualification</h3>
              <button onClick={() => setShowAddStandardModal(false)} className="text-gray-400 hover:text-gray-700">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Select Question</label>
                <select 
                  className="w-full border p-2 rounded focus:outline-none focus:border-blue-500 text-xs"
                  value={selectedStandard}
                  onChange={e => setSelectedStandard(e.target.value)}
                >
                  <option value="age">What is your age? (Range: 18-24, 25-34, 35-44...)</option>
                  <option value="gender">What is your gender? (Dropdown: Male, Female)</option>
                </select>
              </div>

              <div className="bg-blue-50 p-3 rounded border border-blue-100 text-blue-800">
                {selectedStandard === 'age' ? (
                  <p>This will pre-fill standard Age ranges (18-24, 25-34, 35-44, 45-54, 55-64, 65-99) matching standard demographic rules.</p>
                ) : (
                  <p>This will pre-fill standard Gender options (Male, Female).</p>
                )}
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-3 border-t flex justify-end space-x-2">
              <button 
                onClick={() => setShowAddStandardModal(false)}
                className="px-4 py-1.5 border rounded text-gray-600 hover:bg-gray-100 text-xs font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddStandard}
                className="px-4 py-1.5 bg-black hover:bg-gray-800 text-white rounded text-xs font-bold shadow-sm"
              >
                Add Rule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Custom Qualification */}
      {showAddCustomModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded shadow-xl w-full max-w-lg border border-gray-200">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h3 className="text-base font-bold text-gray-800">Add Custom Qualification</h3>
              <button onClick={() => setShowAddCustomModal(false)} className="text-gray-400 hover:text-gray-700">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Question Text</label>
                <input 
                  type="text" 
                  className="w-full border p-2 rounded focus:outline-none focus:border-blue-500 text-xs" 
                  placeholder="e.g. What is your household income?"
                  value={customForm.questionName}
                  onChange={e => setCustomForm({ ...customForm, questionName: e.target.value })}
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Field Type</label>
                <select 
                  className="w-full border p-2 rounded focus:outline-none focus:border-blue-500 text-xs"
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
                    <label className="block font-bold text-gray-700 mb-1">Start Value</label>
                    <input 
                      type="number" 
                      className="w-full border p-2 rounded focus:outline-none focus:border-blue-500 text-xs" 
                      placeholder="e.g. 18"
                      value={customForm.rangeStart}
                      onChange={e => setCustomForm({ ...customForm, rangeStart: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">End Value</label>
                    <input 
                      type="number" 
                      className="w-full border p-2 rounded focus:outline-none focus:border-blue-500 text-xs" 
                      placeholder="e.g. 65"
                      value={customForm.rangeEnd}
                      onChange={e => setCustomForm({ ...customForm, rangeEnd: e.target.value })}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Allowed Options (One per line)</label>
                  <textarea 
                    rows={4}
                    className="w-full border p-2 rounded focus:outline-none focus:border-blue-500 text-xs" 
                    placeholder="Option 1&#10;Option 2&#10;Option 3"
                    value={customForm.optionsText}
                    onChange={e => setCustomForm({ ...customForm, optionsText: e.target.value })}
                  />
                </div>
              )}
            </div>
            <div className="bg-gray-50 px-6 py-3 border-t flex justify-end space-x-2">
              <button 
                onClick={() => setShowAddCustomModal(false)}
                className="px-4 py-1.5 border rounded text-gray-600 hover:bg-gray-100 text-xs font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddCustom}
                className="px-4 py-1.5 bg-[#4eb3f7] hover:bg-sky-400 text-white rounded text-xs font-bold shadow-sm"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectQualification;
