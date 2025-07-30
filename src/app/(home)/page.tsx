"use client"

import { ProjectForm } from "@/modules/home/ui/components/project-form";
import { ProjectsList } from "@/modules/home/ui/components/projects-list";
import Image from "next/image";

const Page = () => {
  return (
    <div className="flex flex-col max-w-5xl mx-auto w-full">
      <section className="space-y-6 py-[16vh] 2xl:py-48">
        <div className="flex items-center justify-center gap-4">
          <h1 className="text-2xl md:text-5xl font-bold">
            Build something with
          </h1>
          <Image
            src="/lovable-logo-icon.svg"
            alt="Lovable"
            width={40}
            height={40}
            className="inline-block"
          />
          <h1 className="text-2xl md:text-5xl font-bold">Lovable</h1>
        </div>
        <p className="text-lg md:text-xl text-muted-foreground text-center">
          Create apps and websites by chatting with AI
        </p>
        <div className="max-w-3xl mx-auto w-full">
          <ProjectForm />
        </div>
      </section>
      <ProjectsList />
    </div>
  );
};

export default Page;
