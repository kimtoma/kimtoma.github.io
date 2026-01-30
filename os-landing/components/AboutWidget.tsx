import React, { useEffect, useState } from 'react';
import { ExternalLink, RefreshCw } from 'lucide-react';

interface AboutWidgetProps {
    isFocused?: boolean;
}

const STATIC_ABOUT = [
    "👋 Hello?",
    "안녕하세요 :) 최신 기술, 예술, 그리고 사람 사이의 접점을 고민하는 서비스 기획자 김경수입니다.",
    "요즘은 판교에 살면서, 서울 우면동에 있는 KT R&D 연구소에서 AI 에이전트 서비스를 기획하고 있어요.",
    "제가 지향하는 서비스는 “쓸모 있으면서도 사람을 향한 서비스” 에요.",
    "좋은 사람과 좋은 팀이 있어야 좋은 제품이 만들어진다고 믿습니다."
];

const AboutWidget: React.FC<AboutWidgetProps> = ({ isFocused = false }) => {
  const [paragraphs, setParagraphs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Instant load
  useEffect(() => {
    setLoading(false);
    setParagraphs(STATIC_ABOUT);
  }, [isFocused]);

  return (
    <div className={`w-full h-full flex flex-col ${isFocused ? 'bg-[#ffefe5] items-center' : ''}`}>
      {/* Header */}
      <div className={`flex justify-between items-center mb-2 shrink-0 border-b border-[#e86b58]/20 pb-1 ${isFocused ? 'w-full max-w-3xl pt-8 px-6 md:px-0' : ''}`}>
        <span className="font-cutive font-bold tracking-widest text-[#e86b58] text-xs">ABOUT.TXT</span>
        <div className="flex gap-2">
            <a href="https://kimtoma.com/about/" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-[#e86b58] transition-colors" title="Open Page">
                <ExternalLink size={12} />
            </a>
        </div>
      </div>

      {/* Content Area */}
      <div className={`flex-1 overflow-y-auto custom-scrollbar ${isFocused ? 'w-full max-w-2xl px-6 md:px-0 py-12' : 'pr-1'}`}>
        {loading ? (
           <div className="space-y-4 mt-2">
             <div className="h-4 bg-gray-400/10 rounded w-3/4 animate-pulse"></div>
             <div className="h-4 bg-gray-400/10 rounded w-full animate-pulse"></div>
           </div>
        ) : (
            <div className={`space-y-4 text-gray-800 leading-relaxed ${isFocused ? 'font-inter text-lg md:text-xl font-light' : 'font-caveat text-xl'}`}>
                {paragraphs.map((p, i) => (
                    <p key={i} className={i === 0 ? "font-bold text-[#e86b58]" : ""}>
                        {p}
                    </p>
                ))}
            </div>
        )}
      </div>
      
      {!loading && !isFocused && (
          <div className="mt-2 text-right">
              <span className="font-cutive text-[10px] text-gray-400">kimtoma.com</span>
          </div>
      )}
    </div>
  );
};

export default AboutWidget;