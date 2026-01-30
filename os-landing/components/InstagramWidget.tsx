import React, { useState, useEffect } from 'react';
import { Camera, ExternalLink, Image as ImageIcon } from 'lucide-react';

interface InstagramPost {
  id: string;
  media_url: string;
  caption: string;
}

const InstagramWidget: React.FC = () => {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // OPTIONAL: If you generate a free RSS feed from https://rss.app/ or similar for your Instagram,
  // paste the URL here to make it live. Otherwise, it uses the cached "Manual Mode" below.
  // Example: "https://rss.app/feeds/..."
  const customRssUrl = ""; 

  // MANUAL CACHE: Since Instagram blocks direct access, we maintain a "Local Cache"
  // mimicking the OS storing recent memories.
  const CACHED_DATA: InstagramPost[] = [
      {
          id: 'cache-1',
          media_url: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          caption: 'Forest exploration. 🌲'
      },
      {
          id: 'cache-2',
          media_url: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          caption: 'Minimalist setup.'
      },
      {
          id: 'cache-3',
          media_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          caption: 'Views from the studio.'
      }
  ];

  const fetchInstagram = async () => {
      setLoading(true);
      if (customRssUrl) {
          try {
              const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(customRssUrl)}`);
              const data = await response.json();
              if (data.status === 'ok' && data.items.length > 0) {
                  const fetchedPosts = data.items.slice(0, 5).map((item: any, idx: number) => ({
                      id: `rss-${idx}`,
                      media_url: item.enclosure?.link || item.thumbnail || '', // RSS specific fields
                      caption: item.title || 'Instagram Post'
                  })).filter((p: any) => p.media_url); // Only keep items with images
                  
                  if (fetchedPosts.length > 0) {
                      setPosts(fetchedPosts);
                      setLoading(false);
                      return;
                  }
              }
          } catch (e) {
              console.warn("RSS Fetch failed, switching to cache");
          }
      }
      
      // Fallback to cache
      setPosts(CACHED_DATA);
      setLoading(false);
  };

  useEffect(() => {
    fetchInstagram();
  }, []);

  useEffect(() => {
    if (posts.length === 0) return;
    const interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % posts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [posts]);

  const post = posts[currentIndex];
  // Avatar fallback
  const avatarUrl = "https://unavatar.io/twitter/kimtoma"; 

  if (loading) {
    return <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center text-gray-300">
        <Camera size={24} />
    </div>;
  }

  return (
    <div className="relative w-full h-full group bg-white flex flex-col">
       {/* Header overlay */}
       <div className="absolute top-0 left-0 right-0 z-10 p-3 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
           <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full border border-white/50 overflow-hidden bg-gray-200">
                    <img src={avatarUrl} alt="kimtoma" className="w-full h-full object-cover" />
                </div>
                <span className="text-white font-inter text-xs font-bold tracking-wide drop-shadow-md">@kimtoma</span>
           </div>
           <a href="https://www.instagram.com/kimtoma/" target="_blank" rel="noreferrer" className="text-white hover:text-[#e86b58] transition-colors">
               <ExternalLink size={14} />
           </a>
       </div>

       {/* Image Feed */}
       <div className="relative flex-1 overflow-hidden bg-gray-100">
           {posts.length > 0 ? (
               posts.map((item, index) => (
               <div key={item.id} className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}>
                   <img 
                    src={item.media_url} 
                    alt={item.caption} 
                    className="w-full h-full object-cover pointer-events-none"
                   />
                   <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 to-transparent"></div>
               </div>
           ))
           ) : (
               <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                   <ImageIcon size={24} />
                   <span className="text-[10px]">No Memories Found</span>
               </div>
           )}
       </div>

       {/* Footer */}
       {post && (
        <div className="absolute bottom-0 left-0 right-0 p-3 text-white transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <p className="text-[10px] font-inter truncate">
                <span className="font-bold mr-1">kimtoma</span>
                {post.caption}
            </p>
        </div>
       )}
       
       {/* Pagination dots */}
       <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-20 pointer-events-none">
           {posts.map((_, idx) => (
               <div 
                key={idx} 
                className={`w-1 h-1 rounded-full shadow-sm transition-all duration-300 ${idx === currentIndex ? 'bg-white scale-125' : 'bg-white/40'}`}
               />
           ))}
       </div>
    </div>
  );
};

export default InstagramWidget;