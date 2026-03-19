import { Metadata } from 'next';
import { getProject } from '@/lib/appwrite';

type Props = {
  params: Promise<{ projectId: string }>
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const projectId = resolvedParams.projectId;
  
  if (!projectId) {
    return { title: "Play | Backing & Score" };
  }

  try {
    const project = await getProject(projectId);
    return {
      title: `${project.name} | Backing & Score`,
      description: `Bản nhạc: ${project.name} (${project.difficulty || 'Normal'}) - Backing & Score`,
      openGraph: {
        title: `${project.name} | Backing & Score`,
        description: `Bản nhạc: ${project.name} (${project.difficulty || 'Normal'})`,
        type: "website"
      },
      twitter: {
        card: "summary_large_image",
        title: `${project.name} | Backing & Score`,
        description: `Bản nhạc: ${project.name} (${project.difficulty || 'Normal'})`
      }
    };
  } catch (e) {
    return {
      title: "Play | Backing & Score"
    };
  }
}

export default function PlayLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
