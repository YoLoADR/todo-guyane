import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { tasks } from "@/lib/db/schema";
import { updateTaskSchema, formatZodErrors } from "@/lib/validations";

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function getTaskById(id: number) {
  return db.select().from(tasks).where(eq(tasks.id, id)).get();
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const task = await getTaskById(Number(id));

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error(`GET /api/tasks/:id failed`, error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const numericId = Number(id);
    const existing = await getTaskById(numericId);

    if (!existing) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = updateTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { errors: formatZodErrors(parsed.error) },
        { status: 400 }
      );
    }

    const update = {
      ...parsed.data,
      updatedAt: new Date().toISOString(),
    };

    const result = db
      .update(tasks)
      .set(update)
      .where(eq(tasks.id, numericId))
      .returning()
      .get();

    return NextResponse.json(result);
  } catch (error) {
    console.error(`PATCH /api/tasks/:id failed`, error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const numericId = Number(id);
    const existing = await getTaskById(numericId);

    if (!existing) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    db.delete(tasks).where(eq(tasks.id, numericId)).run();

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`DELETE /api/tasks/:id failed`, error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
