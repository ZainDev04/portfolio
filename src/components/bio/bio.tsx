import { certifications, coursework, education, experience } from "@/content/portfolio";
import { BioKeys } from "./bio-keys";
import styles from "./bio.module.css";

const PARTS = [
  { id: "bio-story", label: "My Story" },
  { id: "bio-experience", label: "Experience" },
  { id: "bio-education", label: "Education" },
  { id: "bio-certifications", label: "Certifications" },
];

export function Bio() {
  return (
    <section id="about" className={styles.bio} data-header-theme="dark" aria-labelledby="bio-title">
      <div className={styles.keys}>
        <h2 id="bio-title" className={styles.bioTitle}>
          Bio/
        </h2>
        <BioKeys parts={PARTS} />
      </div>

      <div className={styles.content}>
        <article id="bio-story" className={styles.part} data-bio-part>
          <h3 className={styles.partTitle}>My Story</h3>
          <p className={styles.lead}>
            Final-year Computer Science student at <b>NED University</b> in Karachi, specialising in artificial
            intelligence and graduating in August 2027.
          </p>
          <p className={styles.lead}>
            I work on retrieval systems and supervised learning, and on getting models out of notebooks into something a
            person can run. Right now I&apos;m building <b className={styles.accent}>StepGuard</b>, my final year project.
          </p>
          <p className={styles.note}>Coursework: {coursework.join(" · ")}.</p>
        </article>

        <article id="bio-experience" className={styles.part} data-bio-part>
          <h3 className={styles.partTitle}>Experience</h3>
          <ol className={styles.roles}>
            {experience.map((role) => (
              <li key={role.org} className={styles.role}>
                <p className={styles.lead}>
                  <b>{role.org}</b>, {role.title.toLowerCase()}
                </p>
                <p className={styles.meta}>
                  {role.dates} · {role.place}
                </p>
                <ul className={styles.points}>
                  {role.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </article>

        <article id="bio-education" className={styles.part} data-bio-part>
          <h3 className={styles.partTitle}>Education</h3>
          <ol className={styles.roles}>
            {education.map((item) => (
              <li key={item.school} className={styles.role}>
                <p className={styles.lead}>
                  <b>{item.school}</b>
                </p>
                <p className={styles.meta}>
                  {item.detail} · {item.dates}
                </p>
              </li>
            ))}
          </ol>
        </article>

        <article id="bio-certifications" className={styles.part} data-bio-part>
          <h3 className={styles.partTitle}>Certifications</h3>
          <p className={styles.lead}>
            {certifications.map((cert, i) => (
              <span key={cert.name}>
                {cert.name}
                {cert.issuer ? <span className={styles.issuer}> ({cert.issuer})</span> : null}
                {i < certifications.length - 1 ? " · " : "."}
              </span>
            ))}
          </p>
        </article>
      </div>
    </section>
  );
}
