import { person } from "@/content/portfolio";
import { ArrowLink } from "@/components/ui/arrow-link";
import { ContactScene } from "./contact-scene";
import styles from "./contact.module.css";

export function Contact() {
  return (
    <section id="contact" className={styles.contact} data-header-theme="dark" aria-labelledby="contact-title">
      <div className={styles.head}>
        <h2 id="contact-title" className={styles.title} data-reveal>
          Want to build something together?
        </h2>
        <p className={styles.sub} data-reveal>
          {person.lookingFor} Email is the fastest way to reach me.
        </p>
        <div className={styles.actions} data-reveal>
          <a className={styles.pill} href={person.resume} download>
            Download resume
          </a>
          <ArrowLink href={`mailto:${person.email}`}>{person.email}</ArrowLink>
          <ArrowLink href={person.linkedin}>LinkedIn</ArrowLink>
          <ArrowLink href={person.github}>GitHub</ArrowLink>
        </div>
        <a className={styles.top} href="#top">
          Back to top
        </a>
      </div>

      <ContactScene email={person.email} />
    </section>
  );
}
