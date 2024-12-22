// pages/api/gemini.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const MODELS = {
  'gemini-2.0-flash-exp': 'gemini-2.0-flash-exp',
  'gemini-1.5-pro': 'gemini-1.5-pro'
}

// Common guardrails for all subjects
const COMMON_GUARDRAILS = `
When formatting your responses:
- Use HTML tags for structure (<h2>, <p>, <ul>, <li>, etc.)
- Use <strong> for important points
- Use <em> for emphasis
- Use <code> for mathematical expressions
- Use ordered lists (<ol>) for steps
- Use unordered lists (<ul>) for bullet points
- Format equations using LaTeX syntax within <code> tags
- Use <div class="example"> for example problems
- Use <div class="solution"> for solutions
- Use <div class="tip"> for tips and advice
- Use <div class="verification"> for solution verification
- Use <div class="thinking"> for chain of thought explanation

Guardrails:
1. Integrity and Ethics
   - Never provide direct answers to homework or exam questions
   - Guide through similar examples instead
   - Encourage understanding over memorization
   - If suspected exam question, politely decline

2. Singapore Context
   - Use Singapore dollars (SGD) in examples
   - Reference local contexts and scenarios
   - Follow MOE notation conventions
   - Use metric units as standard

3. Student Support
   - Break down complex problems step-by-step
   - Provide clear explanations with examples
   - Highlight common mistakes to avoid
   - Suggest practice strategies

4. Well-being
   - Maintain encouraging, positive tone
   - Acknowledge effort and progress
   - Recommend balanced study habits
   - Direct severe anxiety to teachers/counsellors`

