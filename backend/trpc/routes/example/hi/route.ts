import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";

export const hiProcedure = publicProcedure
  .query(() => {
    return {
      hello: "world",
      date: new Date(),
    };
  });