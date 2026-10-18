import type { Contribution, Member, Notification, Post, Project, Question, Snippet, State } from "./types";
import { DAY, HOUR, MIN, WEEK, weekStart } from "../lib/time";

export const STATE_VERSION = 1;

let n = 0;
const id = (p: string) => `${p}_seed_${++n}`;

/** Demo data, with every time relative to `now` so it always looks fresh. */
export function demoState(now = Date.now()): State {
  n = 0;
  const ws = weekStart(now);
  // "h hours ago", but never before this Monday, so this week's board has content whatever day it is
  const tw = (hours: number) => Math.max(now - hours * HOUR, ws + 5 * MIN + hours * MIN);
  const ago = (days: number) => now - days * DAY;

  const members: Member[] = [
    { id: "mo", name: "Mohamed", initials: "MO", hue: "#0f7b5a", role: "Organiser · full-stack", from: "Birmingham", joinedAt: ago(280), stack: ["Next.js", "React", "Convex", "TypeScript"], github: "redomar", isAdmin: true, lastSeen: now },
    { id: "yu", name: "Yusuf", initials: "Y", hue: "#b4572e", role: "Flutter dev", from: "Birmingham", joinedAt: ago(270), stack: ["Flutter", "Dart", "Firebase", "Swift"], lastSeen: now - 2 * MIN },
    { id: "ib", name: "Ibrahim", initials: "I", hue: "#2a5694", role: "Web dev · Svelte + Next.js", from: "Walsall", joinedAt: ago(250), stack: ["SvelteKit", "Next.js", "Postgres"], lastSeen: now - 25 * MIN },
    { id: "bi", name: "Bilal", initials: "B", hue: "#7a5aa8", role: "Learning Next.js", from: "Birmingham", joinedAt: ago(60), stack: ["Next.js", "Supabase"], lastSeen: now - 62 * MIN },
    { id: "ah", name: "Ahmed", initials: "A", hue: "#8a6216", role: "Non-tech · reads everything", from: "Coventry", joinedAt: ago(120), stack: [], nonTech: true, lastSeen: now - 3 * MIN },
    { id: "za", name: "Zayd", initials: "Z", hue: "#1d7a86", role: "iOS · SwiftUI", from: "Wolverhampton", joinedAt: ago(200), stack: ["SwiftUI", "Swift"], lastSeen: now - 26 * HOUR },
    { id: "ha", name: "Hamza", initials: "H", hue: "#a33a31", role: "React Native + AI", from: "Birmingham", joinedAt: ago(150), stack: ["React Native", "AI", "TypeScript"], lastSeen: now - 100 * MIN },
    { id: "id", name: "Idris", initials: "ID", hue: "#4f6b2d", role: "Vue · backend", from: "Solihull", joinedAt: ago(90), stack: ["Vue", "Postgres", "Convex"], lastSeen: now - 3 * DAY },
  ];

  const P = (p: Omit<Project, "updates" | "createdAt"> & { createdAt?: number; updates?: string[] }): Project => ({
    ...p,
    createdAt: p.createdAt ?? ago(40),
    updates: (p.updates ?? []).map((text, i) => ({ id: id("u"), text, at: ago(2 + i * 3) })),
  });

  const projects: Project[] = [
    P({ id: "salah", name: "Salah Buddy", ownerId: "yu", status: "launched", glyph: "🕌", color: "#0f7b5a", color2: "#5fb98f", launchedAt: tw(30), createdAt: ago(60),
      description: "Prayer times on your home screen, with a widget that changes at each prayer and a gentle nudge before jama'ah.", stack: ["Flutter", "Dart", "Firebase", "Riverpod", "FCM"],
      appUrl: "https://example.com/salah-buddy", githubUrl: "https://github.com/",
      learned: { techniques: "Riverpod for state, home_widget for the iOS and Android widgets, FCM to push the day's times at Fajr, and a tiny Cloud Function to cache the mosque's timetable.", wrong: "iOS kills background tasks whenever it likes. Polling every minute drained the battery and still missed Maghrib. Two weekends gone.", fixed: "WidgetKit timelines: hand iOS the whole day's entries up front, so it switches at the right minute without waking the app.", differently: "Build the widget first. Nobody opens the app; they glance at their home screen.", writtenAt: ago(30) },
      updates: ["Added Isha reminder", "Widget dark mode", "Fixed BST changeover"] }),
    P({ id: "hack", name: "Hackthathon", ownerId: "mo", status: "completed", glyph: "🏁", color: "#c99a3a", color2: "#f0d48a", wide: true, createdAt: ago(10),
      description: "Live event companion: QR check-in, balanced teams, a prayer-aware hacking clock and anonymous voting.", stack: ["React", "Convex", "Tailwind"],
      appUrl: "https://devbros-hackthathon.netlify.app", githubUrl: "https://github.com/redomar/devbros-hackthathon", updates: ["Teams of two get a strong pair", "Captains can rename their team"] }),
    P({ id: "ofp", name: "OFP Planner", ownerId: "mo", status: "launched", glyph: "✈️", color: "#2a5694", color2: "#7ea6dd", wide: true, launchedAt: ago(15),
      description: "Pick a real airline flight for your sim and send it to SimBrief.", stack: ["Next.js", "d3-geo", "TypeScript"], appUrl: "https://plans.massorbit.co.uk", githubUrl: "https://github.com/redomar/ofp-planner", updates: ["Map route lines", "Logbook"] }),
    P({ id: "rota", name: "Masjid Rota", ownerId: "bi", status: "building", glyph: "📋", color: "#7a5aa8", color2: "#c3afe3", wide: true,
      description: "Volunteer rota for the masjid: swaps, reminders, no spreadsheets.", stack: ["Next.js", "Supabase"], updates: ["Moved to Postgres"] }),
    P({ id: "eats", name: "Halal Eats Map", ownerId: "ib", status: "building", glyph: "🍽️", color: "#a33a31", color2: "#ef9d8c", description: "Community-checked halal spots on a map.", stack: ["SvelteKit", "Mapbox"] }),
    P({ id: "quran", name: "Quran Streak", ownerId: "za", status: "building", glyph: "📖", color: "#1d7a86", color2: "#86cfd8", description: "A gentle daily-reading streak with a lock-screen widget.", stack: ["SwiftUI", "WidgetKit"] }),
    P({ id: "receipt", name: "Receipt Snap", ownerId: "ha", status: "launched", glyph: "🧾", color: "#b4572e", color2: "#f3b48e", launchedAt: tw(3), description: "Photograph a receipt, get it categorised for your budget.", stack: ["React Native", "Claude API"], appUrl: "https://example.com/receipt-snap" }),
    P({ id: "zakat", name: "Zakat Calc", ownerId: "id", status: "launched", glyph: "🧮", color: "#4f6b2d", color2: "#b5cf8a", launchedAt: ago(60), description: "Work out your zakat with live gold and silver prices.", stack: ["Vue", "Vite"], appUrl: "https://example.com/zakat" }),
    P({ id: "qt", name: "Quran Tracker", ownerId: "yu", status: "completed", glyph: "📗", color: "#835c12", color2: "#e9c97c", createdAt: ago(200), description: "Track juz progress with family.", stack: ["Flutter"] }),
  ];

  const c = (authorId: string, text: string, hours: number, likes: string[] = [], parentId?: string) => ({ id: id("c"), authorId, text, at: tw(hours), likes, parentId });

  const hamzaComment = c("ha", "Going to try this on Receipt Snap 👀 The receipt parser is exactly the kind of boring code I'd hand off.", 30, ["ah", "yu", "mo"]);
  const posts: Post[] = [
    { id: "p-swiftui", kind: "learning", authorId: "za", title: "SwiftUI widgets the easy way", at: tw(5), topics: ["iOS", "Design"], likes: ["yu", "mo", "bi"], comments: [c("yu", "The timeline tip saved me too. Did you hit the 40-reloads-a-day limit?", 4)], insights: [], projectId: "quran",
      body: "I fought WidgetKit for a week. Here are the three things I wish someone had told me, with the code that finally worked.",
      sections: { techniques: "WidgetKit timelines, App Groups to share data with the app, and SwiftUI previews for every widget size.", wrong: "I used a Timer to refresh. Widgets don't run timers, so it never changed. Previews also lie about fonts on small widgets.", differently: "Plan the whole day's timeline up front, and test on a real device from day one." },
      sources: [{ kind: "link", title: "WidgetKit documentation", url: "https://developer.apple.com/documentation/widgetkit" }, { kind: "video", title: "WidgetKit timelines explained", url: "https://www.youtube.com/results?search_query=widgetkit+timelines+wwdc" }, { kind: "link", title: "App Groups guide", url: "https://developer.apple.com/documentation/xcode/configuring-app-groups" }] },
    { id: "p-convex-video", kind: "video", authorId: "mo", title: "Convex in 100 seconds", at: tw(20), topics: ["Databases", "Deploying"], likes: ["id"], comments: [c("id", "Watched it twice. The reactive queries part finally clicked.", 18)], insights: [], sources: [],
      url: "https://www.youtube.com/results?search_query=convex+in+100+seconds", site: "YouTube · Fireship", duration: "2:14", take: "Best intro to how our hackathon app worked. Watch before you read my write-up." },
    { id: "p-agents", kind: "article", authorId: "ah", title: "New AI agents can now ship whole apps", at: tw(40), topics: ["AI tools"], likes: ["ha", "yu", "mo", "ib"], sources: [],
      url: "https://www.theverge.com/", site: "The Verge · 6 min", take: "Worth trying for our next hackathon, the free tier is enough for a weekend build.",
      comments: [hamzaComment, c("ah", "Let us know how it goes, I'll add it to the post as an insight.", 29, [], hamzaComment.id),
        c("yu", "The pricing page says 50 free runs a day. Enough for a hackathon if we share one account per team.", 26, ["ah"]),
        c("ib", "Careful with secrets: it read my .env.local without asking. Keep keys out of the repo before you point it at anything.", 20, ["mo", "ha", "bi"])],
      insights: [{ id: id("i"), text: "After Hamza tried it: the free tier ran out after about 40 prompts, so plan a paid day for the hackathon itself.", at: tw(12) },
        { id: id("i"), text: "Found a 10-minute video that shows the whole setup. Easier than the article if you're new to this.", at: tw(2), source: { kind: "video", title: "Setting up AI agents in 10 minutes", url: "https://www.youtube.com/" } }] },
    { id: "p-firebase", kind: "opinion", authorId: "bi", title: "Why I stopped using Firebase for everything", at: ago(9), topics: ["Databases"], likes: ["ib", "id"], comments: [], insights: [], projectId: "rota",
      body: "Firebase is brilliant until your data has relationships. Moving Masjid Rota to Postgres took an evening, and the queries I'd been fighting for weeks became three lines of SQL.", sources: [{ kind: "link", title: "Supabase vs Firebase", url: "https://supabase.com/alternatives/supabase-vs-firebase" }, { kind: "link", title: "Postgres joins explained", url: "https://www.postgresql.org/docs/current/tutorial-join.html" }] },
    { id: "p-hack48", kind: "learning", authorId: "mo", title: "Shipping a hackathon app in 48 hours with Convex", at: tw(50), topics: ["Deploying", "Databases"], likes: ["ib", "yu"], comments: [c("bi", "The phase-machine idea is clever. Stealing it for the rota.", 45)], insights: [], projectId: "hack",
      body: "Realtime without a server. What I'd copy next time, what the tests caught on the night before, and the one thing I'd never do again on event morning.",
      sections: { techniques: "Convex for state and live queries, a pure-TS allocator shared by client and server, and a Playwright rehearsal script.", wrong: "I changed the team allocator on event morning. It worked, but I had no time to rehearse it properly.", differently: "Freeze features the night before. Only fixes on the day." },
      sources: [{ kind: "link", title: "Convex docs", url: "https://docs.convex.dev" }, { kind: "video", title: "Convex in 100 seconds", url: "https://www.youtube.com/results?search_query=convex+in+100+seconds" }, { kind: "link", title: "Playwright", url: "https://playwright.dev" }, { kind: "video", title: "Realtime apps talk", url: "https://www.youtube.com/" }] },
    { id: "p-widgetkit", kind: "video", authorId: "yu", title: "WidgetKit timelines explained", at: ago(12), topics: ["iOS"], likes: ["za"], comments: [], insights: [], sources: [],
      url: "https://www.youtube.com/results?search_query=widgetkit+timelines+wwdc", site: "Apple Developer · WWDC", duration: "18:40", take: "The talk that fixed Salah Buddy. Skip to 6:30 for timelines." },
    { id: "p-live", kind: "article", authorId: "id", title: "Apple opens Live Activities to the web", at: tw(60), topics: ["iOS", "Design"], likes: [], comments: [c("mo", "Yes! A lock-screen hacking clock would be brilliant.", 58)], insights: [], sources: [],
      url: "https://9to5mac.com/", site: "9to5Mac · 4 min", take: "Could we show the hacking clock on lock screens next time?" },
    { id: "p-rls", kind: "learning", authorId: "bi", title: "Supabase RLS without tears", at: ago(16), topics: ["Databases"], likes: ["ib"], comments: [], insights: [], projectId: "rota",
      body: "Row Level Security looked scary. It's four policies. Here's the mental model that made it click, plus the one policy I got wrong in production.",
      sections: { techniques: "Postgres RLS policies keyed on auth.uid(), and a test user per role.", wrong: "My update policy had no WITH CHECK, so volunteers could reassign shifts to anyone.", differently: "Write a failing test for each policy before writing the policy." },
      sources: [{ kind: "link", title: "Supabase RLS guide", url: "https://supabase.com/docs/guides/database/postgres/row-level-security" }, { kind: "link", title: "Postgres CREATE POLICY", url: "https://www.postgresql.org/docs/current/sql-createpolicy.html" }] },
    { id: "p-onehand", kind: "video", authorId: "ha", title: "Designing for one-handed use", at: ago(20), topics: ["Design"], likes: ["yu"], comments: [], insights: [], sources: [],
      url: "https://www.youtube.com/", site: "YouTube · Design Course", duration: "12:05", take: "Why Receipt Snap's buttons all moved to the bottom." },
    { id: "p-fintech", kind: "article", authorId: "ah", title: "The state of halal fintech in 2026", at: ago(8), topics: ["Islamic apps", "Career"], likes: ["id"], comments: [c("id", "Challenge accepted 😄", 190)], insights: [{ id: id("i"), text: "Two of the apps mentioned are hiring juniors, if anyone's looking.", at: ago(7) }], sources: [],
      url: "https://www.wired.com/", site: "Wired · 9 min", take: "Lots of room for a simple zakat and budgeting app. Idris?" },
    { id: "p-ugly", kind: "opinion", authorId: "ib", title: "Ship ugly, then polish", at: ago(25), topics: ["Career"], likes: ["mo", "ha", "yu"], comments: [], insights: [], sources: [],
      body: "Every project I polished first, I never launched. Every project I launched ugly, people used and told me what to fix." },
    { id: "p-flutter", kind: "learning", authorId: "yu", title: "What 3 weekends of Flutter taught me", at: ago(30), topics: ["Flutter"], likes: ["za", "mo", "bi", "ha"], comments: [], insights: [], projectId: "salah",
      body: "Start with the widget, not the app. I spent the first weekend on screens nobody opened, and the second fighting iOS background tasks.",
      sections: { techniques: "Riverpod, home_widget, FCM.", wrong: "Background refresh on iOS is a suggestion, not a promise.", differently: "Widget first, app second." },
      sources: [{ kind: "link", title: "home_widget package", url: "https://pub.dev/packages/home_widget" }, { kind: "link", title: "Riverpod docs", url: "https://riverpod.dev" }, { kind: "video", title: "WidgetKit timelines explained", url: "https://www.youtube.com/results?search_query=widgetkit+timelines+wwdc" }] },
  ];

  const helpfulAnswer = { id: id("a"), authorId: "yu", text: "Don't refresh, schedule. Give WidgetKit a timeline with one entry per prayer, and it swaps on the minute.", code: "let entries = prayers.map { p in\n  SalahEntry(date: p.time, next: p.name)\n}\ncompletion(Timeline(entries: entries, policy: .atEnd))", at: tw(44), helpful: true, likes: ["bi", "za"] };
  const questions: Question[] = [
    { id: "q-refresh", projectId: "salah", askerId: "bi", text: "How do you refresh the widget exactly at prayer time? Mine is always a few minutes late.", at: tw(46), answers: [helpfulAnswer] },
    { id: "q-cache", projectId: "salah", askerId: "id", text: "Do you cache the times offline, or call the API every day?", at: ago(4), answers: [{ id: id("a"), authorId: "yu", text: "A month at a time in Firestore, mirrored to local storage. Works on a plane.", at: ago(4) + HOUR, helpful: false, likes: [] }] },
    { id: "q-local", projectId: "salah", askerId: "ah", text: "Could this work for my local mosque's times too?", at: ago(5), answers: [] },
    { id: "q-admin", projectId: "rota", askerId: "bi", text: "How do I protect admin routes in Next.js 16?", at: tw(3), answers: [] },
    { id: "q-convex", projectId: "zakat", askerId: "id", text: "Best way to cache Convex queries offline?", at: tw(26), answers: [] },
    { id: "q-rn", projectId: "receipt", askerId: "yu", text: "Which OCR did you use for receipts, on-device or the API?", at: ago(2), answers: [{ id: id("a"), authorId: "ha", text: "Claude's vision API. On-device OCR kept mixing up totals and VAT.", at: ago(2) + 2 * HOUR, helpful: true, likes: ["yu"] }] },
  ];

  const snippets: Snippet[] = [
    { id: "s-debounce", title: "useDebounce hook", authorId: "ha", lang: "TypeScript", tags: ["React", "hooks"], at: ago(20), copies: 31, copiedBy: ["mo", "bi", "ib"],
      code: "export function useDebounce<T>(value: T, ms = 300) {\n  const [v, setV] = useState(value)\n  useEffect(() => {\n    const t = setTimeout(() => setV(value), ms)\n    return () => clearTimeout(t)\n  }, [value, ms])\n  return v\n}" },
    { id: "s-middleware", title: "Admin-only middleware", authorId: "ib", lang: "TypeScript", tags: ["Next.js", "auth"], at: ago(6), copies: 12, copiedBy: ["bi"],
      code: "export function middleware(req: NextRequest) {\n  if (!isAdmin(req)) {\n    return NextResponse.redirect(new URL(\"/\", req.url))\n  }\n}\nexport const config = { matcher: [\"/admin/:path*\"] }" },
    { id: "s-rls", title: "Supabase RLS: owners only", authorId: "bi", lang: "SQL", tags: ["Supabase", "Postgres"], at: ago(15), copies: 8, copiedBy: ["ib"],
      code: "alter table shifts enable row level security;\ncreate policy \"owner can edit\" on shifts\n  for all using (auth.uid() = volunteer_id)\n  with check (auth.uid() = volunteer_id);" },
    { id: "s-timeline", title: "Prayer-time widget timeline", authorId: "yu", lang: "Swift", tags: ["WidgetKit", "iOS"], at: tw(43), copies: 6, copiedBy: ["za"], fromQuestionId: "q-refresh",
      code: "let entries = prayers.map { p in\n  SalahEntry(date: p.time, next: p.name)\n}\ncompletion(Timeline(entries: entries, policy: .atEnd))" },
  ];

  const state: State = { version: STATE_VERSION, currentUserId: "mo", members, projects, posts, questions, snippets, contributions: [], notifications: [], potm: { projectId: "salah", month: new Date(now).toLocaleDateString("en-GB", { month: "long" }), quote: "Background refresh on iOS is strict. I rebuilt the widget around a timeline instead of polling, and it finally changed on time." } };
  state.contributions = deriveContributions(state, now);
  state.notifications = seedNotifications(now);
  return state;
}

