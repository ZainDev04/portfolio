import { Bio } from "@/components/bio/bio";
import { Contact } from "@/components/contact/contact";
import { Hero } from "@/components/hero/hero";
import { HeroStrip } from "@/components/hero/hero-strip";
import { Manifest } from "@/components/manifest/manifest";
import { Quote } from "@/components/quote/quote";
import { SiteHeader } from "@/components/site-header";
import { Skills } from "@/components/skills/skills";
import { Work } from "@/components/work/work";
import { person, projects } from "@/content/portfolio";

// Structured data so search engines can show name, role and profiles.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: person.name,
  jobTitle: person.role,
  email: `mailto:${person.email}`,
  address: { "@type": "PostalAddress", addressLocality: "Karachi", addressCountry: "PK" },
  alumniOf: { "@type": "CollegeOrUniversity", name: "NED University of Engineering and Technology" },
  sameAs: [person.github, person.linkedin],
  knowsAbout: ["Machine learning", "Retrieval-augmented generation", "Information retrieval", "Python"],
  workExample: projects
    .filter((p) => p.live || p.code)
    .map((p) => ({ "@type": "CreativeWork", name: p.title, url: p.live ?? p.code })),
};

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <Hero />
        <Manifest />
        <Work />
        <Skills />
        <Bio />
        <Quote />
        <Contact />
      </main>
      <footer>
        <HeroStrip />
      </footer>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
