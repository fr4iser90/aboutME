import Image from 'next/image';

export default function About() {
  return (
    <section id="about" className="about-section">
      <div className="about-container">
        <div className="about-image-wrapper">
          <Image
            src="/profile.jpg"
            alt="Profilbild"
            width={250}
            height={250}
            className="about-image"
            priority
          />
        </div>
        <div className="about-content">
          <h2 className="about-title">About Me</h2>
          <p className="about-text">
            I'm a passionate developer with a love for creating beautiful and functional digital experiences. 
            My journey in the tech universe has led me through various galaxies of programming languages and frameworks.
          </p>
          <div className="about-list">
            <div className="about-list-item">
              <span className="about-list-icon">💻</span>
              <span>Techie Geek</span>
            </div>
            <div className="about-list-item">
              <span className="about-list-icon">📍</span>
              <span>Based in Your Location</span>
            </div>
            <div className="about-list-item">
              <span className="about-list-icon">✉️</span>
              <a href="mailto:your.email@example.com" className="about-list-link">
                your.email@example.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 