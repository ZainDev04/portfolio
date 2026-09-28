// Every fact on the site lives here. Sources: resume PDF, LinkedIn export,
// and each project's README on github.com/ZainDev04.

export const person = {
  name: "Shaikh Muhammad Zain",
  role: "Machine learning engineer",
  location: "Karachi, Pakistan",
  email: "smzain20042004@gmail.com",
  github: "https://github.com/ZainDev04",
  linkedin: "https://www.linkedin.com/in/shaikh-muhammad-zain/",
  resume: "/Shaikh-Muhammad-Zain-Resume.pdf",
  lookingFor: "Remote or international ML internships and junior ML engineer roles.",
};

export type Project = {
  slug: string;
  title: string;
  year: string;
  context: string;
  summary: string;
  results: string[];
  stack: string[];
  image?: string;
  imageAlt?: string;
  live?: string;
  code?: string;
  paper?: string;
  status?: "in progress";
};

export const projects: Project[] = [
  {
    slug: "edupulse",
    title: "EduPulse",
    year: "2026",
    context: "Student performance intelligence platform",
    summary:
      "Flags students likely to average below 60 before any exam is taken, explains every prediction with SHAP and audits the model for fairness across student groups. Ten model families are benchmarked from one training command.",
    results: ["At-risk ROC-AUC 0.742 in cross-validation", "Math-score R² 0.882 on the hold-out set", "Per-group thresholds lift recall to 0.88"],
    stack: ["Python", "scikit-learn", "XGBoost", "SHAP", "FastAPI", "Streamlit", "Docker", "CI/CD"],
    image: "/work/edupulse.webp",
    imageAlt: "EduPulse landing page: Catch the student who will struggle, before the first exam.",
    live: "https://edupulse-ml.vercel.app",
    code: "https://github.com/ZainDev04/edupulse",
  },
  {
    slug: "flyrank",
    title: "FlyRank ML internship",
    year: "2026",
    context: "Search ranking model and content archetype study",
    summary:
      "Built classification models on real anonymised search data and scaled the pipeline from a 30k-row starter set to a 79M-row warehouse. The capstone clustered 18,752 pages into behavioural archetypes; five survived an ablation test and the sixth was withdrawn.",
    results: ["Precision@50 from 0.24 to 0.74 over the hand-written baseline", "30k to 79M rows with DuckDB", "Leave-one-client-out ARI 0.909 across 17 clients"],
    stack: ["Python", "pandas", "scikit-learn", "DuckDB", "Hugging Face"],
    image: "/work/flyrank.webp",
    imageAlt: "FlyRank capstone paper: What kinds of content pages exist, and what should you do with each?",
    paper: "https://zaindev04.github.io/Flyrank-ML-Internship/",
    code: "https://github.com/ZainDev04/Flyrank-ML-Internship",
  },
  {
    slug: "git-search",
    title: "Semantic search over Git history",
    year: "2026",
    context: "Hybrid retrieval and RAG with citation checks",
    summary:
      "Searches 2,500 commit messages from huggingface/datasets by meaning, combining BM25, LSA and sentence-transformer embeddings in FAISS. A language model answers with commit citations, and every cited id is checked against what was retrieved.",
    results: ["Right commit at rank 1 for 20 of 22 questions with dense retrieval", "17 of 22 with BM25 alone", "Fabricated citations shown in red"],
    stack: ["Python", "FAISS", "sentence-transformers", "BM25", "Streamlit"],
    image: "/work/gitsearch.webp",
    imageAlt: "Streamlit demo: hybrid retrieval results on the left, the answer and its citation check on the right.",
    code: "https://github.com/ZainDev04/Semantic-Search-Engine-RAG-FAISS",
  },
  {
    slug: "nova",
    title: "Nova",
    year: "2026",
    context: "Rule-based chatbot, DecodeLabs internship",
    summary:
      "Answers with rules instead of a model, so every reply traces back to a line in intents.json. Input is matched in five tiers, from exact lookup to TF-IDF similarity, and the web interface shows which tier answered.",
    results: ["34 intents", "Five matching tiers, cheapest first", "Session memory and safe arithmetic without eval()"],
    stack: ["Python", "Flask", "pytest"],
    image: "/work/nova.webp",
    imageAlt: "Nova chat interface with the match-trace panel.",
    live: "https://nova-rule-based-chatbot.vercel.app",
    code: "https://github.com/ZainDev04/Rule-based-chatbot",
  },
  {
    slug: "iris",
    title: "Iris species classifier",
    year: "2026",
    context: "KNN with an explainable web app, DecodeLabs internship",
    summary:
      "A K-nearest-neighbours model behind a JSON API and a page that shows the neighbours that cast each vote. Every chart is drawn in the browser from the live model.",
    results: ["96.0% five-fold cross-validated accuracy", "93.3% test accuracy", "Strict Content-Security-Policy"],
    stack: ["Python", "scikit-learn", "Flask"],
    image: "/work/iris.webp",
    imageAlt: "Iris Species Classifier landing page with accuracy metrics.",
    live: "https://iris-knn.vercel.app",
    code: "https://github.com/ZainDev04/iris-classifier",
  },
  {
    slug: "stepguard",
    title: "StepGuard",
    year: "2026–27",
    context: "Final year project, NED University",
    summary:
      "Middleware that wraps LangGraph agents, flags hallucinations at each step using log-probability screening and a fine-tuned ModernBERT classifier, and tries to repair them without changing the agent.",
    results: ["Proposal approved by the FYP panel", "Implementation in progress"],
    stack: ["Python", "PyTorch", "Transformers", "LangGraph"],
    status: "in progress",
  },
];

