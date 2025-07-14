import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";
import { initializeDatabase } from "./db";

// Initialize database asynchronously without blocking startup
setTimeout(() => {
  Promise.race([
    initializeDatabase(),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database initialization timeout')), 5000)
    )
  ]).catch((error) => {
    console.error('Database initialization failed:', error);
  });
}, 100);

// app will be mounted at /api
const app = new Hono();

// Enable CORS for all routes
app.use("*", cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

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