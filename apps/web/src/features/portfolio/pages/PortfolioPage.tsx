import {
  PortfolioThemeProvider,
} from '../context/PortfolioThemeProvider';

import PortfolioHeader from
  '../components/layout/PortfolioHeader';

import PortfolioFooter from
  '../components/layout/PortfolioFooter';

import AboutSection from
  '../components/sections/AboutSection';

import SkillsSection from
  '../components/sections/SkillsSection';

import CareerJourneySection from
  '../components/sections/CareerJourneySection';

import CredentialsSection from
  '../components/sections/CredentialsSection';

import ProjectsSection from
  '../components/sections/ProjectsSection';

import EcosystemSection from
  '../components/sections/EcosystemSection';

import ResumeSection from
  '../components/sections/ResumeSection';

import '../styles/portfolio.css';

export default function PortfolioPage() {
  return (
    <PortfolioThemeProvider>

      <PortfolioHeader />

      <main className="pf-container">

        <AboutSection />

        <SkillsSection />

        <CareerJourneySection />

        <CredentialsSection />

        <ProjectsSection />

        <EcosystemSection />

        <ResumeSection />

      </main>

      <PortfolioFooter />

    </PortfolioThemeProvider>
  );
}