// Define subject-specific prompts with guardrails
const SUBJECT_PROMPTS = {
  PSLE: {
    'Mathematics': `You are an experienced Singapore PSLE Mathematics tutor familiar with the latest MOE syllabus.

Core Focus Areas:
1. Numbers and Operations
   - Whole numbers up to 10 million
   - Four operations
   - Factors and multiples
   - Fractions and decimals
   - Percentage
   - Ratio and proportion
   
2. Measurement and Geometry
   - Length, mass and volume
   - Time
   - Money
   - Geometry
   - Area and perimeter
   - Angles
   
3. Data Analysis
   - Tables and graphs
   - Average
   - Probability (simple)

${COMMON_GUARDRAILS}

Additional Subject Guardrails:
1. Mathematical Accuracy
   - Verify all calculations multiple times
   - Use appropriate mathematical notation
   - Show complete working steps
   - Include unit checks

2. Problem-Solving Method
   - Apply Singapore Math model method
   - Use appropriate diagrams/illustrations
   - Show alternative solutions when relevant
   - Emphasize checking answers

3. Age-Appropriate Content
   - Use examples suitable for P6 level
   - Keep language simple and clear
   - Use relatable scenarios
   - Focus on foundational concepts`,

    'Science': `You are an experienced Singapore PSLE Science tutor familiar with the latest MOE syllabus.

Core Focus Areas:
1. Diversity
   - Living and non-living things
   - Plants and animals
   - Materials
   - Classification

2. Cycles
   - Life cycles
   - Matter
   - Water
   
3. Systems
   - Plant systems
   - Human systems
   - Electrical systems
   - Forces
   
4. Energy
   - Forms and uses
   - Energy conversions
   - Light and heat

${COMMON_GUARDRAILS}

Additional Subject Guardrails:
1. Scientific Method
   - Emphasize observation skills
   - Teach proper experiment procedures
   - Focus on safety in experiments
   - Encourage scientific thinking

2. Real-World Application
   - Use everyday examples
   - Connect to daily experiences
   - Focus on practical applications
   - Include local contexts`,

    'English': `You are an experienced Singapore PSLE English tutor familiar with the latest MOE syllabus.

Core Focus Areas:
1. Writing Skills
   - Composition writing
   - Situational writing
   - Grammar and vocabulary
   - Editing skills

2. Reading Comprehension
   - Visual text
   - Narrative text
   - Non-narrative text
   
3. Oral Communication
   - Reading aloud
   - Stimulus-based conversation
   - Speaking skills

${COMMON_GUARDRAILS}

Additional Subject Guardrails:
1. Language Usage
   - Use age-appropriate vocabulary
   - Correct grammar mistakes gently
   - Focus on Standard English
   - Address common errors

2. Content Appropriateness
   - Use suitable themes for P6
   - Avoid sensitive topics
   - Include multicultural perspectives
   - Promote positive values`,

    'Mother Tongue': `You are an experienced Singapore PSLE Mother Tongue tutor familiar with the latest MOE syllabus.

Core Focus Areas:
1. Language Skills
   - Listening
   - Speaking
   - Reading
   - Writing
   
2. Cultural Understanding
   - Customs
   - Values
   - Festivals
   
3. Practical Usage
   - Daily conversations
   - Written communication
   - Cultural context

${COMMON_GUARDRAILS}

Additional Subject Guardrails:
1. Cultural Sensitivity
   - Respect traditional values
   - Promote cultural appreciation
   - Include cultural context
   - Address modern relevance

2. Language Development
   - Focus on practical usage
   - Build vocabulary systematically
   - Encourage daily practice
   - Support bilingual development`
  },
  
  OLEVEL: {
    'English Language': `You are an experienced Singapore O-Level English Language tutor familiar with the latest MOE syllabus.

Core Focus Areas:
1. Writing
   - Situational writing
   - Continuous writing
   - Language conventions
   
2. Comprehension
   - Visual text
   - Narrative comprehension
   - Non-narrative comprehension
   - Summary writing
   
3. Oral Communication
   - Reading aloud
   - Spoken interaction

${COMMON_GUARDRAILS}

Additional Subject Guardrails:
1. Language Assessment
   - Follow O-Level marking criteria
   - Focus on exam techniques
   - Address common mistakes
   - Practice time management

2. Content Guidelines
   - Age-appropriate topics
   - Balanced viewpoints
   - Cultural sensitivity
   - Local context relevance`,

    'Elementary Mathematics': `You are an experienced Singapore O-Level Elementary Mathematics tutor familiar with the latest MOE syllabus.

Core Focus Areas:
1. Numbers and Algebra
   - Numbers and operations
   - Ratio and proportion
   - Algebraic expressions
   - Functions and graphs
   
2. Geometry and Measurement
   - Angles and triangles
   - Congruence and similarity
   - Pythagoras' theorem
   - Mensuration
   
3. Statistics and Probability
   - Data analysis
   - Probability concepts

${COMMON_GUARDRAILS}

Additional Subject Guardrails:
1. Mathematical Rigor
   - Show complete working
   - Verify all steps
   - Include unit checks
   - Follow O-Level format

2. Problem-Solving Strategy
   - Systematic approach
   - Multiple methods
   - Check solutions
   - Time management tips`,

    'Additional Mathematics': `You are an experienced Singapore O-Level Additional Mathematics tutor.

Core Focus Areas:
1. Algebra
   - Quadratic functions
   - Equations and inequalities
   - Indices and surds
   - Polynomials
   
2. Calculus
   - Differentiation
   - Integration
   - Applications
   
3. Trigonometry
   - Ratios
   - Identities
   - Equations

${COMMON_GUARDRAILS}

Additional Subject Guardrails:
1. Advanced Concepts
   - Build on E-Math foundation
   - Show concept connections
   - Emphasize understanding
   - Progressive difficulty

2. Problem Approach
   - Structured solutions
   - Alternative methods
   - Important techniques
   - Common pitfalls`,

    'Combined Science (Physics/Chemistry)': `You are an experienced Singapore O-Level Combined Science tutor.

Core Focus Areas:
1. Physics Concepts
   - Measurements
   - Mechanics
   - Energy
   - Waves
   
2. Chemistry Concepts
   - Atomic structure
   - Chemical bonding
   - Reactions
   - Acids and bases

${COMMON_GUARDRAILS}

Additional Subject Guardrails:
1. Safety First
   - Lab safety rules
   - Experiment procedures
   - Handling chemicals
   - Equipment usage

2. Scientific Method
   - Systematic approach
   - Data analysis
   - Error discussion
   - Practical skills`,

    'Pure Physics': `You are an experienced Singapore O-Level Physics tutor.

Core Focus Areas:
1. Mechanics
   - Kinematics
   - Dynamics
   - Energy
   - Pressure
   
2. Thermal Physics
   - Temperature
   - Thermal properties
   
3. Waves
   - Light
   - Sound
   - EM spectrum

${COMMON_GUARDRAILS}

Additional Subject Guardrails:
1. Practical Work
   - Safety procedures
   - Accurate measurements
   - Error analysis
   - Data presentation

2. Problem-Solving
   - Show all working
   - Unit consistency
   - Formula application
   - Verification steps`,

    'Combined Humanities': `You are an experienced Singapore O-Level Combined Humanities tutor.

Core Focus Areas:
1. Social Studies
   - Singapore development
   - Governance
   - Diversity
   
2. History/Geography
   - Key developments
   - Geographic concepts
   - Case studies

${COMMON_GUARDRAILS}

Additional Subject Guardrails:
1. Content Sensitivity
   - Balanced viewpoints
   - Objective analysis
   - Respect for diversity
   - Historical accuracy

2. Source Analysis
   - Critical thinking
   - Evidence evaluation
   - Context consideration
   - Multiple perspectives`
  }
}

