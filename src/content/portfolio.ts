// Every fact on the site lives here. Sources: resume PDF, LinkedIn export,
// each project's README on github.com/ZainDev04, and the results files of the
// team repos (TechFest, StepGuard). No number goes here without a source file.

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
    slug: "techfest",
    title: "Face recognition",
    year: "2026",
    context: "Runner-up of 50 university teams, NED CSIT TechFest",
    summary:
      "An offline face recognition pipeline for Pakistani faces that runs on a normal CPU: detect, align, check quality, embed with ArcFace and match against a tuned threshold. I built the pipeline and the fine-tuning; the team worked through everything together.",
    results: [
      "97.1% accuracy, 2.9% EER on 40 held-out South Asian people",
      "Without alignment the error rate rises to 25.4%",
      "GPU fine-tune did not clearly win, so we kept the original and said so",
    ],
    stack: ["Python", "PyTorch", "InsightFace", "ArcFace", "ONNX"],
    image: "/work/techfest.webp",
    imageAlt: "Bar chart: face verification error rate is 2.9% with the full pipeline and 25.4% without alignment.",
  },
  {
    slug: "leash",
    title: "Leash",
    year: "2026",
    context: "Payment guardrails for AI agents, PayPal AI Hackathon",
    summary:
      "Lets AI agents pay through PayPal, but only inside rules the user sets. Code checks every payment for budget, store, price and duplicates, PayPal holds the money, and Gemini reads the shop page for hidden instructions before anything is charged. I built the full service for our team entry.",
    results: [
      "The AI can only make a decision stricter, never approve one",
      "Any Gemini or PayPal failure blocks the payment",
      "Agents connect with their own key, or Claude through MCP",
    ],
    stack: ["Python", "FastAPI", "PostgreSQL", "Gemini", "PayPal SDK", "MCP"],
    image: "/work/leash.webp",
    imageAlt: "Leash landing page: Your agents pay. You hold the leash.",
    live: "https://leash-b2xx.onrender.com",
    code: "https://github.com/ZainDev04/leash",
  },
  {
    slug: "vit",
    title: "Mimetic initialization, reproduced",
    year: "2026",
    context: "ICML 2023 paper reproduction, team of three",
    summary:
      "Reproduced Trockman and Kolter's ICML 2023 paper, which has no official code. We wrote a 5.3M-parameter Vision Transformer, the SVD-based mimetic initialization and the training loop from scratch in PyTorch and trained on CIFAR-10.",
    results: [
      "Test accuracy 85.13% to 88.87% with mimetic init",
      "79% of the gain the paper reports",
      "Beat the 100-epoch baseline after 50 epochs",
    ],
    stack: ["PyTorch", "Vision Transformer", "CIFAR-10", "Mixed precision"],
    image: "/work/vit.webp",
    imageAlt: "CIFAR-10 test accuracy per epoch: mimetic init reaches 88.87%, base init 85.13%.",
    code: "https://github.com/ZainDev04/mimetic-init-vit",
  },
  {
    slug: "flyrank",
    title: "FlyRank ML internship",
    year: "2026",
    context: "Content archetypes on 18,752 pages",
    summary:
      "Clustered 18,752 production pages from 29 client sites into content archetypes with K-Means, compared against Gaussian mixture and agglomerative baselines, and turned them into an action playbook. Five archetypes survived an ablation test; the sixth was withdrawn and the paper says why.",
    results: [
      "Leave-one-client-out ARI 0.909 across 17 clients",
      "Five of six archetypes survived the ablation test",
      "Data contract checked against a 78.8M-row dataset with DuckDB",
    ],
    stack: ["Python", "pandas", "scikit-learn", "DuckDB", "Hugging Face"],
    image: "/work/flyrank.webp",
    imageAlt: "FlyRank capstone paper: What kinds of content pages exist, and what should you do with each?",
    paper: "https://zaindev04.github.io/Flyrank-ML-Internship/",
    code: "https://github.com/ZainDev04/Flyrank-ML-Internship",
  },
  {
    slug: "ccpp",
    title: "Power plant output prediction",
    year: "2026",
    context: "Regression with decision support",
    summary:
      "Predicts a combined cycle plant's hourly output from the weather and one condenser reading, using 9,568 hours of real plant data. Three models are compared, and the best one drives a performance alarm and a safety margin for grid commitments, in the browser and in Tableau.",
    results: [
      "KNN: R² 0.959, RMSE 3.45 MW on 1,906 held-out hours",
      "All three models beat the best published result (R² 0.912)",
      "KNN lead confirmed with a paired bootstrap",
    ],
    stack: ["Python", "scikit-learn", "Tableau"],
    image: "/work/ccpp.webp",
    imageAlt: "Plant output predictor: Predict a power plant's output from the weather.",
    live: "https://ccpp-power-prediction.vercel.app",
    code: "https://github.com/ZainDev04/ccpp-power-prediction",
  },
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
    slug: "git-search",
    title: "Semantic search over Git history",
    year: "2026",
    context: "Hybrid retrieval and RAG with citation checks",
    summary:
      "Searches 2,500 commit messages from huggingface/datasets by meaning, combining BM25, LSA and sentence-transformer embeddings in FAISS. A language model answers with commit citations, and every cited id is checked against what was retrieved.",
    results: ["Right commit at rank 1 for 20 of 22 questions with dense retrieval", "17 of 22 with BM25 alone", "Fabricated citations shown in red"],
    stack: ["Python", "FAISS", "sentence-transformers", "BM25", "Streamlit"],
    image: "/work/gitsearch.webp",
    imageAlt: "Bar chart: dense retrieval finds the right commit at rank 1 for 20 of 22 questions, BM25 for 17.",
    code: "https://github.com/ZainDev04/Semantic-Search-Engine-RAG-FAISS",
  },
  {
    slug: "stepguard",
    title: "StepGuard",
    year: "2026–27",
    context: "Final year project, NED University",
    summary:
      "Checks each step of a multi-hop RAG agent against its evidence, finds the first step that fails and triggers a repair. The LangGraph testbed and an error-injection pipeline for labeled traces are built; the step detector comes next.",
    results: [
      "Proposal approved by the FYP panel",
      "Baseline to beat on a 67-trace pilot: step F1 0.800, 1.17 s per step",
      "100 of 500 agent traces collected",
    ],
    stack: ["Python", "LangGraph", "Transformers", "HotpotQA", "Gemini"],
    image: "/work/stepguard.webp",
    imageAlt: "StepGuard method: plan, retrieve, reason, answer; the first failing step is repaired and re-run.",
    status: "in progress",
  },
  {
    slug: "parking",
    title: "Smart parking reasoning",
    year: "2026",
    context: "Knowledge representation course project (CT-351), team of four",
    summary:
      "A rule-based system that decides who may park on campus, which bay each driver gets, and explains every refusal down to the missing fact. One vocabulary is written as frames, a semantic network, first-order logic, description logic and Horn clauses, with forward and backward chaining engines built separately.",
    results: [
      "28 rules and 7 integrity constraints; 105 derived facts in 10 cycles",
      "Both engines derive the same facts in every test scenario",
      "Python engine matches SWI-Prolog: 105 conclusions each",
    ],
    stack: ["Python", "Prolog", "OWL", "Streamlit", "CI"],
    image: "/work/parking.webp",
    imageAlt: "3D campus car park after the morning rush, with allocated and turned-away drivers.",
    live: "https://smart-parking-krr.vercel.app",
    code: "https://github.com/ZainDev04/smart-parking-krr",
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
  card("techfest", "techfest-a", 1600, 1000, "Face verification error rate with and without alignment"),
  card("leash", "leash-a", 1600, 1000, "Leash landing page"),
  card("vit", "vit-a", 1600, 1000, "CIFAR-10 test accuracy per epoch, mimetic against base init"),
  card("flyrank", "flyrank-a", 1600, 1000, "FlyRank capstone paper cover"),
  card("ccpp", "ccpp-a", 1600, 1000, "Power plant output predictor"),
  card("edupulse", "edupulse-a", 1600, 1000, "EduPulse landing page"),
  card("git-search", "gitsearch-a", 1600, 1000, "Right commit at rank 1: dense 20 of 22, BM25 17 of 22"),
  card("stepguard", "stepguard-a", 1600, 1000, "StepGuard method: find the first failing step and repair it"),
  card("parking", "parking-a", 1600, 1000, "3D campus car park after the morning rush"),
  card("leash", "leash-b", 1600, 1000, "Leash: the four checks every payment passes"),
  card("vit", "vit-b", 1600, 1000, "Final accuracy at 25, 50 and 100 epochs, mimetic against base"),
  card("ccpp", "ccpp-b", 1600, 1000, "Every degree costs about 2.2 MW"),
  card("edupulse", "edupulse-b", 1600, 1000, "EduPulse: a 96% accurate model that answered the wrong question"),
  card("git-search", "gitsearch-b", 1600, 1000, "Git search answer with its citation check"),
];

