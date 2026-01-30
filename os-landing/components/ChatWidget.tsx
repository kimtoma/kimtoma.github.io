import React from 'react';
import { MessageCircle, ExternalLink } from 'lucide-react';

const ChatWidget: React.FC = () => {
  return (
    <a
      href="https://chat.kimtoma.com"
      target="_blank"
      rel="noopener noreferrer"
      className="block h-full w-full group"
    >
      <div className="h-full flex flex-col items-center justify-center p-4 text-center">
        <div className="relative mb-4">
          <img
            src="https://github.com/kimtoma.png"
            alt="kimtoma"
            className="w-16 h-16 rounded-full border-2 border-white shadow-md group-hover:scale-105 transition-transform"
          />
          <div className="absolute -bottom-1 -right-1 bg-[#e86b58] rounded-full p-1.5 shadow-md">
            <MessageCircle size={14} className="text-white" />
          </div>
        </div>

        <h3 className="font-caveat text-xl text-gray-800 mb-1 group-hover:text-[#e86b58] transition-colors">
          Chat with me
        </h3>

        <p className="font-inter text-xs text-gray-500 mb-3 leading-relaxed">
          AI 에이전트, UX 디자인,<br/>
          서비스 기획에 대해 물어보세요
        </p>

        <div className="flex items-center gap-1 font-cutive text-[10px] text-[#e86b58] group-hover:underline">
          <span>START CHAT</span>
          <ExternalLink size={10} />
        </div>
      </div>
    </a>
  );
};

export default ChatWidget;
