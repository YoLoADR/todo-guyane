import { describe, it, expect } from "vitest";
import { GET as listTasks, POST as createTask } from "@/app/api/tasks/route";
import {
  GET as getTask,
  PATCH as updateTask,
  DELETE as deleteTask,
} from "@/app/api/tasks/[id]/route";

const baseUrl = "http://localhost:3000/api/tasks";

async function parseJson(response: Response) {
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

describe("Tasks API", () => {

  describe("POST /api/tasks", () => {
    it("creates a task with 201 and default status todo", async () => {
      const body = {
        title: "Corriger bug login",
        description: "Le bouton ne répond pas sur Safari",
        priority: "high",
        category: "Frontend",
        dueDate: "2026-08-10T00:00:00.000Z",
      };
      const request = new Request(baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const response = await createTask(request);
      const data = await parseJson(response);

      expect(response.status).toBe(201);
      expect(data).toMatchObject({
        title: body.title,
        description: body.description,
        priority: body.priority,
        category: body.category,
        dueDate: body.dueDate,
        status: "todo",
      });
      expect(data.id).toBeDefined();
      expect(data.createdAt).toBeDefined();
      expect(data.updatedAt).toBeDefined();
    });

    it("rejects missing title with 400", async () => {
      const request = new Request(baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority: "medium" }),
      });

      const response = await createTask(request);
      expect(response.status).toBe(400);
      const data = await parseJson(response);
      expect(Array.isArray(data.errors)).toBe(true);
    });

    it("rejects title longer than 200 characters with 400", async () => {
      const request = new Request(baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "x".repeat(201), priority: "medium" }),
      });

      const response = await createTask(request);
      expect(response.status).toBe(400);
      const data = await parseJson(response);
      expect(data.errors).toBeDefined();
    });

    it("rejects a due date in the past with 400", async () => {
      const past = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const request = new Request(baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Tâche rétroactive", priority: "medium", dueDate: past }),
      });

      const response = await createTask(request);
      expect(response.status).toBe(400);
      const data = await parseJson(response);
      expect(data.errors).toBeDefined();
    });
  });

  describe("GET /api/tasks", () => {
    it("returns an empty list by default", async () => {
      const response = await listTasks(new Request(baseUrl));
      const data = await parseJson(response);

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
    });

    it("returns all created tasks", async () => {
      await createTask(
        new Request(baseUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: "Tâche 1", priority: "low" }),
        })
      );
      await createTask(
        new Request(baseUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: "Tâche 2", priority: "high" }),
        })
      );

      const response = await listTasks(new Request(baseUrl));
      const data = await parseJson(response);

      expect(response.status).toBe(200);
      expect(data).toHaveLength(2);
    });

    it("filters by priority", async () => {
      await seedMixedTasks();

      const response = await listTasks(new Request(`${baseUrl}?priority=high`));
      const data = await parseJson(response);

      expect(response.status).toBe(200);
      expect(data).toHaveLength(1);
      expect(data[0].priority).toBe("high");
    });

    it("filters by status", async () => {
      await seedMixedTasks();

      const response = await listTasks(new Request(`${baseUrl}?status=done`));
      const data = await parseJson(response);

      expect(response.status).toBe(200);
      expect(data).toHaveLength(1);
      expect(data.every((t: { status: string }) => t.status === "done")).toBe(true);
    });

    it("filters by category", async () => {
      await seedMixedTasks();

      const response = await listTasks(new Request(`${baseUrl}?category=Backend`));
      const data = await parseJson(response);

      expect(response.status).toBe(200);
      expect(data.every((t: { category?: string }) => t.category === "Backend")).toBe(true);
    });

    it("filters by text search on title and description", async () => {
      await seedMixedTasks();

      const response = await listTasks(new Request(`${baseUrl}?q=safari`));
      const data = await parseJson(response);

      expect(response.status).toBe(200);
      expect(data).toHaveLength(1);
      expect(data[0].title).toContain("login");
    });

    it("combines filters with AND logic", async () => {
      await seedMixedTasks();

      const response = await listTasks(
        new Request(`${baseUrl}?priority=high&category=Frontend&q=login`)
      );
      const data = await parseJson(response);

      expect(response.status).toBe(200);
      expect(data).toHaveLength(1);
      expect(data[0].priority).toBe("high");
      expect(data[0].category).toBe("Frontend");
    });
  });

  describe("GET /api/tasks/:id", () => {
    it("returns a task by id", async () => {
      const created = await createSampleTask("Lire doc");

      const response = await getTask(new Request(`${baseUrl}/${created.id}`), {
        params: Promise.resolve({ id: String(created.id) }),
      });
      const data = await parseJson(response);

      expect(response.status).toBe(200);
      expect(data.id).toBe(created.id);
      expect(data.title).toBe("Lire doc");
    });

    it("returns 404 for unknown id", async () => {
      const response = await getTask(new Request(`${baseUrl}/999`), {
        params: Promise.resolve({ id: "999" }),
      });

      expect(response.status).toBe(404);
    });
  });

  describe("PATCH /api/tasks/:id", () => {
    it("updates a task partially and refreshes updatedAt", async () => {
      const created = await createSampleTask("Ancien titre");

      const response = await updateTask(
        new Request(`${baseUrl}/${created.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: "Nouveau titre" }),
        }),
        { params: Promise.resolve({ id: String(created.id) }) }
      );
      const data = await parseJson(response);

      expect(response.status).toBe(200);
      expect(data.title).toBe("Nouveau titre");
      expect(data.updatedAt).not.toBe(data.createdAt);
    });

    it("returns 404 for unknown id", async () => {
      const response = await updateTask(
        new Request(`${baseUrl}/999`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: "Modifié" }),
        }),
        { params: Promise.resolve({ id: "999" }) }
      );

      expect(response.status).toBe(404);
    });

    it("returns 400 for invalid priority", async () => {
      const created = await createSampleTask("Tâche");

      const response = await updateTask(
        new Request(`${baseUrl}/${created.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ priority: "invalid" }),
        }),
        { params: Promise.resolve({ id: String(created.id) }) }
      );

      expect(response.status).toBe(400);
    });
  });

  describe("DELETE /api/tasks/:id", () => {
    it("deletes a task and returns 204", async () => {
      const created = await createSampleTask("À supprimer");

      const response = await deleteTask(
        new Request(`${baseUrl}/${created.id}`, { method: "DELETE" }),
        { params: Promise.resolve({ id: String(created.id) }) }
      );

      expect(response.status).toBe(204);

      const getResponse = await getTask(new Request(`${baseUrl}/${created.id}`), {
        params: Promise.resolve({ id: String(created.id) }),
      });
      expect(getResponse.status).toBe(404);
    });

    it("returns 404 for unknown id", async () => {
      const response = await deleteTask(
        new Request(`${baseUrl}/999`, { method: "DELETE" }),
        { params: Promise.resolve({ id: "999" }) }
      );

      expect(response.status).toBe(404);
    });
  });

  async function createSampleTask(title: string, overrides = {}) {
    const response = await createTask(
      new Request(baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, priority: "medium", ...overrides }),
      })
    );
    return await parseJson(response);
  }

  async function seedMixedTasks() {
    await createSampleTask("Bug login", {
      description: "Le bouton ne répond pas sur Safari",
      priority: "high",
      category: "Frontend",
    });
    const docTask = await createSampleTask("Doc API", {
      priority: "low",
      category: "Backend",
    });
    // POST forces status to "todo", so use PATCH to set "done"
    await updateTask(
      new Request(`${baseUrl}/${docTask.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "done" }),
      }),
      { params: Promise.resolve({ id: String(docTask.id) }) }
    );
    await createSampleTask("Refacto DB", { priority: "medium", category: "Backend" });
  }
});
