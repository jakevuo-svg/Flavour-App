import { useState, useEffect, useMemo } from 'react';
import { AuthProvider, useAuth } from './components/auth/AuthContext';
import { useLanguage } from './contexts/LanguageContext';
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
import ChangePassword from './components/auth/ChangePassword';
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
  const { user, profile, isLoggedIn, isAdmin, signOut } = useAuth();
  const { t } = useLanguage();

  // Data hooks
  const { persons, addPerson, deletePerson, updatePerson } = usePersons();
  const { events, addEvent, deleteEvent, updateEvent, assignWorker, removeWorkerAssignment, getEventAssignments } = useEvents();
  const { notes, addNote, deleteNote, removeNotesForEvent } = useNotes();
  const { locations, updateLocation, addFile: addLocationFile, removeFile: removeLocationFile, getFiles: getLocationFiles } = useLocations();
  const { tasks, addTask, updateTask, deleteTask } = useTasks();
  const { permissions, togglePermission, hasPermission, getTabsForRole, resetToDefaults } = usePermissions();
  const {
    notifications, unreadCount,
    markRead, markAllRead, dismiss: dismissNotif, clearAll: clearAllNotifs,
    emitEventCreated, emitEventUpdated, emitNoteAdded, emitPersonCreated, emitDeadline, emitTaskOverdue,
    emitTaskAdded, emitTaskStatusChanged,
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
  const userRole = profile?.role || 'worker';
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
  const [showChangePassword, setShowChangePassword] = useState(false);

  // Keep selectedEvent in sync with the events array (so edits reflect immediately)
  useEffect(() => {
    if (selectedEvent) {
      const updated = events.find(e => e.id === selectedEvent.id);
      if (updated && updated !== selectedEvent) {
        setSelectedEvent(updated);
      }
    }
  }, [events, selectedEvent]);

  // Keep selectedPerson in sync with the persons array
  useEffect(() => {
    if (selectedPerson) {
      const updated = persons.find(p => p.id === selectedPerson.id);
      if (updated && updated !== selectedPerson) {
        setSelectedPerson(updated);
      }
    }
  }, [persons, selectedPerson]);

  // Dynamic recent activity — built from real notes
  const recentActivity = useMemo(() => {
    const activities = [];

    // Convert actual notes to activity entries
    notes.forEach(note => {
      let target = '';
      let entityType = '';
      let entityId = '';

      if (note.event_id) {
        const event = events.find(e => e.id === note.event_id);
        target = event?.name || 'Tuntematon';
        entityType = 'event';
        entityId = note.event_id;
      } else if (note.person_id) {
        const person = persons.find(p => p.id === note.person_id);
        target = person ? `${person.first_name} ${person.last_name}` : 'Tuntematon';
        entityType = 'person';
        entityId = note.person_id;
      }

      if (target) {
        const titleSnippet = note.title ? `"${note.title}"` : '';
        const contentSnippet = note.content ? (note.content.length > 50 ? note.content.slice(0, 50) + '…' : note.content) : '';
        const notePreview = titleSnippet || contentSnippet;
        activities.push({
          id: `note-act-${note.id}`,
          timestamp: note.created_at,
          user_name: note.author || 'Unknown',
          action: 'ADDED_NOTE',
          action_description: `${target}: ${notePreview}`,
          entity_type: entityType,
          entity_id: entityId,
        });
      }
    });

    // Convert recent event modifications to activity entries
    events.forEach(event => {
      if (!event.modified_at) return;
      const lastChange = event.last_change || '';
      activities.push({
        id: `event-mod-${event.id}`,
        timestamp: event.modified_at,
        user_name: '',
        action: 'UPDATED_EVENT',
        action_description: `${event.name}${lastChange ? ': ' + lastChange : ''}`,
        entity_type: 'event',
        entity_id: event.id,
      });
    });

    // Convert tasks to activity entries
    console.log('[Activity] Processing tasks:', tasks.length, 'tasks');
    tasks.forEach(task => {
      const eventName = events.find(e => e.id === task.event_id)?.name || '';
      const statusLabels = { TODO: 'Tehtävä', IN_PROGRESS: 'Käynnissä', DONE: 'Valmis' };
      if (task.created_at) {
        activities.push({
          id: `task-add-${task.id}`,
          timestamp: task.created_at,
          user_name: '',
          action: 'ADDED_TASK',
          action_description: `${eventName}${eventName ? ': ' : ''}"${task.title}"`,
          entity_type: 'event',
          entity_id: task.event_id,
        });
      }
      if (task.updated_at && task.updated_at !== task.created_at) {
        activities.push({
          id: `task-upd-${task.id}`,
          timestamp: task.updated_at,
          user_name: '',
          action: 'UPDATED_TASK',
          action_description: `${eventName}${eventName ? ': ' : ''}"${task.title}" → ${statusLabels[task.status] || task.status}`,
          entity_type: 'event',
          entity_id: task.event_id,
        });
      }
    });
    console.log('[Activity] Total activities before sort:', activities.length, 'task entries:', activities.filter(a => a.action?.includes('TASK')).length);

    // Sort newest first, limit to 20
    return activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 50);
  }, [notes, events, persons, tasks]);

  if (!isLoggedIn) {
    return <LoginScreen />;
  }

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddPerson = async (data) => {
    try {
      const p = await addPerson(data);
      setShowNewPerson(false);
      showToast(t('personAdded'), 'success');
      emitPersonCreated({ ...data, id: p?.id || 'new' });
    } catch (err) {
      console.error('Failed to add person:', err);
      showToast('Henkilön lisäys epäonnistui', 'error');
    }
  };

  const handleAddEvent = async (data) => {
    if (newEventPrefilledDate) {
      data.date = newEventPrefilledDate;
      setNewEventPrefilledDate(null);
    }
    try {
      const ev = await addEvent(data);
      setShowNewEvent(false);
      showToast(t('eventAdded'), 'success');
      emitEventCreated({ ...data, id: ev?.id || 'new' });
    } catch (err) {
      console.error('Failed to create event:', err);
      showToast('Tapahtuman luonti epäonnistui: ' + (err.message || 'tuntematon virhe'), 'error');
    }
  };

  const handleAddNote = async (data) => {
    try {
      // Convert empty strings to null for foreign keys (Supabase rejects '' for UUID columns)
      const noteData = {
        ...data,
        event_id: data.event_id || null,
        person_id: data.person_id || null,
      };
      await addNote(noteData);
      showToast(t('noteAdded'), 'success');
      const contextName = noteData.event_id
        ? events.find(e => e.id === noteData.event_id)?.name
        : noteData.person_id
          ? persons.find(p => p.id === noteData.person_id)?.first_name + ' ' + persons.find(p => p.id === noteData.person_id)?.last_name
          : null;
      emitNoteAdded(noteData, contextName);
    } catch (err) {
      console.error('Failed to add note:', err);
      showToast('Muistiinpanon lisäys epäonnistui', 'error');
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      await deleteNote(id);
      showToast(t('noteDeleted'), 'success');
    } catch (err) {
      console.error('Failed to delete note:', err);
      showToast('Muistiinpanon poisto epäonnistui', 'error');
    }
  };

  const handleDeletePerson = async (id) => {
    try {
      await deletePerson(id);
      setSelectedPerson(null);
      showToast(t('personDeleted'), 'success');
    } catch (err) {
      console.error('Failed to delete person:', err);
      showToast('Henkilön poisto epäonnistui', 'error');
    }
  };

  const handleDeleteEvent = async (id) => {
    try {
      await deleteEvent(id);
      removeNotesForEvent(id); // Clean up notes from local state (DB CASCADE handles actual deletion)
      setSelectedEvent(null);
      showToast(t('eventDeleted'), 'success');
    } catch (err) {
      console.error('Failed to delete event:', err);
      showToast('Tapahtuman poisto epäonnistui', 'error');
    }
  };

  const handleUpdateEvent = async (id, data) => {
    try {
      const result = await updateEvent(id, data);
      // Emit notification for event update
      const eventName = result?.name || events.find(e => e.id === id)?.name || '';
      const changeDesc = data.last_change || '';
      emitEventUpdated({ id, name: eventName, last_change: changeDesc });
      return result;
    } catch (err) {
      console.error('Failed to update event:', err);
      throw err;
    }
  };

  const handleNoteClick = (activity) => {
    // Navigate to notes tab
    setView('notes');
    setActiveTab('NOTES');
  };

  const handleAddTask = async (data) => {
    try {
      const task = await addTask(data);
      if (!task) {
        showToast('Tehtävän lisäys epäonnistui', 'error');
        return null;
      }
      const eventName = events.find(e => e.id === data.event_id)?.name || '';
      emitTaskAdded(task, eventName);
      showToast('Tehtävä lisätty', 'success');
      console.log('[App] Task added, has created_at:', !!task.created_at, task.created_at);
      return task;
    } catch (err) {
      console.error('Failed to add task:', err);
      showToast('Tehtävän lisäys epäonnistui', 'error');
    }
  };

  const handleUpdateTask = async (id, data) => {
    try {
      const updatedTask = await updateTask(id, data);
      // updatedTask is the full task object from Supabase
      const taskObj = typeof updatedTask === 'object' && updatedTask ? updatedTask : { ...data, id };
      const eventName = events.find(e => e.id === taskObj.event_id)?.name || '';
      if (data.status) {
        emitTaskStatusChanged(taskObj, eventName);
      }
      return updatedTask;
    } catch (err) {
      console.error('Failed to update task:', err);
      showToast('Tehtävän päivitys epäonnistui', 'error');
    }
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
            onNoteClick={handleNoteClick}
            onTaskStatusChange={handleUpdateTask}
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
            {t('noAccess')}
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
            onDeleteNote={handleDeleteNote}
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
            onUpdate={handleUpdateEvent}
            onDelete={handleDeleteEvent}
            tasks={tasks}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={deleteTask}
            notes={notes.filter(n => n.event_id === selectedEvent?.id)}
            onAddNote={handleAddNote}
            onDeleteNote={handleDeleteNote}
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
            <UserManagement
              events={events}
              assignWorker={assignWorker}
              removeWorkerAssignment={removeWorkerAssignment}
            />
            <RolePermissions
              permissions={permissions}
              onToggle={togglePermission}
              onReset={resetToDefaults}
            />
            <ActivityLog />
          </div>
        ) : (
          <div style={{ ...S.border, ...S.bg, ...S.pad, color: '#666', textAlign: 'center' }}>
            {t('noAccess')}
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
            onNoteClick={handleNoteClick}
            onTaskStatusChange={handleUpdateTask}
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
        onSignOut={signOut}
        onChangePassword={() => setShowChangePassword(true)}
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

      {showChangePassword && (
        <ChangePassword onClose={() => setShowChangePassword(false)} />
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
