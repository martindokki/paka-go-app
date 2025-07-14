import { publicProcedure } from "../../../create-context";

export const hiProcedure = publicProcedure
  .query(async () => {
    try {
      console.log('Hi procedure called successfully');
      
      return {
        hello: "world from PAKA Go API!",
        date: new Date(),
        message: "tRPC is working correctly",
        version: "1.0.0",
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Error in hi procedure:', error);
      // Still return a successful response for testing
      return {
        hello: "world (with errors)",
        date: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
        message: "tRPC is working but with issues"
      };
    }
  });