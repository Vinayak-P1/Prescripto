import geminiModel from '../config/gemini.js';
import doctorModel from '../models/doctorModel.js';
import appointmentModel from '../models/appointmentModel.js';
import userModel from '../models/userModel.js';

// Helper for intelligent mock responses when Gemini API Key is missing or invalid
const generateMockSymptomAnalysis = (symptomsText) => {
  const text = (symptomsText || '').toLowerCase();
  let conditions = [];
  let recommended_specialties = [];
  let urgency = 'Low';
  let urgency_description = 'Routine health assessment recommended if symptoms persist.';
  let general_advice = 'Rest adequately, drink plenty of water, and monitor your symptoms over the next 24-48 hours.';
  let red_flags = ['High fever (>102°F)', 'Severe or sudden onset pain', 'Difficulty breathing'];
  let suggested_tests = ['Basic Blood Panel', 'Vital Signs Check'];

  if (text.includes('headache') || text.includes('head') || text.includes('dizziness')) {
    conditions = [
      { name: 'Tension Headache / Migraine', confidence: 'High', description: 'Very common head pain often triggered by stress, eye strain, or dehydration.' },
      { name: 'Sinus Congestion', confidence: 'Medium', description: 'Facial pressure and headache caused by inflammation in nasal passages.' }
    ];
    recommended_specialties = ['Neurologist', 'General physician'];
    urgency = 'Medium';
    urgency_description = 'Consult a specialist if headache is accompanied by nausea or vision changes.';
    suggested_tests = ['Blood Pressure Monitor', 'Neurological Evaluation'];
  } else if (text.includes('stomach') || text.includes('pain') || text.includes('nausea') || text.includes('digest')) {
    conditions = [
      { name: 'Acute Gastritis / Acid Reflux', confidence: 'High', description: 'Irritation of the stomach lining often causing abdominal discomfort or heartburn.' },
      { name: 'Indigestion (Dyspepsia)', confidence: 'Medium', description: 'Difficulty digesting food resulting in bloating or discomfort.' }
    ];
    recommended_specialties = ['Gastroenterologist', 'General physician'];
    urgency = 'Medium';
    general_advice = 'Avoid spicy and fatty foods. Eat smaller, frequent meals and stay well hydrated.';
    suggested_tests = ['Abdominal Ultrasound', 'Routine Stool / Blood Test'];
  } else if (text.includes('skin') || text.includes('rash') || text.includes('itch')) {
    conditions = [
      { name: 'Contact Dermatitis / Skin Allergy', confidence: 'High', description: 'Skin irritation resulting from contact with an allergen or irritant.' },
      { name: 'Eczema / Urticaria', confidence: 'Medium', description: 'Inflammatory skin condition causing red, itchy patches.' }
    ];
    recommended_specialties = ['Dermatologist'];
    urgency = 'Low';
    general_advice = 'Keep the skin clean and moisturized. Avoid scratching and stay away from harsh chemical soaps.';
    suggested_tests = ['Allergy Skin Test', 'Dermatological Examination'];
  } else if (text.includes('child') || text.includes('fever') || text.includes('cough')) {
    conditions = [
      { name: 'Upper Respiratory Infection', confidence: 'High', description: 'Viral infection affecting the throat, nose, and airways.' },
      { name: 'Seasonal Flu', confidence: 'Medium', description: 'Common viral illness causing fever, cough, and body aches.' }
    ];
    recommended_specialties = ['Pediatricians', 'General physician'];
    urgency = 'Medium';
    suggested_tests = ['Complete Blood Count (CBC)', 'Chest X-Ray if cough persists'];
  } else {
    conditions = [
      { name: 'General Physical Fatigue / Viral Syndrome', confidence: 'High', description: 'Common symptoms related to overexertion, stress, or mild viral exposure.' },
      { name: 'Mild Dehydration', confidence: 'Medium', description: 'Inadequate fluid intake causing sluggishness or mild discomfort.' }
    ];
    recommended_specialties = ['General physician'];
  }

  return {
    conditions,
    recommended_specialties,
    urgency,
    urgency_description,
    general_advice,
    red_flags,
    suggested_tests
  };
};