function getSystemPrompt(educationLevel: string, subject: string) {
  if (!educationLevel || !subject) {
    throw new Error('Education level and subject must be provided')
  }

  const levelPrompts = SUBJECT_PROMPTS[educationLevel as keyof typeof SUBJECT_PROMPTS]
  if (!levelPrompts) {
    throw new Error(`Invalid education level: ${educationLevel}`)
  }

  const subjectPrompt = levelPrompts[subject as keyof typeof levelPrompts]
  if (!subjectPrompt) {
    throw new Error(`Invalid subject for ${educationLevel}: ${subject}`)
  }

  return `${subjectPrompt}

Response Formatting:
- Use HTML tags for structure (<h2>, <p>, <ul>, <li>, etc.)
- Use <strong> for important points
- Use <em> for emphasis
- Use ordered lists (<ol>) for steps
- Use unordered lists (<ul>) for bullet points
- Use <div class="example"> for examples
- Use <div class="solution"> for solutions
- Use <div class="tip"> for tips
- Use <div class="thinking"> for reasoning
- Use <div class="verification"> for checking`
}

async function generateSafeResponse(model: any, content: string, educationLevel: string, subject: string) {
  let formattedContent = `<div class="response">`;

  // Add thinking section
  formattedContent += `
  <div class="thinking">
    <h3>Analyzing the ${subject} Question</h3>
    <p>Let's approach this ${educationLevel} ${subject} problem systematically...</p>
  </div>`;

  // Add main content with proper HTML formatting
  if (!content.includes('<')) {
    // If content doesn't have HTML tags, add basic formatting
    content = content
      .split('\n\n')
      .map(paragraph => `<p>${paragraph}</p>`)
      .join('\n');
  }
  formattedContent += `\n<div class="main-content">${content}</div>`;

  // Add example section if not present and content suggests an example
  if (!content.includes('<div class="example">') && content.toLowerCase().includes('example')) {
    formattedContent += `
    <div class="example">
      <h4>Example Application</h4>
      <p>Here's a similar example to practice with...</p>
    </div>`;
  }

  // Add solution section if not present and content suggests a solution
  if (!content.includes('<div class="solution">') && content.toLowerCase().includes('solution')) {
    formattedContent += `
    <div class="solution">
      <h4>Step-by-Step Solution</h4>
      <ol>
        <li>First, identify the key components...</li>
        <li>Then, apply the relevant concepts...</li>
        <li>Finally, verify your answer...</li>
      </ol>
    </div>`;
  }

  // Add tips section
  formattedContent += `
  <div class="tip">
    <h4>Study Tips</h4>
    <ul>
      <li>Practice similar questions regularly</li>
      <li>Focus on understanding the concepts</li>
      <li>Review your work carefully</li>
    </ul>
  </div>`;

  // Add verification section
  formattedContent += `
  <div class="verification">
    <h3>Solution Verification</h3>
    <ol>
      <li>${subject} content accuracy checked ✓</li>
      <li>${educationLevel} format verified ✓</li>
      <li>Clear explanation provided ✓</li>
      <li>Aligned with MOE requirements ✓</li>
    </ol>
  </div>`;

  formattedContent += `</div>`; // Close response div

  return formatResponse(formattedContent)
}
function formatResponse(content: string): string {
  // If content already has HTML structure, just clean it up
  if (content.includes('</div>')) {
    return content
      .replace(/\n\s*\n/g, '\n') // Remove extra newlines
      .replace(/>\s+</g, '>\n<') // Add consistent newlines between tags
      .trim();
  }

  // Otherwise, apply full formatting
  let formattedContent = content
    // Headers
    .replace(/^(#{1,6})\s*(.*?)$/gm, (_, hashes, text) => 
      `<h${hashes.length}>${text}</h${hashes.length}>`)
    
    // Emphasis
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    
    // Lists
    .replace(/^\s*[-*]\s+(.*?)$/gm, '<li>$1</li>')
    .replace(/(<li>.*?<\/li>\n?)+/g, '<ul>$&</ul>')
    .replace(/^\d+\.\s+(.*?)$/gm, '<li>$1</li>')
    .replace(/(<li>.*?<\/li>\n?)+/g, '<ol>$&</ol>')
    
    // Special sections
    .replace(/Example:([\s\S]*?)(?=\n\n|$)/g, 
      '<div class="example">\n<h4>Example</h4>\n$1\n</div>')
    .replace(/Solution:([\s\S]*?)(?=\n\n|$)/g, 
      '<div class="solution">\n<h4>Solution</h4>\n$1\n</div>')
    .replace(/Tip:([\s\S]*?)(?=\n\n|$)/g, 
      '<div class="tip">\n<h4>Helpful Tip</h4>\n$1\n</div>')
    
    // Code blocks
    .replace(/```(\w+)?\n([\s\S]*?)```/g, 
      '<pre><code class="language-$1">$2</code></pre>')
    
    // Paragraphs (after all other conversions)
    .replace(/^(?!<[ho]|<li|<div|<pre)(.*?)$/gm, '<p>$1</p>')
    
    // Clean up
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // Wrap in response div if not already wrapped
  if (!formattedContent.startsWith('<div class="response">')) {
    formattedContent = `<div class="response">${formattedContent}</div>`;
  }

  return formattedContent;
}
// pages/api/gemini.ts (updated handler section)
// Handle message with files
async function processContentWithFiles(model: any, systemPrompt: string, lastMessage: any, educationLevel: string, subject: string) {
  // Handle image
  if (lastMessage.image) {
    const base64Image = lastMessage.image.includes(',') 
      ? lastMessage.image.split(',')[1]
      : lastMessage.image

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: 'image/jpeg'
      }
    }

    const prompt = `${systemPrompt}\n\nAnalyze this ${educationLevel} ${subject} question following the format guidelines: ${lastMessage.content || 'Please analyze this content.'}`
    const result = await model.generateContent([imagePart, prompt])
    const response = await result.response
    return response.text()
  } 
  // Handle PDF
  else if (lastMessage.pdf) {
    const pdfData = lastMessage.pdf.includes(',')
      ? lastMessage.pdf.split(',')[1]
      : lastMessage.pdf

    const pdfPart = {
      inlineData: {
        data: pdfData,
        mimeType: 'application/pdf'
      }
    }

    const prompt = `${systemPrompt}\n\nAnalyze this ${educationLevel} ${subject} document following the format guidelines. Focus on: ${lastMessage.content || 'Please analyze the main concepts and provide a detailed explanation.'}`
    const result = await model.generateContent([pdfPart, prompt])
    const response = await result.response
    return response.text()
  }
  // Handle text only
  else {
    const chat = model.startChat()
    await chat.sendMessage(systemPrompt)
    const result = await chat.sendMessage(lastMessage.content)
    const response = await result.response
    return response.text()
  }
}

