import { skillRings } from "@/content/portfolio";
import { SkillRings } from "./skill-rings";
import styles from "./skills.module.css";

export function Skills() {
  return (
    <section id="skills" className={styles.skills} data-header-theme="light" aria-labelledby="skills-title">
      <SkillRings rings={skillRings} />

      <div className={styles.layout}>
        <h2 id="skills-title" className={styles.title} data-reveal>
          <span className={styles.accent}>learning</span>
          <span>by design.</span>
        </h2>

        <div className={styles.card} data-skills-card data-cursor-theme="ink">
          <p>Python first. Most projects run from a notebook to an API in the same repository, with tests and CI.</p>
          <p>Deep learning: PyTorch for vision models, from a Vision Transformer written from scratch to ArcFace face recognition.</p>
          <p>LLMs: LangGraph agents, Gemini and MCP, with retrieval (BM25, dense embeddings, FAISS) benchmarked on the same questions.</p>
          <p>Classical ML: scikit-learn and XGBoost for tabular data, SHAP when someone needs to know why.</p>
          <p>Shipping: FastAPI, Flask, Docker and PostgreSQL, deployed on Vercel and Render.</p>
          <dl className={styles.areas}>
            {skillRings.map((ring) => (
              <div key={ring.label}>
                <dt>{ring.label}</dt>
                <dd>{ring.tools.join(", ")}</dd>
              </div>
            ))}
          </dl>
          <p className={styles.close}>Measured, then shipped.</p>
        </div>
      </div>
    </section>
  );
}
