import Head from "next/head";
import { api } from "~/utils/api";
import type { GetStaticProps } from "next";
import PageLayout from "~/components/Layout";
import Image from "next/image";
import { LoadingPage } from "~/components/LoadingSpiner";
import PostView from "~/components/PostView";
import { generateSSGHelper } from "~/server/helpers/ssgHelpers";

const SinglePostPage = ({ id }: { id: string }) => {
  const { data } = api.posts.getById.useQuery({
    id,
  });

  // if (isLoading) return <div>Loading...</div>;
  console.log({ data });
  if (!data) return <div>404 Something went wrong</div>;

  return (
    <>
      <Head>
        <title>{`${data.post.content} - ${data.author.username}`}</title>
      </Head>
      <PageLayout>
        <PostView postWithUser={data} />
      </PageLayout>
    </>
  );
};

export default SinglePostPage;

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper();

  const id = context.params?.id as string;

  if (!id) {
    throw new Error("No slug");
  }

  await ssg.posts.getById.prefetch({ id });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      id,
    },
  };
};

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};
