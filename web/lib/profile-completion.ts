// Profile completion: six checkpoints, each worth the same share. Pure logic, shared by the dashboard and resume pages.
export type CompletionInput = {
  name: string;
  headline: string;
  verifiedSkills: number;
  claimedSkills: number;
  profileEntries: number;
  careerInterests: number;
};

export type CompletionItem = { label: string; done: boolean; href: string };

export function completionItems(input: CompletionInput): CompletionItem[] {
  return [
    { label: "Name", done: input.name.trim().length > 0, href: "/profile" },
    { label: "Headline", done: input.headline.trim().length > 0, href: "/profile" },
    { label: "A verified skill", done: input.verifiedSkills > 0, href: "/skills" },
    { label: "A claimed skill from your resume", done: input.claimedSkills > 0, href: "/resume/upload" },
    { label: "An education, project or experience entry", done: input.profileEntries > 0, href: "/profile" },
    { label: "A career interest", done: input.careerInterests > 0, href: "/profile" },
  ];
}

export function completionPercent(items: CompletionItem[]): number {
  if (items.length === 0) return 0;
  return Math.round((100 * items.filter((item) => item.done).length) / items.length);
}
