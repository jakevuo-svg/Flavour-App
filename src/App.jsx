import { useState, useEffect, useMemo } from 'react';
import { AuthProvider, useAuth } from './components/auth/AuthContext';
import LoginScreen from './components/auth/LoginScreen';
import Header from './components/layout/Header';
import Navigation from './components/layout/Navigation';
import Footer from './components/layout/Footer';
import Dashboard from './components/dashboard/Dashboard';
import PersonList from './components/persons/PersonList';
import PersonCard from './components/persons/PersonCard';
import EventList from './components/events/EventList';
import EventCard from './components/events/EventCard';
import NewPersonModal from './components/persons/NewPersonModal';
import NewEventModal from './components/events/NewEventModal';
import LocationList from './components/locations/LocationList';
import NotesView from './components/notes/NotesView';
import DateView from './components/DateView';
import UserManagement from './components/admin/UserManagement';
import ActivityLog from './components/admin/ActivityLog';
import RolePermissions from './components/admin/RolePermissions';
import Toast from './components/common/Toast';
import S from './styles/theme';

// Hooks
import { usePersons } from './hooks/usePersons';
import { useEvents } from './hooks/useEvents';
import { useNotes } from './hooks/useNotes';
import { useLocations } from './hooks/useLocations';
import { useTasks } from './hooks/useTasks';
import { usePermissions } from './hooks/usePermissions';
import { useNotifications } from './hooks/useNotifications';

// Map Navigation uppercase tab names to internal view names
const TAB_TO_VIEW = {
  'PERSON': 'personList',
  'DATE': 'date',
  'EVENTS': 'eventList',
  'LOCATIONS': 'locations',
  'NOTES': 'notes',
  'ADMIN': 'admin',
};

