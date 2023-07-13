import { useUser } from "@clerk/nextjs";
import Image from "next/image";

const CreatePostWizard = () => {
  const user = useUser();
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
        placeholder="Type some emojis"
        className="grow bg-transparent outline-none"
      />
    </div>
  );
};

export default CreatePostWizard;
