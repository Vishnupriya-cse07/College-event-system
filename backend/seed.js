const mongoose = require('mongoose');
const User = require('./models/User');
const Event = require('./models/Event');
require('dotenv').config();

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/college-events');
  console.log('Connected to MongoDB');

  await User.deleteMany({});
  await Event.deleteMany({});

  // Create admin
  const admin = await User.create({
    name: 'System Admin', email: 'admin@demo.com', password: 'demo123',
    role: 'admin'
  });

  // Create societies
  const societies = await User.insertMany([
    { name: 'CodeCraft Lead', email: 'society@demo.com', password: 'demo123', role: 'society', societyName: 'CodeCraft Society', societyCategory: 'technical', societyDescription: 'Premier technical society for programming and software development enthusiasts.' },
    { name: 'Cultural Fest Lead', email: 'cultural@demo.com', password: 'demo123', role: 'society', societyName: 'Cultural Arts Society', societyCategory: 'cultural', societyDescription: 'Celebrating arts, music, dance and cultural diversity on campus.' },
    { name: 'Sports Club Lead', email: 'sports@demo.com', password: 'demo123', role: 'society', societyName: 'Sports Club', societyCategory: 'sports', societyDescription: 'Promoting sports culture and athletic excellence across campus.' },
  ]);

  // Create student
  await User.create({
    name: 'Alex Johnson', email: 'student@demo.com', password: 'demo123',
    role: 'student', studentId: 'STU2024001', department: 'Computer Science',
    year: 2, interests: ['technical', 'hackathon', 'coding', 'workshop']
  });

  // Create events
  const events = [
    {
      title: 'National Level Hackathon 2024', category: 'hackathon',
      description: 'Join the biggest hackathon of the year! Build innovative solutions to real-world problems in 24 hours. Compete with teams from 50+ colleges nationwide. Mentors from top tech companies will guide you throughout.',
      shortDescription: '24-hour hackathon with ₹1 lakh prize pool',
      organizer: societies[0]._id, date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      time: '09:00', venue: 'Main Auditorium', maxParticipants: 200,
      tags: ['hackathon', 'coding', 'technical', 'programming'],
      prizes: [{ position: '1st Place', reward: '₹50,000 + Internship Offer' }, { position: '2nd Place', reward: '₹30,000' }, { position: '3rd Place', reward: '₹20,000' }],
      requirements: ['Laptop required', 'Team of 2-4 members', 'Basic programming knowledge'],
      schedule: [{ time: '09:00 AM', activity: 'Opening ceremony & problem statement reveal' }, { time: '10:00 AM', activity: 'Hacking begins!' }, { time: '10:00 AM (next day)', activity: 'Submission deadline' }, { time: '11:00 AM (next day)', activity: 'Presentations & judging' }],
      registrationOpen: true, status: 'published'
    },
    {
      title: 'React & Next.js Workshop', category: 'workshop',
      description: 'A hands-on workshop covering modern React concepts and Next.js framework. Learn component architecture, hooks, state management, and build a full-stack application by the end of the session.',
      shortDescription: 'Hands-on React.js & Next.js for beginners',
      organizer: societies[0]._id, date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      time: '14:00', venue: 'Lab Block 3, Room 301', maxParticipants: 60,
      tags: ['react', 'javascript', 'web development', 'workshop'],
      requirements: ['Laptop with Node.js installed', 'Basic HTML/CSS knowledge'],
      registrationOpen: true, status: 'published'
    },
    {
      title: 'Annual Cultural Fest - Euphoria 2024', category: 'cultural',
      description: 'Three days of music, dance, drama, and cultural performances! Euphoria is the most awaited cultural fest featuring performances by celebrity artists, inter-college competitions, and food stalls from across India.',
      shortDescription: '3-day cultural extravaganza with celebrity performances',
      organizer: societies[1]._id, date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      time: '17:00', venue: 'College Ground', maxParticipants: 1000,
      tags: ['cultural', 'music', 'dance', 'drama', 'fest'],
      prizes: [{ position: 'Best Performer', reward: 'Trophy + ₹10,000' }],
      registrationOpen: true, status: 'published'
    },
    {
      title: 'Inter-College Cricket Tournament', category: 'sports',
      description: 'Annual T20 cricket tournament with teams from 20+ colleges. Six days of thrilling matches culminating in the grand finals. The champion team gets the coveted Champions Trophy.',
      shortDescription: 'T20 cricket with teams from 20+ colleges',
      organizer: societies[2]._id, date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      time: '08:00', venue: 'College Cricket Ground', maxParticipants: 120,
      tags: ['cricket', 'sports', 'tournament', 't20'],
      prizes: [{ position: 'Winner', reward: 'Champions Trophy + ₹15,000' }, { position: 'Runner Up', reward: '₹8,000' }],
      registrationOpen: true, status: 'published'
    },
    {
      title: 'AI/ML Seminar: Future of Artificial Intelligence', category: 'seminar',
      description: 'Join leading AI researchers and industry experts as they discuss the cutting-edge developments in Artificial Intelligence and Machine Learning. Topics include LLMs, computer vision, and AI ethics.',
      shortDescription: 'Expert talks on AI/ML trends and future',
      organizer: societies[0]._id, date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      time: '11:00', venue: 'Seminar Hall', maxParticipants: 150,
      tags: ['ai', 'ml', 'machine learning', 'seminar', 'technical'],
      speakers: [{ name: 'Dr. Sarah Chen', designation: 'AI Research Lead, Google', bio: '10+ years in AI research with focus on NLP and LLMs.' }, { name: 'Prof. Raj Kumar', designation: 'HOD CS, IIT Delhi', bio: 'Expert in computer vision and deep learning.' }],
      registrationOpen: true, status: 'published'
    },
  ];

  const createdEvents = await Event.insertMany(events);

  // Update society events organized
  await User.findByIdAndUpdate(societies[0]._id, { $set: { eventsOrganized: [createdEvents[0]._id, createdEvents[1]._id, createdEvents[4]._id] } });
  await User.findByIdAndUpdate(societies[1]._id, { $set: { eventsOrganized: [createdEvents[2]._id] } });
  await User.findByIdAndUpdate(societies[2]._id, { $set: { eventsOrganized: [createdEvents[3]._id] } });

  console.log('✅ Database seeded successfully!');
  console.log('\n📧 Demo Accounts:');
  console.log('Student:  student@demo.com / demo123');
  console.log('Society:  society@demo.com / demo123');
  console.log('Admin:    admin@demo.com / demo123');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
