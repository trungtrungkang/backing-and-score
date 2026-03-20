import { Metadata } from 'next';
import { getPlaylist } from '@/lib/appwrite/playlists';

export async function generateMetadata({ params }: { params: Promise<{ playlistId: string }> }): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const pl = await getPlaylist(resolvedParams.playlistId);

    // Fallback default image or use the Playlist cover Image ID if present
    const ogImage = pl.coverImageId 
        ? `https://cloud.appwrite.io/v1/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID}/files/${pl.coverImageId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`
        : 'https://backingscore.com/apple-icon.png'; // Fallback stock icon

    return {
      title: `${pl.name} - Backing & Score`,
      description: pl.description || `Listen to ${pl.name} by User ${pl.ownerId.substring(0, 8)} on Backing & Score.`,
      openGraph: {
        title: `${pl.name} | Collection`,
        description: pl.description || `Listen to ${pl.projectIds?.length || 0} curated tracks.`,
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: pl.name,
          },
        ],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: pl.name,
        description: pl.description || `Discover ${pl.projectIds?.length || 0} curated tracks.`,
        images: [ogImage],
      },
    };
  } catch (error) {
    return {
      title: 'Collection - Backing & Score',
      description: 'Discover curated collections of interactive musical scores.',
    };
  }
}

export default function CollectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
