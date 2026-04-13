import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type InspectionRecord } from './lib/db';
import { getCodeLetter, getInspectionPlan, AQL_VALUES, INSPECTION_LEVELS, type AQLValue, type InspectionLevel } from './lib/aql';
import { Save, FileText, FileSpreadsheet, Trash2, History, Calculator } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function App() {
  const [lotSize, setLotSize] = useState<number>(1000);
  const [inspectionLevel, setInspectionLevel] = useState<InspectionLevel>('II');
  const [criticalAql, setCriticalAql] = useState<AQLValue>('Critical (0)');
  const [majorAql, setMajorAql] = useState<AQLValue>('2.5');
  const [minorAql, setMinorAql] = useState<AQLValue>('4.0');

  const [activeTab, setActiveTab] = useState<'calculator' | 'history'>('calculator');

  const [dbError, setDbError] = useState<string | null>(null);

  const inspections = useLiveQuery(
    async () => {
      try {
        return await db.inspections.orderBy('date').reverse().toArray();
      } catch (err) {
        console.error('Dexie error:', err);
        setDbError('History is unavailable. Your browser may be blocking local storage (e.g., in an iframe or incognito mode).');
        return [];
      }
    }
  );

  const codeLetter = getCodeLetter(lotSize, inspectionLevel);
  const criticalPlan = getInspectionPlan(codeLetter, criticalAql);
  const majorPlan = getInspectionPlan(codeLetter, majorAql);
  const minorPlan = getInspectionPlan(codeLetter, minorAql);

  const handleSave = async () => {
    try {
      await db.inspections.add({
        date: new Date().toISOString(),
        lotSize,
        inspectionLevel,
        criticalAql,
        majorAql,
        minorAql,
        criticalPlan: { sampleSize: criticalPlan.sampleSize, ac: criticalPlan.ac, re: criticalPlan.re },
        majorPlan: { sampleSize: majorPlan.sampleSize, ac: majorPlan.ac, re: majorPlan.re },
        minorPlan: { sampleSize: minorPlan.sampleSize, ac: minorPlan.ac, re: minorPlan.re },
      });
      alert('Inspection plan saved successfully!');
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Failed to save inspection plan. Your browser might be blocking local storage.');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      await db.inspections.delete(id);
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('AQL Inspection Plan (ISO 2859-1)', 14, 22);
    
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 32);
    doc.text(`Lot Size: ${lotSize}`, 14, 40);
    doc.text(`Inspection Level: ${inspectionLevel}`, 14, 48);
    doc.text(`Sample Size Code Letter: ${codeLetter}`, 14, 56);

    autoTable(doc, {
      startY: 65,
      head: [['Defect Type', 'AQL', 'Sample Size', 'Accept (Ac)', 'Reject (Re)']],
      body: [
        ['Critical', criticalAql, criticalPlan.sampleSize, criticalPlan.ac, criticalPlan.re],
        ['Major', majorAql, majorPlan.sampleSize, majorPlan.ac, majorPlan.re],
        ['Minor', minorAql, minorPlan.sampleSize, minorPlan.ac, minorPlan.re],
      ],
    });

    doc.save(`AQL_Plan_${new Date().getTime()}.pdf`);
  };

  const exportExcel = () => {
    const data = [
      { 'Parameter': 'Lot Size', 'Value': lotSize },
      { 'Parameter': 'Inspection Level', 'Value': inspectionLevel },
      { 'Parameter': 'Code Letter', 'Value': codeLetter },
      {},
      { 'Parameter': 'Defect Type', 'Value': 'AQL', 'Sample Size': 'Sample Size', 'Ac': 'Accept (Ac)', 'Re': 'Reject (Re)' },
      { 'Parameter': 'Critical', 'Value': criticalAql, 'Sample Size': criticalPlan.sampleSize, 'Ac': criticalPlan.ac, 'Re': criticalPlan.re },
      { 'Parameter': 'Major', 'Value': majorAql, 'Sample Size': majorPlan.sampleSize, 'Ac': majorPlan.ac, 'Re': majorPlan.re },
      { 'Parameter': 'Minor', 'Value': minorAql, 'Sample Size': minorPlan.sampleSize, 'Ac': minorPlan.ac, 'Re': minorPlan.re },
    ];

    const ws = XLSX.utils.json_to_sheet(data, { skipHeader: true });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inspection Plan');
    XLSX.writeFile(wb, `AQL_Plan_${new Date().getTime()}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <Calculator size={20} />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">AQL Inspector Pro</h1>
          </div>
          <nav className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('calculator')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'calculator' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Calculator
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'history' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              History
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'calculator' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Input Section */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Inspection Parameters</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lot Size</label>
                    <input
                      type="number"
                      min="2"
                      value={lotSize}
                      onChange={(e) => setLotSize(Math.max(2, parseInt(e.target.value) || 2))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Inspection Level</label>
                    <select
                      value={inspectionLevel}
                      onChange={(e) => setInspectionLevel(e.target.value as InspectionLevel)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <optgroup label="General">
                        <option value="I">Level I</option>
                        <option value="II">Level II (Normal)</option>
                        <option value="III">Level III</option>
                      </optgroup>
                      <optgroup label="Special">
                        <option value="S-1">S-1</option>
                        <option value="S-2">S-2</option>
                        <option value="S-3">S-3</option>
                        <option value="S-4">S-4</option>
                      </optgroup>
                    </select>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">AQL Values</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Critical Defects</label>
                        <select
                          value={criticalAql}
                          onChange={(e) => setCriticalAql(e.target.value as AQLValue)}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                        >
                          {AQL_VALUES.map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Major Defects</label>
                        <select
                          value={majorAql}
                          onChange={(e) => setMajorAql(e.target.value as AQLValue)}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                        >
                          {AQL_VALUES.map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Minor Defects</label>
                        <select
                          value={minorAql}
                          onChange={(e) => setMinorAql(e.target.value as AQLValue)}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                        >
                          {AQL_VALUES.map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Section */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold">Inspection Plan</h2>
                  <div className="flex gap-2">
                    <button onClick={exportPDF} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Export PDF">
                      <FileText size={20} />
                    </button>
                    <button onClick={exportExcel} className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors" title="Export Excel">
                      <FileSpreadsheet size={20} />
                    </button>
                    <button onClick={handleSave} className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors">
                      <Save size={16} /> Save
                    </button>
                  </div>
                </div>

                <div className="mb-6 flex items-center gap-4 p-4 bg-blue-50 text-blue-900 rounded-lg border border-blue-100">
                  <div className="flex-1">
                    <p className="text-sm opacity-80">Sample Size Code Letter</p>
                    <p className="text-2xl font-bold">{codeLetter}</p>
                  </div>
                  <div className="w-px h-10 bg-blue-200"></div>
                  <div className="flex-1">
                    <p className="text-sm opacity-80">Standard</p>
                    <p className="text-lg font-semibold">ISO 2859-1</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="py-3 px-4 text-sm font-medium text-gray-500">Defect Type</th>
                        <th className="py-3 px-4 text-sm font-medium text-gray-500">AQL</th>
                        <th className="py-3 px-4 text-sm font-medium text-gray-500 text-center">Sample Size</th>
                        <th className="py-3 px-4 text-sm font-medium text-gray-500 text-center">Accept (Ac)</th>
                        <th className="py-3 px-4 text-sm font-medium text-gray-500 text-center">Reject (Re)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr className="hover:bg-gray-50">
                        <td className="py-4 px-4 font-medium text-red-600">Critical</td>
                        <td className="py-4 px-4 text-gray-600">{criticalAql}</td>
                        <td className="py-4 px-4 text-center font-semibold">{criticalPlan.sampleSize}</td>
                        <td className="py-4 px-4 text-center text-green-600 font-bold">{criticalPlan.ac}</td>
                        <td className="py-4 px-4 text-center text-red-600 font-bold">{criticalPlan.re}</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="py-4 px-4 font-medium text-orange-500">Major</td>
                        <td className="py-4 px-4 text-gray-600">{majorAql}</td>
                        <td className="py-4 px-4 text-center font-semibold">{majorPlan.sampleSize}</td>
                        <td className="py-4 px-4 text-center text-green-600 font-bold">{majorPlan.ac}</td>
                        <td className="py-4 px-4 text-center text-red-600 font-bold">{majorPlan.re}</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="py-4 px-4 font-medium text-yellow-600">Minor</td>
                        <td className="py-4 px-4 text-gray-600">{minorAql}</td>
                        <td className="py-4 px-4 text-center font-semibold">{minorPlan.sampleSize}</td>
                        <td className="py-4 px-4 text-center text-green-600 font-bold">{minorPlan.ac}</td>
                        <td className="py-4 px-4 text-center text-red-600 font-bold">{minorPlan.re}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                {(criticalPlan.note || majorPlan.note || minorPlan.note) && (
                  <div className="mt-6 p-4 bg-yellow-50 text-yellow-800 text-sm rounded-lg border border-yellow-100">
                    <p className="font-semibold mb-1">Notes:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      {criticalPlan.note && <li>Critical: {criticalPlan.note}</li>}
                      {majorPlan.note && <li>Major: {majorPlan.note}</li>}
                      {minorPlan.note && <li>Minor: {minorPlan.note}</li>}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center gap-2">
              <History className="text-gray-400" size={20} />
              <h2 className="text-lg font-semibold">Inspection History</h2>
            </div>
            {dbError && (
              <div className="p-4 bg-red-50 text-red-700 border-b border-red-100 text-sm">
                {dbError}
              </div>
            )}
            {inspections && inspections.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Lot Size</th>
                      <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                      <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">AQL (C/M/m)</th>
                      <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {inspections.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="py-4 px-6 text-sm text-gray-900 whitespace-nowrap">
                          {new Date(record.date).toLocaleString()}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-900">{record.lotSize}</td>
                        <td className="py-4 px-6 text-sm text-gray-900">{record.inspectionLevel}</td>
                        <td className="py-4 px-6 text-sm text-gray-500">
                          {record.criticalAql} / {record.majorAql} / {record.minorAql}
                        </td>
                        <td className="py-4 px-6 text-sm text-right">
                          <button
                            onClick={() => record.id && handleDelete(record.id)}
                            className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-gray-500">
                <p>No inspection records found.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
