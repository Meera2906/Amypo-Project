// Centralized subject-matched images for LoomLearn
import { SUBJECT_IMAGE_LINKS } from '../config/imageLinks'

export const SUBJECT_IMAGE_MAP = [
  {
    subject: 'English',
    keywords: ['english', 'literature', 'writing', 'essay', 'rhetoric', 'grammar', 'reading', 'composition', 'poetry', 'communication'],
    url: SUBJECT_IMAGE_LINKS.English,
    alt: 'English literature, academic reading and writing',
  },
  {
    subject: 'Computer Science',
    keywords: ['computer science', 'programming', 'code', 'algorithm', 'software', 'structure', 'web', 'frontend', 'backend', 'java', 'react', 'python', 'developer'],
    url: SUBJECT_IMAGE_LINKS.ComputerScience,
    alt: 'Computer science code and programming environment',
  },
  {
    subject: 'Gen AI & Machine Learning',
    keywords: ['gen ai', 'ai &', 'machine learning', 'neural', 'deep learning', 'transformer', 'artificial intelligence', 'nlp', 'llm', 'pytorch'],
    url: SUBJECT_IMAGE_LINKS.GenAI,
    alt: 'Generative AI and neural network visualization',
  },
  {
    subject: 'Mathematics',
    keywords: ['mathematics', 'linear algebra', 'math', 'calculus', 'eigenvalue', 'matrix', 'discrete', 'geometry', 'algebra', 'vector'],
    url: SUBJECT_IMAGE_LINKS.Mathematics,
    alt: 'Mathematics and geometric coordinate vectors',
  },
  {
    subject: 'Physics',
    keywords: ['physics', 'quantum', 'mechanics', 'wave', 'optics', 'electrodynamics', 'thermodynamics', 'relativity'],
    url: SUBJECT_IMAGE_LINKS.Physics,
    alt: 'Quantum physics and mechanics wave phenomenon',
  },
  {
    subject: 'Chemistry',
    keywords: ['chemistry', 'synthesis', 'organic', 'molecular', 'reaction', 'lab', 'chemical', 'biochemistry'],
    url: SUBJECT_IMAGE_LINKS.Chemistry,
    alt: 'Chemical laboratory synthesis and molecular research',
  },
  {
    subject: 'Data Science',
    keywords: ['data science', 'analytics', 'big data', 'statistics', 'visualization', 'tableau', 'pandas'],
    url: SUBJECT_IMAGE_LINKS.DataScience,
    alt: 'Data science charts and analytics workspace',
  },
  {
    subject: 'UI/UX',
    keywords: ['ui', 'ux', 'user interface', 'user experience', 'design workspace', 'figma', 'prototype'],
    url: SUBJECT_IMAGE_LINKS.UIUX,
    alt: 'UI/UX interface workspace and wireframes',
  },
  {
    subject: 'Product Design',
    keywords: ['information architecture', 'wireframe', 'product design', 'interaction', 'user flow'],
    url: SUBJECT_IMAGE_LINKS.ProductDesign,
    alt: 'Information architecture and product design',
  },
  {
    subject: 'Business',
    keywords: ['business', 'management', 'finance', 'marketing', 'leadership', 'economics', 'accounting'],
    url: SUBJECT_IMAGE_LINKS.Business,
    alt: 'Business strategy and financial analytics',
  },
]

export const DEFAULT_SUBJECT_IMAGE = {
  subject: 'General',
  url: SUBJECT_IMAGE_LINKS.Default,
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
