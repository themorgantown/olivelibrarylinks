import { LinkItem } from '@/lib/types';

interface LinkCardProps {
  link: LinkItem;
}

export default function LinkCard({ link }: LinkCardProps) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block w-full p-5 bg-white hover:bg-gray-50 border border-[#3a4b2066] rounded-lg shadow-sm transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md"
    >
      {link.image && (
        <div className="relative mb-3 overflow-hidden rounded-md aspect-[16/9] bg-gradient-to-br from-[#e6e9df] via-[#f2f3ed] to-[#e4e7db]">
          <img
            src={link.image}
            alt={link.title}
            loading="lazy"
            className="h-full w-full object-scale-down transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </div>
      )}

      <div className="flex items-center mb-2">
        <div className="w-1 h-12 bg-[#3a4b20] mr-3 rounded-full" />
        <h2 className="text-lg font-bold text-[#5B5B66]">{link.title}</h2>
      </div>

      {link.description && (
        <>
          <div className="w-full h-px bg-gray-200 my-2" />
          <p className="text-[#000] pt-1">{link.description}</p>
        </>
      )}
    </a>
  );
}
