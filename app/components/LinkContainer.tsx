"use client";

import { LinkItem } from '@/lib/types';
import LinkCard from './LinkCard';

interface LinkContainerProps {
  links: LinkItem[];
}

export default function LinkContainer({ links }: LinkContainerProps) {
  return (
    <div className="w-full max-w-6xl mx-auto">
      {links.length === 0 ? (
        <div className="text-center p-6 bg-[#d9d9d9] shadow rounded-md">
          <p className="text-[#5B5B66]">No links available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {links.map((link, index) => (
            <LinkCard key={`${link.url}-${index}`} link={link} />
          ))}
        </div>
      )}
    </div>
  );
}
