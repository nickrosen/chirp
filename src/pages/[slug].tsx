import Head from "next/head";
import { api } from "~/utils/api";
import type { GetStaticProps, InferGetStaticPropsType, NextPage } from "next";
import PageLayout from "~/components/Layout";
import Image from "next/image";
import { LoadingPage } from "~/components/LoadingSpiner";
import PostView from "~/components/PostView";
import { generateSSGHelper } from "~/server/helpers/ssgHelpers";

type PageProps = InferGetStaticPropsType<typeof getStaticProps>;

const ProfileFeed = (props: { userId: string }) => {
  const { data, isLoading } = api.posts.getPostsByUserId.useQuery({
    userId: props.userId,
  });

  if (isLoading) return <LoadingPage />;

  if (!data || data.length === 0) return <div>User has not posted</div>;

  return (
    <div className="flex flex-col">
      {data.map((fullPost) => (
        <PostView postWithUser={fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

const ProfilePage = ({ username }: { username: string }) => {
  const { data, isLoading, error } = api.profile.getUserByUsername.useQuery({
    username,
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
        <ProfileFeed userId={data.id} />
      </PageLayout>
    </>
  );
};

export default ProfilePage;

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper();

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
