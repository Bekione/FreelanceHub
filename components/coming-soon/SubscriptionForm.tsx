"use client";

import React, { useState } from "react";
import { z } from "zod";

const emailSchema = z.email("Please enter a valid email!");

const LoaderIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-loader-circle animate-spin"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
};

const SubscriptionForm: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const handleNotify = async () => {
    try {
      // Validate email using Zod
      emailSchema.parse(email);

      setIsLoading(true);
      setIsError(false);

      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      setMessage("Thanks, We will notify you!");
      setIsError(false);
      setTimeout(() => setMessage(""), 3000);
      setEmail("");
    } catch (error) {
      if (error instanceof z.ZodError) {
        setMessage(error.issues[0].message);
      } else if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage("Something went wrong. Please try again!");
      }
      setIsError(true);
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative mt-4 mx-auto h-14 flex items-center gap-2 p-2 glass-strong rounded-full shadow-lg max-w-md">
      <input
        type="email"
        placeholder="your email here"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleNotify();
          }
        }}
        className="rounded-full outline-none inline-block px-5 w-full h-10 relative bg-transparent font-thin placeholder:text-white/60 text-white"
      />
      <button
        onClick={handleNotify}
        className="group relative ml-auto inline-flex w-fit overflow-hidden rounded-full p-px h-10 focus:outline-none"
        disabled={isLoading}
        style={{ minWidth: "100px" }}
      >
        <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-primary group-hover:bg-primary/80 transition duration-200 text-sm font-medium text-white px-3 backdrop-blur-3xl">
          {isLoading ? <LoaderIcon /> : "Notify Me"}
        </span>
      </button>

      {message && (
        <div
          className={`absolute top-16 left-1/2 w-8/12 transform -translate-x-1/2 text-sm text-center py-2 px-4 rounded-lg ${
            isError ? "text-red-500" : "text-white"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
};

export default SubscriptionForm;