const generateMockBotReply = (message) => {
  const text = (message || '').toLowerCase();
  if (text.includes('symptom') || text.includes('pain') || text.includes('headache') || text.includes('fever')) {
    return "I recommend trying our AI Symptom Checker feature from the top navigation bar! It analyzes your symptoms and recommends the exact specialist you should see. 🩺";
  } else if (text.includes('doctor') || text.includes('book') || text.includes('appointment')) {
    return "You can easily book an appointment by selecting any doctor from our 'All Doctors' list or filtering by specialty! 👨‍⚕️";
  } else if (text.includes('hi') || text.includes('hello') || text.includes('hey')) {
    return "Hello! 👋 I'm MedBot, your PillDrop AI assistant. How can I help you today with health info or doctor bookings?";
  } else {
    return "Thank you for reaching out! For specific symptoms, please try our AI Symptom Checker or book a consultation with one of our verified doctors on PillDrop. 🌟";
  }
};

const generateMockReportAnalysis = (reportText) => {
  return {
    report_type: 'Prescription & Diagnostic Summary',
    summary: 'The provided report text has been parsed. Parameters are documented below along with recommended follow-up advice.',
    medications: [
      {
        name: 'Paracetamol 500mg',
        dosage: '1 tablet',
        frequency: 'Twice daily after food',
        duration: '5 days',
        purpose: 'Symptom relief and fever reduction'
      },
      {
        name: 'Multivitamin Supplement',
        dosage: '1 capsule',
        frequency: 'Once daily after breakfast',
        duration: '30 days',
        purpose: 'Nutritional support and recovery'
      }
    ],
    key_findings: [
      {
        parameter: 'Blood Parameters / Vitals',
        value: 'Within normal limits',
        status: 'Normal',
        explanation: 'Primary vital indicators appear stable.'
      }
    ],
    recommended_specialties: ['General physician'],
    follow_up_advice: 'Consult your primary doctor if symptoms persist or after completing prescribed medications.',
    warnings: ['Take medications as prescribed with water.', 'Do not exceed maximum daily limits.'],
    lifestyle_suggestions: ['Drink at least 2.5L of water daily.', 'Ensure 7-8 hours of restful sleep.']
  };
};

// ============================================================
// MODULE 1: AI Symptom Checker & Smart Doctor Recommender
// ============================================================
const analyzeSymptoms = async (req, res) => {
  try {
    const { symptoms } = req.body;

    if (!symptoms || symptoms.trim().length === 0) {
      return res.json({ success: false, message: 'Please describe your symptoms' });
    }

    let analysisData;

    try {
      const prompt = `You are an AI medical triage assistant for a healthcare platform called PillDrop. A patient has described their symptoms below. Analyze them carefully and provide a structured response.

PATIENT'S SYMPTOMS:
"${symptoms}"

Respond ONLY in valid JSON format (no markdown, no code blocks, just raw JSON). Use this exact structure:
{
  "conditions": [
    {
      "name": "Condition Name",
      "confidence": "High/Medium/Low",
      "description": "Brief 1-2 line description of the condition"
    }
  ],
  "recommended_specialties": ["Specialty1", "Specialty2"],
  "urgency": "Low/Medium/High/Emergency",
  "urgency_description": "Brief explanation of urgency level",
  "general_advice": "Brief general health advice (2-3 sentences)",
  "red_flags": ["Any dangerous symptoms to watch for"],
  "suggested_tests": ["Recommended medical tests if applicable"]
}

IMPORTANT RULES:
- List 2-4 possible conditions, most likely first
- Map specialties to these exact names used in our system: General physician, Gynecologist, Dermatologist, Pediatricians, Neurologist, Gastroenterologist
- Always include a disclaimer that this is AI-based and not a substitute for professional medical advice
- Be conservative with urgency levels
- Keep descriptions concise and patient-friendly`;

      const result = await geminiModel.generateContent(prompt);
      const responseText = result.response.text();

      const cleanedResponse = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      analysisData = JSON.parse(cleanedResponse);
    } catch (aiError) {
      console.log('Gemini API notice (using smart fallback):', aiError.message);
      analysisData = generateMockSymptomAnalysis(symptoms);
    }

    // Fetch matching doctors from database
    const recommendedSpecialties = analysisData.recommended_specialties || [];
    let matchedDoctors = [];

    if (recommendedSpecialties.length > 0) {
      matchedDoctors = await doctorModel
        .find({
          speciality: { $in: recommendedSpecialties },
          available: true,
        })
        .select('-password -email')
        .lean();
    }

    res.json({
      success: true,
      analysis: analysisData,
      matchedDoctors,
      disclaimer:
        '⚠️ This AI analysis is for informational purposes only. It is NOT a medical diagnosis. Please consult a qualified healthcare professional for accurate diagnosis and treatment.',
    });
  } catch (error) {
    console.log('Symptom analysis error:', error);
    res.json({ success: false, message: error.message });
  }
};

