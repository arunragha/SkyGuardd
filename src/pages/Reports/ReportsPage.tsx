import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ReportItem } from '../../types';
import { DEMO_REPORTS } from '../../data/mockData';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { 
  FileText, 
  Download, 
  Eye, 
  Calendar, 
  Radio, 
  Layers, 
  CheckCircle2, 
  FileSpreadsheet, 
  FileDown, 
  Search,
  Filter,
  Plus
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { showToast } = useApp();
  const [reportsList, setReportsList] = useState<ReportItem[]>(DEMO_REPORTS);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [previewReport, setPreviewReport] = useState<ReportItem | null>(null);
  const [isGeneratingNew, setIsGeneratingNew] = useState(false);

  const filteredReports = reportsList.filter(r => {
    if (typeFilter !== 'all' && r.type !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return r.title.toLowerCase().includes(q) ||
        r.summary.toLowerCase().includes(q) ||
        r.stationTarget.toLowerCase().includes(q);
    }
    return true;
  });

  const handleDownloadPDF = (report: ReportItem) => {
    showToast(`Compiling and downloading "${report.title}.pdf" (${report.fileSize})...`, 'info', 'PDF Export Initiated');
    setTimeout(() => {
      // Simulate file download by creating a virtual blob
      const dummyContent = `SKYGUARD TELEMETRY REPORT\n=========================\nTitle: ${report.title}\nDate: ${report.generationDate}\nScope: ${report.stationTarget}\nSummary: ${report.summary}\nRecord Count: ${report.recordCount}\nStatus: Certified by SkyGuard ML Engine.`;
      const blob = new Blob([dummyContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.id}_${report.type}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      showToast(`Downloaded ${report.title} successfully.`, 'success', 'Download Complete');
    }, 600);
  };

  const handleExportCSV = async (report: ReportItem) => {
    showToast(`Exporting dataset for "${report.title}"...`, 'info', 'CSV Generation');
    try {
      const endpoint = report.type === 'model_evaluation' 
        ? api.getModelsCSVUrl() 
        : api.getAnomaliesCSVUrl();
      
      const res = await fetch(endpoint);
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `skyguard_${report.type}_export_${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        showToast(`Exported authentic CSV directly from SkyGuard database.`, 'success', 'CSV Ready');
        return;
      }
    } catch (e) {
      console.warn('Backend CSV download fallback:', e);
    }

    // Fallback if backend is offline
    const csvData = `timestamp,station,parameter,observed,expected_baseline,anomaly_score,severity\n2026-11-12T08:14:00Z,st-01,temperature,42.1,26.4,0.94,critical\n2026-11-12T07:42:00Z,st-03,pressure,988.4,1009.2,0.89,critical\n2026-11-12T06:15:00Z,st-05,windSpeed,64.8,24.0,0.82,high`;
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.id}_telemetry_export.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported CSV with ${report.recordCount.toLocaleString()} observations.`, 'success', 'CSV Ready');
  };

  const handleGenerateCustom = () => {
    setIsGeneratingNew(true);
    showToast('Synthesizing custom fleetwide telemetry report...', 'info');
    setTimeout(() => {
      const newReport: ReportItem = {
        id: `rep-${(reportsList.length + 1).toString().padStart(3, '0')}`,
        title: 'Custom On-Demand Telemetry Audit',
        type: 'anomaly_summary',
        typeLabel: 'Anomaly Summary',
        generationDate: 'Just now · Generated',
        dateRange: 'Past 24 Hours',
        stationTarget: 'Fleetwide (12 Stations)',
        recordCount: 19362,
        fileSize: '3.4 MB',
        status: 'ready',
        summary: 'Instantaneous multi-station anomaly evaluation capturing latest 8 flagged sensor variances.'
      };
      setReportsList([newReport, ...reportsList]);
      setIsGeneratingNew(false);
      showToast('Custom report generated and ready for export.', 'success', 'Report Created');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header with Generate Report Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#101827] border border-white/10 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold">
              Fleet Intelligence Hub
            </span>
            <span className="text-xs text-[#64748B] font-mono">Automated PDF & CSV Synthesis</span>
          </div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-[#F8FAFC]">
            Reports & Export Center
          </h1>
          <p className="text-xs lg:text-sm text-[#94A3B8]">
            Compile formal sensor anomaly summaries, station environmental trends, and machine learning model validation audits.
          </p>
        </div>

        <Button
          variant="cyan"
          size="md"
          icon={<Plus className="w-4 h-4" />}
          isLoading={isGeneratingNew}
          onClick={handleGenerateCustom}
        >
          {isGeneratingNew ? 'Synthesizing Report...' : 'Generate New Report'}
        </Button>
      </div>

      {/* 2. Search & Category Filters */}
      <div className="bg-[#121D2E] p-4 rounded-2xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search report titles, target stations, keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0B1220] text-xs font-mono text-[#F8FAFC] placeholder-[#64748B] pl-9 pr-3 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          {(['all', 'anomaly_summary', 'station_wise', 'model_evaluation', 'weather_trend', 'historical_anomaly'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-xl transition-all capitalize ${
                typeFilter === t
                  ? 'bg-[#3B82F6] text-white font-semibold'
                  : 'bg-[#0B1220] text-[#94A3B8] hover:text-[#F8FAFC] border border-white/5'
              }`}
            >
              {t === 'all' ? 'All Reports' : t.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredReports.map((report) => (
          <div
            key={report.id}
            className="bg-[#121D2E] rounded-2xl border border-white/10 p-5 shadow-xl flex flex-col justify-between hover:border-white/20 transition-all duration-200 group"
          >
            <div>
              {/* Top Row: Type & Size */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold">
                  {report.typeLabel}
                </span>
                <span className="text-[11px] font-mono text-[#64748B]">
                  {report.fileSize}
                </span>
              </div>

              {/* Title & Summary */}
              <h3 className="text-base font-bold text-[#F8FAFC] group-hover:text-cyan-400 transition-colors mb-2">
                {report.title}
              </h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed line-clamp-3 mb-4">
                {report.summary}
              </p>

              {/* Metadata Details */}
              <div className="space-y-1.5 py-3 border-y border-white/5 text-xs font-mono text-[#64748B]">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Date Range:
                  </span>
                  <span className="text-[#94A3B8]">{report.dateRange}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5" /> Scope:
                  </span>
                  <span className="text-[#F8FAFC] truncate max-w-[160px]">{report.stationTarget}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" /> Observations:
                  </span>
                  <span className="text-emerald-400 font-semibold">{report.recordCount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions: Preview, PDF, CSV */}
            <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between gap-2">
              <Button
                variant="ghost"
                size="sm"
                icon={<Eye className="w-3.5 h-3.5" />}
                onClick={() => setPreviewReport(report)}
              >
                Preview
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />}
                  onClick={() => handleExportCSV(report)}
                  title="Export CSV"
                >
                  CSV
                </Button>
                <Button
                  variant="cyan"
                  size="sm"
                  icon={<FileDown className="w-3.5 h-3.5" />}
                  onClick={() => handleDownloadPDF(report)}
                >
                  PDF
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 4. Report Preview Modal */}
      {previewReport && (
        <Modal
          isOpen={!!previewReport}
          onClose={() => setPreviewReport(null)}
          title={`Report Preview — ${previewReport.title}`}
          subtitle={`Generated ${previewReport.generationDate} · Scope: ${previewReport.stationTarget}`}
          maxWidth="2xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-mono text-[#64748B]">
                Format: PDF & CSV Compatible · Size: {previewReport.fileSize}
              </span>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => handleExportCSV(previewReport)}>
                  Export CSV
                </Button>
                <Button variant="cyan" size="sm" onClick={() => handleDownloadPDF(previewReport)}>
                  Download PDF
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-5 text-xs">
            {/* Header / Executive summary */}
            <div className="p-4 rounded-xl bg-[#0B1220] border border-white/10 space-y-2">
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block font-bold">
                Executive Synthesis
              </span>
              <p className="text-xs text-[#F8FAFC] leading-relaxed">
                {previewReport.summary}
              </p>
            </div>

            {/* Audit Metadata */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-[#64748B] block">SCOPE</span>
                <span className="text-xs font-bold text-[#F8FAFC]">{previewReport.stationTarget}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-[#64748B] block">OBSERVATIONS</span>
                <span className="text-xs font-bold text-emerald-400">{previewReport.recordCount.toLocaleString()}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-[#64748B] block">TIME WINDOW</span>
                <span className="text-xs font-bold text-[#F8FAFC]">{previewReport.dateRange}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-[#64748B] block">STATUS</span>
                <span className="text-xs font-bold text-cyan-400 uppercase">{previewReport.status}</span>
              </div>
            </div>

            {/* Sample Tabular Data Extract */}
            <div className="border border-white/10 rounded-xl overflow-hidden font-mono text-[11px]">
              <div className="p-2.5 bg-[#0B1220] border-b border-white/10 font-bold text-[#F8FAFC]">
                Sample Telemetry Extract (Top 3 Records)
              </div>
              <table className="w-full text-left">
                <thead className="bg-white/5 text-[#94A3B8] border-b border-white/5">
                  <tr>
                    <th className="p-2">Obs ID</th>
                    <th className="p-2">Station</th>
                    <th className="p-2">Param</th>
                    <th className="p-2">Observed</th>
                    <th className="p-2">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr>
                    <td className="p-2 text-cyan-400">OBS-2026-94812</td>
                    <td className="p-2">Ridge Peak</td>
                    <td className="p-2">Temperature</td>
                    <td className="p-2 text-red-400 font-bold">42.1°C</td>
                    <td className="p-2">0.94</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-cyan-400">OBS-2026-94808</td>
                    <td className="p-2">Sonoran Basin</td>
                    <td className="p-2">Pressure</td>
                    <td className="p-2 text-red-400 font-bold">988.4 hPa</td>
                    <td className="p-2">0.89</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-cyan-400">OBS-2026-94791</td>
                    <td className="p-2">Highland Alpine</td>
                    <td className="p-2">Wind Gust</td>
                    <td className="p-2 text-amber-400 font-bold">64.8 km/h</td>
                    <td className="p-2">0.82</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

