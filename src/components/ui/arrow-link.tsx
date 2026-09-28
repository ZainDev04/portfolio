import type { ReactNode } from "react";
import styles from "./arrow-link.module.css";

// Link style: underlined text followed by a small circled arrow.
// External links open in a new tab and say so to screen readers.
export function ArrowLink({ href, children, download }: { href: string; children: ReactNode; download?: boolean }) {
  const external = href.startsWith("http");
  return (
    <a
      className={styles.link}
      href={href}
      download={download}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
    >
      <span className={styles.text}>{children}</span>
      <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d={download ? "M12 7v9m-4-4 4 4 4-4" : "M9 15l6-6m-5 0h5v5"} />
      </svg>
      {external ? <span className="sr-only"> (opens in a new tab)</span> : null}
    </a>
  );
}
