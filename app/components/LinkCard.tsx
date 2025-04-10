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
      className="block w-full p-5 bg-white hover:bg-gray-50 border border-[#d9d9d9] rounded-lg shadow-sm transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md"
    >
      <div className="flex items-center mb-2">
        <div className="w-1 h-12 bg-[#3a4b20] mr-3 rounded-full"></div>
        <h2 className="text-lg font-bold text-[#5B5B66]">{link.title}</h2>
      </div>
      
      {link.description && (
        <>
          <div className="w-full h-px bg-gray-200 my-2"></div>
          <p className="text-[#5B5B66] text-sm pt-1">{link.description}</p>
        </>
      )}
    </a>
  );
}