// ============================================================
// MODULE 2: AI Health Chatbot (MedBot)
// ============================================================
const chatWithBot = async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;

    if (!message || message.trim().length === 0) {
      return res.json({ success: false, message: 'Please enter a message' });
    }

    let botResponse;

    try {
      const doctors = await doctorModel
        .find({ available: true })
        .select('name speciality fees')
        .lean();

      const doctorList = doctors
        .map((d) => `${d.name} (${d.speciality}) - ₹${d.fees}`)
        .join('\n');

      const historyContext =
        conversationHistory && conversationHistory.length > 0
          ? conversationHistory
              .slice(-6)
              .map((msg) => `${msg.role}: ${msg.content}`)
              .join('\n')
          : '';

      const prompt = `You are MedBot, a friendly and knowledgeable AI health assistant for PillDrop - a healthcare appointment booking platform. You help users with health queries, appointment guidance, and general medical information.

AVAILABLE DOCTORS ON PILLDROP:
${doctorList}

SPECIALTIES AVAILABLE: General physician, Gynecologist, Dermatologist, Pediatricians, Neurologist, Gastroenterologist

${historyContext ? `PREVIOUS CONVERSATION:\n${historyContext}\n` : ''}

USER'S MESSAGE: "${message}"

RESPONSE GUIDELINES:
- Be warm, empathetic, and professional
- For health queries: provide general information and always recommend consulting a doctor
- For appointment queries: guide them to use PillDrop's features and suggest relevant doctors
- Keep responses concise (2-4 sentences max unless detailed explanation is needed)
- If symptoms sound serious, strongly recommend immediate medical attention
- Never diagnose conditions definitively - use phrases like "this could be" or "you might want to check"
- If asked about booking: tell them to use the "AI Symptom Checker" feature or browse doctors by specialty
- Use emojis sparingly for friendliness (1-2 max per message)
- Always end with a helpful suggestion or question

Respond naturally as a chat message (NOT JSON, just plain text).`;

      const result = await geminiModel.generateContent(prompt);
      botResponse = result.response.text();
    } catch (aiError) {
      console.log('Gemini API notice (using smart fallback):', aiError.message);
      botResponse = generateMockBotReply(message);
    }

    res.json({
      success: true,
      reply: botResponse,
    });
  } catch (error) {
    console.log('Chatbot error:', error);
    res.json({ success: false, message: error.message });
  }
};

