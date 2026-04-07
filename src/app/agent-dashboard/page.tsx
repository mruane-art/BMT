'use client';

import { useState, useEffect } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface CustomTab {
  id: string;
  label: string;
  url: string;
}

interface LinkCardProps {
  icon: string;
  title: string;
  description: string;
  url: string;
  badge?: string;
}

interface MeetingCardProps {
  title: string;
  schedule: string;
  time: string;
  description: string;
  url: string;
  isToday?: boolean;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const KW_RED = '#CC0000';
const KW_BLACK = '#000000';
const KW_LIGHT_GRAY = '#F5F5F5';

const STATIC_TABS = [
  { id: 'home', label: 'Home' },
  { id: 'zoom', label: 'Zoom Meetings' },
  { id: 'technology', label: 'Technology' },
  { id: 'associations', label: 'Associations & MLS' },
  { id: 'community', label: 'Community' },
  { id: 'resources', label: 'Resources' },
];

const QUICK_LINKS: LinkCardProps[] = [
  { icon: '🖥️', title: 'KW Command', description: 'CRM, leads, SmartPlans, and transaction management', url: 'https://command.kw.com' },
  { icon: '📋', title: 'PALS', description: 'PA license and transaction management system', url: 'https://www.palsweb.com' },
  { icon: '🏡', title: 'Bright MLS', description: 'Primary MLS for the Mid-Atlantic region', url: 'https://brightmls.com' },
  { icon: '📚', title: 'KW Connect', description: 'Training, BOLD registration, and coaching resources', url: 'https://connect.kw.com' },
  { icon: '🏛️', title: 'PARealtors.org', description: 'Pennsylvania Association of Realtors member portal', url: 'https://www.parealtors.org' },
  { icon: '🏘️', title: 'Suburban Tri-County Realtors', description: 'Local Realtor association for Montgomery, Chester & Delaware counties', url: 'https://www.stcraor.com' },
  { icon: '📅', title: 'ShowingTime', description: 'Manage showing appointments and feedback', url: 'https://www.showingtime.com' },
  { icon: '✍️', title: 'DocuSign', description: 'Electronic signatures included with KW', url: 'https://www.docusign.com' },
];

const TECH_TOOLS: (LinkCardProps & { badge: string })[] = [
  { icon: '🖥️', title: 'KW Command', description: 'Your all-in-one CRM: leads, marketing, SmartPlans, market reports, and transaction management.', badge: 'Core KW', url: 'https://command.kw.com' },
  { icon: '📚', title: 'KW Connect', description: 'Training library, BOLD registration, on-demand courses, and coaching resources.', badge: 'Training', url: 'https://connect.kw.com' },
  { icon: '📱', title: 'KW App', description: 'The consumer-facing KW app — share listings, capture leads, and stay connected on the go.', badge: 'Core KW', url: 'https://www.kw.com/app' },
  { icon: '📋', title: 'PALS', description: 'Pennsylvania Association of Realtors transaction and license management system.', badge: 'PA Tools', url: 'https://www.palsweb.com' },
  { icon: '🏡', title: 'Bright MLS', description: 'The primary MLS platform serving the Mid-Atlantic region including Pennsylvania.', badge: 'MLS', url: 'https://brightmls.com' },
  { icon: '📊', title: 'RPR (Realtors Property Resource)', description: 'Comprehensive property data, valuations, and market reports — free with NAR membership.', badge: 'NAR Tool', url: 'https://www.narrpr.com' },
  { icon: '📅', title: 'ShowingTime', description: 'Manage property showing appointments, feedback, and analytics.', badge: 'Showings', url: 'https://www.showingtime.com' },
  { icon: '✍️', title: 'DocuSign', description: 'Electronic signatures for contracts and documents — included with KW.', badge: 'Productivity', url: 'https://www.docusign.com' },
  { icon: '🔄', title: 'dotloop', description: 'Transaction management and document storage for real estate professionals.', badge: 'Transactions', url: 'https://www.dotloop.com' },
  { icon: '🔍', title: 'Remine', description: 'Predictive analytics and prospecting tool to find motivated sellers.', badge: 'Prospecting', url: 'https://www.remine.com' },
  { icon: '📰', title: 'Market Snacker', description: 'Quick, digestible market reports you can share with clients on social media.', badge: 'Marketing', url: 'https://www.marketsnacker.com' },
  { icon: '🏘️', title: 'KW Listings', description: 'Syndicate your listings across KW.com and hundreds of partner sites.', badge: 'Core KW', url: 'https://listings.kw.com' },
];

const ASSOCIATION_ITEMS: (LinkCardProps & { badge: string })[] = [
  { icon: '🏛️', title: 'Suburban Tri-County Realtors Association', description: 'Your local Realtor association serving Montgomery, Chester, and Delaware counties in PA. Member services, CE credits, lockbox, and advocacy.', badge: 'Local', url: 'https://www.stcraor.com' },
  { icon: '🏛️', title: 'Pennsylvania Association of Realtors (PAR)', description: 'State-level advocacy, education, standard forms, PALS access, and member benefits.', badge: 'State', url: 'https://www.parealtors.org' },
  { icon: '🏛️', title: 'National Association of Realtors (NAR)', description: 'National advocacy, Code of Ethics training, RPR access, and the REALTOR® brand.', badge: 'National', url: 'https://www.nar.realtor' },
  { icon: '🗄️', title: 'Bright MLS', description: 'Primary MLS database for PA, MD, DC, DE, VA, and NJ. Listing input, searches, CMAs, and stats.', badge: 'MLS', url: 'https://brightmls.com' },
  { icon: '📊', title: 'RPR (NAR Tool)', description: 'Free to all REALTORS®. Property data, valuation tools, neighborhood reports, and market activity.', badge: 'NAR Tool', url: 'https://www.narrpr.com' },
];

const COMMUNITY_ITEMS: (LinkCardProps & { badge?: string })[] = [
  { icon: '🍋', title: "Alex's Lemonade Stand Foundation", description: "KW's national charity partner in the fight against childhood cancer. Participate in fundraising events and lemonade stands year-round.", url: 'https://www.alexslemonade.org' },
  { icon: '❤️', title: 'RED Day', description: "Renew, Energize, and Donate — KW's annual day of community service held every May. Agents across the country volunteer together to give back.", url: 'https://www.kw.com/kw/redday.html' },
  { icon: '🤝', title: 'KW Cares', description: "KW's nonprofit that supports associates and their families in times of hardship through emergency relief.", url: 'https://www.kwcares.org' },
  { icon: '📌', title: 'Market Center Community Board', description: 'Local volunteer opportunities, charity events, and community initiatives organized through your Market Center.', url: '#' },
];

const RESOURCE_ITEMS: (LinkCardProps & { badge?: string })[] = [
  { icon: '📄', title: 'PA Standard Forms Library', description: 'Access PAR standard contracts, addenda, and disclosure forms.', url: 'https://www.parealtors.org/tools-technology/standard-forms/' },
  { icon: '🎓', title: 'KW Education & BOLD', description: 'Register for BOLD, MAPS Coaching, and live training events through KW Connect.', url: 'https://connect.kw.com' },
  { icon: '🎯', title: 'CE Credit Tracker', description: 'Track your continuing education credits through the PA State Real Estate Commission.', url: 'https://www.pals.pa.gov' },
  { icon: '⚖️', title: 'MLS Rules & Compliance', description: 'Bright MLS rules, compliance guidelines, and listing input requirements.', url: 'https://brightmls.com/members/compliance' },
  { icon: '📜', title: 'Code of Ethics Training', description: 'Complete your NAR Code of Ethics requirement (required every 3 years).', url: 'https://www.nar.realtor/code-of-ethics-training' },
  { icon: '👥', title: 'Market Center Staff', description: 'Contact your Market Center leadership, admin staff, and support team.', url: '#' },
  { icon: '🏛️', title: 'PA Real Estate Commission', description: 'License lookup, renewal, regulations, and disciplinary actions in Pennsylvania.', url: 'https://www.dos.pa.gov/ProfessionalLicensing/BoardsCommissions/RealEstateCommission' },
  { icon: '🛡️', title: 'Errors & Omissions Insurance', description: 'Review your E&O policy details and file a claim if needed.', url: '#' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function LinkCard({ icon, title, description, url, badge }: LinkCardProps) {
  const handleClick = () => {
    if (url && url !== '#') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white border border-gray-200 rounded-xl p-5 cursor-pointer transition-shadow hover:shadow-md flex flex-col gap-3"
      style={{ borderLeft: `4px solid ${KW_RED}` }}
    >
      <div className="flex items-start gap-3">
        <div
          className="text-2xl w-10 h-10 flex items-center justify-center rounded-full flex-shrink-0"
          style={{ backgroundColor: '#FFF0F0' }}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-gray-900 text-sm leading-tight">{title}</h3>
            {badge && (
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full text-white flex-shrink-0"
                style={{ backgroundColor: KW_RED }}
              >
                {badge}
              </span>
            )}
          </div>
          <p className="text-gray-500 text-xs mt-1 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}

function MeetingCard({ title, schedule, time, description, url, isToday }: MeetingCardProps) {
  return (
    <div
      className="bg-white border rounded-xl p-6 flex flex-col gap-4 shadow-sm"
      style={{ borderColor: isToday ? KW_RED : '#E5E7EB', borderWidth: isToday ? '2px' : '1px' }}
    >
      {isToday && (
        <div
          className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full self-start text-white"
          style={{ backgroundColor: KW_RED }}
        >
          Today
        </div>
      )}
      <div>
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <span
            className="text-sm font-semibold px-3 py-1 rounded-full"
            style={{ backgroundColor: KW_LIGHT_GRAY, color: KW_BLACK }}
          >
            {schedule}
          </span>
          <span className="text-sm font-semibold text-gray-600">{time}</span>
        </div>
      </div>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
      <button
        onClick={() => { if (url && url !== '#') window.open(url, '_blank', 'noopener,noreferrer'); }}
        className="mt-auto w-full py-3 rounded-lg font-bold text-white text-sm transition-opacity hover:opacity-90"
        style={{ backgroundColor: KW_RED }}
      >
        Join Zoom
      </button>
    </div>
  );
}

// ─── Helper: get today's day of week ─────────────────────────────────────────

function getTodayMeetings(): string[] {
  const day = new Date().getDay(); // 0=Sun,1=Mon,2=Tue,3=Wed,4=Thu,5=Fri,6=Sat
  const meetings: string[] = [];
  if (day === 2) meetings.push('Power Hour'); // Tuesday
  if (day === 4) meetings.push('Broker Moment with Terese'); // Thursday
  if (day >= 1 && day <= 4) meetings.push('VIP Closing Club'); // Mon–Thu
  return meetings;
}

// ─── Tab Content Components ───────────────────────────────────────────────────

function HomeTab() {
  const todayMeetings = getTodayMeetings();

  const meetingDefs = [
    { title: 'Power Hour', schedule: 'Every Tuesday', time: '7:00 PM', description: 'Weekly power session to kick-start your week. Tips, motivation, and production updates.', url: '#zoom-power-hour' },
    { title: 'Broker Moment with Terese', schedule: 'Every Thursday', time: '9:00 AM', description: 'Weekly check-in with our Broker Terese. Office updates, compliance reminders, and open Q&A.', url: '#zoom-broker-moment' },
    { title: 'VIP Closing Club', schedule: 'Mon – Thu', time: 'Time TBD', description: 'Daily accountability session for agents closing deals. Stay on track and celebrate wins.', url: '#zoom-vip-closing' },
  ];

  const todayCards = meetingDefs.filter(m => todayMeetings.includes(m.title));

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome Banner */}
      <div
        className="rounded-2xl p-8 text-white"
        style={{ background: `linear-gradient(135deg, ${KW_BLACK} 0%, #1a1a1a 60%, #2a0000 100%)` }}
      >
        <div className="flex items-center gap-3 mb-1">
          <span className="text-3xl">🏡</span>
          <h1 className="text-2xl font-bold">Welcome to Your Agent Hub</h1>
        </div>
        <p className="text-gray-300 ml-12">Everything you need, in one place.</p>
      </div>

      {/* Today's Zoom Meetings */}
      {todayCards.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3">📅 Today&apos;s Zoom Meetings</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {todayCards.map(m => (
              <MeetingCard key={m.title} {...m} isToday />
            ))}
          </div>
        </div>
      )}