export type Role = { org: string; title: string; dates: string; place: string; points: string[] };

export const experience: Role[] = [
  {
    org: "FlyRank",
    title: "Machine learning intern",
    dates: "Jul – Aug 2026",
    place: "Remote",
    points: [
      "Clustered 18,752 production pages from 29 client sites into content archetypes with K-Means and turned them into an action playbook.",
      "Validated with leave-one-client-out testing (mean ARI 0.909 across 17 clients) and a feature-ablation test; withdrew the archetype that failed.",
      "Checked the data contract against a 78.8M-row dataset with DuckDB, and published the capstone as a paper.",
    ],
  },
  {
    org: "DecodeLabs",
    title: "Artificial intelligence intern",
    dates: "Jun – Jul 2026",
    place: "Remote",
    points: [
      "Built and deployed Nova, a chatbot with five-tier intent matching including TF-IDF, and a KNN classifier (96.0% cross-validated accuracy) with a live web app, both with tests in CI.",
    ],
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
  { school: "NED University of Engineering and Technology", detail: "BS Computer Science, specialisation in Artificial Intelligence, CGPA 3.4/4.0", dates: "2023 – 2027" },
  { school: "DJ Sindh Government Science College", detail: "Intermediate, pre-engineering", dates: "2020 – 2022" },
  { school: "Al-Jauhar Grammar School", detail: "Matriculation, computer science", dates: "2020" },
];

export const certifications = [
  { name: "Google AI Professional Certificate", issuer: "Google, Coursera", date: "Jun 2026" },
  { name: "AI for Research and Insights", issuer: "Google, Coursera", date: "Jun 2026" },
  { name: "AI for Brainstorming and Planning", issuer: "Google, Coursera", date: "Jun 2026" },
  { name: "AI for Content Creation", issuer: "Google, Coursera", date: "Jun 2026" },
  { name: "Machine Learning Certification", issuer: "FlyRank", date: "2026" },
  { name: "AI Fluency Certification", issuer: "FlyRank", date: "2026" },
  { name: "Virtual Internship, Artificial Intelligence", issuer: "DecodeLabs", date: "Jul 2026" },
  { name: "Web Development Course", issuer: "Aptech Computer Education", date: "" },
];

// Skills scene: one ring per area, tools placed on the rings.
export const skillRings = [
  { label: "Deep learning & vision", tools: ["PyTorch", "ArcFace"] },
  { label: "LLMs & agents", tools: ["LangGraph", "Gemini"] },
  { label: "Retrieval & RAG", tools: ["FAISS", "BM25"] },
  { label: "Supervised learning", tools: ["scikit-learn", "XGBoost"] },
  { label: "Explainability", tools: ["SHAP"] },
  { label: "Deployment", tools: ["FastAPI", "Docker"] },
];

export const coursework = ["Machine learning", "Deep learning", "Knowledge representation and reasoning", "Data mining", "Algorithms and data structures"];
