import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { randomUUID } from "crypto";
import { compare, hash } from "bcryptjs";
import { SESSION_DURATION_MS, REFRESH_TOKEN_DAYS } from "./config";

const SESSION_COOKIE = "mie_session";
const REFRESH_COOKIE = "mie_refresh";

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return compare(password, hash);
}

export async function createSession(userId: string, persistent: boolean = false): Promise<string> {
  const sessionId = randomUUID();
  const duration = persistent 
    ? REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000 
    : SESSION_DURATION_MS;
  const expiresAt = new Date(Date.now() + duration);
  
  await prisma.session.create({
    data: {
      id: sessionId,
      userId,
      expiresAt,
      persistent: persistent,
    },
  });
  
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
  
  return sessionId;
}

export async function getSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  
  if (!sessionId) return null;
  
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });
  
  if (!session || session.expiresAt < new Date()) {
    await destroySession();
    return null;
  }
  
  return session;
}

export async function getUser() {
  const session = await getSession();
  return session?.user ?? null;
}

export async function requireUser() {
  const user = await getUser();
  if (!user) {
    throw new Error("Authentication required");
  }
  return user;
}

export async function destroySession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  
  if (sessionId) {
    await prisma.session.delete({ where: { id: sessionId } }).catch(() => {});
  }
  
  cookieStore.delete(SESSION_COOKIE);
  cookieStore.delete(REFRESH_COOKIE);
}

export async function createUser(email: string, name: string, password: string, role: string = "PROFESSOR") {
  const passwordHash = await hashPassword(password);
  
  return prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
      role,
    },
  });
}

export async function authenticateUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  
  if (!user || !user.isActive) return null;
  
  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return null;
  
  return user;
}

export async function extendSession() {
  const session = await getSession();
  if (!session) return null;
  
  const newExpiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  await prisma.session.update({
    where: { id: session.id },
    data: { expiresAt: newExpiresAt },
  });
  
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, session.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: newExpiresAt,
    path: "/",
  });
  
  return session;
}

export async function createDebateSession(userId: string, topic: string, contextData: string) {
  const sessionId = randomUUID();
  
  return prisma.debateSession.create({
    data: {
      id: sessionId,
      userId,
      topic,
      contextData,
      status: "ACTIVE",
      currentRole: "CHALLENGER",
    },
  });
}

export async function getDebateHistory(userId: string, limit: number = 10) {
  return prisma.debateSession.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      feedback: true,
      _count: { select: { messages: true } },
    },
  });
}

export async function addDebateMessage(
  sessionId: string,
  role: "user" | "assistant",
  content: string,
  aiRole?: string
) {
  return prisma.debateMessage.create({
    data: {
      sessionId,
      role,
      content,
      aiRole: aiRole ?? null,
    },
  });
}

export async function addDebateFeedback(
  sessionId: string,
  rating: number,
  notes?: string
) {
  return prisma.debateFeedback.create({
    data: {
      sessionId,
      rating,
      notes,
    },
  });
}

export async function updateAIBehavior(sessionId: string, behaviorAdjustments: string) {
  const session = await prisma.debateSession.findUnique({
    where: { id: sessionId },
  });
  
  if (!session) return null;
  
  const currentAdjustments = session.aiBehaviorAdjustments ?? "";
  const newAdjustments = currentAdjustments 
    ? `${currentAdjustments}; ${behaviorAdjustments}`
    : behaviorAdjustments;
  
  return prisma.debateSession.update({
    where: { id: sessionId },
    data: { aiBehaviorAdjustments: newAdjustments },
  });
}
