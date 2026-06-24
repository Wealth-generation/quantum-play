import { UserProfile, resolveUserProfileTab } from "@/widgets/user-profile";

interface UserPageProps {
  searchParams: Promise<{
    tab?: string | string[];
  }>;
}

export default async function UserPage({ searchParams }: UserPageProps) {
  const { tab } = await searchParams;

  return <UserProfile activeTab={resolveUserProfileTab(tab)} />;
}