// Cards on the desktop orbit sphere: real screenshots from each project, in
// mixed shapes. w/h are the image's shape scaled to a 2048px long side (the
// sphere's sizing unit). Interleaved so projects
// spread around the sphere.
export type OrbitCard = { slug: string; src?: string; w: number; h: number; alt: string };

const card = (slug: string, file: string, w: number, h: number, alt: string): OrbitCard => {
  const s = 2048 / Math.max(w, h);
  return { slug, src: `/work/orbit/${file}.webp`, w: Math.round(w * s), h: Math.round(h * s), alt };
};

export const orbitCards: OrbitCard[] = [
  card("edupulse", "edupulse-a", 1000, 625, "EduPulse landing page"),
  card("nova", "nova-b", 1000, 677, "Nova answering a question with the match trace open"),
  card("flyrank", "flyrank-b", 1000, 750, "FlyRank paper: the data exclusions table"),
  card("iris", "iris-a", 1000, 625, "Iris classifier landing page"),
  card("git-search", "gitsearch-b", 811, 1000, "Git search answer with its citation check"),
  card("edupulse", "edupulse-b", 1000, 1000, "EduPulse: a 96% accurate model that answered the wrong question"),
  card("iris", "iris-c", 1000, 575, "Iris scatter plot of all 150 samples"),
  { slug: "stepguard", w: 2048, h: 1280, alt: "StepGuard, final year project, in progress" },
  card("flyrank", "flyrank-a", 1000, 625, "FlyRank capstone paper cover"),
  card("nova", "nova-a", 1000, 625, "Nova chat interface"),
  card("git-search", "gitsearch-a", 1000, 625, "Git search Streamlit demo"),
  card("iris", "iris-b", 1000, 987, "Iris prediction with its nearest neighbours"),
  card("edupulse", "edupulse-c", 1000, 469, "EduPulse held-out results charts"),
];

export type Role = { org: string; title: string; dates: string; place: string; points: string[] };

export const experience: Role[] = [
  {
    org: "FlyRank",
    title: "Machine learning intern",
    dates: "Jul – Aug 2026",
    place: "Remote",
    points: [
      "Classification models for search ranking on real anonymised data: Precision@50 from 0.24 to 0.74 over the hand-written rule.",
      "Scaled the pipeline from 30k rows to a 79M-row Hugging Face warehouse with DuckDB.",
      "Capstone: behavioural archetypes on 18,752 pages, with a published paper.",
    ],
  },
  {
    org: "DecodeLabs",
    title: "Artificial intelligence intern",
    dates: "Jun – Jul 2026",
    place: "Remote",
    points: ["Built and deployed Nova, a rule-based chatbot, and an Iris KNN classifier with a live web app."],
  },
  {
    org: "Karachi Development Authority",
    title: "Information technology intern",
    dates: "Feb – Mar 2026",
    place: "Karachi",
    points: ["Day-to-day hardware and software support for the IT department in a public-sector office."],
  },
];

export const education = [
  { school: "NED University of Engineering and Technology", detail: "BS Computer Science, specialisation in Artificial Intelligence", dates: "2023 – 2027" },
  { school: "DJ Sindh Government Science College", detail: "Intermediate, pre-engineering", dates: "2020 – 2022" },
  { school: "Al-Jauhar Grammar School", detail: "Matriculation, computer science", dates: "2020" },
];

export const certifications = [
  { name: "Google AI Professional Certificate", issuer: "Coursera", date: "Jun 2026" },
  { name: "Machine Learning Certification", issuer: "FlyRank", date: "2026" },
  { name: "AI Fluency Certification", issuer: "FlyRank", date: "2026" },
  { name: "Virtual Internship, Artificial Intelligence", issuer: "DecodeLabs", date: "2026" },
  { name: "AI for Research and Insights", issuer: "", date: "" },
  { name: "AI for Brainstorming and Planning", issuer: "", date: "" },
  { name: "AI for Content Creation", issuer: "", date: "" },
  { name: "Web Development Course", issuer: "Aptech Computer Education", date: "" },
];

// Skills scene: one ring per area, tools placed on the rings.
export const skillRings = [
  { label: "Retrieval & RAG", tools: ["FAISS", "BM25"] },
  { label: "Supervised learning", tools: ["scikit-learn", "XGBoost"] },
  { label: "Deep learning", tools: ["PyTorch", "TensorFlow"] },
  { label: "Explainability", tools: ["SHAP"] },
  { label: "Data engineering", tools: ["pandas", "DuckDB"] },
  { label: "Deployment", tools: ["FastAPI", "Streamlit", "Docker"] },
];

export const coursework = ["Machine learning", "Data mining", "Parallel and distributed computing", "Algorithms and data structures", "Computer networks"];
