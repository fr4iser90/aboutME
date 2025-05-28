import Image from 'next/image';

export default function About() {
  return (
    <section id="about" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="aspect-square relative rounded-2xl overflow-hidden galaxy-card">
              <Image
                src="/profile.jpg" // Add your profile image to the public folder
                alt="Profile picture"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
          
          <div>
            <h2 className="text-4xl font-bold mb-6 galaxy-text">About Me</h2>
            <p className="text-slate-300 mb-6 text-lg">
              I'm a passionate developer with a love for creating beautiful and functional digital experiences. 
              My journey in the tech universe has led me through various galaxies of programming languages and frameworks.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-slate-300">Full Stack Developer</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-slate-300">Based in Your Location</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:your.email@example.com" className="text-slate-300 hover:text-white transition-colors">
                  your.email@example.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 