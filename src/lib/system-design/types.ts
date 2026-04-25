export interface JourneyScenario {
  slug: string                        // "design-url-shortener"
  label: string                       // "Design a URL Shortener"
  relatedFundamentalsSlugs: string[]  // ["caching-fundamentals", "scalability-fundamentals"]
}

export interface JourneyConcept {
  slug: string   // "business-rule-enforcement"
  label: string  // "Business Rule Enforcement"
}

export interface JourneySection {
  id: string
  label: string
  mentalModelHook: string
  analogies: string[]
  fundamentalsSlug?: string
  fundamentalsBlurb?: string
  practiceSlug?: string
  concepts?: JourneyConcept[]
  firstPass: JourneyScenario[]
  reinforce: JourneyScenario[]
}

export interface Phase {
  number: number
  label: string
  emoji: string
  goal: string
  sections: JourneySection[]
}