      {todayCards.length === 0 && (
        <div className="rounded-xl p-4 border border-gray-200 bg-gray-50 text-gray-500 text-sm">
          No Zoom meetings scheduled for today. Check the <strong>Zoom Meetings</strong> tab for the full schedule.
        </div>
      )}

      {/* Quick Links */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-3">⚡ Quick Links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {QUICK_LINKS.map(link => (
            <LinkCard key={link.title} {...link} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ZoomTab() {
  const meetings = [
    { title: 'Power Hour', schedule: 'Every Tuesday', time: '7:00 PM', description: 'Weekly power session to kick-start your week. Tips, motivation, and production updates.', url: '#zoom-power-hour' },
    { title: 'Broker Moment with Terese', schedule: 'Every Thursday', time: '9:00 AM', description: 'Weekly check-in with our Broker Terese. Office updates, compliance reminders, and open Q&A.', url: '#zoom-broker-moment' },
    { title: 'VIP Closing Club', schedule: 'Mon – Thu', time: 'Time TBD', description: 'Daily accountability session for agents closing deals. Stay on track and celebrate wins.', url: '#zoom-vip-closing' },
  ];

  const schedule = [
    { day: 'Monday', meetings: ['VIP Closing Club'] },
    { day: 'Tuesday', meetings: ['Power Hour', 'VIP Closing Club'] },
    { day: 'Wednesday', meetings: ['VIP Closing Club'] },
    { day: 'Thursday', meetings: ['Broker Moment with Terese', 'VIP Closing Club'] },
    { day: 'Friday', meetings: [] },
    { day: 'Saturday', meetings: [] },
    { day: 'Sunday', meetings: [] },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Zoom Meeting Schedule</h2>
        <p className="text-gray-500 text-sm mt-1">Join your team for weekly sessions and daily accountability.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {meetings.map(m => (
          <MeetingCard key={m.title} {...m} />
        ))}
      </div>

      {/* Placeholder note */}
      <div className="rounded-xl p-4 border border-gray-200" style={{ backgroundColor: KW_LIGHT_GRAY }}>
        <p className="text-gray-600 text-sm">
          💡 <strong>Zoom links above are placeholders.</strong> To update them, contact your Market Center administrator or edit this page directly.
        </p>
      </div>

      {/* Schedule at a glance */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-3">Meeting Schedule at a Glance</h3>
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: KW_RED }}>
                <th className="text-left px-4 py-3 text-white font-semibold">Day</th>
                <th className="text-left px-4 py-3 text-white font-semibold">Meetings</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((row, i) => (
                <tr key={row.day} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 font-medium text-gray-700">{row.day}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {row.meetings.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {row.meetings.map(m => (
                          <span
                            key={m}
                            className="px-2 py-0.5 rounded-full text-xs font-semibold text-white"
                            style={{ backgroundColor: KW_RED }}
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">No meetings</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TechnologyTab() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">KW Technology Suite</h2>
        <p className="text-gray-500 text-sm mt-1">Tools and platforms included with your Keller Williams membership</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TECH_TOOLS.map(tool => (
          <div
            key={tool.title}
            className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3 hover:shadow-md transition-shadow"
            style={{ borderLeft: `4px solid ${KW_RED}` }}
          >
            <div className="flex items-start gap-3">
              <div
                className="text-2xl w-10 h-10 flex items-center justify-center rounded-full flex-shrink-0"
                style={{ backgroundColor: '#FFF0F0' }}
              >
                {tool.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-gray-900 text-sm">{tool.title}</h3>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full text-white flex-shrink-0"
                    style={{ backgroundColor: KW_RED }}
                  >
                    {tool.badge}
                  </span>
                </div>
                <p className="text-gray-500 text-xs mt-1 leading-relaxed">{tool.description}</p>
              </div>
            </div>
            <button
              onClick={() => window.open(tool.url, '_blank', 'noopener,noreferrer')}
              className="mt-auto w-full py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: KW_RED }}
            >
              Open Tool
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AssociationsTab() {
  const localState = ASSOCIATION_ITEMS.slice(0, 3);
  const mlsData = ASSOCIATION_ITEMS.slice(3);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Associations &amp; MLS</h2>
        <p className="text-gray-500 text-sm mt-1">Your professional associations and MLS access points</p>
      </div>

      <div>
        <h3 className="text-base font-bold text-gray-800 mb-3 uppercase tracking-wide" style={{ color: KW_RED }}>
          Local &amp; State Associations
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {localState.map(item => (
            <LinkCard key={item.title} {...item} />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-base font-bold text-gray-800 mb-3 uppercase tracking-wide" style={{ color: KW_RED }}>
          MLS &amp; Data
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {mlsData.map(item => (
            <LinkCard key={item.title} {...item} />
          ))}
        </div>
      </div>
    </div>
  );
}

function CommunityTab() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900">KW Cares</h2>
        <p className="text-gray-500 text-sm mt-1">Giving Where We Live, Work, and Play</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {COMMUNITY_ITEMS.map(item => (
          <LinkCard key={item.title} {...item} />
        ))}
      </div>

      {/* Inspiration quote */}
      <div
        className="rounded-xl p-6"
        style={{ borderLeft: `4px solid ${KW_RED}`, backgroundColor: KW_LIGHT_GRAY }}
      >
        <p className="text-gray-700 text-sm italic leading-relaxed">
          &ldquo;Real estate is not just about properties — it&apos;s about people and the communities we serve.&rdquo;
        </p>
      </div>
    </div>
  );
}

function ResourcesTab() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Agent Resources &amp; Education</h2>
        <p className="text-gray-500 text-sm mt-1">Forms, training, compliance, and licensing — all in one place</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {RESOURCE_ITEMS.map(item => (
          <LinkCard key={item.title} {...item} />
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AgentDashboard() {
  const [activeTab, setActiveTab] = useState('home');
  const [customTabs, setCustomTabs] = useState<CustomTab[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTab, setNewTab] = useState({ label: '', url: '' });
  const [formError, setFormError] = useState('');

  // Load custom tabs from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('kw_custom_tabs');
      if (stored) {
        setCustomTabs(JSON.parse(stored));
      }
    } catch {
      // ignore SSR / parse errors
    }
  }, []);

  // Persist custom tabs to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('kw_custom_tabs', JSON.stringify(customTabs));
    } catch {
      // ignore
    }
  }, [customTabs]);

  function addCustomTab() {
    if (!newTab.label.trim()) {
      setFormError('Tab name is required.');
      return;
    }
    if (!newTab.url.startsWith('http')) {
      setFormError('URL must start with http.');
      return;
    }
    const tab: CustomTab = {
      id: `custom-${Date.now()}`,
      label: newTab.label.trim(),
      url: newTab.url.trim(),
    };
    setCustomTabs(prev => [...prev, tab]);
    setNewTab({ label: '', url: '' });
    setFormError('');
  }

  function deleteCustomTab(id: string) {
    setCustomTabs(prev => prev.filter(t => t.id !== id));
    if (activeTab === id) setActiveTab('home');
  }

  function handleTabClick(tabId: string) {
    // If it's a custom tab, open its URL in a new tab
    const custom = customTabs.find(t => t.id === tabId);
    if (custom) {
      window.open(custom.url, '_blank', 'noopener,noreferrer');
    } else {
      setActiveTab(tabId);
    }
  }

  function renderTabContent() {
    switch (activeTab) {
      case 'home': return <HomeTab />;
      case 'zoom': return <ZoomTab />;
      case 'technology': return <TechnologyTab />;
      case 'associations': return <AssociationsTab />;
      case 'community': return <CommunityTab />;
      case 'resources': return <ResourcesTab />;
      default: return null;
    }
  }

  const allTabs = [...STATIC_TABS, ...customTabs.map(t => ({ id: t.id, label: t.label }))];

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: KW_LIGHT_GRAY }}>

      {/* ── Header ── */}
      <header className="text-white shadow-lg" style={{ backgroundColor: KW_BLACK }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            {/* KW Logo mark */}
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center font-black text-white text-lg flex-shrink-0"
              style={{ backgroundColor: KW_RED }}
            >
              KW
            </div>
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-gray-400">
                KW Realty Group #275 | Collegeville, PA
              </p>
              <h1 className="text-xl font-black tracking-tight">Agent Resource Hub</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-semibold px-3 py-1 rounded-full"
              style={{ backgroundColor: KW_RED, color: '#fff' }}
            >
              Internal Use Only
            </span>
          </div>
        </div>
      </header>

      {/* ── Tab Bar ── */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto gap-1 py-2 scrollbar-hide">
            {allTabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className="flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap"
                  style={
                    isActive
                      ? { backgroundColor: KW_RED, color: '#fff' }
                      : { backgroundColor: 'transparent', color: KW_BLACK }
                  }
                  onMouseEnter={e => {
                    if (!isActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#FFF0F0';
                  }}
                  onMouseLeave={e => {
                    if (!isActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                  }}
                >
                  {tab.label}
                </button>
              );
            })}

            {/* + Add Tab button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold border-2 border-dashed transition-colors whitespace-nowrap"
              style={{ borderColor: KW_RED, color: KW_RED, backgroundColor: 'transparent' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#FFF0F0'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; }}
            >
              + Add Tab
            </button>
          </div>
        </div>
      </div>

      {/* ── Tab Content ── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {renderTabContent()}
      </main>

      {/* ── Footer ── */}
      <footer className="text-center py-4 text-xs text-gray-400" style={{ backgroundColor: '#2a2a2a', color: '#9ca3af' }}>
        © 2025 Keller Williams Realty Group #275 | Collegeville, PA | For Internal Agent Use Only
      </footer>

      {/* ── Add Tab Modal ── */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowAddModal(false); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Manage Custom Tabs</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold leading-none"
              >
                ×
              </button>
            </div>

            {/* Add new tab form */}
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Tab Name</label>
                <input
                  type="text"
                  value={newTab.label}
                  onChange={e => setNewTab(prev => ({ ...prev, label: e.target.value }))}
                  placeholder="e.g. My Brokerage Portal"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  style={{ focusRingColor: KW_RED } as React.CSSProperties}
                  onKeyDown={e => { if (e.key === 'Enter') addCustomTab(); }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">URL</label>
                <input
                  type="url"
                  value={newTab.url}
                  onChange={e => setNewTab(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://example.com"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  onKeyDown={e => { if (e.key === 'Enter') addCustomTab(); }}
                />
              </div>
              {formError && <p className="text-xs font-semibold" style={{ color: KW_RED }}>{formError}</p>}
              <div className="flex gap-2">
                <button
                  onClick={addCustomTab}
                  className="flex-1 py-2 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: KW_RED }}
                >
                  Add Tab
                </button>
                <button
                  onClick={() => { setShowAddModal(false); setNewTab({ label: '', url: '' }); setFormError(''); }}
                  className="flex-1 py-2 rounded-lg text-sm font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Existing custom tabs list */}
            {customTabs.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Existing Custom Tabs</h3>
                <ul className="flex flex-col gap-2">
                  {customTabs.map(tab => (
                    <li
                      key={tab.id}
                      className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{tab.label}</p>
                        <p className="text-xs text-gray-400 truncate">{tab.url}</p>
                      </div>
                      <button
                        onClick={() => deleteCustomTab(tab.id)}
                        className="ml-3 flex-shrink-0 text-lg font-bold text-gray-400 hover:text-red-600 transition-colors leading-none"
                        title="Delete tab"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
