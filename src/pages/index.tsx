import { SignInButton, useUser } from "@clerk/nextjs";
import Head from "next/head";
import CreatePostWizard from "~/components/CreatePostWizard";
import PageLayout from "~/components/Layout";
import { LoadingPage } from "~/components/LoadingSpiner";
import PostView from "~/components/PostView";
import { api } from "~/utils/api";

const Feed = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();
  if (postsLoading) return <LoadingPage />;
  if (!data) throw new Error("Something went wrong");
  return (
    <div>
      {[...data]?.map((postWithUser) => (
        <PostView postWithUser={postWithUser} key={postWithUser?.post?.id} />
      ))}
    </div>
  );
};

export default function Home() {
  const { user, isLoaded: userLoaded, isSignedIn } = useUser();
  console.log({ user, isSignedIn, userLoaded });
  // start fetching asap let rq handle cacheing
  api.posts.getAll.useQuery();

  // if (!userLoaded && !postsLoaded) return <div></div>; //return empty div if both are loading since user loads faster than posts, don't want to block

  // if (!data) return <div>Something went wrong</div>;

  return (
    <PageLayout>
      <Head>
        <title>Chirp</title>
        <meta name="description" content="💭" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="border-b border-slate-500 p-4">
        {!isSignedIn && <SignInButton />}
        {isSignedIn && <CreatePostWizard />}
      </div>
      {isSignedIn && <Feed />}
    </PageLayout>
  );
}
