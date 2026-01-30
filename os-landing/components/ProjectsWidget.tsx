import React, { useEffect, useState } from 'react';
import { ExternalLink, RefreshCw, Folder } from 'lucide-react';

interface Project {
  title: string;
  link: string;
}

interface ProjectsWidgetProps {
    isFocused?: boolean;
}

const STATIC_PROJECTS: Project[] = [
    { title: "Neural Networks Visualization", link: "https://kimtoma.com/projects/" },
    { title: "Analog UI Kit", link: "https://kimtoma.com/projects/" },
    { title: "Sound Synthesis Engine", link: "https://kimtoma.com/projects/" },
    { title: "Generative Art Series", link: "https://kimtoma.com/projects/" },
    { title: "Memory Archive V1", link: "https://kimtoma.com/projects/" },
    { title: "Vibe Coding Experiments", link: "https://kimtoma.com/projects/" }
];

const ProjectsWidget: React.FC<ProjectsWidgetProps> = ({ isFocused = false }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Instant load simulation
  const fetchProjects = () => {
      setLoading(false);
      setProjects(isFocused ? [...STATIC_PROJECTS, ...STATIC_PROJECTS, ...STATIC_PROJECTS].slice(0, 18) : STATIC_PROJECTS);
  };

  useEffect(() => {
    fetchProjects();
  }, [isFocused]);

  return (
    <div className={`w-full h-full flex flex-col font-cutive text-gray-700 ${isFocused ? 'bg-[#f4f7f6] items-center pt-12' : 'text-sm'}`}>
      {/* Header */}
      <div className={`flex justify-between items-center mb-4 border-b border-gray-300/50 pb-2 shrink-0 ${isFocused ? 'w-full max-w-3xl px-6 md:px-0' : 'w-full'}`}>
        <span className={`font-bold tracking-widest text-[#e86b58] ${isFocused ? 'text-xl' : ''}`}>PROJECTS.DIR</span>
        <div className="flex gap-2">
            <button onClick={fetchProjects} className="hover:text-[#e86b58] transition-colors" title="Reload Source">
                <RefreshCw size={isFocused ? 18 : 14} className={loading ? "animate-spin" : ""} />
            </button>
            <a href="https://kimtoma.com/projects/" target="_blank" rel="noreferrer" className="hover:text-[#e86b58] transition-colors" title="Open Website">
                <ExternalLink size={isFocused ? 18 : 14} />
            </a>
        </div>
      </div>

      {/* List Container */}
      <div className={`flex-1 overflow-y-auto custom-scrollbar relative ${isFocused ? 'w-full max-w-3xl px-6 md:px-0 py-6' : ''}`}>
        {loading ? (
           <div className="space-y-3 animate-pulse mt-2">
             {[1,2,3,4].map(i => <div key={i} className="h-4 bg-gray-200/50 rounded w-full"></div>)}
           </div>
        ) : (
            <ul className={`space-y-3 ${isFocused ? 'space-y-6' : ''}`}>
                {projects.map((p, i) => (
                    <li key={i} className="group cursor-pointer">
                        <a href={p.link} target="_blank" rel="noreferrer" className={`block ${isFocused ? 'p-4 hover:bg-white rounded-lg transition-all' : ''}`}>
                            <div className="flex items-baseline justify-between group-hover:text-[#e86b58] transition-colors">
                                <div className="flex items-center gap-4">
                                     <span className={`font-mono text-gray-400 ${isFocused ? 'text-lg' : 'opacity-40 text-xs'}`}>{(i + 1).toString().padStart(2, '0')}</span>
                                     <span className={`font-bold truncate ${isFocused ? 'text-2xl font-inter' : ''}`}>
                                        {p.title}
                                     </span>
                                </div>
                                {isFocused && <Folder size={20} className="text-gray-300 group-hover:text-[#e86b58]" />}
                            </div>
                            {!isFocused && <div className="h-px w-full bg-gray-200 mt-1 group-hover:bg-[#e86b58]/30 transition-colors"></div>}
                        </a>
                    </li>
                ))}
            </ul>
        )}
        
        {!loading && (
            <div className={`text-gray-400 text-center font-sans tracking-wider opacity-60 ${isFocused ? 'mt-12 mb-12' : 'mt-6 text-[10px]'}`}>
                — END OF BUFFER —
            </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsWidget;