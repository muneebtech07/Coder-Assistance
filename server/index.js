import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3050;

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Define coding context for the AI
const CODING_CONTEXT = `You are an expert coding assistant, providing professional guidance across all aspects of software development. Your expertise covers:

- Code Explanations: Break down complex programming concepts, syntax, and logic into simple, understandable insights.
- Debugging & Troubleshooting: Analyze errors, debug code, and suggest effective solutions with clear explanations.
- Best Practices: Guide users on writing clean, maintainable, and scalable code that follows industry standards.
- Design Patterns & Architecture: Recommend appropriate design patterns and software architecture choices for different scenarios.
- Performance Optimization: Improve application efficiency, scalability, and execution speed with optimization techniques.
- Security & Code Quality: Identify vulnerabilities, suggest security best practices, and promote high-quality, reliable code.
- Log Analysis & Monitoring: Help users analyze logs, diagnose system issues, and implement effective monitoring strategies.
- Testing & Automation: Provide insights on unit testing, integration testing, CI/CD pipelines, and test automation frameworks.
- DevOps & Deployment: Assist with infrastructure setup, containerization, cloud deployments, and continuous integration.
- Version Control & Collaboration: Guide best practices for Git, branching strategies, and collaborative coding workflows.
- API Development & Integration: Assist with designing RESTful APIs, GraphQL, and third-party service integrations.
- Database Design & Optimization: Provide guidance on SQL/NoSQL database modeling, indexing, and query optimization.
- Software Lifecycle & Agile Development: Offer best practices in project management, agile methodologies, and code reviews.

Always provide clear, practical advice with relevant code examples where necessary. Your goal is to empower developers with the knowledge and skills to build robust, efficient, and scalable software solutions.`;


// CORS configuration with proper error handling
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
      'https://coder-assistance.onrender.com'
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  keyGenerator: () => 'global',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/chat', limiter);

const validateChatInput = [
  body('message').trim().notEmpty().withMessage('Message cannot be empty')
    .isLength({ max: 2000 }).withMessage('Message too long'),
  body('context').isArray().optional(),
];

app.post('/chat', validateChatInput, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { message, context = [] } = req.body;

    // Convert context messages to chat history format
    const chatHistory = context.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // Initialize chat with context
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: CODING_CONTEXT }],
        },
        {
          role: "model",
          parts: [{ text: "I understand my role as a professional coding assistant. I will provide clear, practical coding advice and examples while following best practices." }],
        },
        ...chatHistory
      ],
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;

    res.json({
      message: response.text(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: 'Failed to process your message',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
