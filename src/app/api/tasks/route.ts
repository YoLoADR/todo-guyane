import { NextResponse } from "next/server";
import { eq, and, like, or } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { tasks } from "@/lib/db/schema";
import { createTaskSchema, Priority, Status, formatZodErrors } from "@/lib/validations";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const priority = searchParams.get("priority");
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const q = searchParams.get("q");

    const conditions = [];

    if (priority) {
      conditions.push(eq(tasks.priority, priority as Priority));
    }
    if (status) {
      conditions.push(eq(tasks.status, status as Status));
    }
    if (category) {
      conditions.push(eq(tasks.category, category));
    }
    if (q) {
      const term = `%${q}%`;
      conditions.push(
        or(like(tasks.title, term), like(tasks.description, term))
      );
    }

    const result = await db
      .select()
      .from(tasks)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/tasks failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { errors: formatZodErrors(parsed.error) },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const insert = {
      ...parsed.data,
      status: "todo" as const,
      createdAt: now,
      updatedAt: now,
    };

    const result = db.insert(tasks).values(insert).returning().get();

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("POST /api/tasks failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