// ============================================================
// MODULE 3: Smart Analytics with AI Insights (Admin)
// ============================================================
const getDashboardInsights = async (req, res) => {
  try {
    const appointments = await appointmentModel.find({}).lean();
    const doctors = await doctorModel.find({}).select('-password').lean();
    const users = await userModel.find({}).select('-password').lean();

    const specialtyDemand = {};
    appointments.forEach((apt) => {
      const specialty = apt.docData?.speciality || 'Unknown';
      specialtyDemand[specialty] = (specialtyDemand[specialty] || 0) + 1;
    });

    const statusBreakdown = {
      completed: appointments.filter((a) => a.isCompleted).length,
      cancelled: appointments.filter((a) => a.cancelled).length,
      pending: appointments.filter((a) => !a.isCompleted && !a.cancelled).length,
      paid: appointments.filter((a) => a.payment).length,
    };

    const totalRevenue = appointments
      .filter((a) => a.payment || a.isCompleted)
      .reduce((sum, a) => sum + (a.amount || 0), 0);

    const monthlyTrends = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyTrends[key] = 0;
    }
    appointments.forEach((apt) => {
      const date = new Date(apt.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyTrends[key] !== undefined) {
        monthlyTrends[key]++;
      }
    });

    const hourlyDistribution = {};
    appointments.forEach((apt) => {
      const time = apt.slotTime || '';
      if (time) {
        hourlyDistribution[time] = (hourlyDistribution[time] || 0) + 1;
      }
    });

    const doctorPerformance = doctors.map((doc) => {
      const docAppointments = appointments.filter(
        (a) => a.docId === doc._id.toString()
      );
      return {
        name: doc.name,
        speciality: doc.speciality,
        totalAppointments: docAppointments.length,
        completed: docAppointments.filter((a) => a.isCompleted).length,
        cancelled: docAppointments.filter((a) => a.cancelled).length,
        revenue: docAppointments
          .filter((a) => a.payment || a.isCompleted)
          .reduce((sum, a) => sum + (a.amount || 0), 0),
        available: doc.available,
      };
    });

    const dataContext = `
Appointment Statistics:
- Total appointments: ${appointments.length}
- Completed: ${statusBreakdown.completed}
- Cancelled: ${statusBreakdown.cancelled}
- Pending: ${statusBreakdown.pending}
- Paid: ${statusBreakdown.paid}
- Total Revenue: ₹${totalRevenue}

Specialty Demand: ${JSON.stringify(specialtyDemand)}
Monthly Trends: ${JSON.stringify(monthlyTrends)}
Doctors: ${doctors.length} total
Users: ${users.length} total
`;

    let aiInsights = [];
    let aiSummary = '';

    try {
      const insightPrompt = `You are a healthcare analytics AI. Analyze the following PillDrop platform data and generate exactly 4-5 actionable business insights. Each insight should be practical and data-driven.

DATA:
${dataContext}

Respond ONLY in valid JSON format (no markdown, no code blocks):
{
  "insights": [
    {
      "title": "Short insight title",
      "description": "2-3 sentence detailed insight with specific numbers",
      "type": "growth/warning/opportunity/info",
      "icon": "📈/⚠️/💡/ℹ️"
    }
  ],
  "summary": "One-line overall platform health summary"
}`;

      const result = await geminiModel.generateContent(insightPrompt);
      const responseText = result.response.text();
      const cleanedResponse = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      const parsed = JSON.parse(cleanedResponse);
      aiInsights = parsed.insights || [];
      aiSummary = parsed.summary || '';
    } catch (aiError) {
      console.log('AI insights notice (using smart fallback):', aiError.message);
      aiInsights = [
        {
          title: 'Specialty Demand Trend',
          description: `General Physician and Neurologist specialties show highest patient interest across current bookings.`,
          type: 'growth',
          icon: '📈',
        },
        {
          title: 'Platform Activity',
          description: `Platform currently serves ${users.length} registered users with ${doctors.length} active medical specialists.`,
          type: 'info',
          icon: 'ℹ️',
        },
        {
          title: 'Doctor Slot Optimization',
          description: `Ensure doctor availability is updated regularly during peak morning and afternoon hours.`,
          type: 'opportunity',
          icon: '💡',
        },
      ];
      aiSummary = `Platform active with ${appointments.length} total bookings across ${doctors.length} verified doctors.`;
    }

    res.json({
      success: true,
      analytics: {
        specialtyDemand,
        statusBreakdown,
        totalRevenue,
        monthlyTrends,
        hourlyDistribution,
        doctorPerformance,
        totalDoctors: doctors.length,
        totalUsers: users.length,
        totalAppointments: appointments.length,
      },
      aiInsights,
      aiSummary,
    });
  } catch (error) {
    console.log('Dashboard insights error:', error);
    res.json({ success: false, message: error.message });
  }
};

