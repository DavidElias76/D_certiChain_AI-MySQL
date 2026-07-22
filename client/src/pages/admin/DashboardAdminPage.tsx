import { 
  Users, 
  FileText, 
  ShieldCheck, 
  TrendingUp, 
  Clock,
  CheckCircle2,
  // AlertCircle
} from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, trend }: any) => (
  <div className="bg-white border border-slate-200 p-6 hover:border-slate-300 transition-all">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-slate-100 rounded-lg">
        <Icon className="text-slate-600" size={24} />
      </div>
      {trend && (
        <span className="text-emerald-600 text-xs font-medium flex items-center gap-1">
          <TrendingUp size={14} /> {trend}
        </span>
      )}
    </div>
    <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
    <p className="text-3xl font-semibold text-slate-900">{value}</p>
  </div>
);

export default function DashboardAdminPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">System Overview</h1>
        <p className="text-slate-600 text-sm mt-1">Real-time analytics for CertiChain AI platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Certificates" 
          value="1,284" 
          icon={FileText} 
          trend="+12%" 
        />
        <StatCard 
          title="Verified Users" 
          value="856" 
          icon={Users} 
          trend="+5.4%" 
        />
        <StatCard 
          title="Blockchain Transactions" 
          value="3,492" 
          icon={ShieldCheck} 
        />
        <StatCard 
          title="Pending Approvals" 
          value="18" 
          icon={Clock} 
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200">
          <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-medium text-slate-900">Recent Issuance Activity</h3>
            <button className="text-sm text-indigo-600 hover:underline">View All</button>
          </div>
          
          <div className="divide-y divide-slate-100">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    {/* This will be issued by the admin username */}
                    <p className="text-sm font-medium text-slate-900">Bachelor of Business Information Technology</p>
                    <p className="text-xs text-slate-500">Issued to: David Elias • 2 mins ago</p>
                  </div>
                </div>
                <span className="px-3 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 rounded">Success</span>
              </div>
            ))}
          </div>
        </div>

    {/* This will get the real values of the system - to be changed at the end of the project */}
        <div className="bg-white border border-slate-200 p-6">
          <h3 className="font-medium text-slate-900 mb-6">System Status</h3>
          
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                <span className="text-sm text-slate-700">Ethereum Blockchain</span>
              </div>
              <span className="text-xs font-medium text-emerald-600">Stable</span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                <span className="text-sm text-slate-700">AI Recommendation Engine</span>
              </div>
              <span className="text-xs font-medium text-emerald-600">Online</span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-amber-500 rounded-full" />
                <span className="text-sm text-slate-700">Database Backup</span>
              </div>
              <span className="text-xs font-medium text-amber-600">In Progress</span>
            </div>
          </div>

          <div className="mt-8 p-5 bg-slate-50 border border-slate-200 text-sm">
            System is running optimally with 1,284 certificates secured on the blockchain.
          </div>
        </div>
      </div>
    </div>
  );
}