import { useEffect } from 'react'
import functionApi from '@/api/functionApi'
import { NavBar } from '@/components'
import { useState, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

// ─── Sub-components ──────────────────────────────────────────────────────────

function Spinner() {
  const { t } = useTranslation('retinalDiseaseDetection')

  return (
    <div className="flex flex-col items-center gap-3 py-8 text-slate-400">
      <div className="w-10 h-10 rounded-full border-[3px] border-slate-600 border-t-sky-400 animate-spin" />
      <p className="text-sm">{t('spinner.running')}</p>
    </div>
  )
}

function UploadZone({ isDragging, onDragOver, onDragLeave, onDrop, onClick }) {
  const { t } = useTranslation('retinalDiseaseDetection')

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={t('upload.ariaLabel')}
      onClick={onClick}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={[
        'flex flex-col items-center justify-center min-h-[180px] rounded-xl border-2 border-dashed',
        'cursor-pointer transition-colors duration-200 select-none',
        isDragging
          ? 'border-sky-400 bg-sky-400/10'
          : 'border-slate-600 bg-slate-800/50 hover:border-slate-500 hover:bg-slate-700/50',
      ].join(' ')}
    >
      <svg className="w-10 h-10 mb-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
      <span className="text-slate-300 text-sm font-medium mb-1">{t('upload.prompt')}</span>
      <span className="text-slate-500 text-xs">{t('upload.formats')}</span>
    </div>
  )
}

function ImagePreview({ src, onClear }) {
  const { t } = useTranslation('retinalDiseaseDetection')

  return (
    <div className="rounded-xl bg-slate-800/50 p-4 text-center">
      <img
        src={src}
        alt={t('preview.alt')}
        className="max-h-64 mx-auto rounded-lg object-contain mb-3"
      />
      <button
        onClick={onClear}
        className="text-xs text-slate-400 hover:text-slate-200 border border-slate-600 hover:border-slate-400 rounded-lg px-3 py-1.5 transition-colors"
      >
        {t('preview.clear')}
      </button>
    </div>
  )
}

function ResultCard({ data }) {
  const { t } = useTranslation('retinalDiseaseDetection')
  const [showAll, setShowAll] = useState(false)

  const pct = (data.disease_risk_probability * 100).toFixed(1)
  const threshold = (data.threshold_used * 100).toFixed(1)
  const positive = data.disease_risk_positive

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/70 p-5 space-y-4">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <span className="text-sm text-slate-400">{t('result.diseaseRisk')}</span>
        <span className="text-3xl font-bold text-slate-50">{pct}%</span>
        <span
          className={[
            'text-xs font-semibold px-2.5 py-1 rounded-md',
            positive
              ? 'bg-red-500/20 text-red-300'
              : 'bg-green-500/20 text-green-300',
          ].join(' ')}
        >
          {positive ? t('result.abnormal') : t('result.normal')}
        </span>
      </div>

      <p className="text-xs text-slate-500">
        {t('result.thresholdUsed', { value: threshold })}
      </p>

      {data.all_classes && Object.keys(data.all_classes).length > 0 && (
        <div>
          <button
            onClick={() => setShowAll((v) => !v)}
            className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors"
          >
            <span>{showAll ? '▲' : '▼'}</span>
            {showAll ? t('result.hideAllScores') : t('result.showAllScores')}
          </button>

          {showAll && (
            <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 max-h-48 overflow-y-auto pr-1">
              {Object.entries(data.all_classes)
                .sort((a, b) => b[1] - a[1])
                .map(([label, prob]) => (
                  <div key={label} className="flex justify-between text-xs border-b border-slate-700/50 pb-1">
                    <span className="text-slate-300 truncate mr-2">{label}</span>
                    <span className="text-sky-400 shrink-0">{(prob * 100).toFixed(1)}%</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ErrorBanner({ message }) {
  return (
    <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
      {message}
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function RetinalDiseaseDetection() {
  const { t } = useTranslation('retinalDiseaseDetection')
  const fileInputRef = useRef(null)

  const [previewUrl, setPreviewUrl] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const applyFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) {
      setError(t('errors.invalidFile'))
      return
    }

    setError(null)
    setResult(null)
    setSelectedFile(file)

    const url = URL.createObjectURL(file)
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return url
    })
  }, [t])

  const handleFileChange = (e) => {
    if (e.target.files[0]) applyFile(e.target.files[0])
  }

  const handleClear = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setSelectedFile(null)
    setResult(null)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    applyFile(e.dataTransfer.files[0])
  }

  const handlePredict = async () => {
    if (!selectedFile) return

    setError(null)
    setResult(null)
    setLoading(true)

    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const res = await functionApi.predictSwintiny(formData)
      const data = res.data

      if (res.status !== 200) {
        setError(data?.detail ?? data?.message ?? t('errors.requestFailed', { status: res.status }))
        return
      }

      setResult(data)
    } catch (err) {
      setError(t('errors.network', {
        message: err.message ?? t('errors.apiUnavailable')
      }))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <NavBar />
      <div className="min-h-screen flex flex-col items-center py-10 px-4 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
        <div className="w-full max-w-lg space-y-6">
          <header className="text-center">
            <h1 className="text-3xl font-bold text-slate-50 mb-2">{t('page.title')}</h1>
            <p className="text-slate-400 text-sm">{t('page.subtitle')}</p>
          </header>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />

          {previewUrl ? (
            <ImagePreview src={previewUrl} onClear={handleClear} />
          ) : (
            <UploadZone
              isDragging={isDragging}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            />
          )}

          <div className="flex justify-center">
            <button
              onClick={handlePredict}
              disabled={!selectedFile || loading}
              className={[
                'px-8 py-3 rounded-xl font-semibold text-sm transition-all duration-200',
                selectedFile && !loading
                  ? 'bg-sky-500 hover:bg-sky-400 text-white shadow-lg shadow-sky-500/20 hover:-translate-y-0.5'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed',
              ].join(' ')}
            >
              {loading ? t('page.running') : t('page.runPrediction')}
            </button>
          </div>

          {loading && <Spinner />}

          {error && <ErrorBanner message={error} />}

          {result && !loading && (
            <div>
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                {t('result.sectionTitle')}
              </h2>
              <ResultCard data={result} />
            </div>
          )}

          <footer className="text-center pt-4 border-t border-slate-700/60 text-xs text-slate-600">
            {t('footer.poweredBy')} ·{' '}
            <a
              href="https://huggingface.co/qualcomm/Swin-Tiny"
              target="_blank"
              rel="noreferrer"
              className="text-sky-600 hover:text-sky-400 transition-colors"
            >
              {t('footer.apiDocs')}
            </a>

            <p className="text-xs text-[#64748b] leading-relaxed">
              {t('footer.disclaimer')}
              <br />
              <strong className="text-red-500 block mt-2">
                {t('footer.consult')}
              </strong>
            </p>
          </footer>
        </div>
      </div>
    </>
  )
}
