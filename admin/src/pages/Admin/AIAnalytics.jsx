import React, { useState, useEffect, useContext } from 'react'
import { AdminContext } from '../../context/AdminContext'
import axios from 'axios'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line, Doughnut, Bar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const AIAnalytics = () => {
  const { atoken, backendUrl } = useContext(AdminContext)
  const [analytics, setAnalytics] = useState(null)
  const [aiInsights, setAiInsights] = useState([])
  const [aiSummary, setAiSummary] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get(backendUrl + '/api/ai/dashboard-insights', {
        headers: { atoken },
      })
      if (data.success) {
        setAnalytics(data.analytics)
        setAiInsights(data.aiInsights || [])
        setAiSummary(data.aiSummary || '')
      }
    } catch (error) {
      console.error('Analytics error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (atoken) {
      fetchAnalytics()
    }
  }, [atoken])

  if (loading) {
    return (
      <div className="m-5 w-full flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-500">Loading AI Analytics...</p>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="m-5 w-full text-center py-20">
        <p className="text-gray-500">No analytics data available yet.</p>
      </div>
    )
  }

  // Chart configurations
  const monthLabels = Object.keys(analytics.monthlyTrends || {}).map((key) => {
    const [year, month] = key.split('-')
    const date = new Date(year, month - 1)
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
  })

  const trendData = {
    labels: monthLabels,
    datasets: [
      {
        label: 'Appointments',
        data: Object.values(analytics.monthlyTrends || {}),
        borderColor: '#5f6FFF',
        backgroundColor: 'rgba(95, 111, 255, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 8,
        pointBackgroundColor: '#5f6FFF',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  }

  const specialtyLabels = Object.keys(analytics.specialtyDemand || {})
  const specialtyData = {
    labels: specialtyLabels,
    datasets: [
      {
        data: Object.values(analytics.specialtyDemand || {}),
        backgroundColor: [
          '#5f6FFF',
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#8B5CF6',
          '#EC4899',
          '#06B6D4',
        ],
        borderWidth: 2,
        borderColor: '#fff',
        hoverOffset: 8,
      },
    ],
  }

  const statusData = {
    labels: ['Completed', 'Cancelled', 'Pending'],
    datasets: [
      {
        data: [
          analytics.statusBreakdown?.completed || 0,
          analytics.statusBreakdown?.cancelled || 0,
          analytics.statusBreakdown?.pending || 0,
        ],
        backgroundColor: ['#10B981', '#EF4444', '#F59E0B'],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  }

  // Peak hours bar chart
  const hourLabels = Object.keys(analytics.hourlyDistribution || {}).slice(0, 12)
  const peakHoursData = {
    labels: hourLabels,
    datasets: [
      {
        label: 'Bookings',
        data: hourLabels.map((h) => analytics.hourlyDistribution[h] || 0),
        backgroundColor: 'rgba(95, 111, 255, 0.7)',
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { font: { size: 11 } },
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } },
      },
    },
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { padding: 15, font: { size: 11 }, usePointStyle: true },
      },
    },
    cutout: '60%',
  }

  const getInsightTypeColor = (type) => {
    switch (type) {
      case 'growth':
        return 'border-green-200 bg-green-50'
      case 'warning':
        return 'border-orange-200 bg-orange-50'
      case 'opportunity':
        return 'border-blue-200 bg-blue-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  return (
    <div className="m-5 w-full max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            🤖 AI Analytics Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            AI-powered insights and analytics for your platform
          </p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition-colors cursor-pointer"
        >
          🔄 Refresh
        </button>
      </div>

      {/* AI Summary Banner */}
      {aiSummary && (
        <div className="bg-gradient-to-r from-primary to-indigo-500 text-white rounded-xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🧠</span>
            <span className="text-sm font-semibold opacity-90">AI Platform Summary</span>
          </div>
          <p className="text-white/95">{aiSummary}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <p className="text-2xl font-bold text-gray-900">{analytics.totalAppointments}</p>
          <p className="text-xs text-gray-500 mt-1">Total Appointments</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <p className="text-2xl font-bold text-green-600">₹{analytics.totalRevenue?.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">Total Revenue</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <p className="text-2xl font-bold text-primary">{analytics.totalDoctors}</p>
          <p className="text-xs text-gray-500 mt-1">Active Doctors</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <p className="text-2xl font-bold text-purple-600">{analytics.totalUsers}</p>
          <p className="text-xs text-gray-500 mt-1">Registered Users</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Appointment Trends */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            📈 Appointment Trends
          </h3>
          <div className="h-64">
            <Line data={trendData} options={chartOptions} />
          </div>
        </div>

        {/* Specialty Demand */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            🏥 Specialty Demand
          </h3>
          <div className="h-64">
            <Doughnut data={specialtyData} options={doughnutOptions} />
          </div>
        </div>

        {/* Peak Hours */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            ⏰ Peak Booking Hours
          </h3>
          <div className="h-64">
            <Bar data={peakHoursData} options={chartOptions} />
          </div>
        </div>

        {/* Appointment Status */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            📊 Appointment Status
          </h3>
          <div className="h-64">
            <Doughnut data={statusData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* AI Insights */}
      {aiInsights.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            💡 AI-Generated Insights
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {aiInsights.map((insight, i) => (
              <div
                key={i}
                className={`rounded-xl p-5 border ${getInsightTypeColor(insight.type)}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{insight.icon}</span>
                  <h4 className="font-semibold text-gray-800">{insight.title}</h4>
                </div>
                <p className="text-sm text-gray-600">{insight.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Doctor Performance Table */}
      {analytics.doctorPerformance?.length > 0 && (
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            👨‍⚕️ Doctor Performance
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Doctor</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Specialty</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Appointments</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Completed</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Revenue</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {analytics.doctorPerformance.map((doc, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-800">{doc.name}</td>
                    <td className="py-3 px-4 text-gray-600">{doc.speciality}</td>
                    <td className="py-3 px-4 text-center">{doc.totalAppointments}</td>
                    <td className="py-3 px-4 text-center text-green-600">{doc.completed}</td>
                    <td className="py-3 px-4 text-center font-medium">₹{doc.revenue?.toLocaleString()}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          doc.available
                            ? 'bg-green-50 text-green-600'
                            : 'bg-red-50 text-red-600'
                        }`}
                      >
                        {doc.available ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default AIAnalytics
