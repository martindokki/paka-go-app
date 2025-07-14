import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { db, schema } from "../../../db";

export const hiProcedure = publicProcedure
  .query(async () => {
    try {
      // Test database connection
      const result = await db.select().from(schema.users).limit(1);
      return {
        hello: "world",
        date: new Date(),
        database: "connected",
        userCount: result.length
      };
    } catch (error) {
      console.error('Database error in hi procedure:', error);
      return {
        hello: "world",
        date: new Date(),
        database: "error",
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });