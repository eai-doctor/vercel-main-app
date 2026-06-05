import { useState, useRef, useCallback, useEffect } from 'react'
import { NavBar } from '@/components'
import functionApi from '@/api/functionApi'
import { useTranslation } from 'react-i18next'

function SkinCancerDetection() {
  const { t } = useTranslation('skinCancerDetection')

  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleFile = useCallback((file) => {
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError(t('errors.invalidFile'))
      return
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl)

    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setError(null)
    setResult(null)
  }, [previewUrl, t])

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files?.[0])
  }

  const handleClear = () => {
    setSelectedFile(null)

    if (previewUrl) URL.revokeObjectURL(previewUrl)

    setPreviewUrl(null)
    setResult(null)
    setError(null)

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handlePredict = async () => {
    if (!selectedFile) return

    setLoading(true)
    setError(null)
    setResult(null)

    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const res = await functionApi.predictClipVitb16(formData)
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
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-[#e2e8f0]">
      <NavBar />

      <div className="max-w-[560px] mx-auto px-6 py-8">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#f8fafc] mb-2">
            {t('page.title')}
          </h1>
          <p className="text-[#94a3b8] text-sm">
            {t('page.subtitle')}
          </p>
          <p className="text-[#64748b] text-xs mt-3 leading-relaxed">
            {t('page.note')}
          </p>
        </header>

        <main className="space-y-6">
          <section>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />

            {!previewUrl ? (
              <div
                role="button"
                tabIndex={0}
                aria-label={t('upload.ariaLabel')}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center min-h-[180px] border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 select-none ${
                  dragOver
                    ? 'border-[#38bdf8] bg-[#38bdf8]/10'
                    : 'border-[#475569] bg-[#1e293b]/50 hover:border-[#64748b] hover:bg-[#334155]/50'
                }`}
              >
                <span className="text-[#cbd5e1] mb-1">
                  {t('upload.prompt')}
                </span>
                <span className="text-xs text-[#64748b]">
                  {t('upload.formats')}
                </span>
              </div>
            ) : (
              <div className="p-4 bg-[#1e293b]/50 rounded-xl text-center">
                <img
                  src={previewUrl}
                  alt={t('upload.previewAlt')}
                  className="max-w-full max-h-[280px] rounded-lg mx-auto mb-3 object-cover shadow-lg"
                />
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-4 py-2 bg-[#475569] hover:bg-[#64748b] text-[#e2e8f0] font-semibold rounded-lg transition-all"
                >
                  {t('upload.remove')}
                </button>
              </div>
            )}
          </section>

          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              disabled={!selectedFile || loading}
              onClick={handlePredict}
              className="w-full py-3 bg-[#0ea5e9] hover:bg-[#0284c7] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all transform hover:not-disabled:-translate-y-0.5"
            >
              {loading ? t('actions.analyzing') : t('actions.runScreening')}
            </button>
          </div>

          {loading && (
            <div className="text-center py-8">
              <div className="w-10 h-10 mx-auto border-4 border-[#334155] border-t-[#38bdf8] rounded-full animate-spin" />
              <p className="mt-4 text-[#94a3b8] text-sm italic">
                {t('loading.message')}
              </p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className={`rounded-xl p-5 border ${
                result.cancer_positive
                  ? 'bg-red-500/10 border-red-500/40'
                  : 'bg-emerald-500/10 border-emerald-500/40'
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">
                    {result.cancer_positive ? '⚠️' : '✅'}
                  </span>
                  <div>
                    <p className={`text-lg font-bold ${
                      result.cancer_positive ? 'text-red-300' : 'text-emerald-300'
                    }`}>
                      {result.cancer_positive ? t('result.positive') : t('result.negative')}
                    </p>
                    <p className="text-xs text-[#64748b]">
                      {t('result.threshold', {
                        value: (result.threshold_used * 100).toFixed(1)
                      })}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-[#94a3b8]">
                      {t('result.probability')}
                    </span>
                    <span className={`text-sm font-bold ${
                      result.cancer_positive ? 'text-red-300' : 'text-emerald-300'
                    }`}>
                      {(result.cancer_probability * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 bg-[#334155] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        result.cancer_positive ? 'bg-red-400' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${Math.min(result.cancer_probability * 100, 100)}%` }}
                    />
                  </div>

                  <div className="relative h-2 mt-1">
                    <div
                      className="absolute top-0 w-px h-2 bg-[#94a3b8]"
                      style={{ left: `${result.threshold_used * 100}%` }}
                    />
                    <span
                      className="absolute text-[10px] text-[#64748b] -translate-x-1/2"
                      style={{ left: `${result.threshold_used * 100}%`, top: '6px' }}
                    >
                      {t('result.thresholdMarker')}
                    </span>
                  </div>
                </div>
              </div>

              {result.cancer_positive && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <p className="text-xs text-amber-300 leading-relaxed">
                    ⚕️ {t('result.warning')}
                  </p>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-500/15 border border-red-500/40 rounded-lg">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}
        </main>

        <footer className="mt-12 pt-6 border-t border-[#334155] text-center">
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
  )
}

export default SkinCancerDetection
