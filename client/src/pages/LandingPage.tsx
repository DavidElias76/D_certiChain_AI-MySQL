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
  Cpu
} from 'lucide-react';
import ThemeToggle from '../components/common/ThemeToggle';

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-border-muted dark:border-slate-800 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-5 flex items-center justify-between text-left hover:text-primary transition-colors"
      >
        <span className="text-base font-semibold text-on-surface dark:text-white">{question}</span>
        {isOpen ? <Minus size={18} /> : <Plus size={18} />}
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 pb-5' : 'max-h-0'}`}>
        <p className="text-sm text-on-surface-variant dark:text-slate-400 leading-relaxed">
          {answer}
        </p>
      </div>
    </div>
  );
};

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-surface-subtle dark:bg-slate-950 text-on-surface dark:text-slate-200 selection:bg-primary/30 font-sans transition-colors duration-300">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-border-muted dark:border-slate-800/50">
        <div className="max-w-container mx-auto px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-primary p-1.5">
              <ShieldCheck className="text-white" size={20} />
            </div>
            <span className="text-lg font-bold tracking-tight text-on-surface dark:text-white">CertiChain <span className="text-primary">AI</span></span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-[13px] font-semibold tracking-wider">
            <a href="#features" className="hover:text-primary dark:hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-primary dark:hover:text-white transition-colors">How It Works</a>
            <a href="#use-cases" className="hover:text-primary dark:hover:text-white transition-colors">Use Cases</a>
            <a href="#faq" className="hover:text-primary dark:hover:text-white transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/login" className="text-[13px] font-semibold hover:text-primary dark:hover:text-white transition-colors px-3 tracking-wider rounded-md border-0">
              Log in
            </Link>
            <Link to="/register" className="bg-primary hover:bg-primary-container text-white px-4 py-2 text-[13px] font-semibold transition-all rounded-md">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-28 pb-16 lg:pt-40 lg:pb-24 overflow-hidden bg-white dark:bg-slate-950">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_50%,rgba(10,105,218,0.05)_0%,rgba(0,0,0,0)_100%)] dark:bg-[radial-gradient(45%_40%_at_50%_50%,rgba(10,105,218,0.08)_0%,rgba(0,0,0,0)_100%)]" />
        
        <div className="max-w-container mx-auto px-6 text-center flex flex-col items-center">
          <div className="max-w-4xl">
            <span className="inline-block px-3 py-1 bg-indigo-600 dark:bg-slate-900 border border-border-muted dark:border-slate-800 text-slate-200 dark:text-slate-300 text-[12px] font-semibold mb-6 tracking-wider rounded-lg">
              Blockchain-powered certificate verification
            </span>
            
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-on-surface dark:text-white mb-6 leading-[1.2]">
              Trust in every credential. <br/>
              Verify, manage and grow with AI-powered certificate intelligence.
            </h1>
            
            <p className="max-w-2xl mx-auto text-[18px] text-on-surface-variant dark:text-slate-400 mb-8 leading-relaxed">
              CertiChain AI combines blockchain verification with AI career guidance to give universities, students and employers a unified platform for trusted credentials.
            </p>

            <div className="flex items-center justify-center gap-3">
              <Link to="/register" className="bg-primary text-white px-8 py-3 font-bold text-[15px] hover:bg-primary-container transition-all flex items-center gap-2 tracking-widest rounded-md">
                Verify Certificates
              </Link>
              <Link to="/login" className="bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-3 font-bold text-[15px] transition-all flex items-center gap-2 tracking-widest rounded-md">
                Log in
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 scroll-mt-16 bg-white dark:bg-slate-950">
        <div className="max-w-container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <span className="text-slate-900 dark:text-primary-container text-[30px] font-extrabold">Features</span>
            <h2 className="text-2xl lg:text-3xl font-bold text-on-surface dark:text-white mt-3 tracking-tight">Everything you need to validate credentials</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Blockchain Verification", icon: ShieldCheck, desc: "Immutable certificate records stored on-chain with cryptographic proof of authenticity." },
              { title: "Instant Verification", icon: Search, desc: "Scan QR code or upload PDF for real-time blockchain validation." },
              { title: "AI Career Guidance", icon: Cpu, desc: "Intelligent job recommendations based on verified academic credentials." },
              { title: "Admin Dashboard", icon: LayoutDashboard, desc: "Issue, manage, revoke certificates and track all activity." },
              { title: "Digital Certificates", icon: Award, desc: "Students receive secure PDF certificates with embedded QR codes." },
              { title: "Employer Portal", icon: Building2, desc: "Bulk verification and instant background checks for recruiters." }
            ].map((feature, i) => (
              <div key={i} className="bg-white dark:bg-slate-950 border border-border-muted dark:border-slate-800 p-6 hover:border-primary transition-all group">
                <div className="w-10 h-10 bg-surface-container-low dark:bg-slate-900 flex items-center justify-center mb-4 border border-border-muted dark:border-slate-800">
                  <feature.icon className="text-primary dark:text-primary-container" size={22} />
                </div>
                <h3 className="text-[17px] font-bold text-on-surface dark:text-white mb-3 tracking-tight">{feature.title}</h3>
                <p className="text-[14px] text-on-surface-variant dark:text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

{/* the heading and the sub heading need to be different */}
      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-slate-50 dark:bg-slate-900/50 transition-colors scroll-mt-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-2xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">How It Works</h2>
            <p className="text-slate-900 dark:text-slate-400 text-xl font-bold">Simple, secure process for students and employers</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
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
              <div key={i} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-8">
                <span className="text-slate-900 dark:text-indigo-400 font-mono font-bold text-base block mb-4">
                  {item.step}
                </span>
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Step {i+1}</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="py-20 bg-white dark:bg-slate-950 scroll-mt-16">
        <div className="max-w-container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <span className="text-slate-900 dark:text-primary-container font-mono text-[25px] font-bold">Use cases</span>
            <h2 className="text-2xl lg:text-3xl font-bold text-on-surface dark:text-white mt-3 tracking-tight">
              Built for every stakeholder
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10">
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
                className="text-center p-8 border border-slate-200 dark:border-slate-800 hover:border-primary/50 transition-all"
              >
                <h3 className="text-[17px] font-bold text-on-surface dark:text-white mb-4 tracking-tight">
                  {item.title}
                </h3>
                <p className="text-[14px] text-on-surface-variant dark:text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-white dark:bg-slate-950 transition-colors scroll-mt-16">
        <div className="max-w-container mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="text-center lg:text-left">
              <h2 className="text-2xl lg:text-3xl font-bold text-on-surface dark:text-white mb-4 tracking-tight">
                Frequently Asked Questions
              </h2>
              <p className="text-[14px] text-on-surface-variant dark:text-slate-400 mb-6 leading-relaxed">
                Everything you need to know about CertiChain AI and our blockchain verification process.
              </p>
              
              <div className="bg-auth-navy p-6 text-white text-center border border-border-muted rounded-2xl">
                <h4 className="font-bold text-sm mb-2 tracking-wider">Still have questions?</h4>
                <p className="text-slate-400 text-[12px] mb-5 leading-relaxed">
                  Can't find the answer you're looking for? Please chat with our friendly team.
                </p>
                <button className="bg-primary text-white px-6 py-2.5 rounded-lg font-bold text-[12px] hover:bg-primary-container transition-colors tracking-widest">
                  Contact Support
                </button>
              </div>
            </div>
            
            <div className="lg:col-span-2 space-y-6">
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

      {/* CTA Section */}
      <section className="py-20 bg-surface-subtle dark:bg-slate-950">
        <div className="max-w-container mx-auto px-6">
          <div className="bg-auth-navy dark:bg-primary p-10 lg:p-16 text-center text-white rounded-2xl border border-border-muted dark:border-slate-800">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 tracking-tight">
              Ready to get started?
            </h2>
            <p className="text-slate-300 text-[15px] mb-8 max-w-lg mx-auto leading-relaxed">
              Join universities, students and employers building trust in digital credentials.
            </p>
            <Link 
              to="/register" 
              className="inline-flex items-center gap-2 bg-white text-auth-navy dark:text-white dark:bg-primary-container px-8 py-3 font-bold text-[15px] hover:bg-surface-subtle transition-all tracking-widest rounded-lg"
            >
              Get Started <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white dark:bg-slate-950 border-t border-border-muted dark:border-slate-800">
        <div className="max-w-container mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="text-primary" size={24} />
                <span className="text-base font-bold tracking-tight text-on-surface dark:text-white">CertiChain AI</span>
              </div>
              <p className="text-on-surface-variant text-[13px] leading-relaxed">
                Blockchain-powered certificate verification and AI career guidance platform.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-sm text-on-surface dark:text-white mb-4 tracking-wider">Product</h4>
              <ul className="space-y-3 text-[13px] text-on-surface-variant">
                <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">API</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Status</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sm text-on-surface dark:text-white mb-4 tracking-wider">Resources</h4>
              <ul className="space-y-3 text-[13px] text-on-surface-variant">
                <li><a href="#" className="hover:text-primary transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Guides</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Support</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sm text-on-surface dark:text-white mb-4 tracking-wider">Company</h4>
              <ul className="space-y-3 text-[13px] text-on-surface-variant">
                <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-border-muted dark:border-slate-900 text-center md:text-left">
            <p className="text-on-surface-variant text-[11px] tracking-widest">
              © 2026 CertiChain AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;