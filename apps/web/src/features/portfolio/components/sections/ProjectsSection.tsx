import {
  FolderCode,
  ArrowUpRight,
} from 'lucide-react';

import {
  SiGithub,
} from 'react-icons/si';

import { Link } from 'react-router-dom';

import { PROJECTS } from '../../config/portfolio.config';

import SectionHeading from '../shared/SectionHeading';
import PortfolioCard from '../shared/PortfolioCard';

export default function ProjectsSection() {
  return (
    <section id="projects" className="pf-section">
      <SectionHeading
        eyebrow="Selected Work"
        title="Featured Projects"
        description="A collection of applications and software modules I've been developing."
      />

      <div className="grid gap-5
        md:grid-cols-2 lg:grid-cols-3">

        {PROJECTS.map((project) => (
          <PortfolioCard
            key={project.id}
            className="group flex flex-col
              overflow-hidden"
          >
            <div className="pf-muted flex aspect-video
              items-center justify-center overflow-hidden">

              {project.imageUrl ? (
                <img
                  src={project.imageUrl}
                  alt={project.name}
                  loading="lazy"
                  className="h-full w-full object-cover
                    transition duration-300
                    group-hover:scale-105"
                />
              ) : (
                <FolderCode
                  size={56}
                  strokeWidth={1}
                  className="pf-text-muted"
                />
              )}
            </div>

            <div className="flex flex-1 flex-col p-5">
              <p className="pf-text-muted text-xs">
                {project.category}
              </p>

              <h3 className="mt-2 text-lg font-semibold">
                {project.name}
              </h3>

              <p className="pf-text-muted mt-3
                text-sm leading-6">
                {project.description}
              </p>

              <div className="my-5 flex flex-wrap gap-1.5">
                {project.technologies.map((tech) => (
                  <span key={tech} className="pf-badge">
                    {tech}
                  </span>
                ))}
              </div>

              <div className="mt-auto flex flex-wrap gap-2">
                {project.demoUrl && (
                  project.demoUrl.startsWith('/') ? (
                    <Link
                      to={project.demoUrl}
                      className="pf-button pf-button-primary"
                    >
                      Live Demo
                      <ArrowUpRight size={15} />
                    </Link>
                  ) : (
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pf-button pf-button-primary"
                    >
                      Live Demo
                      <ArrowUpRight size={15} />
                    </a>
                  )
                )}

                {project.sourceUrl && (
                  <a
                    href={project.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pf-button pf-button-outline"
                  >
                    <SiGithub size={15} />
                    Source
                  </a>
                )}
              </div>
            </div>
          </PortfolioCard>
        ))}
      </div>
    </section>
  );
}