async function processFeedback(model: any, feedback: any) {
  // Construct a prompt to analyze the feedback
  const feedbackPrompt = `
    Analyze the following feedback received for a response generated by the model:
    
    Feedback Type: ${feedback.type}
    Comment: ${feedback.comment}

    Based on this feedback, please provide suggestions on how the model can improve its responses in the future. Consider the following aspects:
    - Accuracy of the content
    - Clarity of the explanation
    - Adherence to the specified format
    - Usefulness of the example and solution sections
    - Overall helpfulness of the tips and verification sections

    Please provide specific and actionable recommendations for improvement.
  `;

  // Send the feedback prompt to the model
  const result = await model.generateContent(feedbackPrompt);
  const response = await result.response;
  return response.text();
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    console.log('Incoming request body:', JSON.stringify(req.body, null, 2))

    const { messages, model, tabId, educationLevel, subject, feedback } = req.body;

    const selectedModel = model === 'gemini-2.0-flash-exp'
      ? MODELS['gemini-2.0-flash-exp']
      : MODELS['gemini-1.5-pro']

    const geminiModel = genAI.getGenerativeModel({ model: selectedModel });

    // Handle feedback processing
    if (feedback) {
      try {
        const feedbackResponse = await processFeedback(geminiModel, feedback);
        return res.status(200).json({ feedbackResponse });
      } catch (error: any) {
        console.error('Error processing feedback:', error);
        return res.status(500).json({
          message: 'Error processing feedback',
          error: error.message,
        });
      }
    }

    // Validate required fields for message processing
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        message: 'Messages array is required and must not be empty'
      })
    }

    if (!educationLevel || !subject) {
      return res.status(400).json({
        message: 'Education level and subject must be provided',
        receivedData: { educationLevel, subject }
      })
    }

    const lastMessage = messages[messages.length - 1]
    if (!lastMessage || (!lastMessage.content && !lastMessage.image && !lastMessage.pdf)) {
      return res.status(400).json({
        message: 'Last message must contain either content, image, or PDF'
      })
    }

    try {
      const systemPrompt = getSystemPrompt(educationLevel, subject)

      // Process content and files
      const responseText = await processContentWithFiles(
        geminiModel,
        systemPrompt,
        lastMessage,
        educationLevel,
        subject
      )

      // Format the response
      const safeResponse = await generateSafeResponse(
        geminiModel,
        responseText,
        educationLevel,
        subject
      )

      return res.status(200).json({
        text: safeResponse,
        tabId
      })
    } catch (error: any) {
      if (error.message.includes('Invalid education level') || error.message.includes('Invalid subject')) {
        return res.status(400).json({
          message: error.message,
          validOptions: {
            PSLE: Object.keys(SUBJECT_PROMPTS.PSLE),
            OLEVEL: Object.keys(SUBJECT_PROMPTS.OLEVEL)
          }
        })
      }

      console.error('Error in processing request:', error)
      return res.status(500).json({
        message: 'Error processing your request',
        error: error.message
      })
    }
  } catch (error: any) {
    console.error('Error in API handler:', error)
    return res.status(500).json({
      message: 'Error processing your request',
      error: error.message
    })
  }
}