const AppContent = () => {
  const { user, isLoggedIn, isAdmin, signOut } = useAuth();

  // Data hooks
  const { persons, addPerson, deletePerson, updatePerson } = usePersons();
  const { events, addEvent, deleteEvent, updateEvent } = useEvents();
  const { notes, addNote, deleteNote } = useNotes();
  const { locations, updateLocation, addFile: addLocationFile, removeFile: removeLocationFile, getFiles: getLocationFiles } = useLocations();
  const { tasks, addTask, updateTask, deleteTask } = useTasks();
  const { permissions, togglePermission, hasPermission, getTabsForRole, resetToDefaults } = usePermissions();
  const {
    notifications, unreadCount,
    markRead, markAllRead, dismiss: dismissNotif, clearAll: clearAllNotifs,
    emitEventCreated, emitEventUpdated, emitNoteAdded, emitPersonCreated, emitDeadline, emitTaskOverdue,
  } = useNotifications();

  // Check deadlines on mount and when events change
  useEffect(() => {
    const now = new Date();
    events.forEach(event => {
      if (!event.date) return;
      const eventDate = new Date(event.date);
      const hoursLeft = (eventDate - now) / 3600000;
      if (hoursLeft > 0 && hoursLeft <= 48) {
        emitDeadline(event, hoursLeft);
      }
    });
    // Also check overdue tasks
    tasks.forEach(task => {
      if (task.status !== 'DONE' && task.due_date && new Date(task.due_date) < now) {
        const eventName = events.find(e => e.id === task.event_id)?.name || '';
        emitTaskOverdue(task, eventName);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only on mount

  // Compute allowed tabs for current user's role
  const userRole = user?.role || 'worker';
  const allowedTabs = getTabsForRole(userRole);
  const can = (feature) => hasPermission(userRole, feature);

  // State management
  const [view, setView] = useState('home');
  const [activeTab, setActiveTab] = useState(null); // null = HOME (no nav tab active)
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewPerson, setShowNewPerson] = useState(false);
  const [showNewEvent, setShowNewEvent] = useState(false);
  const [newEventPrefilledDate, setNewEventPrefilledDate] = useState(null);
  const [toast, setToast] = useState(null);

  // Dynamic recent activity — built from real notes
  const recentActivity = useMemo(() => {
    const activities = [];

    // Convert actual notes to activity entries
    notes.forEach(note => {
      let description = '';
      let entityType = '';
      let entityId = '';

      if (note.event_id) {
        const event = events.find(e => e.id === note.event_id);
        description = `Lisäsi muistiinpanon tapahtumaan "${event?.name || 'Tuntematon'}"`;
        entityType = 'event';
        entityId = note.event_id;
      } else if (note.person_id) {
        const person = persons.find(p => p.id === note.person_id);
        description = `Lisäsi muistiinpanon henkilölle "${person ? person.first_name + ' ' + person.last_name : 'Tuntematon'}"`;
        entityType = 'person';
        entityId = note.person_id;
      }

      if (description) {
        activities.push({
          id: `note-act-${note.id}`,
          timestamp: note.created_at,
          user_name: note.author || 'Unknown',
          action: 'ADDED_NOTE',
          action_description: description,
          entity_type: entityType,
          entity_id: entityId,
        });
      }
    });

    // Sort newest first, limit to 20
    return activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 20);
  }, [notes, events, persons]);

  if (!isLoggedIn) {
    return <LoginScreen />;
  }

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddPerson = (data) => {
    const p = addPerson(data);
    setShowNewPerson(false);
    showToast('Henkilö lisätty onnistuneesti', 'success');
    emitPersonCreated({ ...data, id: p?.id || 'new' });
  };

  const handleAddEvent = (data) => {
    if (newEventPrefilledDate) {
      data.date = newEventPrefilledDate;
      setNewEventPrefilledDate(null);
    }
    const ev = addEvent(data);
    setShowNewEvent(false);
    showToast('Tapahtuma lisätty onnistuneesti', 'success');
    emitEventCreated({ ...data, id: ev?.id || 'new' });
  };

  const handleAddNote = (data) => {
    addNote(data);
    showToast('Muistiinpano lisätty onnistuneesti', 'success');
    const contextName = data.event_id
      ? events.find(e => e.id === data.event_id)?.name
      : data.person_id
        ? persons.find(p => p.id === data.person_id)?.first_name + ' ' + persons.find(p => p.id === data.person_id)?.last_name
        : null;
    emitNoteAdded(data, contextName);
  };

  const handleDeleteNote = (id) => {
    deleteNote(id);
    showToast('Muistiinpano poistettu', 'success');
  };

  const handleDeletePerson = (id) => {
    deletePerson(id);
    setSelectedPerson(null);
    showToast('Henkilö poistettu', 'success');
  };

  const handleDeleteEvent = (id) => {
    deleteEvent(id);
    setSelectedEvent(null);
    showToast('Tapahtuma poistettu', 'success');
  };

  const handlePersonClick = (person) => {
    setSelectedPerson(person);
    setView('personCard');
    setActiveTab('PERSON');
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setView('eventCard');
    setActiveTab('EVENTS');
  };

  // Navigation sends uppercase tab names — map to internal view names
  const handleTabChange = (tab) => {
    const mappedView = TAB_TO_VIEW[tab] || 'home';
    setActiveTab(tab);
    setView(mappedView);
    setSelectedPerson(null);
    setSelectedEvent(null);
  };

  const handleGoHome = () => {
    setView('home');
    setActiveTab(null);
    setSelectedPerson(null);
    setSelectedEvent(null);
  };

  const handleAddEventFromDate = (dateObj) => {
    setNewEventPrefilledDate(dateObj.date);
    setShowNewEvent(true);
    setActiveTab('EVENTS');
    setView('eventList');
  };

  const renderContent = () => {
    switch (view) {
      case 'home':
        return (
          <Dashboard
            events={events}
            persons={persons}
            notes={notes}
            tasks={tasks}
            recentActivity={recentActivity}
            onEventClick={handleEventClick}
            onPersonClick={handlePersonClick}
            onTaskStatusChange={updateTask}
          />
        );

      case 'personList':
        return isAdmin ? (
          <PersonList
            persons={persons}
            onPersonClick={handlePersonClick}
            searchQuery={searchQuery}
          />
        ) : (
          <div style={{ ...S.card, padding: 20, textAlign: 'center', color: '#666' }}>
            Sinulla ei ole oikeutta käyttää tätä osiota.
          </div>
        );

      case 'personCard':
        return selectedPerson ? (
          <PersonCard
            person={selectedPerson}
            events={events}
            notes={notes}
            onBack={() => {
              setSelectedPerson(null);
              setView('personList');
              setActiveTab('PERSON');
            }}
            onEventClick={handleEventClick}
            onUpdate={updatePerson}
            onDelete={handleDeletePerson}
            onAddNote={addNote}
            onDeleteNote={deleteNote}
          />
        ) : null;

      case 'eventList':
        return (
          <EventList
            events={events}
            locations={locations}
            onEventClick={handleEventClick}
            searchQuery={searchQuery}
          />
        );

      case 'eventCard':
        return selectedEvent ? (
          <EventCard
            event={selectedEvent}
            locations={locations}
            persons={persons}
            onBack={() => {
              setSelectedEvent(null);
              setView('eventList');
              setActiveTab('EVENTS');
            }}
            onUpdate={updateEvent}
            onDelete={handleDeleteEvent}
            tasks={tasks}
            onAddTask={addTask}
            onUpdateTask={updateTask}
            onDeleteTask={deleteTask}
            notes={notes.filter(n => n.event_id === selectedEvent?.id)}
            onAddNote={handleAddNote}
            onDeleteNote={deleteNote}
          />
        ) : null;

      case 'locations':
        return (
          <LocationList
            locations={locations}
            events={events}
            onEventClick={handleEventClick}
            onUpdateLocation={updateLocation}
            onAddFile={addLocationFile}
            onRemoveFile={removeLocationFile}
            onGetFiles={getLocationFiles}
          />
        );

      case 'notes':
        return (
          <NotesView
            notes={notes}
            events={events}
            persons={persons}
            onAddNote={handleAddNote}
            onDeleteNote={handleDeleteNote}
          />
        );

      case 'date':
        return (
          <DateView
            events={events}
            onEventClick={handleEventClick}
            onAddEvent={handleAddEventFromDate}
          />
        );

      case 'admin':
        return isAdmin ? (
          <div>
            <UserManagement />
            <RolePermissions
              permissions={permissions}
              onToggle={togglePermission}
              onReset={resetToDefaults}
            />
            <ActivityLog />
          </div>
        ) : (
          <div style={{ ...S.border, ...S.bg, ...S.pad, color: '#666', textAlign: 'center' }}>
            Sinulla ei ole oikeutta käyttää tätä osiota.
          </div>
        );

      default:
        return (
          <Dashboard
            events={events}
            persons={persons}
            notes={notes}
            tasks={tasks}
            recentActivity={recentActivity}
            onEventClick={handleEventClick}
            onPersonClick={handlePersonClick}
            onTaskStatusChange={updateTask}
          />
        );
    }
  };

  return (
    <div style={S.app}>
      <Header
        onHome={handleGoHome}
        onNewEvent={() => setShowNewEvent(true)}
        onNewPerson={() => setShowNewPerson(true)}
        onNewNote={() => {
          setView('notes');
          setActiveTab('NOTES');
        }}
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkRead={markRead}
        onMarkAllRead={markAllRead}
        onDismiss={dismissNotif}
        onClearAll={clearAllNotifs}
        onEventClick={handleEventClick}
        onPersonClick={handlePersonClick}
        events={events}
        persons={persons}
      />
      <Navigation activeTab={activeTab} onTabChange={handleTabChange} searchQuery={searchQuery} onSearch={setSearchQuery} allowedTabs={allowedTabs} />

      <div style={{ borderTop: "none" }}>
        {renderContent()}
      </div>

      {showNewPerson && (
        <NewPersonModal
          show={true}
          onClose={() => setShowNewPerson(false)}
          onAdd={handleAddPerson}
        />
      )}

      {showNewEvent && (
        <NewEventModal
          onClose={() => {
            setShowNewEvent(false);
            setNewEventPrefilledDate(null);
          }}
          onAdd={handleAddEvent}
          locations={locations}
          prefilledDate={newEventPrefilledDate}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
