import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  ArrowRight, 
  Building2, 
  LayoutDashboard,
  Search,
  Award,
  Plus,
  Minus,
  Cpu,
  BadgeCheck,
  CheckCircle2,
  Fingerprint,
  GraduationCap,
  Landmark,
  LockKeyhole,
  Sparkles,
} from 'lucide-react';
import ThemeToggle from '../components/common/ThemeToggle';

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-slate-200 dark:border-slate-800 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-4 py-5 text-left transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 rounded-md"
      >
        <span className="text-sm font-semibold text-slate-900 dark:text-white sm:text-base">{question}</span>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-slate-200 text-indigo-600 dark:border-slate-700 dark:text-indigo-400">
          {isOpen ? <Minus size={16} /> : <Plus size={16} />}
        </span>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 pb-5' : 'max-h-0'}`}>
        <p className="pr-10 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {answer}
        </p>
      </div>
    </div>
  );
};

const LandingPage = () => {
  return (
    <>
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-200 dark:bg-slate-950 dark:text-slate-200">
      <header className="fixed top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center bg-indigo-600">
              <ShieldCheck className="text-white" size={20} />
            </div>
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white sm:text-lg">CertiChain <span className="text-indigo-600 dark:text-indigo-400">AI</span></span>
          </Link>
          <nav aria-label="Main navigation" className="hidden items-center gap-7 text-sm font-semibold text-slate-600 dark:text-slate-300 lg:flex">
            <a href="#features" className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400">Features</a>
            <a href="#how-it-works" className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400">How It Works</a>
            <a href="#use-cases" className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400">Use Cases</a>
            <a href="#faq" className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400">FAQ</a>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Link to="/login" className="px-2 py-2 text-sm font-semibold text-slate-700 transition-colors hover:text-indigo-600 dark:text-slate-200 dark:hover:text-indigo-400 sm:px-3 rounded-md">
              Log in
            </Link>
            <Link to="/register" className="bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 sm:px-4 rounded-md">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-slate-200 bg-white pt-28 dark:border-slate-800 dark:bg-slate-950 sm:pt-32 lg:pt-36">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_75%_30%,rgba(99,102,241,0.12),transparent_42%)] dark:bg-[radial-gradient(ellipse_at_75%_30%,rgba(79,70,229,0.18),transparent_42%)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-16 sm:px-8 sm:pb-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pb-24">
          <div>
            <span className="inline-flex items-center gap-2 border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-300 rounded-md">
              <ShieldCheck size={14} /> Blockchain-powered credentials
            </span>
            <h1 className="mt-6 max-w-2xl text-4xl font-bold leading-[1.08] tracking-tight text-slate-950 dark:text-white sm:text-5xl lg:text-6xl">
              Trust in every <span className="text-indigo-600 dark:text-indigo-400">credential.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400 sm:text-lg">
              Verify, manage and grow with AI-powered certificate intelligence. One trusted platform for universities, students and employers.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register" className="inline-flex items-center justify-center gap-2 bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 rounded-md">
                Verify Certificates <ArrowRight size={16} />
              </Link>
              <Link to="/login" className="inline-flex items-center justify-center border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition-colors hover:border-indigo-400 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-700 dark:hover:text-indigo-300 rounded-md">
                Log in
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-2"><CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400" /> Tamper-evident records</span>
              <span className="inline-flex items-center gap-2"><CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400" /> Simple certificate checks</span>
            </div>
          </div>

          <div aria-label="Illustration of a verified academic certificate" className="relative mx-auto w-full max-w-lg">
            <div aria-hidden="true" className="absolute -inset-5 bg-indigo-100/70 blur-3xl dark:bg-indigo-950/50" />
            <div className="relative border border-slate-200 bg-white p-4 shadow-2xl shadow-indigo-950/10 dark:border-slate-700 dark:bg-slate-900 sm:p-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center bg-indigo-600 text-white"><Landmark size={18} /></span>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Academic Credential</p>
                    <p className="mt-0.5 text-[10px] text-slate-500">Digital certificate record</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <BadgeCheck size={13} /> Verified
                </span>
              </div>
              <div className="py-7 text-center sm:py-9">
                <span className="mx-auto flex h-14 w-14 items-center justify-center border border-indigo-100 bg-indigo-50 text-indigo-600 dark:border-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-300">
                  <GraduationCap size={28} />
                </span>
                <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">Certificate of achievement</p>
                <div className="mx-auto mt-4 h-2 w-3/5 bg-slate-200 dark:bg-slate-700" />
                <div className="mx-auto mt-2 h-1.5 w-2/5 bg-slate-100 dark:bg-slate-800" />
                <div className="mx-auto mt-6 h-px w-4/5 bg-slate-100 dark:bg-slate-800" />
                <div className="mx-auto mt-4 grid w-4/5 grid-cols-2 gap-3">
                  <div className="h-7 border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-950" />
                  <div className="h-7 border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-950" />
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                <span className="inline-flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                  <LockKeyhole size={13} className="text-indigo-600 dark:text-indigo-400" /> Secured with blockchain proof
                </span>
                <Fingerprint size={24} className="text-indigo-300 dark:text-indigo-700" />
              </div>
            </div>
            <div className="absolute -bottom-5 -left-4 hidden items-center gap-2 border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-lg dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 sm:flex">
              <Sparkles size={15} className="text-indigo-600 dark:text-indigo-400" /> Trusted credentials, made simple
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="scroll-mt-20 bg-slate-50 py-20 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">Features</span>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-white lg:text-3xl">Everything you need to validate credentials</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">From secure issuance to instant checks, keep trusted credentials moving.</p>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Blockchain Verification", icon: ShieldCheck, desc: "Immutable certificate records stored on-chain with cryptographic proof of authenticity." },
              { title: "Instant Verification", icon: Search, desc: "Scan QR code or upload PDF for real-time blockchain validation." },
              { title: "AI Career Guidance", icon: Cpu, desc: "Intelligent job recommendations based on verified academic credentials." },
              { title: "Admin Dashboard", icon: LayoutDashboard, desc: "Issue, manage, revoke certificates and track all activity." },
              { title: "Digital Certificates", icon: Award, desc: "Students receive secure PDF certificates with embedded QR codes." },
              { title: "Employer Portal", icon: Building2, desc: "Bulk verification and instant background checks for recruiters." }
            ].map((feature, i) => (
              <div key={i} className="group border border-slate-200 bg-white p-6 transition-colors hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-800">
                <div className="mb-5 flex h-11 w-11 items-center justify-center border border-indigo-100 bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white dark:border-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-300 dark:group-hover:bg-indigo-600">
                  <feature.icon size={21} />
                </div>
                <h3 className="mb-2 text-base font-bold tracking-tight text-slate-900 dark:text-white">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-20 border-y border-slate-200 bg-white py-20 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-12 text-center">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">A clear process</span>
            <h2 className="mt-3 text-2xl font-bold text-slate-900 dark:text-white lg:text-3xl">How It Works</h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">Simple, secure steps for students and employers.</p>
          </div>
          
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { 
                step: "01. Issue", 
                desc: "Universities issue certificates on-chain through the admin portal with full metadata." 
              },
              { 
                step: "02. Receive & Verify", 
                desc: "Students download their secure PDF certificate with QR code, verify it on the blockchain and unlock AI-powered career recommendations." 
              },
              { 
                step: "03. Employer Verification", 
                desc: "Employers scan the QR code or upload the PDF for instant blockchain verification of the certificate." 
              }
            ].map((item, i) => (
              <div key={i} className="border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950 sm:p-7">
                <span className="mb-5 flex h-15 w-50 items-center justify-center border border-indigo-200 bg-indigo-50 font-mono text-sm font-bold text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-300">
                  {item.step}
                </span>
                <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-white">Step {i+1}</h3>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="use-cases" className="scroll-mt-20 bg-slate-50 py-20 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">Use cases</span>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-white lg:text-3xl">
              Built for every stakeholder
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">A shared foundation for institutions, graduates, and hiring teams.</p>
          </div>
          
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { 
                title: "Universities", 
                desc: "Issue tamper-proof digital certificates on the blockchain, manage issuance records, and reduce administrative workload." 
              },
              { 
                title: "Students", 
                desc: "Receive secure certificates, verify them instantly, store them digitally, and unlock AI-powered career recommendations." 
              },
              { 
                title: "Employers", 
                desc: "Verify candidate credentials in seconds using QR code or PDF upload, reduce fraud, and make faster hiring decisions." 
              }
            ].map((item, i) => (
              <div 
                key={i} 
                className="border border-slate-200 bg-white p-6 transition-colors hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-800 sm:p-8"
              >
                <span className="mb-5 flex h-10 w-10 items-center justify-center border border-indigo-100 bg-indigo-50 text-indigo-600 dark:border-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-300">
                  {i === 0 ? <Landmark size={19} /> : i === 1 ? <GraduationCap size={19} /> : <Building2 size={19} />}
                </span>
                <h3 className="mb-2 text-base font-bold tracking-tight text-slate-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="scroll-mt-20 border-t border-slate-200 bg-white py-20 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">Help center</span>
              <h2 className="mb-4 mt-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-white lg:text-3xl">
                Frequently Asked Questions
              </h2>
              <p className="mb-6 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Everything you need to know about CertiChain AI and our blockchain verification process.
              </p>
              
              <div className="border border-slate-800 bg-slate-950 p-6 text-white dark:border-slate-700">
                <h4 className="mb-2 text-sm font-bold">Still have questions?</h4>
                <p className="mb-5 text-sm leading-relaxed text-slate-400">
                  Can't find the answer you're looking for? Please chat with our friendly team.
                </p>
                <button className="bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 rounded-md">
                  Contact Support
                </button>
              </div>
            </div>
            
            <div className="divide-y divide-slate-200 border-y border-slate-200 dark:divide-slate-800 dark:border-slate-800">
              <FAQItem 
                question="How does blockchain verification work?" 
                answer="When a certificate is issued, a unique cryptographic hash is generated and stored on the Ethereum blockchain. When someone verifies the certificate, our system re-calculates the hash and compares it with the one on the ledger. If they match, the certificate is 100% authentic."
              />
              <FAQItem 
                question="Is it free for students?" 
                answer="Yes! Students can create an account, view their issued certificates, and share them with potential employers completely for free."
              />
              <FAQItem 
                question="How does the AI career engine work?" 
                answer="Our AI uses Google Gemini to analyze the specific units, grades, and skills listed on your verified certificates. It then compares this data with current job market trends to suggest the most suitable career paths."
              />
              <FAQItem 
                question="Can employers verify certificates in bulk?" 
                answer="Absolutely. Our Enterprise portal allows recruitment agencies and HR teams to upload thousands of certificates simultaneously for instant background checks."
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16 dark:bg-slate-950 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="relative overflow-hidden border border-slate-800 bg-slate-950 px-6 py-12 text-center text-white dark:border-slate-800 sm:px-10 lg:py-16">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_120%,rgba(79,70,229,0.55),transparent_58%)]" />
            <div className="relative">
              <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-300"><ShieldCheck size={14} /> Credentials you can trust</span>
              <h2 className="mb-4 mt-3 text-3xl font-bold tracking-tight lg:text-4xl">
                Ready to get started?
              </h2>
              <p className="mx-auto mb-8 mt-3 max-w-lg text-sm leading-relaxed text-slate-300 sm:text-base">
                Join universities, students and employers building trust in digital credentials.
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 rounded-md"
              >
                Get Started <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white py-12 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
            <div>
              <div className="mb-4 flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center bg-indigo-600"><ShieldCheck className="text-white" size={18} /></span>
                <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">CertiChain AI</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                Blockchain-powered certificate verification and AI career guidance platform.
              </p>
            </div>

            <div>
              <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">Product</h4>
              <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
                <li><a href="#" className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400">Features</a></li>
                <li><a href="#" className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400">Pricing</a></li>
                <li><a href="#" className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400">API</a></li>
                <li><a href="#" className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400">Status</a></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">Resources</h4>
              <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
                <li><a href="#" className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400">Documentation</a></li>
                <li><a href="#" className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400">Guides</a></li>
                <li><a href="#" className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400">Support</a></li>
                <li><a href="#" className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400">Blog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">Company</h4>
              <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
                <li><a href="#" className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400">About</a></li>
                <li><a href="#" className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400">Careers</a></li>
                <li><a href="#" className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400">Contact</a></li>
                <li><a href="#" className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400">Privacy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6 text-center dark:border-slate-800 md:text-left">
            <p className="text-[11px] tracking-wider text-slate-500 dark:text-slate-400">
              © 2026 CertiChain AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
    </>
  )
};

export default LandingPage;