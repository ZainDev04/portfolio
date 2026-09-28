import { projects } from "@/content/portfolio";
import { ArrowLink } from "@/components/ui/arrow-link";
import { WorkCarousel } from "./work-carousel";
import styles from "./work.module.css";

export function Work() {
  return (
    <section id="work" className={styles.work} data-header-theme="dark" aria-labelledby="work-title">
      <div className={styles.head}>
        <p className={styles.label} data-reveal>
          Selected work
        </p>
        <h2 id="work-title" className={styles.title} data-reveal>
          Projects, <span className={styles.accent}>with the numbers.</span>
        </h2>
      </div>

      {/* Desktop shows the projects on the orbit sphere above; phones get a carousel. */}
      <WorkCarousel
        slides={projects.map(({ slug, title, context, year, image, imageAlt, status }) => ({ slug, title, context, year, image, imageAlt, status }))}
      />

      <ol id="project-index" className={styles.index} aria-label="Project details">
        {projects.map((project, i) => (
          <li key={project.slug} id={`project-${project.slug}`} className={styles.row} data-reveal>
            <p className={styles.num}>{String(i + 1).padStart(2, "0")}</p>

            <div className={styles.main}>
              <h3 className={styles.name}>
                {project.title}
                {project.status ? <span className={styles.status}>{project.status}</span> : null}
              </h3>
              <p className={styles.context}>
                {project.context} · {project.year}
              </p>
              <p className={styles.summary}>{project.summary}</p>
            </div>

            <div className={styles.side}>
              <ul className={styles.results}>
                {project.results.map((result) => (
                  <li key={result}>{result}</li>
                ))}
              </ul>
              <ul className={styles.stack} aria-label="Built with">
                {project.stack.map((tool) => (
                  <li key={tool}>{tool}</li>
                ))}
              </ul>
              <div className={styles.links}>
                {project.live ? <ArrowLink href={project.live}>Live demo</ArrowLink> : null}
                {project.paper ? <ArrowLink href={project.paper}>Paper</ArrowLink> : null}
                {project.code ? <ArrowLink href={project.code}>Code</ArrowLink> : null}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
