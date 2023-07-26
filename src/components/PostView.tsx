import type { RouterOutputs } from "~/utils/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import Link from "next/link";
dayjs.extend(relativeTime);

type PostWithAuthor = RouterOutputs["posts"]["getAll"][number];

interface PostViewProps {
  postWithUser: PostWithAuthor;
}
const PostView = ({ postWithUser }: PostViewProps) => {
  const { post, author } = postWithUser;
  console.log({ post, author });
  return (
    <div key={post.id} className="flex gap-3 border-b border-slate-500 p-4">
      <Image
        src={author.profileImageUrl}
        className="h-14 w-14 rounded-full"
        width={56}
        height={56}
        alt={`${author?.username}'s profile picture`}
      />
      <div className="flex flex-col">
        <div className="flex gap-x-2 text-slate-300">
          <Link href={`/@${author.username}`}>
            <span>{`@${author?.username}`}</span> ·{" "}
          </Link>
          <Link href={`/post/${post.id}`}>
            <span>{dayjs(post.createdAt).fromNow()}</span>
          </Link>
        </div>
        <span className="text-[24px]">{post.content}</span>
      </div>
    </div>
  );
};
export default PostView;
