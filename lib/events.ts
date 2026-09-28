export type Campus = "Mokopane" | "Polokwane";

export interface BookingChoice {
  id: string;
  label: string;
  price: number;
  capacity: number;
  note?: string;
  timeLabel?: string;
}

export interface EventSession {
  date: string;
  campus: Campus;
  capacity: number;
}

export interface AcademyEvent {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
  duration: string;
  price: number;
  capacity: number;
  includes: string[];
  campuses: Campus[];
  sessions: EventSession[];
  bookingChoices?: BookingChoice[];
}

const campuses: Campus[] = ["Polokwane", "Mokopane"];
const cookingClubSessions: EventSession[] = [
  { date: "2026-10-21", campus: "Polokwane", capacity: 50 },
  { date: "2026-10-21", campus: "Mokopane", capacity: 50 },
  { date: "2026-11-18", campus: "Polokwane", capacity: 50 },
  { date: "2026-11-18", campus: "Mokopane", capacity: 50 },
];

export const EVENTS: AcademyEvent[] = [
  {
    id: "third-wednesday-cooking-club",
    title: "Third Wednesday Cooking Club",
    category: "Cooking Club",
    image: "/3rdwed.jpeg",
    description:
      "A relaxed, hands-on evening around a new menu, shared skills, and good food. Choose to cook with the class or order a freshly prepared meal for collection.",
    duration: "Evening",
    price: 200,
    capacity: 50,
    includes: ["Freshly prepared menu", "Recipe card", "A welcoming kitchen"],
    campuses,
    sessions: cookingClubSessions,
    bookingChoices: [
      {
        id: "cook-with-class",
        label: "Cook with class",
        price: 275,
        capacity: 18,
        timeLabel: "Starts at 17:30",
        note: "Hands-on cooking session",
      },
      {
        id: "takeaway",
        label: "Takeaway order",
        price: 200,
        capacity: 50,
        timeLabel: "Collection between 18:00-20:00",
        note: "Order for collection",
      },
    ],
  },
  {
    id: "barista-croissants",
    title: "Barista & Croissants",
    category: "Baking",
    image: "/barista.jpeg",
    description:
      "Learn café-style coffee skills and bake buttery croissants from scratch.",
    duration: "1 day",
    price: 850,
    capacity: 14,
    includes: ["Coffee tasting", "All ingredients", "Take-home croissants"],
    campuses: ["Polokwane"],
    sessions: [],
  },
  {
    id: "gourmet-filled-cookies",
    title: "Gourmet Filled Cookies",
    category: "Baking",
    image: "/cookie.jpeg",
    description:
      "Make bakery-style cookies with rich fillings and a range of flavour ideas.",
    duration: "1 day",
    price: 550,
    capacity: 30,
    includes: ["All ingredients", "Recipe booklet", "Cookies to take home"],
    campuses,
    sessions: [
      { date: "2026-11-07", campus: "Polokwane", capacity: 30 },
      { date: "2026-11-14", campus: "Mokopane", capacity: 30 },
    ],
  },
  {
    id: "potjie-competition",
    title: "Potjie Competition",
    category: "Competition",
    image: "/potjie.jpeg",
    description:
      "Gather around the fire for a friendly celebration of South African cooking.",
    duration: "Full day",
    price: 450,
    capacity: 60,
    includes: ["Ingredients allowance", "Potjie equipment", "Prize giving"],
    campuses: ["Polokwane"],
    sessions: [],
  },
  {
    id: "secret-supper-society",
    title: "The Secret Supper Society",
    category: "Dining Experience",
    image: "/secret.jpeg",
    description:
      "An intimate dinner with a surprise menu, thoughtful pairings, and great company.",
    duration: "Evening (3 hrs)",
    price: 650,
    capacity: 30,
    includes: ["Multi-course surprise dinner", "Wine pairing", "Reserved seat"],
    campuses: ["Polokwane"],
    sessions: [
      { date: "2026-10-16", campus: "Polokwane", capacity: 30 },
      { date: "2026-11-27", campus: "Polokwane", capacity: 30 },
    ],
  },
  {
    id: "sushi-class",
    title: "Sushi Class",
    category: "World Cuisine",
    image: "/sushi.jpeg",
    description:
      "Practice the techniques behind beautifully prepared sushi in a guided class.",
    duration: "1 day",
    price: 950,
    capacity: 25,
    includes: ["All ingredients", "Recipe booklet", "Sushi lunch"],
    campuses,
    sessions: [
      { date: "2026-10-03", campus: "Polokwane", capacity: 25 },
      { date: "2026-10-17", campus: "Mokopane", capacity: 25 },
    ],
  },
];

export function getEvent(eventId: string) {
  return EVENTS.find((event) => event.id === eventId);
}

export function getSession(event: AcademyEvent, date: string, campus: string) {
  return event.sessions.find(
    (session) => session.date === date && session.campus === campus,
  );
}

export function sessionKey(
  date: string,
  campus: Campus,
  choiceId?: string | null,
) {
  return `${date}:${campus}:${choiceId ?? "default"}`;
}

export function formatPrice(amount: number) {
  return `R ${amount.toLocaleString("en-ZA")}`;
}

export function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-ZA", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
