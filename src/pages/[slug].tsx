import Head from "next/head";
import { api } from "~/utils/api";
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import superjson from "superjson";
import { createServerSideHelpers } from "@trpc/react-query/server";
import type { GetStaticProps, InferGetStaticPropsType, NextPage } from "next";
import PageLayout from "~/components/Layout";
import Image from "next/image";

type PageProps = InferGetStaticPropsType<typeof getStaticProps>;

const ProfilePage: NextPage<PageProps> = ({
  username,
}: {
  username: string;
}) => {
  const { data, isLoading, error } = api.profile.getUserByUsername.useQuery({
    username: "nickrosen",
  });
  if (isLoading) return <div>Loading...</div>;
  if (error || !data) return <div>Something went wrong</div>;
  console.log({ data });

  return (
    <>
      <Head>
        <title>{data.username}</title>
      </Head>
      <PageLayout>
        <div className="relative h-48  bg-slate-600">
          <Image
            src={data.profileImageUrl}
            alt="profile pic"
            width={128}
            height={128}
            className="absolute bottom-0 left--0 -mb-[64px] ml-4 rounded-full border-4 border-black bg-black"
          />
        </div>
        <div className="h-[64px]"></div>
        <div className="p-4 text-2xl">{`@${data.username}`}</div>
        <div className="w-full border-b border-slate-400" />
      </PageLayout>
    </>
  );
};

export default ProfilePage;

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, userId: null },
    transformer: superjson, // optional - adds superjson serialization
  });

  const slug = context.params?.slug as string;

  if (!slug) {
    throw new Error("No slug");
  }

  const username: string = slug.replace("@", "");

  await ssg.profile.getUserByUsername.prefetch({ username });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      username,
    },
  };
};

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};
