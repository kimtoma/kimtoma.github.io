import React from 'react';
import { FileText, ExternalLink } from 'lucide-react';

interface BlogPost {
  title: string;
  date: string;
  link: string;
}

const RECENT_POSTS: BlogPost[] = [
  { title: "모바일 O/S 별 버전 점유율 확인하기", date: "2023.08", link: "https://blog.kimtoma.com/2023/08/24/mobile-os-usage/" },
  { title: "2022 디자이너가 알아야 할 주요 트렌드", date: "2022.01", link: "https://blog.kimtoma.com/2022/01/06/2022-trends-designers-should-know/" },
  { title: "2021년 회고", date: "2021.12", link: "https://blog.kimtoma.com/2021/12/31/retrospective-2021/" },
  { title: "UI를 여행하는 디자이너를 위한 안내서 - 스위치", date: "2021.09", link: "https://blog.kimtoma.com/2021/09/14/the-designers-guide-to-the-ui-switches/" },
  { title: "UI를 여행하는 디자이너를 위한 안내서 - 버튼", date: "2021.02", link: "https://blog.kimtoma.com/2021/02/10/the-designers-guide-to-the-ui-button/" },
];

const BlogListWidget: React.FC = () => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
        <FileText size={14} className="text-[#e86b58]" />
        <span className="font-cutive text-xs text-gray-500 uppercase tracking-wider">Recent Posts</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {RECENT_POSTS.map((post, index) => (
          <a
            key={index}
            href={post.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-2 rounded hover:bg-white/50 transition-colors group"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="font-inter text-sm text-gray-700 group-hover:text-[#e86b58] transition-colors line-clamp-1">
                {post.title}
              </span>
              <ExternalLink size={12} className="text-gray-400 group-hover:text-[#e86b58] shrink-0 mt-1" />
            </div>
            <span className="font-cutive text-[10px] text-gray-400">{post.date}</span>
          </a>
        ))}
      </div>

      <div className="pt-2 mt-2 border-t border-gray-200">
        <a
          href="https://blog.kimtoma.com/archive"
          target="_blank"
          rel="noopener noreferrer"
          className="font-cutive text-[10px] text-[#e86b58] hover:underline flex items-center gap-1"
        >
          VIEW ALL POSTS <ExternalLink size={8} />
        </a>
      </div>
    </div>
  );
};

export default BlogListWidget;
