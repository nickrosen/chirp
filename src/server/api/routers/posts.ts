import { clerkClient } from "@clerk/nextjs";
import { UserResource } from "@clerk/types";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const filterUserForClient = (user:UserResource) => {
    return {
        id: user.id,
        userName: user.username,
        profileImageUrl: user.profileImageUrl,
    }
}

export const postsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts =  await ctx.prisma.post.findMany({
        take: 100,
    });

    const users = await clerkClient.users.getUserList({
        userId: posts.map((post) => post.authorId),
        limit: 100,
    })

    console.log({users})

    return posts.map((post) => {
        const author = users.find((user) => user.id === post.authorId);
        if(!author || !author.username) throw new TRPCError({code: "INTERNAL_SERVER_ERROR", message: "Author not found"})

        return {
            post,
            author,
        }
    })
    }),
    
});
