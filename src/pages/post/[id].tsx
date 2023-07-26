import Head from "next/head";
import { api } from "~/utils/api";

export default function SinglePostPage() {
  return (
    <>
      <Head>
        <title>Post</title>
        <meta name="description" content="💭" />
      </Head>
      <main className="flex h-screen justify-center">
        <div className="w-full border-x border-slate-500 md:max-w-2xl">
          <div className="border-b border-slate-500 p-4">Post view</div>
        </div>
      </main>
    </>
  );
}
