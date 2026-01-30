import React from 'react';
import { ExternalLink } from 'lucide-react';

interface BlogPost {
  title: string;
  date: string;
  year: string;
  link: string;
}

// Real blog posts from kimtoma.com grouped by year
const BLOG_POSTS: BlogPost[] = [
  { title: "모바일 O/S 별 버전 점유율 확인하기", date: "08.24", year: "2023", link: "https://blog.kimtoma.com/2023/08/24/mobile-os-usage/" },
  { title: "2022 디자이너가 알아야 할 주요 트렌드", date: "01.06", year: "2022", link: "https://blog.kimtoma.com/2022/01/06/2022-trends-designers-should-know/" },
  { title: "2021년 회고", date: "12.31", year: "2021", link: "https://blog.kimtoma.com/2021/12/31/retrospective-2021/" },
  { title: "UI를 여행하는 디자이너를 위한 안내서 - 스위치", date: "09.14", year: "2021", link: "https://blog.kimtoma.com/2021/09/14/the-designers-guide-to-the-ui-switches/" },
  { title: "UI를 여행하는 디자이너를 위한 안내서 - 버튼", date: "02.10", year: "2021", link: "https://blog.kimtoma.com/2021/02/10/the-designers-guide-to-the-ui-button/" },
  { title: "UI에서 날짜, 시간 표기는 어떻게 하는게 좋을까?", date: "01.02", year: "2021", link: "https://blog.kimtoma.com/2021/01/02/how-to-display-the-date-and-time-in-ui/" },
  { title: "2020년 회고", date: "12.27", year: "2020", link: "https://blog.kimtoma.com/2020/12/27/retrospective-2020/" },
  { title: "2021 디자이너가 알아야 할 주요 트렌드", date: "12.15", year: "2020", link: "https://blog.kimtoma.com/2020/12/15/2021-trends-designers-should-know/" },
  { title: "모바일 O/S 별 버전 점유율 확인하기", date: "09.22", year: "2020", link: "https://blog.kimtoma.com/2020/09/22/mobile-os-usage/" },
  { title: "Thumbzone 체크하기", date: "05.04", year: "2020", link: "https://blog.kimtoma.com/2020/05/04/ui-thumbzone-check/" },
  { title: "Color Contrast 체크하기", date: "04.14", year: "2020", link: "https://blog.kimtoma.com/2020/04/14/ui-color-contrast-check/" },
  { title: "프로젝트 간단 회고하기", date: "01.09", year: "2020", link: "https://blog.kimtoma.com/2020/01/09/how-to-retrospective-workshop/" },
  { title: "곤도 마리에의 시대 – 소비시대의 종말", date: "11.30", year: "2019", link: "https://blog.kimtoma.com/2019/11/30/marie-kondo-for-life/" },
  { title: "Jira 간단 사용법", date: "10.18", year: "2019", link: "https://blog.kimtoma.com/2019/10/18/how-to-use-jira/" },
  { title: "Abstract 간단 사용법", date: "10.18", year: "2019", link: "https://blog.kimtoma.com/2019/10/18/how-to-use-abstract/" },
  { title: "UI 버튼 크기는 어떻게 정해야 하나?", date: "09.19", year: "2019", link: "https://blog.kimtoma.com/2019/09/19/button-ui-minimum-size/" },
  { title: "다국어 대응을 위한 String Table 작성하기", date: "08.12", year: "2019", link: "https://blog.kimtoma.com/2019/08/12/creating-a-stringtable-for-multilingual-support/" },
  { title: "일 잘하는 팀(조직)은 어떻게 일할까요?", date: "08.09", year: "2019", link: "https://blog.kimtoma.com/2019/08/09/how-do-a-teamwork/" },
  { title: "2019 테크 트렌드 요약", date: "05.28", year: "2019", link: "https://blog.kimtoma.com/2019/05/28/2019-tech-trends/" },
  { title: "프랜시스 베이컨 왈", date: "03.17", year: "2019", link: "https://blog.kimtoma.com/2019/03/17/francis-bacon-said/" },
  { title: "내가 좋아하는 회사에 투자하기", date: "02.16", year: "2019", link: "https://blog.kimtoma.com/2019/02/16/empower-to-company-that-i-love/" },
  { title: "비트코인 채굴하기 with Honeyminer", date: "07.31", year: "2018", link: "https://blog.kimtoma.com/2018/07/31/bitcoin-mining-with-honeyminer/" },
  { title: "모맷 라인 이모티콘 제작기", date: "07.22", year: "2018", link: "https://blog.kimtoma.com/2018/07/22/momat-line-emoticon/" },
  { title: "모맷 비하인드 스토리", date: "02.24", year: "2017", link: "https://blog.kimtoma.com/2017/02/24/momat-behind-the-scene/" },
  { title: "추천 도구: Slack, Sketch, Sympli", date: "08.31", year: "2016", link: "https://blog.kimtoma.com/2016/08/31/recommend-tools-slack-sketch-sympli/" },
  { title: "질투나는 사이트 datausa.io", date: "04.11", year: "2016", link: "https://blog.kimtoma.com/2016/04/11/datausa-site-that-make-me-jealousy/" },
  { title: "파일 명명 규칙", date: "06.03", year: "2013", link: "https://blog.kimtoma.com/2013/06/03/file-naming-rules/" },
];

