"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);

  const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const emailIsValid = isValidEmail(email);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const submitter = (e.nativeEvent as SubmitEvent)
      .submitter as HTMLButtonElement | null;
    const action = submitter?.value;

    // only handle Google authentication for now
    if (action === "google") {
      await signIn("google", { callbackUrl: "/dashboard" });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-amber flex flex-col items-center gap-4"
    >
      <div className="w-full">
        <Image
          src="/images/logo.svg"
          width={42}
          height={35}
          alt="Airtable logo"
          unoptimized
          priority
        />
      </div>
      <div className="my-10 w-full text-3xl">Sign in to Airtable</div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="email"
          className="w-[500px] self-start font-medium text-gray-700"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          name="email"
          placeholder="Email address"
          autoFocus
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setTouched(true);
          }}
          className={`h-[40px] w-[500px] rounded px-3 shadow focus:outline-none ${
            touched && !emailIsValid
              ? "border border-red-500 focus:border-red-500"
              : "border border-gray-300 focus:border-blue-500"
          }`}
        />
        {touched && !emailIsValid && (
          <p className="w-[500px] self-start text-sm text-red-600">
            Invalid email
          </p>
        )}
      </div>

      <button
        className={`mt-2 h-[40px] w-[500px] rounded shadow transition ${
          emailIsValid
            ? "cursor-pointer bg-blue-700 text-white"
            : "bg-blue-300 text-white"
        }`}
        type="submit"
        name="action"
        value="email"
        disabled={!emailIsValid}
      >
        Continue
      </button>

      <div className="my-2 flex items-center gap-2 text-gray-500">or</div>

      <button
        className="h-[40px] w-[500px] cursor-pointer rounded border border-gray-300 shadow hover:shadow-md"
        type="submit"
        name="action"
        value="sso"
      >
        Sign in with <b>Single Sign On</b>
      </button>
      <button
        className="h-[40px] w-[500px] cursor-pointer rounded border border-gray-300 shadow hover:shadow-md"
        type="submit"
        name="action"
        value="google"
      >
        <span className="flex items-center justify-center gap-2">
          <Image
            src="/images/google.svg"
            width={18}
            height={18}
            alt="Google logo"
            unoptimized
            priority
          />
          <>
            Continue with <b className="ml-[-3]">Google</b>
          </>
        </span>
      </button>
      <button
        className="h-[40px] w-[500px] cursor-pointer rounded border border-gray-300 shadow hover:shadow-md"
        type="submit"
        name="action"
        value="apple"
      >
        <span className="flex items-center justify-center gap-2">
          <Image
            src="/images/apple.svg"
            width={18}
            height={18}
            alt="Apple logo"
            unoptimized
            priority
          />
          <>
            Continue with <b className="ml-[-3]">Apple ID</b>
          </>
        </span>
      </button>

      <div className="mt-15 w-full text-sm text-gray-600">
        New to Airtable?{" "}
        <Link
          href="/login"
          className="text-blue-600 underline hover:no-underline"
        >
          Create an account
        </Link>{" "}
        instead.
      </div>
    </form>
  );
}
