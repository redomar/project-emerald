export type Id = string;

export type Member = {
  id: Id;
  name: string;
  initials: string;
  hue: string;
  role: string;
  from: string;
  joinedAt: number;
  stack: string[];
  github?: string;
  isAdmin?: boolean;
  nonTech?: boolean;
  lastSeen: number;
  hidePresence?: boolean;
};

export type ProjectStatus = "building" | "launched" | "completed";

export type Learned = { techniques: string; wrong: string; fixed: string; differently: string; writtenAt: number };

export type Project = {
  id: Id;
  name: string;
  ownerId: Id;
  status: ProjectStatus;
  description: string;
  stack: string[];
  appUrl?: string;
  githubUrl?: string;
  glyph: string;
  color: string;
  color2: string;
  wide?: boolean;
  createdAt: number;
  launchedAt?: number;
  learned?: Learned;
  updates: { id: Id; text: string; at: number }[];
};

export type PostKind = "learning" | "opinion" | "article" | "video";

export type Source = { kind: "link" | "video"; title: string; url: string };

export type Comment = { id: Id; authorId: Id; text: string; at: number; likes: Id[]; parentId?: Id };

export type Insight = { id: Id; text: string; at: number; source?: Source };

export type Post = {
  id: Id;
  kind: PostKind;
  authorId: Id;
  title: string;
  at: number;
  topics: string[];
  likes: Id[];
  comments: Comment[];
  // learning / opinion
  body?: string;
  sections?: { techniques: string; wrong: string; differently: string };
  projectId?: Id;
  sources: Source[];
  // article / video
  url?: string;
  site?: string;
  duration?: string;
  take?: string;
  insights: Insight[];
};

export type Answer = { id: Id; authorId: Id; text: string; code?: string; at: number; helpful: boolean; likes: Id[] };

export type Question = { id: Id; projectId: Id; askerId: Id; text: string; at: number; answers: Answer[] };

export type Snippet = {
  id: Id;
  title: string;
  authorId: Id;
  lang: string;
  tags: string[];
  code: string;
  at: number;
  copies: number;
  copiedBy: Id[];
  fromQuestionId?: Id;
};

export type ContributionType =
  | "launch"
  | "learning"
  | "helpful"
  | "answer"
  | "snippet"
  | "snippetCopied"
  | "share"
  | "insight"
  | "comment"
  | "commentReceived"
  | "codingDay";

/** One row per thing a member did. Points are derived from these rows (see points.ts), never stored. */
export type Contribution = { id: Id; memberId: Id; type: ContributionType; at: number; ref: string };

export type Notification = { id: Id; memberId: Id; text: string; at: number; read: boolean; href: string };

export type State = {
  version: number;
  currentUserId: Id;
  members: Member[];
  projects: Project[];
  posts: Post[];
  questions: Question[];
  snippets: Snippet[];
  contributions: Contribution[];
  notifications: Notification[];
  potm?: { projectId: Id; month: string; quote: string };
};