// Group posts by year
const groupedPosts = BLOG_POSTS.reduce((acc, post) => {
  if (!acc[post.year]) {
    acc[post.year] = [];
  }
  acc[post.year].push(post);
  return acc;
}, {} as Record<string, BlogPost[]>);

const years = Object.keys(groupedPosts).sort((a, b) => parseInt(b) - parseInt(a));

interface BlogViewProps {
  isDark?: boolean;
  isFocused?: boolean;
  onFocusChange?: (focused: boolean) => void;
}

const BlogView: React.FC<BlogViewProps> = ({ isDark = false }) => {
  // Dark mode colors
  const textPrimary = isDark ? 'text-gray-100' : 'text-gray-800';
  const textMuted = isDark ? 'text-gray-400' : 'text-gray-500';
  const textLight = isDark ? 'text-gray-500' : 'text-gray-400';
  const hoverBg = isDark ? 'hover:bg-white/5' : 'hover:bg-white/30';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';

  return (
    <div className="w-full h-full flex items-start justify-center overflow-y-auto pb-24 md:pb-16">
      <div className="w-full max-w-2xl px-6 py-12 md:py-16">
        {/* Header */}
        <div className="mb-12 md:mb-16">
          <h1 className={`font-cutive text-3xl md:text-4xl ${textPrimary} mb-3`}>Archive</h1>
          <p className={`font-inter text-sm ${textMuted} font-light`}>
            {BLOG_POSTS.length} posts from {years[years.length - 1]} to {years[0]}
          </p>
        </div>

        {/* Posts by Year */}
        <div className="space-y-10 md:space-y-12">
          {years.map((year) => (
            <section key={year}>
              {/* Year Header */}
              <h2 className="font-cutive text-[#e86b58] text-sm tracking-[0.2em] mb-4 pb-2 border-b border-[#e86b58]/20">
                {year}
              </h2>

              {/* Posts List */}
              <ul className="space-y-1">
                {groupedPosts[year].map((post, index) => (
                  <li key={index}>
                    <a
                      href={post.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`group flex items-baseline justify-between gap-4 py-2 ${hoverBg} -mx-3 px-3 rounded transition-colors`}
                    >
                      <span className={`font-inter ${textPrimary} group-hover:text-[#e86b58] transition-colors text-sm md:text-base`}>
                        {post.title}
                      </span>
                      <span className={`font-cutive text-xs ${textLight} shrink-0 flex items-center gap-1`}>
                        {post.date}
                        <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        {/* Footer */}
        <div className={`mt-16 pt-8 border-t ${borderColor} text-center`}>
          <span className={`font-cutive text-xs ${textLight} tracking-[0.2em]`}>
            END_OF_ARCHIVE
          </span>
        </div>
      </div>
    </div>
  );
};

export default BlogView;
