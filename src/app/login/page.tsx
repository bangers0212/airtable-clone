"use server";

import { redirect } from "next/navigation";
import { getServerAuthSession } from "~/server/auth";
import LoginForm from "./_components/LoginForm";
import Image from "next/image";

export default async function LoginPage() {
  const session = await getServerAuthSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex h-screen">
      <div className="flex w-full flex-col items-center justify-center lg:w-1/2">
        <LoginForm />
      </div>
      <div className="hidden flex-1 items-center justify-center lg:flex">
        <div className="relative h-[590px] w-[395px] cursor-pointer overflow-hidden rounded-2xl transition-transform duration-300 hover:scale-105">
          <Image
            src="/images/login-image.png"
            alt="AI image"
            fill
            priority
            unoptimized
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
}
