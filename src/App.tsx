import { MotionConfig } from "motion/react";
import { Analytics } from "@vercel/analytics/react";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import ExperienceList from "@/components/ExperienceList";
import ProjectCarousel from "@/components/ProjectCarousel";
import SkillsList from "@/components/SkillsList";
// import Certifications from "@/components/Certifications";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import CommandPalette from "@/components/CommandPalette";
import CustomCursor from "@/components/CustomCursor";

function App() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-screen overflow-x-hidden bg-void text-fg">
        <CustomCursor />
        <Nav />
        <main>
          <Hero />
          <ExperienceList />
          <ProjectCarousel />
          <SkillsList />
          {/* <Certifications /> */}
          <Contact />
        </main>
        <Footer />
        <CommandPalette />
        <Analytics />
      </div>
    </MotionConfig>
  );
}

export default App;
