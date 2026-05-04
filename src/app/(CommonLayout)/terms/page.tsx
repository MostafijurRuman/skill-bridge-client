import { FileText } from "lucide-react";

export const metadata = {
  title: "Terms of Service | SkillBridge",
  description: "Read our terms of service.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden pb-24">
      {/* Header Section */}
      <section className="relative py-16 md:py-24 px-4 border-b border-border bg-muted/10">
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-heading tracking-tight">
            Terms of Service
          </h1>
          <p className="text-muted-foreground font-sans">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="px-4 mt-16">
        <div className="max-w-3xl mx-auto space-y-6 text-muted-foreground leading-relaxed">
          <h2 className="text-2xl font-bold font-heading text-foreground mt-8 mb-4">1. Agreement to Terms</h2>
          <p>
            By viewing or using this website, which can be accessed at SkillBridge.com, you are agreeing to be bound by these website Terms and Conditions of Use and agree that you are responsible for the agreement with any applicable local laws. If you disagree with any of these terms, you are prohibited from accessing this site. The materials contained in this website are protected by copyright and trade mark law.
          </p>

          <h2 className="text-2xl font-bold font-heading text-foreground mt-8 mb-4">2. Use License</h2>
          <p>
            Permission is granted to temporarily download one copy of the materials on SkillBridge's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>modify or copy the materials;</li>
            <li>use the materials for any commercial purpose or for any public display;</li>
            <li>attempt to reverse engineer any software contained on SkillBridge's website;</li>
            <li>remove any copyright or other proprietary notations from the materials; or</li>
            <li>transfer the materials to another person or "mirror" the materials on any other server.</li>
          </ul>

          <h2 className="text-2xl font-bold font-heading text-foreground mt-8 mb-4">3. Disclaimer</h2>
          <p>
            All the materials on SkillBridge's website are provided "as is". SkillBridge makes no warranties, may it be expressed or implied, therefore negates all other warranties. Furthermore, SkillBridge does not make any representations concerning the accuracy or reliability of the use of the materials on its website or otherwise relating to such materials or any sites linked to this website.
          </p>

          <h2 className="text-2xl font-bold font-heading text-foreground mt-8 mb-4">4. Limitations</h2>
          <p>
            SkillBridge or its suppliers will not be hold accountable for any damages that will arise with the use or inability to use the materials on SkillBridge's website, even if SkillBridge or an authorize representative of this website has been notified, orally or written, of the possibility of such damage. Some jurisdiction does not allow limitations on implied warranties or limitations of liability for incidental damages, these limitations may not apply to you.
          </p>

          <h2 className="text-2xl font-bold font-heading text-foreground mt-8 mb-4">5. Revisions and Errata</h2>
          <p>
            The materials appearing on SkillBridge's website may include technical, typographical, or photographic errors. SkillBridge will not promise that any of the materials in this website are accurate, complete, or current. SkillBridge may change the materials contained on its website at any time without notice. SkillBridge does not make any commitment to update the materials.
          </p>

          <h2 className="text-2xl font-bold font-heading text-foreground mt-8 mb-4">6. Links</h2>
          <p>
            SkillBridge has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The presence of any link does not imply endorsement by SkillBridge of the site. The use of any linked website is at the user's own risk.
          </p>
        </div>
      </section>
    </div>
  );
}
