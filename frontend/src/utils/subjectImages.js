// Centralized subject-matched Unsplash images for LoomLearn

export const SUBJECT_IMAGE_MAP = [
  {
    subject: 'English',
    keywords: ['english', 'literature', 'writing', 'essay', 'rhetoric', 'grammar', 'reading', 'composition', 'poetry', 'communication'],
    url: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&auto=format&fit=crop&q=80',
    alt: 'English literature, academic reading and writing',
  },
  {
    subject: 'Computer Science',
    keywords: ['computer science', 'programming', 'code', 'algorithm', 'software', 'structure', 'web', 'frontend', 'backend', 'java', 'react', 'python', 'developer'],
    url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
    alt: 'Computer science code and programming environment',
  },
  {
    subject: 'Gen AI & Machine Learning',
    keywords: ['gen ai', 'ai &', 'machine learning', 'neural', 'deep learning', 'transformer', 'artificial intelligence', 'nlp', 'llm', 'pytorch'],
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    alt: 'Generative AI and neural network visualization',
  },
  {
    subject: 'Mathematics',
    keywords: ['mathematics', 'linear algebra', 'math', 'calculus', 'eigenvalue', 'matrix', 'discrete', 'geometry', 'algebra', 'vector'],
    url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80',
    alt: 'Mathematics and geometric coordinate vectors',
  },
  {
    subject: 'Physics',
    keywords: ['physics', 'quantum', 'mechanics', 'wave', 'optics', 'electrodynamics', 'thermodynamics', 'relativity'],
    url: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=600&auto=format&fit=crop&q=80',
    alt: 'Quantum physics and mechanics wave phenomenon',
  },
  {
    subject: 'Chemistry',
    keywords: ['chemistry', 'synthesis', 'organic', 'molecular', 'reaction', 'lab', 'chemical', 'biochemistry'],
    url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&auto=format&fit=crop&q=80',
    alt: 'Chemical laboratory synthesis and molecular research',
  },
  {
    subject: 'Data Science',
    keywords: ['data science', 'analytics', 'big data', 'statistics', 'visualization', 'tableau', 'pandas'],
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
    alt: 'Data science charts and analytics workspace',
  },
  {
    subject: 'UI/UX',
    keywords: ['ui', 'ux', 'user interface', 'user experience', 'design workspace', 'figma', 'prototype'],
    url: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&auto=format&fit=crop&q=80',
    alt: 'UI/UX interface workspace and wireframes',
  },
  {
    subject: 'Product Design',
    keywords: ['information architecture', 'wireframe', 'product design', 'interaction', 'user flow'],
    url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&auto=format&fit=crop&q=80',
    alt: 'Information architecture and product design',
  },
  {
    subject: 'Business',
    keywords: ['business', 'management', 'finance', 'marketing', 'leadership', 'economics', 'accounting'],
    url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
    alt: 'Business strategy and financial analytics',
  },
]

export const DEFAULT_SUBJECT_IMAGE = {
  subject: 'General',
  url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80',
  alt: 'Academic peer learning and collaboration workspace',
}

export const getSubjectThumbnail = (subjectName = '', title = '') => {
  const cleanSubject = (subjectName || '').toLowerCase().trim()
  const cleanTitle = (title || '').toLowerCase().trim()

  // 1. Direct match on subject name first
  if (cleanSubject) {
    const directSubjectMatch = SUBJECT_IMAGE_MAP.find(
      (item) => item.subject.toLowerCase() === cleanSubject || cleanSubject.includes(item.subject.toLowerCase())
    )
    if (directSubjectMatch) {
      // Special case: if subject is broad like Computer Science, but title is specifically Gen AI / Machine Learning
      if (directSubjectMatch.subject === 'Computer Science') {
        const genAiMatch = SUBJECT_IMAGE_MAP.find((item) => item.subject === 'Gen AI & Machine Learning')
        if (genAiMatch && genAiMatch.keywords.some((kw) => cleanTitle.includes(kw))) {
          return genAiMatch
        }
      }
      return directSubjectMatch
    }
  }

  // 2. Specific keyword matching with word boundaries
  const combined = `${cleanSubject} ${cleanTitle}`.trim()
  for (const item of SUBJECT_IMAGE_MAP) {
    if (
      item.keywords.some((kw) => {
        // Escape keyword for regex safety
        const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const regex = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, 'i')
        return regex.test(combined)
      })
    ) {
      return item
    }
  }
  return DEFAULT_SUBJECT_IMAGE
}
