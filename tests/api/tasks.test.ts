import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST, GET } from "@/app/api/tasks/route";
import { insertTask } from "../setup";

function makePostRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost:3000/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function makeGetRequest(url: string = "http://localhost:3000/api/tasks"): NextRequest {
  return new NextRequest(url, { method: "GET" });
}

describe("POST /api/tasks", () => {
  beforeEach(() => {
    // DB fraiche gérée par setup.ts
  });

  it("crée une tâche avec tous les champs → 201", async () => {
    const req = makePostRequest({
      title: "Corriger le bug de login",
      description: "Le bouton ne répond pas sur Safari",
      priority: "high",
      category: "Frontend",
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.id).toBeDefined();
    expect(json.title).toBe("Corriger le bug de login");
    expect(json.status).toBe("todo");
    expect(json.priority).toBe("high");
    expect(json.createdAt).toBeDefined();
    expect(json.updatedAt).toBeDefined();
  });

  it("crée une tâche avec priorité par défaut medium → 201", async () => {
    const req = makePostRequest({
      title: "Acheter du café",
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.priority).toBe("medium");
    expect(json.status).toBe("todo");
  });

  it("crée une tâche avec statut backlog explicite → 201", async () => {
    const req = makePostRequest({
      title: "Idée future",
      status: "backlog",
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.status).toBe("backlog");
  });

  it("rejette sans titre → 400", async () => {
    const req = makePostRequest({
      priority: "high",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.errors).toBeDefined();
    expect(Array.isArray(json.errors)).toBe(true);
  });

  it("rejette avec titre vide → 400", async () => {
    const req = makePostRequest({
      title: "",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("rejette avec titre > 200 caractères → 400", async () => {
    const req = makePostRequest({
      title: "a".repeat(201),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("rejette avec description > 2000 caractères → 400", async () => {
    const req = makePostRequest({
      title: "Test",
      description: "a".repeat(2001),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("rejette avec priorité invalide → 400", async () => {
    const req = makePostRequest({
      title: "Test",
      priority: "invalid",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("rejette avec date d'échéance passée → 400", async () => {
    const req = makePostRequest({
      title: "Tâche rétroactive",
      dueDate: new Date(Date.now() - 86400000).toISOString(),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("rejette avec statut invalide → 400", async () => {
    const req = makePostRequest({
      title: "Test",
      status: "invalid",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("accepte une catégorie → 201", async () => {
    const req = makePostRequest({
      title: "Test cat",
      category: "Backend",
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.category).toBe("Backend");
  });

  it("rejette avec catégorie > 50 caractères → 400", async () => {
    const req = makePostRequest({
      title: "Test",
      category: "a".repeat(51),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("rejette un body JSON invalide → 400", async () => {
    const req = new NextRequest("http://localhost:3000/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "invalid json",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});

describe("GET /api/tasks", () => {
  it("renvoie un tableau vide quand aucune tâche → 200", async () => {
    const res = await GET(makeGetRequest());
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json)).toBe(true);
    expect(json.length).toBe(0);
  });

  it("renvoie la liste des tâches → 200", async () => {
    insertTask({ title: "Task 1", priority: "high" });
    insertTask({ title: "Task 2", priority: "low" });

    const res = await GET(makeGetRequest());
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.length).toBe(2);
  });

  it("filtre par priority=high → 200", async () => {
    insertTask({ title: "High task", priority: "high" });
    insertTask({ title: "Low task", priority: "low" });

    const res = await GET(
      makeGetRequest("http://localhost:3000/api/tasks?priority=high"),
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.length).toBe(1);
    expect(json[0].priority).toBe("high");
  });

  it("filtre par status=done → 200", async () => {
    insertTask({ title: "Done task", status: "done" });
    insertTask({ title: "Todo task", status: "todo" });

    const res = await GET(
      makeGetRequest("http://localhost:3000/api/tasks?status=done"),
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.length).toBe(1);
    expect(json[0].status).toBe("done");
  });

  it("filtre par category=Frontend → 200", async () => {
    insertTask({ title: "FE", category: "Frontend" });
    insertTask({ title: "BE", category: "Backend" });

    const res = await GET(
      makeGetRequest("http://localhost:3000/api/tasks?category=Frontend"),
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.length).toBe(1);
    expect(json[0].category).toBe("Frontend");
  });

  it("filtre par recherche texte q=login → 200", async () => {
    insertTask({ title: "Bug login", description: "Fix needed" });
    insertTask({ title: "Doc API", description: "Write docs" });

    const res = await GET(
      makeGetRequest("http://localhost:3000/api/tasks?q=login"),
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.length).toBe(1);
    expect(json[0].title).toBe("Bug login");
  });

  it("filtre combinés (AND) → 200", async () => {
    insertTask({ title: "Login FE", priority: "high", category: "Frontend" });
    insertTask({ title: "Login BE", priority: "low", category: "Backend" });
    insertTask({ title: "Doc FE", priority: "high", category: "Frontend" });

    const res = await GET(
      makeGetRequest(
        "http://localhost:3000/api/tasks?priority=high&category=Frontend&q=Login",
      ),
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.length).toBe(1);
    expect(json[0].title).toBe("Login FE");
  });
});