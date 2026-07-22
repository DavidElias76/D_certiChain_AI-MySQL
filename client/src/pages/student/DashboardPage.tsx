import { Link } from 'react-router-dom';
import { 
  Award, 
  Search, 
  ArrowRight,
  ShieldCheck,
  Cpu,
  Star
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const QuickAction = ({ title, desc, icon: Icon, to }: any) => (
  <Link 
    to={to}
    className="group bg-white border border-slate-200 p-6 hover:border-slate-300 transition-all rounded-lg"
  >
    <div className="w-11 h-11 bg-slate-100 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
      <Icon className="text-slate-600" size={26} />
    </div>
    <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
    <p className="text-slate-600 text-sm leading-relaxed mb-6">{desc}</p>
    <div className="flex items-center gap-2 text-indigo-600 text-sm font-medium">
      Access 
      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
    </div>
  </Link>
);

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-10">
      {/* Welcome Banner */}
      <div className="bg-white border border-slate-200 p-8 rounded-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Welcome back, {user?.username || 'Student'}
            </h1>
            <p className="text-slate-600 mt-2 text-xl">
              Your academic journey is secured on the blockchain.
            </p>
          </div>

          <div className="flex gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900">0</div>
              <div className="text-xs text-slate-500 mt-1">CERTIFICATES</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900">0</div>
              <div className="text-xs text-slate-500 mt-1">VERIFICATIONS</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-medium text-slate-700 mb-5">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickAction 
            title="My Certificates" 
            desc="View and download your verified academic credentials." 
            icon={Award} 
            to="/my-certificates"
          />
          <QuickAction 
            title="Verify Certificate" 
            desc="Check the authenticity of any certificate using blockchain." 
            icon={Search} 
            to="/verify-certificate"
          />
          <QuickAction 
            title="Career Recommendations" 
            desc="Get AI-powered job suggestions based on your qualifications." 
            icon={Cpu} 
            to="/career-recommendations"
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Certificates */}
        <div className="lg:col-span-2 bg-white border border-slate-200 p-6 rounded-lg">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-medium text-slate-900">Recent Certificates</h3>
            <Link to="/my-certificates" className="text-indigo-600 text-sm hover:underline">
              View All →
            </Link>
          </div>
          
          <div className="py-16 text-center border border-dashed border-slate-300 rounded">
            <ShieldCheck size={48} className="mx-auto text-slate-400 mb-4" />
            <h4 className="text-slate-700 font-medium">No certificates yet</h4>
            <p className="text-slate-500 text-sm mt-2">
              Certificates issued by your institution will appear here.
            </p>
          </div>
        </div>

        {/* AI Career Insights */}
        <div className="bg-white border border-slate-200 p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-6">
            <Star className="text-amber-500" size={22} />
            <h3 className="font-medium text-slate-900">AI Career Insights</h3>
          </div>
          
          <div className="space-y-5">
            <div className="p-5 bg-slate-50 border border-slate-100">
              <p className="uppercase text-xs tracking-widest text-slate-500 mb-2">Recommended Role</p>
              <h4 className="text-slate-900 font-medium">Business Analyst / Full Stack Developer</h4>
              <p className="text-slate-600 text-sm mt-3">
                High demand roles based on your BBIT qualification.
              </p>
            </div>

            <div className="p-5 bg-slate-50 border border-slate-100">
              <p className="uppercase text-xs tracking-widest text-slate-500 mb-2">Suggestion</p>
              <p className="text-slate-600 text-sm">
                Complete your profile and verify your certificates to unlock better recommendations.
              </p>
            </div>
          </div>

          <Link 
            to="/career-recommendations"
            className="block w-full text-center mt-8 py-3.5 bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors rounded"
          >
            Open AI Career Engine
          </Link>
        </div>
      </div>
    </div>
  );
}