import { useUser } from "@clerk/nextjs";
import { error } from "console";
import Image from "next/image";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { api } from "~/utils/api";
import LoadingSpinner, { LoadingPage } from "./LoadingSpiner";

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
    onError: (e) => {
      console.log({ F: e.data });
      const errorMsg = e.data?.zodError?.fieldErrors.content;
      if (errorMsg && errorMsg[0]) {
        return toast.error(errorMsg[0]);
      }
      toast.error("Something went wrong");
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
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            mutate({ content: input });
          }
        }}
      />
      {input !== "" && !isPosting && (
        <button onClick={() => mutate({ content: input })} disabled={isPosting}>
          Submit
        </button>
      )}
      {isPosting && (
        <div className="flex items-center justify-center">
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
};

export default CreatePostWizard;
