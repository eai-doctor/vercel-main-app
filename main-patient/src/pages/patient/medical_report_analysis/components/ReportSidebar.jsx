import { DocumentIcon, UploadIcon, ScanIcon, ImageIcon, CheckCircleIcon } from '@/components/ui/icons';

const SAVE_STATUS_UI = {
  saving: { label: 'Saving…', cls: 'text-slate-400' },
  saved:  { label: 'Saved',   cls: 'text-green-600' },
  error:  { label: 'Save failed', cls: 'text-red-500' },
};

function TestResultsTable({ testResults, isLoadingTests, onUpdateTestResult, saveStatus }) {
  const showLoading = isLoadingTests;
  const showTable = !isLoadingTests && testResults && testResults.length > 0;

  if (!showLoading && !showTable) return null;

  const statusUi = SAVE_STATUS_UI[saveStatus] ?? null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-[#f5f7ff]">
        <div className="w-[34px] h-[34px] rounded-[9px] bg-[#e6ecff] flex items-center justify-center shrink-0">
          <svg className="w-[16px] h-[16px] text-[#2C3B8D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h2 className="text-[14px] font-semibold text-slate-800 flex-1">Test Results</h2>
        {statusUi && (
          <span className={`text-[11px] font-medium ${statusUi.cls}`}>{statusUi.label}</span>
        )}
      </div>

      {showLoading ? (
        <div className="flex items-center justify-center gap-2 py-6 text-slate-400">
          <div className="w-4 h-4 border-2 border-[#2C3B8D] border-t-transparent rounded-full animate-spin" />
          <span className="text-[12px]">Extracting test results…</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-3 py-2 font-semibold text-slate-600 whitespace-nowrap">Test</th>
                <th className="text-left px-3 py-2 font-semibold text-slate-600 whitespace-nowrap">Results</th>
                <th className="text-left px-3 py-2 font-semibold text-slate-600 whitespace-nowrap">Normal Range</th>
              </tr>
            </thead>
            <tbody>
              {testResults.map((row, i) => {
                const isAbnormal = row.is_abnormal;
                const rowCls = isAbnormal ? 'bg-red-50' : (i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50');
                const cellCls = isAbnormal ? 'text-red-700' : 'text-slate-700';
                const inputCls = `w-full bg-transparent outline-none focus:ring-1 focus:ring-[#2C3B8D] rounded px-1 py-0.5 ${cellCls}`;

                return (
                  <tr key={i} className={`${rowCls} border-b border-slate-100 last:border-0`}>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={row.test}
                        onChange={(e) => onUpdateTestResult(i, 'test', e.target.value)}
                        className={inputCls}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={row.result}
                        onChange={(e) => onUpdateTestResult(i, 'result', e.target.value)}
                        className={`${inputCls} font-semibold`}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={row.normal_range}
                        onChange={(e) => onUpdateTestResult(i, 'normal_range', e.target.value)}
                        className={inputCls}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ReportSidebar({
  activeTab,
  reports,
  selectedReportId,
  handleSelectReport,
  fileInputRef,
  handleFileInputChange,
  isUploadingReport,
  testResults,
  isLoadingTests,
  onUpdateTestResult,
  saveStatus,
}) {
  return (
    <div className={`w-full lg:w-1/3 space-y-4 ${activeTab === 'chat' ? 'hidden lg:block' : 'block'}`}>

      {/* Upload card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-[#f5f7ff]">
          <div className="w-[34px] h-[34px] rounded-[9px] bg-[#e6ecff] flex items-center justify-center shrink-0">
            <DocumentIcon className="w-[16px] h-[16px] text-[#2C3B8D]" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-[14px] font-semibold text-slate-800">Reports</h2>
            <p className="text-[10px] text-slate-400">Upload and manage your reports</p>
          </div>
          {reports.length > 0 && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#eef2ff] text-[#2C3B8D] shrink-0">
              {reports.length}
            </span>
          )}
        </div>

        <div className="p-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingReport}
            className="w-full py-2.5 rounded-xl text-[13px] font-bold text-white bg-[#2C3B8D] hover:bg-[#233070]
              transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isUploadingReport ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <UploadIcon className="w-4 h-4" />
                Upload Report
              </>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={handleFileInputChange}
          />
          <p className="text-[10px] text-slate-400 text-center mt-2">PDF, JPG, PNG up to 10 MB</p>
        </div>
      </div>

      {/* Reports list card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-[#f5f7ff]">
          <div className="w-[34px] h-[34px] rounded-[9px] bg-[#e6ecff] flex items-center justify-center shrink-0">
            <ScanIcon className="w-[16px] h-[16px] text-[#2C3B8D]" />
          </div>
          <h2 className="text-[14px] font-semibold text-slate-800">Your Reports</h2>
        </div>

        {reports.length === 0 ? (
          <div className="p-6 text-center">
            <div className="w-10 h-10 rounded-xl bg-[#e6ecff] flex items-center justify-center mx-auto mb-3">
              <DocumentIcon className="w-5 h-5 text-[#2C3B8D]" />
            </div>
            <p className="text-[13px] font-semibold text-slate-700 mb-1">No reports uploaded</p>
            <p className="text-[11px] text-slate-400">Upload a PDF or image to get started</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {reports.map((report) => (
              <li
                key={report.id}
                onClick={() => handleSelectReport(report.id)}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors
                  ${selectedReportId === report.id
                    ? 'bg-[#eef2ff] border-l-2 border-[#2C3B8D]'
                    : 'hover:bg-slate-50 border-l-2 border-transparent'
                  }`}
              >
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  {report.fileType === 'pdf' ? (
                    <DocumentIcon className="w-4 h-4 text-red-500" />
                  ) : (
                    <ImageIcon className="w-4 h-4 text-blue-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-slate-800 truncate">{report.filename}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {report.uploadedAt.toLocaleDateString()}{report.sizeKB ? ` · ${report.sizeKB} KB` : ''}
                  </p>
                </div>
                {selectedReportId === report.id && (
                  <CheckCircleIcon className="w-4 h-4 text-[#2C3B8D] shrink-0" />
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Test results table — shown only when a report with lab data is selected */}
      <TestResultsTable
        testResults={testResults}
        isLoadingTests={isLoadingTests}
        onUpdateTestResult={onUpdateTestResult}
        saveStatus={saveStatus}
      />
    </div>
  );
}

export default ReportSidebar;
