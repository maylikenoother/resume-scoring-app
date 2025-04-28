"use client";

import { useAuth } from "@clerk/nextjs"; // ✅ Correct for Clerk
import { SignIn } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) {
      router.push("/dashboard"); // ✅ Redirect automatically
    }
  }, [isSignedIn, router]);

  if (isSignedIn) {
    return null;
  }

  return (
    <div>
      <SignIn routing="hash" />
    </div>
  );
}
