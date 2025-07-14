import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";
import { initializeDatabase } from "./db";

// Initialize database synchronously to ensure it's ready before handling requests
let dbInitialized = false;

// Initialize database immediately
initializeDatabase()
  .then(() => {
    dbInitialized = true;
    console.log('Database initialized successfully');
  })
  .catch((error) => {
    console.error('Database initialization failed:', error);
    dbInitialized = false;
  });

// app will be mounted at /api
const app = new Hono();

// Enable CORS for all routes with more permissive settings
app.use("*", cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
  allowHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  credentials: false,
}));

// Add request logging middleware
app.use("*", async (c, next) => {
  const start = Date.now();
  console.log(`[${new Date().toISOString()}] ${c.req.method} ${c.req.path}`);
  await next();
  const end = Date.now();
  console.log(`[${new Date().toISOString()}] ${c.req.method} ${c.req.path} - ${end - start}ms`);
});

// Add middleware to check database initialization (but allow some endpoints to work)
app.use("/trpc/*", async (c, next) => {
  // Allow example.hi to work even without database for testing
  const path = c.req.path;
  if (path.includes('example.hi') || path.includes('example/hi')) {
    await next();
    return;
  }
  
  if (!dbInitialized) {
    return c.json({ 
      error: 'Database not initialized yet. Please wait a moment and try again.',
      timestamp: new Date().toISOString()
    }, 503);
  }
  await next();
});

// Mount tRPC router at /trpc
app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    createContext,
  })
);

// Simple health check endpoint
app.get("/", (c) => {
  return c.json({ 
    status: "ok", 
    message: "PAKA Go API is running", 
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    database: dbInitialized ? "connected" : "initializing"
  });
});

// Add a test endpoint
app.get("/test", (c) => {
  return c.json({ 
    message: "Test endpoint working", 
    data: { hello: "world" },
    timestamp: new Date().toISOString(),
    database: dbInitialized ? "ready" : "not ready"
  });
});

// Add a simple ping endpoint
app.get("/ping", (c) => {
  return c.json({ pong: true, timestamp: new Date().toISOString() });
});

// Add a debug endpoint to check tRPC setup
app.get("/debug", (c) => {
  return c.json({ 
    message: "Debug endpoint", 
    trpcMounted: true,
    timestamp: new Date().toISOString(),
    database: dbInitialized,
    routes: {
      health: "/api/",
      ping: "/api/ping",
      test: "/api/test",
      trpc: "/api/trpc/*"
    },
    headers: Object.fromEntries(c.req.raw.headers.entries())
  });
});

export default app;