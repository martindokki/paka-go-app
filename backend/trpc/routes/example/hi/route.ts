import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { db } from "../../../db/index";
import * as schema from "../../../db/schema";

export const hiProcedure = publicProcedure
  .query(async () => {
    try {
      // Try database connection but don't fail if it's not available
      let dbStatus = "not_tested";
      let userCount = 0;
      
      try {
        const result = await db.select().from(schema.users).limit(1);
        dbStatus = "connected";
        userCount = result.length;
      } catch (dbError) {
        console.warn('Database not available in hi procedure:', dbError);
        dbStatus = "unavailable";
      }
      
      return {
        hello: "world from PAKA Go API!",
        date: new Date(),
        database: dbStatus,
        userCount,
        message: "tRPC is working correctly",
        version: "1.0.0"
      };
    } catch (error) {
      console.error('Error in hi procedure:', error);
      // Still return a successful response for testing
      return {
        hello: "world (with errors)",
        date: new Date(),
        database: "error",
        error: error instanceof Error ? error.message : 'Unknown error',
        message: "tRPC is working but with issues"
      };
    }
  });