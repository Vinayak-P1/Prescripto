import React, { useState, useContext } from 'react'
import { AppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'

const ReportAnalyzer = () => {
  const { backendUrl, currencySymbol } = useContext(AppContext)
  const navigate = useNavigate()

  const [reportText, setReportText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const sampleReports = [
    {
      title: 'Sample Prescription',
      text: 'Patient: John Doe, Age 35\nDiagnosis: Type 2 Diabetes Mellitus\nRx:\n1. Tab Metformin 500mg - twice daily after meals - 30 days\n2. Tab Glimepiride 1mg - once daily before breakfast - 30 days\n3. Tab Atorvastatin 10mg - once daily at night - 30 days\nAdvice: Low sugar diet, regular exercise, follow-up after 1 month\nFasting blood sugar: 180 mg/dL (Normal: 70-100)\nHbA1c: 7.8% (Normal: <5.7%)',
    },
    {
      title: 'Sample Lab Report',
      text: 'CBC Report:\nHemoglobin: 11.2 g/dL (Normal: 13.5-17.5)\nWBC: 12,500 /cumm (Normal: 4,500-11,000)\nPlatelet Count: 1,80,000 /cumm (Normal: 1,50,000-4,00,000)\nESR: 45 mm/hr (Normal: 0-20)\nRBC: 4.2 million/cumm (Normal: 4.5-5.5)\nMCV: 72 fL (Normal: 80-100)\nMCH: 24 pg (Normal: 27-33)',
    },
  ]

  const handleAnalyze = async () => {
    if (!reportText.trim()) return

    setLoading(true)
    try {
      const { data } = await axios.post(backendUrl + '/api/ai/analyze-report', {
        reportText,
      })

      if (data.success) {
        setResult(data)
      } else {
        toast.error(data.message || 'AI service is currently unavailable. Please try again.')
      }
    } catch (error) {
      console.error(error)
      toast.error('Analysis failed. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'normal':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'abnormal':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'borderline':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-teal-50 px-5 py-2 rounded-full mb-4 border border-emerald-100">
          <span className="text-xl">📄</span>
          <span className="text-sm font-medium text-emerald-600">AI Document Analysis</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          AI Report Analyzer
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          Paste your prescription or lab report text and our AI will extract medications,
          key findings, and provide a plain-language summary.
        </p>
      </div>

      {!result ? (
        <div className="max-w-2xl mx-auto">
          {/* Input Area */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              📋 Paste your report/prescription text
            </label>
            <textarea
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              placeholder="Paste your prescription details, lab report values, or medical report text here..."
              className="w-full h-48 p-4 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-gray-700 placeholder-gray-400 transition-all font-mono text-sm"
              id="report-input"
            />

            {/* Sample Reports */}
            <div className="mt-4">
              <p className="text-xs text-gray-400 mb-2">Try with sample data:</p>
              <div className="flex gap-2">
                {sampleReports.map((sample, i) => (
                  <button
                    key={i}
                    onClick={() => setReportText(sample.text)}
                    className="text-xs px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-full border border-emerald-200 transition-all cursor-pointer"
                  >
                    📎 {sample.title}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={!reportText.trim() || loading}
            className={`w-full py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 ${
              reportText.trim() && !loading
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-500/25 cursor-pointer active:scale-[0.98]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            id="analyze-report-btn"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              '🔬 Analyze Report'
            )}
          </button>

          {/* Disclaimer */}
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-xs text-amber-700 flex items-start gap-2">
              <span className="text-base mt-[-2px]">⚠️</span>
              <span>
                <strong>Disclaimer:</strong> This AI analysis is for informational
                purposes only. Always consult your prescribing doctor for accurate
                interpretation of medical reports and prescriptions.
              </span>
            </p>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto animate-[fadeIn_0.5s_ease-out]">
          {/* Back Button */}
          <button
            onClick={() => {
              setResult(null)
              setReportText('')
            }}
            className="mb-6 text-sm text-gray-500 hover:text-emerald-600 flex items-center gap-1 cursor-pointer"
          >
            ← Analyze another report
          </button>

          {/* Report Type & Summary */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">📄</span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm">
                {result.report?.report_type}
              </span>
            </div>
            <h3 className="text-xl font-bold mb-2">Analysis Summary</h3>
            <p className="text-white/90">{result.report?.summary}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Medications */}
            {result.report?.medications?.length > 0 && (
              <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  💊 Medications
                </h3>
                <div className="space-y-3">
                  {result.report.medications.map((med, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl border border-gray-100 bg-gray-50/50"
                    >
                      <p className="font-semibold text-gray-800">{med.name}</p>
                      <div className="mt-1 space-y-0.5 text-sm text-gray-500">
                        {med.dosage && <p>📏 Dosage: {med.dosage}</p>}
                        {med.frequency && <p>⏰ Frequency: {med.frequency}</p>}
                        {med.duration && <p>📅 Duration: {med.duration}</p>}
                        {med.purpose && (
                          <p className="text-emerald-600 mt-1">💡 {med.purpose}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Findings */}
            {result.report?.key_findings?.length > 0 && (
              <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  🔬 Key Findings
                </h3>
                <div className="space-y-3">
                  {result.report.key_findings.map((finding, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl border border-gray-100"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-800 text-sm">
                          {finding.parameter}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(
                            finding.status
                          )}`}
                        >
                          {finding.status}
                        </span>
                      </div>
                      {finding.value && (
                        <p className="text-sm font-mono text-gray-700 bg-gray-50 px-2 py-1 rounded mt-1">
                          {finding.value}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">{finding.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Follow-up & Warnings */}
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            {result.report?.follow_up_advice && (
              <div className="bg-blue-50 rounded-2xl border border-blue-200 p-5">
                <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                  📋 Follow-up Advice
                </h4>
                <p className="text-sm text-blue-700">{result.report.follow_up_advice}</p>
              </div>
            )}

            {result.report?.warnings?.length > 0 && (
              <div className="bg-red-50 rounded-2xl border border-red-200 p-5">
                <h4 className="font-bold text-red-800 mb-2 flex items-center gap-2">
                  ⚠️ Warnings
                </h4>
                <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                  {result.report.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Lifestyle Suggestions */}
          {result.report?.lifestyle_suggestions?.length > 0 && (
            <div className="mt-6 bg-white rounded-2xl shadow-md border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                🌿 Lifestyle Suggestions
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.report.lifestyle_suggestions.map((tip, i) => (
                  <span
                    key={i}
                    className="px-3 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm border border-emerald-200"
                  >
                    ✨ {tip}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Suggested Doctors */}
          {result.suggestedDoctors?.length > 0 && (
            <div className="mt-6 bg-white rounded-2xl shadow-md border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                👨‍⚕️ Recommended Doctors for Follow-up
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {result.suggestedDoctors.map((doc, i) => (
                  <div
                    key={i}
                    className="border border-gray-100 rounded-xl p-4 hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group"
                    onClick={() => navigate(`/appointments/${doc._id}`)}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={doc.image}
                        alt={doc.name}
                        className="w-14 h-14 rounded-full object-cover bg-emerald-50"
                      />
                      <div>
                        <p className="font-semibold text-gray-800 group-hover:text-emerald-600 transition-colors">
                          {doc.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {doc.speciality} · {doc.experience}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {currencySymbol}{doc.fees}
                      </span>
                      <span className="text-xs text-emerald-600 font-medium group-hover:underline">
                        Book Now →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-xs text-amber-700">{result.disclaimer}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReportAnalyzer
