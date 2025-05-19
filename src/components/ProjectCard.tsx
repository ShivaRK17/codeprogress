import Link from 'next/link';

interface ProjectCardProps {
  id: string;
  title: string;
  created_at: string;
}

export default function ProjectCard({ id, title, created_at }: ProjectCardProps) {
  return (
    <div className="border rounded p-4 mb-4 hover:shadow-md transition-shadow">
      <Link href={`/project/${id}`} className="block">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-gray-500">Created: {new Date(created_at).toLocaleDateString()}</p>
      </Link>
    </div>
  );
} 