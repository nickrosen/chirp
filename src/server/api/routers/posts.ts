import { clerkClient } from "@clerk/nextjs";
import type { User } from "@clerk/nextjs/dist/types/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";

const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    userName: user.username,
    profileImageUrl: user.profileImageUrl,
  };
};

import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
import { Redis } from "@upstash/redis";

// Create a new ratelimiter, that allows 3 requests per 1 minute
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
  /**
   * Optional prefix for the keys used in redis. This is useful if you want to share a redis
   * instance with other applications and want to avoid key collisions. The default prefix is
   * "@upstash/ratelimit"
   */
  prefix: "@upstash/ratelimit",
});

export const postsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      take: 100,
      orderBy: {
        createdAt: "desc",
      },
    });

    const userId = posts.map((post) => post.authorId);
    const users = (
      await clerkClient.users.getUserList({
        userId: userId,
        limit: 110,
      })
    ).map(filterUserForClient);

    console.log({ users });

    return posts.map((post) => {
      const author = users.find((user) => user.id === post.authorId);
      if (!author || !author.userName)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Author not found",
        });

      return {
        post,
        author: {
          ...author,
          userName: author.userName,
        },
      };
    });
  }),

  create: privateProcedure
    .input(
      z.object({
        // string is used as error message if validation fails
        content: z
          .string()
          .emoji("Only emojis are welcome here")
          .min(1)
          .max(280), // cvalidate emoji
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.userId ?? "";

      const { success } = await ratelimit.limit(authorId);
      if (!success)
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Too many requests",
        });
      const post = await ctx.prisma.post.create({
        data: {
          authorId,
          content: input.content,
        },
      });
      return post;
    }),
});
