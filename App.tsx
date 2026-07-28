import React, { useState } from 'react';
import { 
  Search, Bell, HelpCircle, Plus, LayoutDashboard, 
  CalendarDays, CalendarRange, Inbox, Users, Settings, 
  LifeBuoy, CalendarCheck, Clock, XCircle
} from 'lucide-react';

const mockAppointments = [
  { id: 1, time: '09:00', client: 'Alice Johnson', procedure: 'Swedish Massage', specialist: 'Sarah Smith', status: 'confirmed' },
  { id: 2, time: '10:15', client: 'David Green', procedure: 'Hot Stone Massage', specialist: 'Pending Specialist', status: 'new' },
  { id: 3, time: '11:30', client: 'Carol White', procedure: 'Facial', specialist: 'Emma Brown', status: 'needs_action' },
];

const mockRequests = [
  { id: 1, client: 'David Green', procedure: 'Hot Stone Massage', requestedTime: 'Oct 25, 14:00', status: 'new' },
  { id: 2, client: 'Eva Black', procedure: 'Aromatherapy', requestedTime: 'Oct 25, 16:30', status: 'needs_action' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [requestTab, setRequestTab] = useState('new');
  const [selectedRequests, setSelectedRequests] = useState<number[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* KPI Cards (Refinement 1) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Today', count: 12, icon: CalendarDays, color: 'text-primary' },
          { label: 'Confirmed', count: 8, icon: CalendarCheck, color: 'text-primary-fixed-dim' },
          { label: 'Pending', count: 3, icon: Clock, color: 'text-yellow-500' },
          { label: 'Cancelled', count: 1, icon: XCircle, color: 'text-outline' },
        ].map((kpi, i) => (
          <div key={i} className="bg-surface-base p-4 rounded-xl shadow-sm border border-surface-variant flex items-center gap-4">
            <div className={`p-3 rounded-full bg-surface-container ${kpi.color}`}>
              <kpi.icon size={24} />
            </div>
            <div>
              <p className="text-label-sm text-on-surface-variant">{kpi.label}</p>
              <p className="text-headline-lg font-bold text-on-surface">{kpi.count}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters (Refinement 1) */}
      <div className="flex gap-4 p-4 bg-surface-base rounded-xl shadow-sm border border-surface-variant">
        {['All Specialists', 'All Procedures', 'All Statuses'].map((filter, i) => (
          <select key={i} className="bg-surface-container-low border border-outline-variant text-body-md rounded-lg py-2 px-4 outline-none focus:border-primary">
            <option>{filter}</option>
          </select>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="bg-surface-base rounded-xl shadow-sm border border-surface-variant overflow-hidden">
        <div className="p-4 border-b border-surface-variant bg-surface-container-lowest">
          <h3 className="font-headline-md text-on-surface">Today's Schedule</h3>
        </div>
        <div className="p-4 space-y-2">
          {mockAppointments.map(app => (
            <div 
              key={app.id} 
              onClick={() => setSelectedAppointment(app)}
              className="flex items-center gap-4 p-3 rounded-lg border border-surface-variant cursor-pointer hover:bg-surface-container-low transition-colors"
            >
              <div className="w-16 text-label-md text-on-surface-variant font-bold">{app.time}</div>
              <div className={`flex-1 p-3 rounded-lg flex justify-between items-center ${
                app.status === 'confirmed' ? 'bg-primary-fixed text-on-primary-fixed' : 
                app.status === 'new' ? 'bg-yellow-100 text-yellow-800' : 'bg-error-container text-on-error-container'
              }`}>
                <div>
                  <p className="font-bold">{app.client}</p>
                  <p className="text-sm opacity-80">{app.procedure} • {app.specialist}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Incoming Requests Quick View (Added for screenshot) */}
      <div className="bg-surface-base rounded-xl shadow-sm border border-surface-variant overflow-hidden">
        <div className="p-4 border-b border-surface-variant bg-surface-container-lowest">
          <h3 className="font-headline-md text-on-surface">Incoming Requests</h3>
        </div>
        <div className="p-4 space-y-4">
          {mockRequests.filter(r => r.status === 'new').map(req => (
            <div key={req.id} className="border border-surface-variant rounded-xl p-4 flex gap-4 bg-surface-container-lowest">
              <input type="checkbox" className="mt-1 w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary" />
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-on-surface">{req.client}</h4>
                    <p className="text-sm text-on-surface-variant">{req.procedure} • {req.requestedTime}</p>
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">New</span>
                </div>
                <div className="flex gap-2 mt-4">
                  <button className="bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors">Confirm</button>
                  <button className="bg-sand-light text-primary px-4 py-2 rounded-lg text-sm font-bold hover:bg-sand-light/80 transition-colors">Reschedule</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderRequests = () => (
    <div className="bg-surface-base rounded-xl shadow-sm border border-surface-variant flex flex-col h-[calc(100vh-12rem)]">
      {/* Tabs (Refinement 2) */}
      <div className="flex border-b border-surface-variant p-2 gap-2">
        {[
          { id: 'new', label: 'Incoming Requests', count: 2, badge: 'bg-yellow-100 text-yellow-800' },
          { id: 'action', label: 'Needs Action', count: 1, badge: 'bg-error-container text-on-error-container' },
          { id: 'handled', label: 'Recently Handled', count: 0, badge: 'bg-surface-container text-on-surface-variant' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setRequestTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-label-md transition-colors ${requestTab === tab.id ? 'bg-secondary-container/30 text-primary' : 'text-on-surface-variant hover:bg-surface-container'}`}
          >
            {tab.label}
            <span className={`px-2 py-0.5 rounded-full text-xs ${tab.badge}`}>{tab.count}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {mockRequests.filter(r => requestTab === 'new' ? r.status === 'new' : true).map(req => (
          <div key={req.id} className="border border-surface-variant rounded-xl p-4 flex gap-4 bg-surface-container-lowest">
            <input 
              type="checkbox" 
              className="mt-1 w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary"
              checked={selectedRequests.includes(req.id)}
              onChange={(e) => {
                if(e.target.checked) setSelectedRequests([...selectedRequests, req.id]);
                else setSelectedRequests(selectedRequests.filter(id => id !== req.id));
              }}
            />
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-on-surface">{req.client}</h4>
                  <p className="text-sm text-on-surface-variant">{req.procedure} • {req.requestedTime}</p>
                </div>
                <span className="px-2 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">New</span>
              </div>
              <details className="mb-4">
                <summary className="text-sm text-primary cursor-pointer font-bold mb-2 outline-none">Add Notes</summary>
                <textarea className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2 text-sm outline-none focus:border-primary" rows={2} placeholder="Type notes here..."></textarea>
              </details>
              <div className="flex gap-2">
                <button className="bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors">Confirm</button>
                <button className="bg-sand-light text-primary px-4 py-2 rounded-lg text-sm font-bold hover:bg-sand-light/80 transition-colors">Reschedule</button>
                <button className="border border-outline-variant text-on-surface-variant px-4 py-2 rounded-lg text-sm font-bold hover:bg-surface-container transition-colors">Cancel</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedRequests.length > 0 && (
        <div className="p-4 border-t border-surface-variant bg-surface-container-low">
          <button className="w-full bg-primary text-on-primary py-3 rounded-lg font-bold shadow-sm hover:bg-primary/90 transition-colors">
            Bulk Confirm ({selectedRequests.length})
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen flex">
      {/* SideNavBar */}
      <nav className="h-full w-64 fixed left-0 top-0 bg-surface-container-low shadow-sm flex flex-col py-6 px-4 z-50">
        <button className="w-full bg-accent-coral text-on-primary font-label-md py-3 px-4 rounded-lg shadow-sm hover:bg-accent-coral/90 mb-8 flex justify-center items-center gap-2 h-12">
          <Plus size={20} /> Quick Book
        </button>
        
        <div className="flex-1 space-y-2">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-label-md transition-colors ${activeTab === 'dashboard' ? 'text-primary bg-secondary-container/30 border-r-4 border-primary' : 'text-on-surface-variant hover:text-primary hover:bg-secondary-container/20'}`}>
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button onClick={() => setActiveTab('requests')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-label-md transition-colors ${activeTab === 'requests' ? 'text-primary bg-secondary-container/30 border-r-4 border-primary' : 'text-on-surface-variant hover:text-primary hover:bg-secondary-container/20'}`}>
            <Inbox size={20} /> Pending Requests
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:text-primary hover:bg-secondary-container/20 transition-colors">
            <CalendarDays size={20} /> Week View
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:text-primary hover:bg-secondary-container/20 transition-colors">
            <CalendarRange size={20} /> Month View
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:text-primary hover:bg-secondary-container/20 transition-colors">
            <Users size={20} /> Clients
          </button>
        </div>

        <div className="mt-auto space-y-2 pt-4 border-t border-surface-variant">
          <div className="flex items-center gap-4 mb-4 pl-2">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold">SPA</div>
            <div>
              <h1 className="text-headline-md font-bold text-primary">SPA BookFlow</h1>
              <p className="text-label-sm text-on-surface-variant">Management</p>
            </div>
          </div>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:text-primary hover:bg-secondary-container/20 transition-colors">
            <Settings size={20} /> Settings
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:text-primary hover:bg-secondary-container/20 transition-colors">
            <LifeBuoy size={20} /> Support
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-40 bg-surface shadow-sm h-16 px-6 flex justify-between items-center">
          <div className="relative w-64 hidden lg:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
            <input 
              className="w-full bg-sand-light border-transparent focus:bg-surface-base focus:border-primary text-body-md rounded-full py-2 pl-10 pr-4 outline-none transition-colors shadow-sm placeholder:text-on-surface-variant" 
              placeholder="Search clients, appointments..." 
              type="text" 
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="text-on-surface-variant hover:text-primary p-2 rounded-full hover:bg-surface-container"><Bell size={20} /></button>
            <button className="text-on-surface-variant hover:text-primary p-2 rounded-full hover:bg-surface-container"><HelpCircle size={20} /></button>
          </div>
        </header>

        <main className="flex-1 p-8 bg-surface-muted overflow-y-auto">
          <div className="mb-8">
            <h2 className="text-headline-xl font-bold text-on-surface mb-2">{activeTab === 'dashboard' ? "Today's Overview" : "Incoming Requests"}</h2>
            <p className="text-body-lg text-on-surface-variant">Tuesday, October 24th, 2023</p>
          </div>

          {activeTab === 'dashboard' ? renderDashboard() : renderRequests()}
        </main>
      </div>

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-on-surface/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-base w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-surface-variant flex justify-between items-center bg-surface-container-lowest">
              <h3 className="font-headline-lg font-bold text-on-surface">Appointment Detail</h3>
              <button onClick={() => setSelectedAppointment(null)} className="text-on-surface-variant hover:text-error p-2 rounded-full hover:bg-error-container/20 transition-colors">
                <XCircle size={24} />
              </button>
            </div>
            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed font-bold text-xl">
                  {selectedAppointment.client.charAt(0)}
                </div>
                <div>
                  <h4 className="text-headline-md font-bold text-on-surface">{selectedAppointment.client}</h4>
                  <p className="text-body-md text-on-surface-variant">+1 (555) 123-4567 • VIP Client</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-container-low p-4 rounded-xl">
                  <p className="text-label-sm text-on-surface-variant mb-1">Procedure</p>
                  <p className="font-bold">{selectedAppointment.procedure}</p>
                </div>
                <div className="bg-surface-container-low p-4 rounded-xl">
                  <p className="text-label-sm text-on-surface-variant mb-1">Time</p>
                  <p className="font-bold">{selectedAppointment.time} (60 min)</p>
                </div>
                <div className="bg-surface-container-low p-4 rounded-xl">
                  <p className="text-label-sm text-on-surface-variant mb-1">Specialist</p>
                  <p className="font-bold">{selectedAppointment.specialist}</p>
                </div>
                <div className="bg-surface-container-low p-4 rounded-xl">
                  <p className="text-label-sm text-on-surface-variant mb-1">Status</p>
                  <span className="px-2 py-1 rounded-full text-xs font-bold bg-primary-fixed text-on-primary-fixed uppercase tracking-wider">
                    {selectedAppointment.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-label-sm text-on-surface-variant mb-2">Receptionist Notes</p>
                <textarea 
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3 text-body-md outline-none focus:border-primary" 
                  rows={3} 
                  placeholder="Client prefers warm oil..."
                ></textarea>
              </div>
            </div>
            <div className="p-4 border-t border-surface-variant bg-surface-container-lowest flex justify-end gap-3">
              <button onClick={() => setSelectedAppointment(null)} className="border border-outline-variant text-on-surface-variant px-5 py-2.5 rounded-xl font-bold hover:bg-surface-container transition-colors">
                Cancel Booking
              </button>
              <button className="bg-sand-light text-primary px-5 py-2.5 rounded-xl font-bold hover:bg-sand-light/80 transition-colors">
                Reschedule
              </button>
              <button onClick={() => setSelectedAppointment(null)} className="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-bold hover:bg-primary/90 shadow-sm transition-colors">
                Mark as Confirmed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
