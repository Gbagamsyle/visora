"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";

export default function ProfileLink() {
  const { isLoaded, isSignedIn, user } = useUser();
  const name = user?.fullName || user?.primaryEmailAddress?.emailAddress || "Account";
  const initials = name
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  if (!isLoaded || !isSignedIn) {
    return <Link href="/login" className="topbar-profile" aria-label="Sign in">Sign in</Link>;
  }

  return (
    <Link href="/profile" className="avatar" aria-label={`Open profile for ${name}`}>
      {initials || "U"}
    </Link>
  );
}
