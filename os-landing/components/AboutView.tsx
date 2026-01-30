import React from 'react';
import { MapPin, Calendar, Award, Wrench, Globe, ExternalLink } from 'lucide-react';

interface AboutViewProps {
  isDark?: boolean;
}

const AboutView: React.FC<AboutViewProps> = ({ isDark = false }) => {
  // Dark mode colors
  const bgCard = isDark ? 'bg-[#2a2420]' : 'bg-[#fdfbf7]';
  const borderCard = isDark ? 'border-[#3a3430]' : 'border-[#e5e0d8]';
  const textPrimary = isDark ? 'text-gray-100' : 'text-gray-800';
  const textSecondary = isDark ? 'text-gray-300' : 'text-gray-700';
  const textMuted = isDark ? 'text-gray-400' : 'text-gray-500';
  const textLight = isDark ? 'text-gray-500' : 'text-gray-400';
  const bgTag = isDark ? 'bg-[#3a3430] text-gray-300' : 'bg-gray-100 text-gray-500';
  const bgSection = isDark ? 'bg-[#1f1c1a]' : 'bg-white';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';
  const bgAward = isDark ? 'bg-[#1f1c1a]/50' : 'bg-gray-50/50';
  const timelineBorder = isDark ? 'border-gray-600' : 'border-gray-200';
  const dotBg = isDark ? 'bg-[#2a2420]' : 'bg-white';
  const dotInactive = isDark ? 'bg-gray-600' : 'bg-gray-200';
  const countryTag = isDark ? 'bg-[#3a3430] border-gray-600 text-gray-300' : 'bg-white border-gray-200 text-gray-600';
  const connectLink = isDark ? 'bg-[#1f1c1a] border-gray-700' : 'bg-white border-gray-200';

  return (
    <div className="w-full h-full flex items-center justify-center p-4 md:p-12 overflow-hidden pb-24 md:pb-16">
      <div className={`relative max-w-4xl w-full h-full ${bgCard} shadow-[0_20px_60px_rgba(0,0,0,0.1)] rounded-sm overflow-hidden border ${borderCard} flex flex-col`}>
        {/* Paper Texture Effect */}
        {!isDark && (
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paper'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paper)' opacity='0.5'/%3E%3C/svg%3E")` }}></div>
        )}

        {/* Scrollable Content */}
        <div className="relative z-10 overflow-y-auto custom-scrollbar p-8 md:p-16 h-full">

            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 border-b border-[#e86b58]/30 pb-8 mb-10">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white shadow-md sepia-[0.2] shrink-0">
                    <img src="https://github.com/kimtoma.png" alt="Kim Toma" className="w-full h-full object-cover" />
                </div>
                <div>
                    <h1 className={`font-cutive text-3xl md:text-5xl ${textPrimary} font-bold mb-2`}>KIM TOMA</h1>
                    <p className={`font-inter ${textMuted} text-sm md:text-base`}>Service Planner & UX Designer</p>
                    <div className="flex gap-3 mt-4">
                        <span className={`px-2 py-1 ${bgTag} text-xs font-mono rounded`}>#Agentic_AI</span>
                        <span className={`px-2 py-1 ${bgTag} text-xs font-mono rounded`}>#UX_Design</span>
                        <span className={`px-2 py-1 ${bgTag} text-xs font-mono rounded`}>#Product</span>
                    </div>
                </div>
            </div>

            <div className="space-y-16">

                {/* 1. Hello */}
                <section>
                    <h2 className="font-cutive text-[#e86b58] text-xl font-bold mb-6 flex items-center gap-2">
                        <span>👋</span> Hello?
                    </h2>
                    <div className={`font-inter font-light ${textSecondary} leading-loose space-y-4 text-lg`}>
                        <p>
                            안녕하세요 :) <br/>
                            최신 기술, 예술, 그리고 사람 사이의 접점을 고민하는 서비스 기획자 <strong className={textPrimary}>김경수</strong>입니다.
                        </p>
                        <p>
                            요즘은 판교에 살면서, 서울 우면동에 있는 <strong className={textPrimary}>KT R&D 연구소</strong>에서 AI 에이전트 서비스를 기획하고 있어요.
                        </p>
                        <p>
                            최근에는 엔씨소프트에서 iF 디자인 어워드를 수상한 AI 야구 앱 <strong className={textPrimary}>페이지(PAIGE)</strong>, 그리고 에이치나인에서 블록체인 기반 리워드 앱 <strong className={textPrimary}>더 헌터스(The Hunters)</strong>의 서비스 기획과 UX 설계를 총괄했었습니다. 그 전에는 삼성, SK, 대림건설, 국내외 스타트업들과 협업하며 Mobile, TV, Kiosk, Robot 등 다양한 디바이스에서 사용자 경험을 설계해 왔어요.
                        </p>
                        <p>
                            제가 지향하는 서비스는 <strong className={textPrimary}>"쓸모 있으면서도 사람을 향한 서비스"</strong> 에요. 기본에 충실하면서도 의미 있는 경험을 전하고, 위트도 놓치고 싶지 않은 작은 욕심이 있어요.
                        </p>
                        <p>
                            여가 시간엔 (돈은 안 되지만) 재미있는 사이드 프로젝트나 최신 기술 실험을 즐겨요. 그리고 갈수록 확신하게 되는 건, <strong className={textPrimary}>좋은 사람과 좋은 팀이 있어야 좋은 제품이 만들어진다는 사실</strong>이에요. 기술도, 아이디어도 결국 사람을 통해 만들어지니까요! (음… 요즘엔 AI…?!)
                        </p>
                    </div>
                </section>

                {/* 2. Career */}
                <section>
                    <h2 className="font-cutive text-[#e86b58] text-xl font-bold mb-8 flex items-center gap-2">
                        <MapPin size={20} /> Career
                    </h2>
                    <div className={`space-y-10 border-l-2 ${timelineBorder} ml-3 pl-8 relative`}>

                        {/* KT */}
                        <div className="relative">
                            <span className={`absolute -left-[41px] top-1 w-5 h-5 rounded-full ${dotBg} border-4 border-[#e86b58]`}></span>
                            <h3 className={`text-xl font-bold ${textPrimary}`}>(주) 케이티</h3>
                            <div className={`text-sm font-mono ${textMuted} mb-2`}>2024.06 ~ 현재</div>
                            <p className={`font-bold ${textSecondary} mb-2`}>기술혁신부문 R&D연구소 Agentic AI Lab A-기획팀 / 책임연구원</p>
                            <ul className={`list-disc list-outside ml-4 ${textMuted} font-light space-y-1 text-sm`}>
                                <li>15,000명 규모의 조직에서 약 150명 규모의 연구소 구성원과 협업 중</li>
                                <li>최신 AI 기술을 리서치하고, 사내·기업·소비자 대상 상용화 가능한 AI 에이전트 서비스 기획</li>
                                <li>단순 PoC가 아니라 실제 문제 해결을 목표로 한 실용적인 서비스 중심</li>
                            </ul>
                        </div>

                        {/* NC Soft */}
                        <div className="relative">
                            <span className={`absolute -left-[41px] top-1 w-5 h-5 rounded-full ${dotInactive}`}></span>
                            <h3 className={`text-xl font-bold ${textPrimary}`}>(주) 엔씨소프트</h3>
                            <div className={`text-sm font-mono ${textMuted} mb-2`}>2020.03 ~ 2024.05</div>
                            <p className={`font-bold ${textSecondary} mb-2`}>AI Biz실 AI Product팀 / 팀장, 시니어 프로덕트 매니저</p>
                            <ul className={`list-disc list-outside ml-4 ${textMuted} font-light space-y-1 text-sm`}>
                                <li>약 70명의 AI 조직과 인하우스 기반 AI 서비스 기획</li>
                                <li>디자인팀 → 기획팀으로 이동, 팀장으로 NLP/스트리밍 기술 기반 프로젝트 리딩</li>
                                <li>iF 수상작 PAIGE를 비롯해 다양한 실험성 있는 프로젝트 진행</li>
                            </ul>
                        </div>

                        {/* H9 */}
                        <div className="relative">
                            <span className={`absolute -left-[41px] top-1 w-5 h-5 rounded-full ${dotInactive}`}></span>
                            <h3 className={`text-xl font-bold ${textPrimary}`}>(주) 에이치나인</h3>
                            <div className={`text-sm font-mono ${textMuted} mb-2`}>2010.06 ~ 2020.02</div>
                            <p className={`font-bold ${textSecondary} mb-2`}>UX실 / 팀장, UX 디자인 매니저</p>
                            <ul className={`list-disc list-outside ml-4 ${textMuted} font-light space-y-1 text-sm`}>
                                <li>강남의 작은 오피스텔에서 시작해 100명 규모 회사로 성장하는 여정에 동참</li>
                                <li>스마트폰 앱 초기부터 태블릿, 키오스크, 로봇 등 다양한 플랫폼에서 UX 설계</li>
                            </ul>
                        </div>

                         {/* Outback */}
                        <div className="relative opacity-60 hover:opacity-100 transition-opacity">
                            <span className={`absolute -left-[41px] top-1 w-5 h-5 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}></span>
                            <h3 className={`text-lg font-bold ${textPrimary}`}>(유) 아웃백스테이크하우스코리아</h3>
                            <div className={`text-sm font-mono ${textMuted} mb-2`}>2005.01 ~ 2005.05</div>
                            <p className={`font-bold ${textSecondary} mb-2`}>직원 (홀서빙) / 닉네임 Bingo</p>
                            <p className={`${textMuted} font-light text-sm`}>
                                명동 매장에서 다양한 사람을 만나며 '서비스의 본질은 사람을 이해하는 것'이라는 걸 처음 배운 시간
                            </p>
                        </div>
                    </div>
                </section>

                {/* 3. Education */}
                <section>
                     <h2 className="font-cutive text-[#e86b58] text-xl font-bold mb-6 flex items-center gap-2">
                        <Calendar size={20} /> Education
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className={`${bgSection} p-6 border ${borderColor} rounded-sm`}>
                            <h3 className={`font-bold ${textPrimary}`}>문일고등학교</h3>
                            <div className={`text-xs font-mono ${textLight} mb-2`}>1999.03 ~ 2002.02</div>
                            <p className={`text-sm ${textMuted} font-light`}>만화를 좋아해서 미술부에 들어갔고, 소묘부터 시작해 입시 미술을 거쳐 수시로 대학 합격.</p>
                        </div>
                        <div className={`${bgSection} p-6 border ${borderColor} rounded-sm`}>
                            <h3 className={`font-bold ${textPrimary}`}>홍익대학교 세종캠퍼스</h3>
                            <div className={`text-xs font-mono ${textLight} mb-2`}>2002.03 ~ 2010.02</div>
                            <p className={`text-sm ${textMuted} font-light`}>디지털미디어디자인 전공 학사 졸업. 애니메이션을 꿈꾸다 디자인으로 전공 변경. 졸업준비위원회 회장 역임.</p>
                        </div>
                    </div>
                </section>

                {/* 4. Awards */}
                <section>
                    <h2 className="font-cutive text-[#e86b58] text-xl font-bold mb-6 flex items-center gap-2">
                        <Award size={20} /> Awards
                    </h2>
                    <div className="space-y-4">
                        <div className={`flex flex-col md:flex-row gap-4 p-4 border ${borderColor} ${bgAward} rounded-sm`}>
                            <div className="shrink-0 font-bold text-[#e86b58] font-cutive">2021</div>
                            <div>
                                <h3 className={`font-bold ${textPrimary}`}>iF Design Award (Communication / App)</h3>
                                <p className={`text-sm ${textMuted} mb-2`}>AI 기반 야구 콘텐츠 & 커뮤니티 모바일 앱, PAIGE</p>
                                <a href="#" className="text-xs text-[#e86b58] hover:underline flex items-center gap-1 font-mono">
                                    <ExternalLink size={10} /> VIEW PROJECT
                                </a>
                            </div>
                        </div>
                        <div className={`flex flex-col md:flex-row gap-4 p-4 border ${borderColor} ${bgAward} rounded-sm`}>
                            <div className="shrink-0 font-bold text-[#e86b58] font-cutive">2020</div>
                            <div>
                                <h3 className={`font-bold ${textPrimary}`}>iF Design Award (Communication / App)</h3>
                                <p className={`text-sm ${textMuted} mb-2`}>암호화폐 기반 리워드형 모바일 게임, The Hunters</p>
                                <a href="#" className="text-xs text-[#e86b58] hover:underline flex items-center gap-1 font-mono">
                                    <ExternalLink size={10} /> VIEW PROJECT
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* 5. Tools */}
                    <section>
                        <h2 className="font-cutive text-[#e86b58] text-xl font-bold mb-6 flex items-center gap-2">
                            <Wrench size={20} /> Tools
                        </h2>
                        <div className={`text-sm space-y-3 font-light ${textSecondary}`}>
                            <p><strong className={`font-medium ${textPrimary}`}>Knowledge:</strong> Confluence, Obsidian, Notion, Github</p>
                            <p><strong className={`font-medium ${textPrimary}`}>Project:</strong> Jira, Asana</p>
                            <p><strong className={`font-medium ${textPrimary}`}>Design:</strong> Figma, Sketch, Adobe Suite</p>
                            <p><strong className={`font-medium ${textPrimary}`}>Ideation:</strong> Xmind, Figjam, Whiteboard</p>
                            <p><strong className={`font-medium ${textPrimary}`}>AI:</strong> ChatGPT, Claude, Ollama, Cursor</p>
                        </div>
                    </section>

                    {/* 6. Licenses */}
                    <section>
                         <h2 className="font-cutive text-[#e86b58] text-xl font-bold mb-6 flex items-center gap-2">
                            🪪 Licenses
                        </h2>
                        <ul className={`text-sm space-y-2 font-light ${textSecondary}`}>
                             <li>🤿 PADI Advanced Open Water Diver</li>
                             <li>🤿 PADI Open Water Diver</li>
                             <li>🚘 운전면허 1종 보통</li>
                        </ul>
                    </section>
                </div>

                {/* 7. Have Been */}
                <section>
                    <h2 className="font-cutive text-[#e86b58] text-xl font-bold mb-6 flex items-center gap-2">
                        <Globe size={20} /> Have Been
                    </h2>
                    <p className={`text-sm ${textMuted} mb-4 font-light`}>
                        28살에 처음 비행기를 타고 떠난 보라카이 여행 이후 될 수 있으면 매년 한 번은 새로운 곳으로 떠나보려고 했어요.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {['아이슬란드', '영국', '프랑스', '태국', '베트남', '인도네시아', '필리핀', '홍콩', '일본', '미국', '캐나다'].map(country => (
                            <span key={country} className={`px-3 py-1 ${countryTag} border rounded-full text-xs shadow-sm`}>
                                {country}
                            </span>
                        ))}
                    </div>
                </section>

                {/* 8. Connect */}
                <section>
                    <h2 className="font-cutive text-[#e86b58] text-xl font-bold mb-6">🔗 Connect</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                         <a href="https://twitter.com" target="_blank" rel="noreferrer" className={`flex items-center gap-2 p-3 ${connectLink} border rounded hover:border-[#e86b58] hover:text-[#e86b58] transition-colors group ${textPrimary}`}>
                             <span className="font-bold text-sm">X (Twitter)</span>
                             <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                         </a>
                         <a href="https://instagram.com" target="_blank" rel="noreferrer" className={`flex items-center gap-2 p-3 ${connectLink} border rounded hover:border-[#e86b58] hover:text-[#e86b58] transition-colors group ${textPrimary}`}>
                             <span className="font-bold text-sm">Instagram</span>
                             <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                         </a>
                         <a href="https://youtube.com" target="_blank" rel="noreferrer" className={`flex items-center gap-2 p-3 ${connectLink} border rounded hover:border-[#e86b58] hover:text-[#e86b58] transition-colors group ${textPrimary}`}>
                             <span className="font-bold text-sm">YouTube</span>
                             <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                         </a>
                         <a href="https://github.com" target="_blank" rel="noreferrer" className={`flex items-center gap-2 p-3 ${connectLink} border rounded hover:border-[#e86b58] hover:text-[#e86b58] transition-colors group ${textPrimary}`}>
                             <span className="font-bold text-sm">GitHub</span>
                             <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                         </a>
                         <a href="https://linkedin.com" target="_blank" rel="noreferrer" className={`flex items-center gap-2 p-3 ${connectLink} border rounded hover:border-[#e86b58] hover:text-[#e86b58] transition-colors group ${textPrimary}`}>
                             <span className="font-bold text-sm">LinkedIn</span>
                             <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                         </a>
                    </div>
                </section>

                {/* Signature */}
                <div className="pt-12 flex justify-end">
                     <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Signature_sample.svg/1200px-Signature_sample.svg.png" alt="Signature" className={`h-16 ${isDark ? 'opacity-30 invert' : 'opacity-50'} -rotate-2`} />
                </div>

            </div>
        </div>
      </div>
    </div>
  );
};

export default AboutView;