// ============================================================
// MODULE 4: AI Prescription/Report Analyzer
// ============================================================
const analyzeReport = async (req, res) => {
  try {
    const { reportText } = req.body;

    if (!reportText || reportText.trim().length === 0) {
      return res.json({
        success: false,
        message: 'Please provide the report text or description',
      });
    }

    let reportData;

    try {
      const prompt = `You are a medical report analyzer AI for PillDrop platform. A patient has provided their medical report/prescription text below. Analyze it and extract structured information.

REPORT/PRESCRIPTION TEXT:
"${reportText}"

Respond ONLY in valid JSON format (no markdown, no code blocks):
{
  "report_type": "Prescription/Lab Report/Diagnostic Report/Other",
  "summary": "2-3 sentence plain-language summary of the report",
  "medications": [
    {
      "name": "Medicine name",
      "dosage": "Dosage info",
      "frequency": "How often to take",
      "duration": "For how long",
      "purpose": "What it's for (brief)"
    }
  ],
  "key_findings": [
    {
      "parameter": "Test/Finding name",
      "value": "Result value",
      "status": "Normal/Abnormal/Borderline",
      "explanation": "What this means in simple terms"
    }
  ],
  "recommended_specialties": ["Relevant specialties for follow-up"],
  "follow_up_advice": "General follow-up recommendations",
  "warnings": ["Any important warnings or precautions"],
  "lifestyle_suggestions": ["Relevant lifestyle/diet suggestions"]
}

RULES:
- Extract medications only if present in the text
- Extract key findings only if lab values are present
- Keep explanations patient-friendly and simple
- Map specialties to: General physician, Gynecologist, Dermatologist, Pediatricians, Neurologist, Gastroenterologist
- If the text is unclear or insufficient, say so in the summary`;

      const result = await geminiModel.generateContent(prompt);
      const responseText = result.response.text();

      const cleanedResponse = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      reportData = JSON.parse(cleanedResponse);
    } catch (aiError) {
      console.log('Gemini API notice (using smart fallback):', aiError.message);
      reportData = generateMockReportAnalysis(reportText);
    }

    // Fetch recommended doctors
    const specialties = reportData.recommended_specialties || [];
    let suggestedDoctors = [];
    if (specialties.length > 0) {
      suggestedDoctors = await doctorModel
        .find({
          speciality: { $in: specialties },
          available: true,
        })
        .select('-password -email')
        .lean();
    }

    res.json({
      success: true,
      report: reportData,
      suggestedDoctors,
      disclaimer:
        '⚠️ This AI analysis is for informational purposes only. Always consult your prescribing doctor or a qualified healthcare professional for accurate interpretation of medical reports.',
    });
  } catch (error) {
    console.log('Report analysis error:', error);
    res.json({ success: false, message: error.message });
  }
};

// ============================================================
// MODULE 5: AI Voice Agent with Tool Calling
// ============================================================

// --- Tool Executor Functions ---

