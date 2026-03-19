import { Metadata } from 'next';
import { getProject } from '@/lib/appwrite';
import ShareClientPage from './share-client';

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(searchParams);
  const projectId = typeof resolvedParams.p === 'string' ? resolvedParams.p : undefined;
  
  if (!projectId) {
    return { title: "Shared Project | Backing & Score" };
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
      title: "Shared Project | Backing & Score"
    };
  }
}

export default function SharePageWrapper() {
  return <ShareClientPage />;
}