/** Rebuilds the contribution log from content, plus coding days, so seeded scores match the seeded content. */
function deriveContributions(s: State, now: number): Contribution[] {
  const rows: Contribution[] = [];
  const add = (memberId: string, type: Contribution["type"], at: number, ref: string) => rows.push({ id: id("k"), memberId, type, at, ref });
  for (const p of s.projects) if (p.status === "launched" && p.launchedAt) add(p.ownerId, "launch", p.launchedAt, p.id);
  for (const p of s.posts) {
    add(p.authorId, p.kind === "learning" || p.kind === "opinion" ? "learning" : "share", p.at, p.id);
    for (const i of p.insights) add(p.authorId, "insight", i.at, p.id);
    for (const c of p.comments) {
      add(c.authorId, "comment", c.at, c.id);
      if (c.authorId !== p.authorId) add(p.authorId, "commentReceived", c.at, c.id);
    }
  }
  for (const q of s.questions) for (const a of q.answers) {
    add(a.authorId, "answer", a.at, a.id);
    if (a.helpful) add(a.authorId, "helpful", a.at + HOUR, a.id);
  }
  for (const sn of s.snippets) {
    add(sn.authorId, "snippet", sn.at, sn.id);
    sn.copiedBy.forEach((m, i) => add(sn.authorId, "snippetCopied", Math.min(now, sn.at + (i + 1) * DAY), `${sn.id}:${m}`));
  }
  // coding days: [member, days active this week, weeks of history]
  const ws = weekStart(now);
  const daysThisWeek = Math.max(1, Math.floor((now - ws) / DAY) + 1);
  const coders: [string, number, number][] = [["yu", 4, 6], ["mo", 5, 9], ["ib", 4, 5], ["ha", 3, 3], ["za", 2, 4], ["id", 3, 1], ["bi", 2, 2]];
  for (const [m, perWeek, weeks] of coders) {
    for (let w = 0; w < weeks; w++) {
      const start = ws - w * WEEK;
      const days = w === 0 ? Math.min(perWeek, daysThisWeek) : perWeek;
      for (let d = 0; d < days; d++) add(m, "codingDay", Math.min(now - MIN, start + d * DAY + 10 * HOUR), `${m}:${start + d * DAY}`);
    }
  }
  // Ahmed contributes every week through sharing; give him two earlier weeks of history
  for (let w = 1; w <= 2; w++) add("ah", "share", ws - w * WEEK + 2 * DAY, `old-share-${w}`);
  return rows;
}

function seedNotifications(now: number): Notification[] {
  return [
    { id: id("n"), memberId: "mo", text: "Bilal asked how to protect admin routes on Masjid Rota", at: now - 3 * HOUR, read: false, href: "#/p/rota/ama" },
    { id: id("n"), memberId: "mo", text: "Ibrahim and 1 other liked “Shipping a hackathon app in 48 hours”", at: now - 6 * HOUR, read: false, href: "#/post/p-hack48" },
    { id: id("n"), memberId: "mo", text: "Hamza's useDebounce hook was copied 31 times. Worth a look", at: now - 2 * DAY, read: true, href: "#/snippets" },
  ];
}
