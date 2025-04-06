/**
 * TASKSMASHER USE CASE DEFINITIONS
 *
 * This file defines all the different use cases (tools) available in TaskSmasher.
 * Each use case has its own settings that control how it appears and functions.
 *
 * WHAT THIS FILE DOES:
 * - Defines the name and description for each use case
 * - Provides keywords that help the AI understand what each use case is about
 * - Controls how each use case is displayed in the sidebar menu
 *
 * HOW TO ADD A NEW USE CASE:
 * 1. Copy an existing use case block (like the "daily" one)
 * 2. Change the ID (the part before the colon)
 * 3. Update the label, keywords, and description
 * 4. Save the file
 *
 * The new use case will automatically appear in the sidebar menu and get its own page!
 */

// Technical definition - for developers only
export type UseCaseDefinition = {
  label: string;              // The name shown to users
  keywords: string[];         // Words that help identify this type of task
  negativeKeywords: string[]; // Words that indicate this is NOT the right use case
  description: string;        // Short description shown to users
};

// USE CASE DEFINITIONS
// This is where all the different TaskSmasher tools are defined
// TO ADD A NEW USE CASE: Copy an existing block and modify it
export const useCaseDefinitions: Record<string, UseCaseDefinition> = {
  // DAILY ORGANIZER
  // This use case helps users organize their daily tasks and schedule
  daily: {
    label: "Daily Organizer",  // Name shown in the sidebar and page title
    keywords: [
      "today", "tomorrow", "morning", "evening", "daily", "schedule",
      "routine", "appointment", "meeting", "call", "reminder", "day",
      "organize", "plan", "check", "review", "update", "email", "task",
      "calendar", "agenda", "work", "personal"
    ],
    negativeKeywords: [
      "recipe", "cook", "ingredient", "marketing", "campaign", "seo",
      "diy", "build", "paint", "travel", "flight", "hotel", "vacation"
    ],
    description: "Plan your day efficiently with our free AI planner. Daily tasks simplified into magic to-do lists."  // Shown to users
  },
  // GOAL PLANNER
  // This use case helps users plan and track their long-term goals
  goals: {
    label: "Goal Planner",  // Name shown in the sidebar and page title
    keywords: [
      "goal", "objective", "milestone", "achieve", "accomplish", "target",
      "plan", "strategy", "vision", "mission", "success", "measure",
      "progress", "track", "growth", "improve", "develop", "habit",
      "resolution", "challenge", "deadline", "outcome", "result"
    ],
    negativeKeywords: [
      "recipe", "cook", "ingredient", "marketing", "campaign", "daily",
      "today", "tomorrow", "shopping", "buy", "purchase", "grocery"
    ],
    description: "Achieve goals faster using our free AI task planner. Break down objectives into smart to-do lists."  // Shown to users
  },
  marketing: {
    label: "Marketing Tasks",
    keywords: [
      "marketing", "campaign", "social media", "post", "content", "email",
      "newsletter", "audience", "engagement", "analytics", "metrics",
      "conversion", "lead", "customer", "brand", "seo", "advertising",
      "promotion", "launch", "strategy", "market", "competitor", "website",
      "web design", "web development", "UI", "UX", "user interface", "user experience"
    ],
    negativeKeywords: [
      "recipe", "cook", "ingredient", "diy", "build", "paint",
      "shopping", "grocery", "personal", "home", "cleaning", "fix"
    ],
    description: "Organise marketing campaigns easily. Smart AI task manager creates structured to-do lists."
  },
  recipe: {
    label: "Recipe Steps",
    keywords: [
      "recipe", "cook", "bake", "ingredient", "food", "meal", "prep",
      "kitchen", "dish", "dinner", "lunch", "breakfast", "snack",
      "portion", "serve", "taste", "flavor", "spice", "grill", "roast",
      "mix", "stir", "chop", "slice", "dice", "heat", "simmer", "boil"
    ],
    negativeKeywords: [
      "marketing", "campaign", "seo", "email", "meeting", "work",
      "presentation", "analysis", "report", "review", "assignment"
    ],
    description: "Turn any recipe into step-by-step smart to-do lists. Simplify cooking tasks with free AI planning."
  },
  home: {
    label: "Home Chores",
    keywords: [
      "clean", "tidy", "organize", "declutter", "laundry", "dishes",
      "vacuum", "mop", "dust", "wash", "fold", "iron", "repair", "fix",
      "maintenance", "garden", "lawn", "mow", "plant", "water", 
      "furniture", "decorate", "home", "house", "apartment", "room"
    ],
    negativeKeywords: [
      "marketing", "campaign", "seo", "work", "meeting", "presentation",
      "travel", "flight", "hotel", "vacation", "report", "analysis"
    ],
    description: "Effortlessly manage chores with AI to-do lists. Keep your home organised using our free AI task manager."
  },
  freelance: {
    label: "Freelancer Projects",
    keywords: [
      "client", "project", "deadline", "proposal", "contract", "invoice",
      "freelance", "gig", "work", "design", "develop", "write", "edit",
      "draft", "revise", "submit", "deliver", "feedback", "meeting",
      "call", "portfolio", "rate", "quote", "payment", "budget"
    ],
    negativeKeywords: [
      "recipe", "cook", "ingredient", "home", "cleaning", "personal",
      "shopping", "grocery", "travel", "vacation", "family"
    ],
    description: "Manage freelance tasks effectively. Free AI planner to help create clear project workflows."
  },
  travel: {
    label: "Trip Planner",
    keywords: [
      "travel", "trip", "vacation", "journey", "flight", "hotel", "booking",
      "reservation", "itinerary", "destination", "sight", "tour", "visa",
      "passport", "pack", "luggage", "map", "guide", "transportation",
      "ticket", "accommodation", "explore", "visit", "adventure"
    ],
    negativeKeywords: [
      "recipe", "marketing", "work", "meeting", "home", "cleaning",
      "laundry", "assignment", "report", "analysis", "presentation"
    ],
    description: "Free AI task planner for seamless travel. Smart to-do lists cover packing, bookings, and activities."
  },
  shopping: {
    label: "Shopping Tasks",
    keywords: [
      "shopping", "buy", "purchase", "store", "shop", "mall", "online",
      "cart", "checkout", "order", "delivery", "pickup", "return", 
      "exchange", "price", "compare", "sale", "discount", "coupon",
      "item", "product", "brand", "grocery", "list", "budget"
    ],
    negativeKeywords: [
      "marketing", "campaign", "work", "meeting", "presentation",
      "travel", "flight", "hotel", "vacation", "report", "analysis"
    ],
    description: "Plan your shopping effortlessly. Free AI-generated smart to-do lists keep purchases organised and on budget."
  },
  study: {
    label: "Study Plan",
    keywords: [
      "study", "learn", "course", "class", "assignment", "homework",
      "project", "exam", "test", "quiz", "lecture", "note", "research",
      "paper", "thesis", "essay", "read", "write", "review", "practice",
      "solve", "understand", "memorize", "education", "school", "college"
    ],
    negativeKeywords: [
      "recipe", "marketing", "campaign", "home", "cleaning", "shopping",
      "travel", "vacation", "client", "freelance", "work"
    ],
    description: "Optimise studying with free AI-powered task breakdowns. Magic to-do lists help you stay focused and productive."
  },
  events: {
    label: "Event Planning",
    keywords: [
      "event", "party", "celebration", "wedding", "birthday", "anniversary",
      "holiday", "gathering", "meetup", "venue", "guest", "invite",
      "invitation", "rsvp", "decorate", "catering", "food", "drink",
      "music", "entertainment", "schedule", "plan", "organize", "host"
    ],
    negativeKeywords: [
      "marketing", "campaign", "work", "meeting", "presentation",
      "assignment", "report", "analysis", "study", "exam", "test"
    ],
    description: "Plan events with ease. Free AI auto task manager to organise guest lists, schedules, and more."
  },
  diy: {
    label: "DIY Projects",
    keywords: [
      "diy", "build", "make", "craft", "create", "project", "tool",
      "material", "wood", "paint", "glue", "cut", "measure", "assemble",
      "design", "fix", "repair", "upcycle", "repurpose", "restore",
      "renovate", "install", "construct", "handmade", "homemade"
    ],
    negativeKeywords: [
      "marketing", "campaign", "work", "meeting", "presentation",
      "study", "exam", "assignment", "report", "analysis"
    ],
    description: "Simplify your DIY projects using our free AI task manager. Create clear and manageable steps."
  },
  creative: {
    label: "Creative Projects",
    keywords: [
      "creative", "art", "design", "draw", "paint", "sketch", "illustration",
      "write", "story", "poetry", "novel", "blog", "content", "photo",
      "video", "film", "edit", "music", "compose", "record", "podcast",
      "create", "idea", "inspiration", "portfolio", "project"
    ],
    negativeKeywords: [
      "marketing", "campaign", "work", "meeting", "presentation",
      "shopping", "grocery", "cleaning", "home", "laundry"
    ],
    description: "Turn creative ideas into reality with free AI task planners. Smart to-do lists structure your creative process."
  }
};