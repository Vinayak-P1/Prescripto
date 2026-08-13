import React, { useState, useContext } from 'react'
import { AppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'

const SymptomChecker = () => {
  const { backendUrl, currencySymbol } = useContext(AppContext)
  const navigate = useNavigate()

  const [symptoms, setSymptoms] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [step, setStep] = useState('input') // input, analyzing, results

  const analyzeSteps = [
    { text: 'Understanding your symptoms...', icon: '🔍' },
    { text: 'Analyzing possible conditions...', icon: '🧠' },
    { text: 'Finding the right specialists...', icon: '👨‍⚕️' },
    { text: 'Preparing recommendations...', icon: '📋' },
  ]
  const [currentStep, setCurrentStep] = useState(0)

  const handleAnalyze = async () => {
    if (!symptoms.trim()) return

    setLoading(true)
    setStep('analyzing')
    setCurrentStep(0)

    // Animate through analysis steps
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= analyzeSteps.length - 1) {
          clearInterval(stepInterval)
          return prev
        }
        return prev + 1
      })
    }, 800)

    try {
      const { data } = await axios.post(backendUrl + '/api/ai/analyze-symptoms', {
        symptoms,
      })

      clearInterval(stepInterval)

      if (data.success) {
        setResult(data)
        setTimeout(() => setStep('results'), 500)
      } else {
        setStep('input')
        toast.error(data.message || 'AI service is currently unavailable. Please try again.')
      }
    } catch (error) {
      clearInterval(stepInterval)
      setStep('input')
      console.error(error)
      toast.error('Could not connect to AI service. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const getUrgencyColor = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case 'emergency':
        return 'bg-red-500 text-white'
      case 'high':
        return 'bg-orange-500 text-white'
      case 'medium':
        return 'bg-yellow-400 text-gray-900'
      case 'low':
        return 'bg-green-500 text-white'
      default:
        return 'bg-gray-300 text-gray-700'
    }
  }

  const getConfidenceColor = (confidence) => {
    switch (confidence?.toLowerCase()) {
      case 'high':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low':
        return 'text-gray-600 bg-gray-50 border-gray-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const quickSymptoms = [
    'Headache and dizziness for 2 days',
    'Persistent stomach pain after eating',
    'Skin rash with itching on arms',
    'Frequent cough and mild fever',
    'Back pain and joint stiffness',
    'Difficulty sleeping and anxiety',
  ]

  return (
    <div className="min-h-screen py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-50 to-purple-50 px-5 py-2 rounded-full mb-4 border border-indigo-100">
          <span className="text-xl">🤖</span>
          <span className="text-sm font-medium text-indigo-600">Powered by AI</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          AI Symptom Checker
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          Describe your symptoms in natural language and our AI will analyze them,
          suggest possible conditions, and recommend the right specialist for you.
        </p>
      </div>

      {/* Input Section */}
      {step === 'input' && (
        <div className="max-w-2xl mx-auto animate-[fadeIn_0.4s_ease-out]">
          {/* Symptom Input */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              💬 Describe your symptoms
            </label>
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="E.g., I've been having severe headaches and blurry vision for the past 3 days. The pain is mostly on the right side and gets worse in the evening..."
              className="w-full h-36 p-4 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-gray-700 placeholder-gray-400 transition-all"
              id="symptom-input"
            />

            {/* Quick Symptom Suggestions */}
            <div className="mt-4">
              <p className="text-xs text-gray-400 mb-2">Quick suggestions:</p>
              <div className="flex flex-wrap gap-2">
                {quickSymptoms.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setSymptoms(s)}
                    className="text-xs px-3 py-1.5 bg-gray-50 hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 rounded-full border border-gray-200 hover:border-indigo-200 transition-all cursor-pointer"
                    id={`quick-symptom-${i}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={!symptoms.trim() || loading}
            className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
              symptoms.trim()
                ? 'bg-gradient-to-r from-primary to-indigo-500 text-white hover:shadow-lg hover:shadow-primary/25 cursor-pointer active:scale-[0.98]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            id="analyze-btn"
          >
            🔬 Analyze My Symptoms
          </button>

          {/* Disclaimer */}
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-xs text-amber-700 flex items-start gap-2">
              <span className="text-base mt-[-2px]">⚠️</span>
              <span>
                <strong>Medical Disclaimer:</strong> This AI tool is for informational
                purposes only and does not constitute medical advice, diagnosis, or
                treatment. Always consult a qualified healthcare professional.
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Analyzing Animation */}
      {step === 'analyzing' && (
        <div className="max-w-md mx-auto text-center animate-[fadeIn_0.3s_ease-out]">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-10">
            {/* Pulsing brain animation */}
            <div className="w-24 h-24 mx-auto mb-8 relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
              <div className="absolute inset-2 bg-primary/30 rounded-full animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center text-5xl">
                🧠
              </div>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Analyzing Your Symptoms
            </h2>

            {/* Step Progress */}
            <div className="space-y-3">
              {analyzeSteps.map((s, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-500 ${
                    i < currentStep
                      ? 'bg-green-50 text-green-700'
                      : i === currentStep
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-gray-300'
                  }`}
                >
                  <span className="text-lg">
                    {i < currentStep ? '✅' : i === currentStep ? s.icon : '⬜'}
                  </span>
                  <span className="text-sm">{s.text}</span>
                  {i === currentStep && (
                    <div className="ml-auto w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results Section */}
      {step === 'results' && result && (
        <div className="max-w-4xl mx-auto animate-[fadeIn_0.5s_ease-out]">
          {/* Back Button */}
          <button
            onClick={() => {
              setStep('input')
              setResult(null)
              setSymptoms('')
            }}
            className="mb-6 text-sm text-gray-500 hover:text-primary flex items-center gap-1 cursor-pointer"
          >
            ← Check different symptoms
          </button>

          {/* Urgency Banner */}
          <div
            className={`${getUrgencyColor(
              result.analysis?.urgency
            )} rounded-xl p-4 mb-6 flex items-center gap-3`}
          >
            <span className="text-2xl">
              {result.analysis?.urgency === 'Emergency'
                ? '🚨'
                : result.analysis?.urgency === 'High'
                ? '⚡'
                : result.analysis?.urgency === 'Medium'
                ? '⚠️'
                : '✅'}
            </span>
            <div>
              <p className="font-bold">
                Urgency Level: {result.analysis?.urgency}
              </p>
              <p className="text-sm opacity-90">
                {result.analysis?.urgency_description}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Possible Conditions */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                🩺 Possible Conditions
              </h3>
              <div className="space-y-3">
                {result.analysis?.conditions?.map((condition, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl border border-gray-100 hover:border-primary/30 transition-all"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-gray-800">
                        {condition.name}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border ${getConfidenceColor(
                          condition.confidence
                        )}`}
                      >
                        {condition.confidence}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{condition.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Specialties */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                👨‍⚕️ Recommended Specialties
              </h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {result.analysis?.recommended_specialties?.map((spec, i) => (
                  <span
                    key={i}
                    className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium"
                  >
                    {spec}
                  </span>
                ))}
              </div>

              {/* General Advice */}
              <div className="mt-4 p-3 bg-blue-50 rounded-xl">
                <p className="text-xs font-semibold text-blue-700 mb-1">💡 General Advice</p>
                <p className="text-sm text-blue-600">{result.analysis?.general_advice}</p>
              </div>

              {/* Red Flags */}
              {result.analysis?.red_flags?.length > 0 && (
                <div className="mt-4 p-3 bg-red-50 rounded-xl">
                  <p className="text-xs font-semibold text-red-700 mb-1">
                    🚩 Watch for these red flags
                  </p>
                  <ul className="text-sm text-red-600 list-disc list-inside">
                    {result.analysis.red_flags.map((flag, i) => (
                      <li key={i}>{flag}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Suggested Tests */}
          {result.analysis?.suggested_tests?.length > 0 && (
            <div className="mt-6 bg-white rounded-2xl shadow-md border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                🧪 Suggested Medical Tests
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.analysis.suggested_tests.map((test, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm border border-purple-200"
                  >
                    {test}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Matched Doctors */}
          {result.matchedDoctors?.length > 0 && (
            <div className="mt-6 bg-white rounded-2xl shadow-md border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                ⭐ Recommended Doctors on PillDrop
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {result.matchedDoctors.map((doc, i) => (
                  <div
                    key={i}
                    className="border border-gray-100 rounded-xl p-4 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group"
                    onClick={() => navigate(`/appointments/${doc._id}`)}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={doc.image}
                        alt={doc.name}
                        className="w-14 h-14 rounded-full object-cover bg-primary/10"
                      />
                      <div>
                        <p className="font-semibold text-gray-800 group-hover:text-primary transition-colors">
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
                      <span className="text-xs text-primary font-medium group-hover:underline">
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

export default SymptomChecker
