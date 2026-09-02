import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { uploadMedicalReport, chatMedicalReport, getMedicalReports, extractMedicalReportTests, saveMedicalReportTests } from '@/api/chatApi';

const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_SIZE_MB = 10;
const AUTOSAVE_DELAY_MS = 800;

function buildWelcomeMessage(filename) {
  return `**${filename}** has been loaded. Ask me anything about this report.`;
}

function tryRecomputeAbnormal(result, normal_range) {
  const numResult = parseFloat(result);
  const rangeMatch = normal_range.match(/([\d.]+)\s*[-–]\s*([\d.]+)/);
  if (isNaN(numResult) || !rangeMatch) return undefined;
  return numResult < parseFloat(rangeMatch[1]) || numResult > parseFloat(rangeMatch[2]);
}

export function useMedicalReport() {
  const { isAuthenticated, loading } = useAuth();

  const [reports, setReports] = useState([]);
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [isUploadingReport, setIsUploadingReport] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [isLoadingTests, setIsLoadingTests] = useState(false);
  // 'idle' | 'saving' | 'saved' | 'error'
  const [saveStatus, setSaveStatus] = useState('idle');

  const fileInputRef = useRef(null);
  const autosaveTimerRef = useRef(null);
  const activeReportIdRef = useRef(null);

  // Load previously uploaded reports from the backend on mount (once auth is ready)
  useEffect(() => {
    if (loading || !isAuthenticated) return;
    getMedicalReports()
      .then((res) => {
        const rows = res.data?.reports ?? [];
        setReports(
          rows.map((r) => ({
            id: r.report_id,
            reportId: r.report_id,
            filename: r.filename,
            fileType: r.file_type,
            uploadedAt: new Date(r.uploaded_at),
            sizeKB: null,
          }))
        );
      })
      .catch(() => {/* fail silently — user just starts with an empty list */});
  }, [loading, isAuthenticated]);

  const selectedReport = reports.find((r) => r.id === selectedReportId) ?? null;

  // Debounced auto-save: fires 800 ms after testResults last changed,
  // but only when tests are loaded (non-null, non-empty) and a report is active.
  useEffect(() => {
    if (!testResults || testResults.length === 0 || !activeReportIdRef.current) return;

    clearTimeout(autosaveTimerRef.current);
    setSaveStatus('saving');

    const reportId = activeReportIdRef.current;
    autosaveTimerRef.current = setTimeout(async () => {
      try {
        await saveMedicalReportTests(reportId, testResults);
        setSaveStatus('saved');
      } catch {
        setSaveStatus('error');
      }
    }, AUTOSAVE_DELAY_MS);

    return () => clearTimeout(autosaveTimerRef.current);
  }, [testResults]);

  const seedChat = (filename) => {
    setMessages([{ role: 'assistant', content: buildWelcomeMessage(filename) }]);
  };

  const loadTestResults = async (reportId) => {
    activeReportIdRef.current = reportId;
    setIsLoadingTests(true);
    setTestResults(null);
    setSaveStatus('idle');
    try {
      const res = await extractMedicalReportTests(reportId);
      const { has_test_results, tests } = res.data;
      // Only set if this report is still the active one (no race condition on fast switching)
      if (activeReportIdRef.current === reportId) {
        setTestResults(has_test_results && tests?.length > 0 ? tests : []);
      }
    } catch {
      if (activeReportIdRef.current === reportId) {
        setTestResults([]);
      }
    } finally {
      if (activeReportIdRef.current === reportId) {
        setIsLoadingTests(false);
      }
    }
  };

  const handleFileInputChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      alert('Please upload a PDF, JPG, or PNG file.');
      e.target.value = '';
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      alert('File size must be under 10 MB.');
      e.target.value = '';
      return;
    }

    e.target.value = '';
    setIsUploadingReport(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await uploadMedicalReport(formData);
      const { report_id } = res.data;

      const newReport = {
        id: Date.now().toString(),
        reportId: report_id,
        file,
        filename: file.name,
        fileType: file.type === 'application/pdf' ? 'pdf' : 'image',
        uploadedAt: new Date(),
        sizeKB: Math.round(file.size / 1024),
      };

      setReports((prev) =>
        prev.some((r) => r.reportId === report_id) ? prev : [...prev, newReport]
      );
      setSelectedReportId(newReport.id);
      seedChat(newReport.filename);
      loadTestResults(report_id);
    } catch (err) {
      const msg = err?.response?.data?.error || 'Failed to upload report. Please try again.';
      alert(msg);
    } finally {
      setIsUploadingReport(false);
    }
  };

  const handleSelectReport = (id) => {
    if (id === selectedReportId) return;
    const report = reports.find((r) => r.id === id);
    if (!report) return;
    setSelectedReportId(id);
    seedChat(report.filename);
    setInput('');
    loadTestResults(report.reportId);
  };

  const updateTestResult = (index, field, value) => {
    setTestResults((prev) => {
      if (!prev) return prev;
      return prev.map((row, i) => {
        if (i !== index) return row;
        const next = { ...row, [field]: value };
        if (field === 'result') {
          const recomputed = tryRecomputeAbnormal(value, next.normal_range);
          if (recomputed !== undefined) next.is_abnormal = recomputed;
        }
        return next;
      });
    });
  };

  const sendMessage = async () => {
    if (!input.trim() || !selectedReport || isLoadingChat) return;

    const userMessage = { role: 'user', content: input.trim() };
    const currentHistory = [...messages, userMessage];
    setMessages(currentHistory);
    setInput('');
    setIsLoadingChat(true);

    try {
      const apiHistory = currentHistory.slice(0, -1).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await chatMedicalReport(userMessage.content, selectedReport.reportId, apiHistory);
      const reply = res.data?.response || 'No response received.';
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      const errMsg = err?.response?.data?.error || 'Something went wrong. Please try again.';
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: errMsg, isError: true },
      ]);
    } finally {
      setIsLoadingChat(false);
    }
  };

  const clearChat = () => {
    if (selectedReport) {
      seedChat(selectedReport.filename);
    } else {
      setMessages([]);
    }
  };

  return {
    reports,
    selectedReportId,
    selectedReport,
    fileInputRef,
    handleFileInputChange,
    handleSelectReport,
    isUploadingReport,
    messages,
    input,
    setInput,
    isLoadingChat,
    sendMessage,
    clearChat,
    testResults,
    isLoadingTests,
    updateTestResult,
    saveStatus,
  };
}
