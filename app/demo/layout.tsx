import { requireChatGPTUser } from "../chatgpt-auth";

export const dynamic = "force-dynamic";

export default async function DemoLayout({ children }: { children: React.ReactNode }) {
  await requireChatGPTUser("/demo");
  return children;
}
