import { z } from "zod";
import { publicProcedure } from "../../create-context.js";

export const hiProcedure = publicProcedure
  .query(() => {
    return {
      hello: "world",
      date: new Date(),
    };
  });