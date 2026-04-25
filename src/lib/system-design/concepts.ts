import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { JOURNEY } from './journey'
import type { JourneySection, Phase } from './types'

const CONCEPTS_DIR = path.join(process.cwd(), 'src', 'app', 'system-design', 'concepts')

export interface ConceptGuide {
  slug: string
  title: string
  content: string
  evaluatorPrompt: string
}

function extractTitle(content: string, fallback: string): string {
  const match = content.match(/^#\s+(.+)$/m)
  return match ? match[1] : fallback
}

export function getConceptGuide(slug: string): ConceptGuide | null {
  const dir = path.join(CONCEPTS_DIR, slug)
  const conceptPath = path.join(dir, 'concept.md')
  const promptPath = path.join(dir, 'prompt.md')

  if (!fs.existsSync(conceptPath) || !fs.existsSync(promptPath)) return null

  const { content } = matter(fs.readFileSync(conceptPath, 'utf-8'))
  const evaluatorPrompt = fs.readFileSync(promptPath, 'utf-8')

  return {
    slug,
    title: extractTitle(content, slug.replace(/-/g, ' ')),
    content,
    evaluatorPrompt,
  }
}

export function getAllConceptSlugs(): string[] {
  if (!fs.existsSync(CONCEPTS_DIR)) return []
  return fs
    .readdirSync(CONCEPTS_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory() && e.name !== '[slug]')
    .filter((e) => fs.existsSync(path.join(CONCEPTS_DIR, e.name, 'concept.md')))
    .map((e) => e.name)
}

export function getSectionForConcept(slug: string): { phase: Phase; section: JourneySection } | null {
  for (const phase of JOURNEY) {
    for (const section of phase.sections) {
      if (section.concepts?.some((c) => c.slug === slug)) return { phase, section }
    }
  }
  return null
}