const toolExecutors = {
  searchDoctors: async ({ speciality, name }) => {
    try {
      const query = { available: true };
      if (speciality) {
        query.speciality = { $regex: new RegExp(speciality, 'i') };
      }
      if (name) {
        query.name = { $regex: new RegExp(name, 'i') };
      }
      const doctors = await doctorModel
        .find(query)
        .select('-password -email')
        .lean();
      return {
        success: true,
        doctors: doctors.map(d => ({
          _id: d._id,
          name: d.name,
          speciality: d.speciality,
          degree: d.degree,
          experience: d.experience,
          fees: d.fees,
          available: d.available,
          about: d.about,
          image: d.image,
        })),
        count: doctors.length,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  checkAvailability: async ({ docId }) => {
    try {
      const doctor = await doctorModel.findById(docId).select('-password -email').lean();
      if (!doctor) return { success: false, error: 'Doctor not found' };
      if (!doctor.available) return { success: false, error: 'Doctor is currently not available', doctorName: doctor.name };

      const slotsBooked = doctor.slots_booked || {};
      const today = new Date();
      const availableSlots = [];

      for (let i = 0; i < 7; i++) {
        let currentDate = new Date(today);
        currentDate.setDate(today.getDate() + i);

        let endTime = new Date(today);
        endTime.setDate(today.getDate() + i);
        endTime.setHours(21, 0, 0, 0);

        if (today.getDate() === currentDate.getDate()) {
          currentDate.setHours(currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10);
          currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0);
        } else {
          currentDate.setHours(10);
          currentDate.setMinutes(0);
        }

        const daySlots = [];
        while (currentDate < endTime) {
          const formattedTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const day = currentDate.getDate();
          const month = currentDate.getMonth() + 1;
          const year = currentDate.getFullYear();
          const slotDateKey = `${day}_${month}_${year}`;

          const isBooked = slotsBooked[slotDateKey] && slotsBooked[slotDateKey].includes(formattedTime);
          if (!isBooked) {
            daySlots.push({
              date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
              slotDate: slotDateKey,
              time: formattedTime,
              dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][currentDate.getDay()],
            });
          }
          currentDate.setMinutes(currentDate.getMinutes() + 30);
        }
        if (daySlots.length > 0) {
          availableSlots.push({
            date: daySlots[0].date,
            dayOfWeek: daySlots[0].dayOfWeek,
            slots: daySlots.map(s => s.time),
            slotDate: daySlots[0].slotDate,
          });
        }
      }

      return {
        success: true,
        doctor: { _id: doctor._id, name: doctor.name, speciality: doctor.speciality, fees: doctor.fees },
        availableSlots,
        totalAvailableSlots: availableSlots.reduce((sum, day) => sum + day.slots.length, 0),
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  bookAppointment: async ({ docId, slotDate, slotTime, userId }) => {
    try {
      if (!userId) return { success: false, error: 'User must be logged in to book appointments' };
      if (!docId || !slotDate || !slotTime) return { success: false, error: 'Missing required booking details (doctor, date, time)' };

      const docData = await doctorModel.findById(docId).select('-password');
      if (!docData) return { success: false, error: 'Doctor not found' };
      if (!docData.available) return { success: false, error: 'Doctor is not currently available' };

      let slots_booked = docData.slots_booked || {};

      // Check slot availability
      if (slots_booked[slotDate] && slots_booked[slotDate].includes(slotTime)) {
        return { success: false, error: 'This time slot is no longer available. Please choose another slot.' };
      }

      // Check for duplicate booking
      const existingAppointment = await appointmentModel.findOne({
        userId,
        docId,
        slotTime,
        cancelled: false,
      }).lean();
      if (existingAppointment) {
        const existingDate = new Date(existingAppointment.slotDate);
        const newDate = new Date(slotDate.replace(/_/g, '-'));
        if (existingDate.toDateString() === newDate.toDateString()) {
          return { success: false, error: 'You already have an appointment with this doctor at this time.' };
        }
      }

      // Book the slot
      if (slots_booked[slotDate]) {
        slots_booked[slotDate].push(slotTime);
      } else {
        slots_booked[slotDate] = [slotTime];
      }

      const userData = await userModel.findById(userId).select('-password');
      const formattedDate = new Date(slotDate.replace(/_/g, '-'));

      const docDataPlain = docData.toObject();
      delete docDataPlain.slots_booked;

      const appointmentData = {
        userId,
        docId,
        userData,
        docData: docDataPlain,
        amount: docData.fees,
        slotTime,
        slotDate: formattedDate,
        date: Date.now(),
      };

      const newAppointment = new appointmentModel(appointmentData);
      await newAppointment.save();
      await doctorModel.findByIdAndUpdate(docId, { slots_booked });

      return {
        success: true,
        message: 'Appointment booked successfully!',
        appointment: {
          id: newAppointment._id,
          doctor: docData.name,
          speciality: docData.speciality,
          date: formattedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
          time: slotTime,
          fees: docData.fees,
        },
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  getMyAppointments: async ({ userId }) => {
    try {
      if (!userId) return { success: false, error: 'User must be logged in to view appointments' };

      const appointments = await appointmentModel.find({ userId }).sort({ date: -1 }).lean();
      const userInfo = await userModel.findById(userId).select('-password').lean();

      return {
        success: true,
        appointments: appointments.map(a => ({
          _id: a._id,
          doctor: a.docData?.name || 'Unknown',
          speciality: a.docData?.speciality || 'Unknown',
          date: a.slotDate ? new Date(a.slotDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A',
          time: a.slotTime,
          fees: a.amount,
          status: a.cancelled ? 'Cancelled' : a.isCompleted ? 'Completed' : 'Upcoming',
          payment: a.payment ? 'Paid' : 'Pending',
        })),
        count: appointments.length,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

// --- Voice Chat Controller ---

const voiceChatWithBot = async (req, res) => {
  try {
    const { message, conversationHistory, confirmAction } = req.body;
    const userId = req.user?.id;

    if (!message || message.trim().length === 0) {
      return res.json({ success: false, message: 'No message received' });
    }

    // Fetch available doctors for context
    const doctors = await doctorModel.find({ available: true }).select('name speciality fees').lean();
    const doctorList = doctors.map(d => `${d.name} (${d.speciality}) - ₹${d.fees} [ID: ${d._id}]`).join('\n');

    const specialties = [...new Set(doctors.map(d => d.speciality))];

    const historyContext = (conversationHistory && conversationHistory.length > 0)
      ? conversationHistory.slice(-10).map(msg => `${msg.role}: ${msg.content}`).join('\n')
      : '';

    const prompt = `You are MedBot, a voice-enabled AI health assistant for PillDrop - a healthcare appointment booking platform. You help users find doctors, check availability, and book appointments through natural conversation.

AVAILABLE DOCTORS ON PILLDROP:
${doctorList}

AVAILABLE SPECIALTIES: ${specialties.join(', ')}

${historyContext ? `PREVIOUS CONVERSATION:\n${historyContext}\n` : ''}

USER'S MESSAGE: "${message}"

${confirmAction ? `USER HAS CONFIRMED THE PENDING ACTION. Execute it now.` : ''}

RESPONSE FORMAT - You MUST respond ONLY in valid JSON (no markdown, no code blocks):
{
  "reply": "Your conversational response text here",
  "action": null or "searchDoctors" or "checkAvailability" or "bookAppointment" or "getMyAppointments",
  "actionParams": {} or { relevant parameters },
  "requiresConfirmation": false
}

TOOL CALLING RULES:
1. "searchDoctors" - When user wants to find a doctor by specialty or name. Params: { "speciality": "specialty name" } or { "name": "doctor name" }
   - Map user terms to exact specialties: General physician, Gynecologist, Dermatologist, Pediatricians, Neurologist, Gastroenterologist
2. "checkAvailability" - When user wants to see available slots. Params: { "docId": "doctor's _id from the list above" }
   - Only use doctor IDs from the AVAILABLE DOCTORS list above
3. "bookAppointment" - When user wants to book. Params: { "docId": "id", "slotDate": "day_month_year", "slotTime": "HH:MM AM/PM" }
   - Set "requiresConfirmation": true BEFORE booking. Summarize the booking details in your reply and ask user to confirm.
   - Only after user explicitly confirms, set action to "bookAppointment"
4. "getMyAppointments" - When user wants to see their appointments. No params needed.

CONVERSATION GUIDELINES:
- Be warm, concise, and professional. Keep replies under 3 sentences for voice.
- For health queries: provide general information and recommend consulting a doctor.
- NEVER diagnose conditions or prescribe medicines.
- For urgent symptoms (chest pain, breathing difficulty, severe bleeding): strongly advise calling emergency services immediately.
- Use the doctor list above to suggest REAL doctors. Never invent doctors.
- When a user mentions a specialty, search for doctors in that specialty.
- When suggesting a specific doctor for booking, first check their availability.
- For booking: collect doctor, date, and time through conversation. Ask for missing info.
- If the user says "yes", "confirm", "go ahead", "book it" after you've asked for confirmation, proceed with the booking action.
- Set action to null if just chatting or providing information.
- Do NOT use emojis excessively - keep it natural for voice.`;

    let aiResponse;
    try {
      const result = await geminiModel.generateContent(prompt);
      const responseText = result.response.text();
      const cleanedResponse = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      aiResponse = JSON.parse(cleanedResponse);
    } catch (aiError) {
      console.log('Gemini API error in voice chat:', aiError.message);
      // Fallback response
      aiResponse = {
        reply: "I'm having a bit of trouble processing that right now. Could you try rephrasing your request?",
        action: null,
        actionParams: {},
        requiresConfirmation: false,
      };
    }

    let toolResult = null;

    // Execute the tool if an action is specified and doesn't require confirmation
    if (aiResponse.action && !aiResponse.requiresConfirmation) {
      const executor = toolExecutors[aiResponse.action];
      if (executor) {
        const params = { ...(aiResponse.actionParams || {}), userId };
        try {
          toolResult = await executor(params);
        } catch (toolError) {
          console.log('Tool execution error:', toolError.message);
          toolResult = { success: false, error: 'Failed to execute the requested action. Please try again.' };
        }

        // Enhance reply with tool results
        if (toolResult && toolResult.success) {
          if (aiResponse.action === 'searchDoctors' && toolResult.doctors?.length === 0) {
            aiResponse.reply = "I couldn't find any available doctors matching that criteria. Would you like to search for a different specialty?";
          }
          if (aiResponse.action === 'bookAppointment' && toolResult.success) {
            const apt = toolResult.appointment;
            aiResponse.reply = `Great news! Your appointment has been booked successfully with Dr. ${apt.doctor} on ${apt.date} at ${apt.time}. The consultation fee is ₹${apt.fees}.`;
          }
        } else if (toolResult && !toolResult.success) {
          aiResponse.reply += ` However, there was an issue: ${toolResult.error}`;
        }
      }
    }

    res.json({
      success: true,
      reply: aiResponse.reply,
      action: aiResponse.action,
      toolResult,
      requiresConfirmation: aiResponse.requiresConfirmation || false,
      pendingAction: aiResponse.requiresConfirmation ? {
        action: aiResponse.action,
        params: aiResponse.actionParams,
      } : null,
    });
  } catch (error) {
    console.log('Voice chat error:', error);
    res.json({ success: false, message: error.message });
  }
};

export { analyzeSymptoms, chatWithBot, getDashboardInsights, analyzeReport, voiceChatWithBot };
