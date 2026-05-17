import type { Metadata } from "next";
import { UserLayout } from "@/components/user/UserLayout";

export const metadata: Metadata = {
  title: "Dashboard — THRIYON",
  description: "Your sovereign creative workspace.",
};

export default function UserSpaceLayout({ children }: { children: React.ReactNode }) {
  return <UserLayout>{children}</UserLayout>;
}
