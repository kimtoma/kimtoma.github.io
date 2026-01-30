import React from 'react';
import { ExternalLink, Award } from 'lucide-react';

interface Project {
  title: string;
  description: string;
  link?: string;
  award?: string;
  awardLink?: string;
}

interface ProjectSection {
  title: string;
  projects: Project[];
}

const PROJECT_SECTIONS: ProjectSection[] = [
  {
    title: "Main Projects",
    projects: [
      {
        title: "PAIGE",
        description: "AI-powered app for KBO Baseball Fans",
        link: "https://paige.kr.nc.com/?ref=kimtoma",
        award: "iF Design Award 2021",
        awardLink: "https://ifworlddesignguide.com/entry/295159-paige"
      },
      {
        title: "Mossland: The Hunters",
        description: "Tappable game rewarded by blockchain",
        link: "https://ifworlddesignguide.com/entry/274510-mossland-the-hunters",
        award: "iF Design Award 2020",
        awardLink: "https://ifworlddesignguide.com/entry/274510-mossland-the-hunters"
      },
      {
        title: "Wenzi",
        description: "Marketplace for Handmade class & goods",
        link: "https://wenzi.io"
      }
    ]
  },
  {
    title: "Side Projects",
    projects: [
      {
        title: "kimtoma O/S",
        description: "Her 영화에서 영감받은 인터랙티브 포트폴리오",
        link: "https://kimtoma.com"
      },
      {
        title: "chat.kimtoma.com",
        description: "Gemini 기반 AI 챗봇 with RAG",
        link: "https://chat.kimtoma.com"
      },
      {
        title: "Momat Stickers",
        description: "Line character stickers for Foodie",
        link: "https://store.line.me/stickershop/product/4102511/en"
      },
      {
        title: "Playlisteem",
        description: "Sharing music playlists on Steem blockchain",
        link: "https://playlisteem.web.app/"
      }
    ]
  },
  {
    title: "Translations",
    projects: [
      {
        title: "개발자가 알아야 할 피그마의 모든 것",
        description: "Everything Developers Need to Know About Figma",
        link: "https://webactually.com/2021/01/18/%EA%B0%9C%EB%B0%9C%EC%9E%90%EA%B0%80-%EC%95%8C%EC%95%84%EC%95%BC-%ED%95%A0-%ED%94%BC%EA%B7%B8%EB%A7%88%EC%9D%98-%EB%AA%A8%EB%93%A0-%EA%B2%83/"
      },
      {
        title: "전자상거래 UI 디자인의 목표",
        description: "Best Practice For E-Commerce UI Design",
        link: "https://webactually.com/2021/01/29/%EC%A0%84%EC%9E%90%EC%83%81%EA%B1%B0%EB%9E%98-UI-%EB%94%94%EC%9E%90%EC%9D%B8%EC%9D%98-%EB%AA%A9%ED%91%9C/"
      },
      {
        title: "디자인 리스크 줄이기",
        description: "Reducing Design Risk",
        link: "https://webactually.com/2021/02/23/%EB%94%94%EC%9E%90%EC%9D%B8-%EB%A6%AC%EC%8A%A4%ED%81%AC-%EC%A4%84%EC%9D%B4%EA%B8%B0/"
      }
    ]
  }
];

interface ProjectsViewProps {
  isFocused?: boolean;
  onFocusChange?: (focused: boolean) => void;
}

const ProjectsView: React.FC<ProjectsViewProps> = () => {
  return (
    <div className="w-full h-full flex items-start justify-center overflow-y-auto pb-24 md:pb-16">
      <div className="w-full max-w-2xl px-6 py-12 md:py-16">
        {/* Header */}
        <div className="mb-12 md:mb-16">
          <h1 className="font-cutive text-3xl md:text-4xl text-gray-800 mb-3">Projects</h1>
          <p className="font-inter text-sm text-gray-500 font-light">
            Project lists that I made with love. &lt;3
          </p>
        </div>

        {/* Project Sections */}
        <div className="space-y-12 md:space-y-16">
          {PROJECT_SECTIONS.map((section, sectionIndex) => (
            <section key={sectionIndex}>
              {/* Section Header */}
              <h2 className="font-cutive text-[#e86b58] text-sm tracking-[0.2em] mb-6 pb-2 border-b border-[#e86b58]/20">
                {section.title}
              </h2>

              {/* Projects List */}
              <ul className="space-y-4">
                {section.projects.map((project, index) => (
                  <li key={index} className="group">
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block py-3 hover:bg-white/30 -mx-3 px-3 rounded transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-inter font-medium text-gray-800 group-hover:text-[#e86b58] transition-colors">
                              {project.title}
                            </span>
                            <ExternalLink size={12} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <p className="font-inter text-sm text-gray-500 font-light">
                            {project.description}
                          </p>
                          {project.award && (
                            <a
                              href={project.awardLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 mt-2 text-xs text-[#e86b58] hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Award size={12} />
                              {project.award}
                            </a>
                          )}
                        </div>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-200 text-center">
          <span className="font-cutive text-xs text-gray-400 tracking-[0.2em]">
            END_OF_PROJECTS
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProjectsView;
