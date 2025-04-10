import { Link } from '@/lib/google-sheets';

interface LinkCardProps {
  link: Link;
}

export default function LinkCard({ link }: LinkCardProps) {
  // Get domain name for aria-label
  const domain = new URL(link.url).hostname.replace('www.', '');
  
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="w-full p-4 bg-[#d9d9d9] transition-all duration-300 mb-4 text-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
      aria-label={`${link.title} - ${domain}`}
    >
      <h2 className="text-xl font-bold text-[#5B5B66] mb-1">{link.title}</h2>
      {link.description && (
        <p className="text-[#5B5B66] text-sm">{link.description}</p>
      )}
    </a>
  );
}
