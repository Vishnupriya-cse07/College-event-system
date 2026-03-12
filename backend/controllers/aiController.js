const axios = require('axios');
const Event = require('../models/Event');
const User = require('../models/User');

const OLLAMA_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const MODEL = process.env.OLLAMA_MODEL || 'llama3';

const callLlama = async (prompt, systemPrompt = '') => {
  try {
    const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
      model: MODEL,
      prompt: systemPrompt ? `${systemPrompt}\n\nUser: ${prompt}` : prompt,
      stream: false,
      options: { temperature: 0.7, top_p: 0.9 }
    }, { timeout: 30000 });
    return response.data.response;
  } catch (err) {
    // Fallback if Ollama is not running
    console.log('Ollama not available, using fallback');
    return null;
  }
};

exports.getRecommendations = async (req, res) => {
  try {
    const student = await User.findById(req.user._id);
    const allEvents = await Event.find({ 
      status: { $in: ['published', 'ongoing'] },
      date: { $gte: new Date() },
      registrationOpen: true
    }).populate('organizer', 'name societyName');
    
    if (allEvents.length === 0) {
      return res.json({ success: true, recommendations: [], message: 'No upcoming events' });
    }
    
    const eventsData = allEvents.map(e => ({
      id: e._id,
      title: e.title,
      category: e.category,
      tags: e.tags,
      description: e.shortDescription || e.description.substring(0, 200)
    }));
    
    const prompt = `Student interests: ${student.interests?.join(', ') || 'general'}, Department: ${student.department || 'any'}.
    
Available events: ${JSON.stringify(eventsData)}

Analyze and return ONLY a JSON array of event IDs in order of relevance for this student. Return format: {"recommended": ["id1", "id2", ...], "reasons": {"id1": "reason", ...}}`;

    const aiResponse = await callLlama(prompt, 'You are an event recommendation AI. Always respond with valid JSON only.');
    
    let recommendations = allEvents;
    let reasons = {};
    
    if (aiResponse) {
      try {
        const parsed = JSON.parse(aiResponse.match(/\{.*\}/s)?.[0] || '{}');
        if (parsed.recommended && parsed.recommended.length > 0) {
          const orderedIds = parsed.recommended;
          reasons = parsed.reasons || {};
          recommendations = orderedIds
            .map(id => allEvents.find(e => e._id.toString() === id))
            .filter(Boolean);
          
          const unrecommended = allEvents.filter(e => !orderedIds.includes(e._id.toString()));
          recommendations = [...recommendations, ...unrecommended];
        }
      } catch (e) {
        // Use interest-based fallback
        recommendations = allEvents.filter(event =>
          student.interests?.some(interest =>
            event.tags?.includes(interest.toLowerCase()) ||
            event.category === interest.toLowerCase()
          )
        );
        if (recommendations.length < 3) recommendations = allEvents;
      }
    } else {
      // Keyword matching fallback
      const scored = allEvents.map(event => {
        let score = 0;
        student.interests?.forEach(interest => {
          if (event.tags?.some(t => t.toLowerCase().includes(interest.toLowerCase()))) score += 3;
          if (event.category === interest.toLowerCase()) score += 5;
          if (event.title.toLowerCase().includes(interest.toLowerCase())) score += 2;
        });
        return { event, score };
      });
      recommendations = scored.sort((a, b) => b.score - a.score).map(s => s.event);
    }
    
    res.json({ success: true, recommendations: recommendations.slice(0, 8), reasons });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.generateEventDescription = async (req, res) => {
  try {
    const { title, category, details } = req.body;
    
    const prompt = `Generate a compelling event description for a college event:
Title: ${title}
Category: ${category}
Key details: ${details}

Write an engaging 150-200 word description that highlights what students will learn/gain, creates excitement, and includes relevant keywords. Be specific and enthusiastic.`;

    const response = await callLlama(prompt, 'You are a creative college event coordinator. Write engaging event descriptions.');
    
    if (!response) {
      return res.json({ 
        success: true, 
        description: `Join us for an exciting ${category} event: ${title}! ${details}. This is a great opportunity to learn, network, and grow. Don't miss out on this incredible experience organized just for you.`
      });
    }
    
    res.json({ success: true, description: response });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.chatWithAI = async (req, res) => {
  try {
    const { message, context } = req.body;
    
    const systemPrompt = `You are EveBot, an AI assistant for a college event management system. 
Help students find events, answer questions about registrations, and provide information about campus activities.
Context: ${JSON.stringify(context || {})}`;
    
    const response = await callLlama(message, systemPrompt);
    
    if (!response) {
      return res.json({ 
        success: true, 
        message: "I'm here to help! You can browse events, register for activities, and track your registrations. What would you like to know?"
      });
    }
    
    res.json({ success: true, message: response });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.analyzeEventSuccess = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId)
      .populate('registeredStudents', 'department year interests')
      .populate('feedback');
    
    if (!event) return res.status(404).json({ message: 'Event not found' });
    
    const registrationRate = ((event.registeredStudents.length / event.maxParticipants) * 100).toFixed(1);
    const avgRating = event.feedback.length > 0
      ? (event.feedback.reduce((sum, f) => sum + f.rating, 0) / event.feedback.length).toFixed(1)
      : 'N/A';
    
    const prompt = `Analyze this college event:
Title: ${event.title}, Category: ${event.category}
Registrations: ${event.registeredStudents.length}/${event.maxParticipants} (${registrationRate}%)
Average Rating: ${avgRating}/5
Feedback count: ${event.feedback.length}

Provide: 1) Brief success analysis 2) Key insights 3) Recommendations for future events. Be concise (under 200 words).`;

    const analysis = await callLlama(prompt, 'You are an event analytics expert.');
    
    res.json({
      success: true,
      stats: { registrationRate, avgRating, feedbackCount: event.feedback.length },
      analysis: analysis || `Event achieved ${registrationRate}% registration rate with ${event.feedback.length} feedback responses. Average rating: ${avgRating}/5.`
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
