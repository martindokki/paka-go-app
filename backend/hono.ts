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

// Enable CORS for all routes
app.use("*", cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Add middleware to check database initialization
app.use("/trpc/*", async (c, next) => {
  if (!dbInitialized) {
    return c.json({ error: 'Database not initialized' }, 503);
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
  return c.json({ status: "ok", message: "API is running", timestamp: new Date().toISOString() });
});

// Add a test endpoint
app.get("/test", (c) => {
  return c.json({ message: "Test endpoint working", data: { hello: "world" } });
});

// Add a debug endpoint to check tRPC setup
app.get("/debug", (c) => {
  return c.json({ 
    message: "Debug endpoint", 
    trpcMounted: true,
    timestamp: new Date().toISOString(),
    routes: {
      health: "/api/",
      test: "/api/test",
      trpc: "/api/trpc/*"
    }
  });
});

export default app;