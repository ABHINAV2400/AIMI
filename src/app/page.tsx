import { prisma } from "@/lib/db";

const Page = async () => {
  const users = await prisma.post.findMany();

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      {JSON.stringify(users, null, 2)}
    </div>
  );
};

export default Page;
