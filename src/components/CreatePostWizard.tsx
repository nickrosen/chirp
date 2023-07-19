import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useState } from "react";
import { api } from "~/utils/api";

const CreatePostWizard = () => {
  const [input, setInput] = useState("");
  const user = useUser();
  const ctx = api.useContext();
  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      // await ctx.posts.getAll.invalidate();
      void ctx.posts.getAll.invalidate(); //use void to tell ts no need to await
    },
  });
  if (!user.isSignedIn) return null;

  return (
    <div className="flex w-full gap-3">
      <Image
        src={user.user.profileImageUrl}
        alt="profile pic"
        className="h-14 w-14 rounded-full"
        width={56}
        height={56}
      />
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type some emojis"
        className="grow bg-transparent outline-none"
        disabled={isPosting}
      />
      <button onClick={() => mutate({ content: input })}>Submit</button>
    </div>
  );
};

export default CreatePostWizard;
