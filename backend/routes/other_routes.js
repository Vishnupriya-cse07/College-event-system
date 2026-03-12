const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { Notification, Society } = require('../models/Models');
const Event = require('../models/Event');
const User = require('../models/User');
const fetch = require('node-fetch');

// =================== NOTIFICATIONS ===================
const notifRouter = express.Router();

notifRouter.get('/', authenticate, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('data.eventId', 'title date')
      .sort({ createdAt: -1 })
      .limit(50);
    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });
    res.json({ success: true, notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

notifRouter.put('/read-all', authenticate, async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true, readAt: new Date() });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

notifRouter.put('/:id/read', authenticate, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true, readAt: new Date() });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// =================== SOCIETIES ===================
const societyRouter = express.Router();

societyRouter.get('/', async (req, res) => {
  try {
    const societies = await Society.find({ isActive: true }).sort({ isVerified: -1, name: 1 });
    res.json({ success: true, societies });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

societyRouter.get('/:id', async (req, res) => {
  try {
    const society = await Society.findById(req.params.id);
    if (!society) return res.status(404).json({ success: false, message: 'Society not found' });
    const events = await Event.find({ society: req.params.id, status: 'approved' }).sort({ date: 1 }).limit(10);
    res.json({ success: true, society, events });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

societyRouter.put('/profile', authenticate, authorize('society'), async (req, res) => {
  try {
    const allowedFields = ['description', 'logo', 'banner', 'socialLinks', 'faculty_advisor', 'achievements'];
    const updates = {};
    allowedFields.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const society = await Society.findByIdAndUpdate(req.user.societyId, updates, { new: true });
    res.json({ success: true, society, message: 'Profile updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// =================== AI RECOMMENDATION ===================
const aiRouter = express.Router();

const callLlama = async (prompt) => {
  // Try Groq first (faster, cloud-based)
  if (process.env.GROQ_API_KEY) {
    const response = await fetch(process.env.GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });
    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  // Fallback: Ollama local
  const response = await fetch(process.env.LLAMA_API_URL || 'http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: process.env.LLAMA_MODEL || 'llama3',
      prompt,
      stream: false,
    }),
  });
  const data = await response.json();
  return data.response || '';
};

// Get personalized event recommendations
aiRouter.get('/recommendations', authenticate, authorize('student'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const upcomingEvents = await Event.find({
      status: 'approved',
      date: { $gte: new Date() },
    }).populate('society', 'name category').limit(50);

    if (!upcomingEvents.length) {
      return res.json({ success: true, recommendations: [], message: 'No upcoming events found' });
    }

    const eventsContext = upcomingEvents.map(e => ({
      id: e._id,
      title: e.title,
      category: e.category,
      description: e.shortDescription || e.description?.substring(0, 100),
      date: e.date,
      society: e.society?.name,
      tags: e.tags?.join(', '),
    }));

    const prompt = `You are an AI event recommendation engine for a college event management system.

Student Profile:
- Name: ${user.name}
- Department: ${user.department || 'General'}
- Year: ${user.year || 'Unknown'}
- Interests: ${user.interests?.join(', ') || 'Not specified'}

Available Upcoming Events (JSON):
${JSON.stringify(eventsContext, null, 2)}

Task: Analyze the student's interests and profile, then recommend the top 5 most relevant events.
Return ONLY a valid JSON array of event IDs with reasons, like this:
[
  {"eventId": "...", "score": 95, "reason": "Matches your interest in technology and coding"},
  {"eventId": "...", "score": 88, "reason": "Great for networking in your department"}
]
Return only JSON, no explanations.`;

    let recommendationsRaw;
    try {
      recommendationsRaw = await callLlama(prompt);
      const jsonMatch = recommendationsRaw.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('No JSON found');

      const parsed = JSON.parse(jsonMatch[0]);
      const recommended = parsed.map(rec => {
        const event = upcomingEvents.find(e => e._id.toString() === rec.eventId);
        return event ? { ...event.toObject(), aiScore: rec.score, aiReason: rec.reason } : null;
      }).filter(Boolean);

      res.json({ success: true, recommendations: recommended, aiPowered: true });
    } catch (parseError) {
      // Fallback: simple interest-based matching
      const matched = upcomingEvents
        .filter(e => user.interests?.includes(e.category))
        .slice(0, 5)
        .map(e => ({ ...e.toObject(), aiScore: 75, aiReason: `Matches your interest in ${e.category}` }));

      res.json({ success: true, recommendations: matched, aiPowered: false, fallback: true });
    }
  } catch (error) {
    console.error('AI recommendation error:', error);
    res.status(500).json({ success: false, message: 'AI service error' });
  }
});

// AI event description generator (for societies)
aiRouter.post('/generate-description', authenticate, authorize('society', 'admin'), async (req, res) => {
  try {
    const { title, category, keyPoints } = req.body;

    const prompt = `Generate a compelling, engaging event description for a college event with the following details:
Title: ${title}
Category: ${category}
Key Points: ${keyPoints}

Write a professional, exciting 2-3 paragraph description that will attract students. 
Include: what the event is about, what participants will gain, and a call-to-action.
Keep it under 300 words. Write only the description, no title.`;

    const description = await callLlama(prompt);
    res.json({ success: true, description: description.trim() });
  } catch (error) {
    res.status(500).json({ success: false, message: 'AI generation failed' });
  }
});

// AI chatbot for event queries
aiRouter.post('/chat', authenticate, async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;

    const recentEvents = await Event.find({ status: 'approved', date: { $gte: new Date() } })
      .select('title category date venue.name maxParticipants currentParticipants')
      .limit(20);

    const systemContext = `You are EventBot, a helpful AI assistant for a college event management system. 
You help students find events, answer questions about registrations, and provide event information.
Current upcoming events: ${JSON.stringify(recentEvents)}
Be concise, friendly, and helpful. If asked about specific events, refer to the data above.`;

    const messages = [
      { role: 'system', content: systemContext },
      ...(conversationHistory || []),
      { role: 'user', content: message },
    ];

    const fullPrompt = messages.map(m => `${m.role === 'user' ? 'User' : m.role === 'system' ? 'System' : 'Assistant'}: ${m.content}`).join('\n') + '\nAssistant:';

    const reply = await callLlama(fullPrompt);
    res.json({ success: true, reply: reply.trim() });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Chat service error' });
  }
});

module.exports = { notifRouter, societyRouter, aiRouter };
