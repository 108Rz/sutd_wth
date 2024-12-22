// utils/formatResponse.ts
function formatMathContent(content: string) {
    // First, clean up any existing malformed HTML
    let cleanContent = content.replace(/```html/g, '').replace(/```/g, '')
    
    // Format the content into structured sections
    const sections = {
      title: '',
      explanation: '',
      calculation: '',
      answer: '',
      note: ''
    }
  
    const lines = cleanContent.split('\n')
    let currentSection = ''
  
    lines.forEach(line => {
      line = line.trim()
      if (!line) return
  
      // Identify sections
      if (line.match(/^(Basic|Advanced|O-Level)/i)) {
        sections.title = line
      } else if (line.startsWith('Calculation:')) {
        currentSection = 'calculation'
        sections.calculation = line.replace('Calculation:', '').trim()
      } else if (line.startsWith('Answer:')) {
        currentSection = 'answer'
        sections.answer = line.replace('Answer:', '').trim()
      } else if (line.startsWith('Note:')) {
        currentSection = 'note'
        sections.note = line.replace('Note:', '').trim()
      } else if (!sections.explanation && !currentSection) {
        sections.explanation += ' ' + line
      } else if (currentSection === 'note') {
        sections.note += ' ' + line
      }
    })
  
    // Build formatted HTML
    let formattedHtml = '<div class="math-response">'
    
    // Title
    if (sections.title) {
      formattedHtml += `<h2 class="text-lg font-semibold mb-3">${sections.title}</h2>`
    }
    
    // Explanation
    if (sections.explanation) {
      formattedHtml += `<p class="mb-4">${sections.explanation.trim()}</p>`
    }
    
    // Calculation
    if (sections.calculation) {
      formattedHtml += `
        <div class="calculation-block bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-4">
          <div class="font-semibold mb-1">Calculation:</div>
          <code class="text-lg">${sections.calculation}</code>
        </div>`
    }
    
    // Answer
    if (sections.answer) {
      formattedHtml += `
        <div class="answer-block bg-green-50 dark:bg-green-900/20 p-3 rounded-lg mb-4">
          <div class="font-semibold mb-1">Answer:</div>
          <code class="text-lg">${sections.answer}</code>
        </div>`
    }
    
    // Note
    if (sections.note) {
      formattedHtml += `
        <div class="note-block bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg mt-4">
          <div class="font-semibold mb-1">Note:</div>
          <p>${sections.note}</p>
        </div>`
    }
  
    formattedHtml += '</div>'
    return formattedHtml
  }
  
  export function formatResponse(content: string) {
    // Check if it's a math-related response
    if (content.includes('Calculation:') || content.includes('Answer:')) {
      return formatMathContent(content)
    }
  
    // For non-math content, format as regular content
    return `<div class="general-response">
      ${content
        .split('\n')
        .map(line => {
          line = line.trim()
          if (!line) return ''
          
          // Format headers
          if (line.match(/^#+\s/)) {
            const level = line.match(/^#+/)[0].length
            const text = line.replace(/^#+\s/, '')
            return `<h${level} class="font-semibold text-lg mb-3">${text}</h${level}>`
          }
          
          // Format lists
          if (line.match(/^[-*]\s/)) {
            return `<li class="ml-4">${line.replace(/^[-*]\s/, '')}</li>`
          }
          
          // Format code blocks
          if (line.includes('`')) {
            line = line.replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1 rounded">$1</code>')
          }
          
          // Default to paragraph
          return `<p class="mb-3">${line}</p>`
        })
        .join('')}
    </div>`
  }