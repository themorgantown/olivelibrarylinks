import { Link } from '@/lib/google-sheets';

interface LinkCardProps {
  link: Link;
}

export default function LinkCard({ link }: LinkCardProps) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="w-full p-4 bg-[#d9d9d9] hover:bg-[#d9d9d9cc] transition-all duration-300 transform hover:-translate-y-1 mb-4 text-center"
    >
      <h2 className="text-xl font-bold text-[#5B5B66] mb-1">{link.title}</h2>
      {link.description && (
        <p className="text-[#5B5B66] text-sm">{link.description}</p>
      )}
    </a>
  );
}
