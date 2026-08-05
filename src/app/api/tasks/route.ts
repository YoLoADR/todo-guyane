import { NextResponse, type NextRequest } from "next/server";
import { getDb } from "@/lib/db/client";
import { tasks } from "@/lib/db/schema";
import { createTaskSchema } from "@/lib/validations";
import { eq, and, like, or } from "drizzle-orm";

/**
 * GET /api/tasks — liste des tâches avec filtres (priority, category, status, q).
 * Filtres combinés en AND. Recherche q sur title + description (substring).
 */
export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const priority = searchParams.get("priority");
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const q = searchParams.get("q");

    const conditions = [];
    if (priority) conditions.push(eq(tasks.priority, priority as never));
    if (category) conditions.push(eq(tasks.category, category));
    if (status) conditions.push(eq(tasks.status, status as never));
    if (q) {
      conditions.push(
        or(
          like(tasks.title, `%${q}%`),
          like(tasks.description, `%${q}%`),
        )!,
      );
    }

    const result =
      conditions.length > 0
        ? await db.select().from(tasks).where(and(...conditions))
        : await db.select().from(tasks);

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/tasks error:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/tasks — crée une tâche.
 * Validation Zod (createTaskSchema). priority défaut "medium", status défaut "todo".
 * Retourne 201 avec la tâche créée, 400 si validation échoue.
 */
export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const body = await request.json();
    const result = createTaskSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          errors: result.error.issues.map((i) => ({
            field: i.path.join("."),
            message: i.message,
          })),
        },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();
    const [created] = await db
      .insert(tasks)
      .values({
        title: result.data.title,
        description: result.data.description ?? null,
        priority: result.data.priority,
        category: result.data.category ?? null,
        dueDate: result.data.dueDate ?? null,
        status: result.data.status,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { errors: [{ field: "body", message: "JSON invalide" }] },
        { status: 400 },
      );
    }
    console.error("POST /api/tasks error:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 },
    );
  }
}
