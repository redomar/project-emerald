// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from "vitest";
import { actions, getState } from "../src/data/store";
import { standings } from "../src/data/points";

const pts = (id: string) => standings(getState().contributions, [id], "all", Date.now())[0].total;

describe("store actions", () => {
  beforeEach(() => actions.resetDemo());

  it("seeds an admin current user with demo content", () => {
    const s = getState();
    expect(s.members.find((m) => m.id === s.currentUserId)?.isAdmin).toBe(true);
    expect(s.projects.length).toBeGreaterThan(5);
    expect(s.posts.length).toBeGreaterThan(5);
  });

  it("a comment scores the commenter and the post author, and deleting it takes both back", () => {
    const post = getState().posts.find((p) => p.authorId === "ah")!;
    const [mo, ah] = [pts("mo"), pts("ah")];
    actions.addComment(post.id, "Great find");
    expect(pts("mo")).toBe(mo + 2);
    expect(pts("ah")).toBeGreaterThanOrEqual(ah);
    const c = getState().posts.find((p) => p.id === post.id)!.comments.at(-1)!;
    actions.deleteComment(post.id, c.id);
    expect(pts("mo")).toBe(mo);
    expect(pts("ah")).toBe(ah);
  });

  it("marking an answer helpful scores the answerer once; unmarking removes it", () => {
    actions.actAs("bi");
    const q = getState().questions.find((x) => x.id === "q-admin")!;
    actions.actAs("ib");
    actions.answer(q.id, "Use middleware with a role check");
    const a = getState().questions.find((x) => x.id === q.id)!.answers[0];
    const before = pts("ib");
    actions.actAs("bi");
    actions.toggleHelpful(q.id, a.id);
    expect(pts("ib")).toBe(before + 10);
    actions.toggleHelpful(q.id, a.id);
    expect(pts("ib")).toBe(before);
  });

  it("launching a project scores +50 only the first time", () => {
    const id = actions.createProject({ name: "Test", description: "", status: "building", stack: [] });
    const before = pts("mo");
    actions.setProjectStatus(id, "launched");
    actions.setProjectStatus(id, "building");
    actions.setProjectStatus(id, "launched");
    expect(pts("mo")).toBe(before + 50);
  });

  it("deleting all data leaves only the admin, and reset brings demo data back", () => {
    actions.deleteAllData();
    const s = getState();
    expect(s.members).toHaveLength(1);
    expect(s.members[0].isAdmin).toBe(true);
    expect(s.projects).toHaveLength(0);
    expect(s.contributions).toHaveLength(0);
    actions.resetDemo();
    expect(getState().members.length).toBeGreaterThan(1);
  });

  it("export then import round-trips, and rejects junk", () => {
    actions.addSnippet({ title: "x", lang: "SQL", tags: [], code: "select 1" });
    const json = actions.exportJson();
    actions.deleteAllData();
    expect(actions.importJson(json)).toBe(true);
    expect(getState().snippets.some((s) => s.title === "x")).toBe(true);
    expect(actions.importJson("{\"nope\":1}")).toBe(false);
  });

  it("persists to localStorage", () => {
    actions.addSnippet({ title: "persisted", lang: "SQL", tags: [], code: "select 1" });
    expect(localStorage.getItem("emerald:state")).toContain("persisted");
  });
});
