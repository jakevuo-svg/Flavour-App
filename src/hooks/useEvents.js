import { useState, useEffect, useCallback } from 'react';
import { supabase, isDemoMode } from '../services/supabaseClient';
import { useAuth } from '../components/auth/AuthContext';

// Demo seed data for events
const now = new Date();
const futureDate = (days) => new Date(now.getTime() + days * 86400000).toISOString();
const pastDate = (days) => new Date(now.getTime() - days * 86400000).toISOString();

let demoEvents = isDemoMode ? [
  {
    id: 'event-1',
    name: 'Lapland Cooking Experience',
    date: futureDate(14),
    end_date: futureDate(14),
    start_time: '17:30',
    end_time: '22:00',
    location_id: 'loc-2',
    location_name: 'KELLOHALLI',
    type: 'COOKING SCHOOL',
    status: 'CONFIRMED',
    guest_count: 37,
    language: 'Suomi',
    company: 'Acme Corp',
    booker: 'Matti V.',
    contact: 'matti@acme.fi',
    clientName: 'Acme Corp Oy',
    goal: 'Networking, special toteutusmuoto & menu',
    attentionNotes: '- Puolukkateemainen welcoming drink\n- Tuovat omat essut\n- Video screeneille Studiolle\n- Saapuminen Kellohallin kautta\n- Pöydät dekotaan lappiteemalla (havut, kynttilät)',
    erv: '1. No alcohol\n2. Gluten-free\n3. Gluten- and lactose-free (fish ok, no red meat)\nhuom, paikan päällä voi tulla pieniä ilmi',
    schedule: '17:10 Ready\n17:30 Guest Arrival - Welcome drinks\n18:00 Opening Words\n18:15 Cooking Session begins\n20:15 Dinner\n22:00 End',
    menu: 'Amuse-bouche: Leipäjuusto deep fried\nFirst: Lapland flatbread with reindeer tartare\nSecond: Black salsify soup with charred white fish\nMain: Lappish potato snow, dark sauce, reindeer\nDessert: Arctic cranberries three ways',
    menuLink: 'https://drive.google.com/drive/folders/menu-lapland-2026',
    decorations: 'Lapland style - havut ja kynttilät, 2 long tables in Kellohalli',
    materials: [
      { id: 'mat-1', name: 'Istumajärjestys Kellohalli', type: 'seating', driveLink: 'https://drive.google.com/file/d/seating-lapland', fileData: null, fileName: null, fileType: null, addedAt: '2026-01-20T10:00:00Z' },
      { id: 'mat-2', name: 'Menu grafiikka v2', type: 'menu_graphic', driveLink: 'https://drive.google.com/file/d/menu-graphic-lapland', fileData: null, fileName: null, fileType: null, addedAt: '2026-01-22T14:30:00Z' },
      { id: 'mat-3', name: 'Lappiteema moodboard', type: 'branding', driveLink: 'https://drive.google.com/file/d/branding-lapland', fileData: null, fileName: null, fileType: null, addedAt: '2026-01-18T09:00:00Z' },
    ],
    logistics: 'Video looppaamaan näytöille, Kassu klo 15:00',
    orderLink: 'https://drive.google.com/drive/folders/1aBcDeFgHiJkLmNoPqRsTuVwXyZ',
    orderNotes: 'Tilausvahvistus lähetetty 28.1. Laskutus 14pv netto.',
    food: '4 courses + amuse',
    foodPrice: '2800',
    drinks: 'Kuohuviini + viinit menun kanssa',
    drinksPrice: '900',
    tech: 'Video screens + audio',
    techPrice: '400',
    program: 'Cooking school 4 pistettä',
    programPrice: '1200',
    notes: 'Valmius 17:15. Narikat oikealle. 4 tiimiä, jokaisessa asiakasyrityksen kapteeni.',
    created_by: 'demo-admin-1',
    created_at: pastDate(10),
    modified_at: pastDate(2),
  },
  {
    id: 'event-2',
    name: 'Company Dinner - Nordic Corp',
    date: futureDate(45),
    end_date: futureDate(45),
    start_time: '18:00',
    end_time: '23:00',
    location_id: 'loc-1',
    location_name: 'BLACK BOX 360',
    type: 'DINNER',
    status: 'CONFIRMED',
    guest_count: 80,
    language: 'English',
    company: 'Nordic Corp',
    contact: 'anna@nordic.fi',
    goal: 'Vuosijuhla ja palkitsemistilaisuus',
    attentionNotes: '- 360° projisoinnit teemalla\n- Palkintoseremonia jälkiruoan jälkeen',
    erv: '3 vegaania, 2 gluteiinitonta',
    schedule: '18:00 Welcome drinks\n19:00 Dinner\n21:00 Awards\n22:00 After party\n23:00 End',
    menu: 'TBD - 3 course dinner',
    decorations: 'Company branding + Nordic theme',
    orderLink: 'https://drive.google.com/drive/folders/2xYzAbCdEfGhIjKlMnOpQrStUv',
    food: '3 courses',
    foodPrice: '4200',
    drinks: 'Full bar',
    drinksPrice: '2400',
    notes: 'AV-tekniikka tarkistettava viikkoa ennen',
    created_by: 'demo-admin-1',
    created_at: pastDate(20),
    modified_at: pastDate(5),
  },
  {
    id: 'event-3',
    name: 'Team Cooking Workshop',
    date: futureDate(7),
    end_date: futureDate(7),
    start_time: '10:00',
    end_time: '14:00',
    location_id: 'loc-3',
    location_name: 'FLAVOUR STUDIO',
    type: 'COOKING SCHOOL',
    status: 'WORKING ON IT',
    guest_count: 25,
    language: 'Suomi',
    company: 'Tech Solutions Oy',
    contact: 'pekka@techsolutions.fi',
    goal: 'Tiimihenki + kokkauskokemus',
    schedule: '10:00 Tervetuloa\n10:30 Kokkaus alkaa\n12:30 Ruokailu\n14:00 Lopetus',
    menu: 'Italian themed - pasta workshop',
    food: 'Pasta + dessert',
    foodPrice: '1200',
    drinks: 'Viinit + alkoholittomat',
    drinksPrice: '600',
    notes: 'DJ-sopimus vahvistettava',
    created_by: 'demo-admin-1',
    created_at: pastDate(15),
    modified_at: pastDate(3),
  },
  {
    id: 'event-4',
    name: 'Seminar: Food Trends 2026',
    date: futureDate(30),
    end_date: futureDate(30),
    start_time: '09:00',
    end_time: '17:00',
    location_id: 'loc-2',
    location_name: 'KELLOHALLI',
    type: 'SEMINAR',
    status: 'NOT CONFIRMED',
    guest_count: 120,
    language: 'English',
    company: 'Food Industry Finland',
    contact: 'laura@foodindustry.fi',
    goal: 'Alan trendikatsaus ja verkostoituminen',
    schedule: '09:00 Rekisteröinti\n09:30 Keynote\n11:00 Panel\n12:00 Lounas\n13:00 Workshopit\n16:00 Networking\n17:00 End',
    food: 'Lounas + kahvit',
    foodPrice: '3600',
    notes: 'Esilinat tilattava 30 kpl',
    created_by: 'demo-admin-1',
    created_at: pastDate(8),
    modified_at: pastDate(1),
  },
  {
    id: 'event-5',
    name: 'Pikkujoulut - Startup Hub',
    date: futureDate(60),
    end_date: futureDate(60),
    start_time: '18:00',
    end_time: '01:00',
    location_id: 'loc-4',
    location_name: 'CUISINE',
    type: 'COMPANY PARTY',
    status: 'PRELIMINARY',
    guest_count: 65,
    language: 'Suomi',
    company: 'Startup Hub Oy',
    contact: 'sanna@startuphub.fi',
    goal: 'Rento pikkujoulutunnelma',
    attentionNotes: '- Jouluteema\n- Karaoke mahdollinen\n- DJ klo 21 eteenpäin',
    schedule: '18:00 Cocktails\n19:00 Buffet\n20:00 Puhe + palkinnot\n21:00 DJ + tanssi\n01:00 End',
    menu: 'Joulubuffet + cocktail-alkupalat',
    decorations: 'Jouluteema: valot, kuuset, kynttilät',
    food: 'Joulubuffet',
    foodPrice: '3200',
    drinks: 'Cocktails + viinit + olut',
    drinksPrice: '2800',
    program: 'DJ + karaoke',
    programPrice: '800',
    notes: '3 kansainvälistä puhujaa, lentoliput ja hotellit',
    created_by: 'demo-admin-1',
    created_at: pastDate(5),
    modified_at: pastDate(1),
  },
] : [];

let demoEventAssignments = [];
let demoNextId = 100;

/**
 * Custom hook for managing events data
 */
export function useEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { profile, isWorker, isAdmin } = useAuth();

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (isDemoMode) {
        if (isWorker) {
          const workerEvents = demoEvents.filter(e =>
            demoEventAssignments.some(a => a.event_id === e.id && a.user_id === profile?.id)
          );
          setEvents(workerEvents.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
        } else {
          setEvents([...demoEvents].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
        }
        return;
      }

      console.log('[useEvents] Fetching events. isDemoMode:', isDemoMode, 'isWorker:', isWorker, 'isAdmin:', isAdmin, 'profile:', profile?.id);

      let query = supabase.from('events').select('*');

      if (isWorker) {
        console.log('[useEvents] Worker mode — filtering by assignments');
        const { data: assignments, error: assignmentError } = await supabase
          .from('event_assignments')
          .select('event_id')
          .eq('user_id', profile?.id);

        if (assignmentError) throw assignmentError;

        const eventIds = assignments?.map(a => a.event_id) || [];
        if (eventIds.length === 0) {
          console.log('[useEvents] No assignments found for worker');
          setEvents([]);
          return;
        }

        query = query.in('id', eventIds);
      }

      const { data, error: err } = await query.order('created_at', { ascending: false });

      if (err) {
        console.error('[useEvents] Supabase query error:', err);
        throw err;
      }
      console.log('[useEvents] Got events:', data?.length || 0, data);
      setEvents(data || []);
    } catch (err) {
      console.error('Failed to fetch events:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [profile?.id, isWorker, isAdmin]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const addEvent = useCallback(async (data) => {
    try {
      setError(null);
      const eventData = {
        ...data,
        created_by: profile?.id,
        created_at: new Date().toISOString(),
        modified_at: new Date().toISOString(),
      };

      if (isDemoMode) {
        const id = `event-${demoNextId++}`;
        const newEvent = { id, ...eventData };
        demoEvents.push(newEvent);
        setEvents(prev => [newEvent, ...prev]);
        return newEvent;
      }

      const { data: newEvent, error: err } = await supabase
        .from('events')
        .insert([eventData])
        .select()
        .single();

      if (err) throw err;
      setEvents(prev => [newEvent, ...prev]);
      return newEvent;
    } catch (err) {
      console.error('Failed to add event:', err);
      setError(err.message);
      throw err;
    }
  }, [profile?.id]);

  const updateEvent = useCallback(async (id, data) => {
    try {
      setError(null);
      const updateData = {
        ...data,
        modified_by: profile?.id,
        modified_at: new Date().toISOString(),
      };

      if (isDemoMode) {
        const idx = demoEvents.findIndex(e => e.id === id);
        if (idx !== -1) {
          demoEvents[idx] = { ...demoEvents[idx], ...updateData };
          setEvents(prev => prev.map(e => e.id === id ? { ...e, ...updateData } : e));
          return demoEvents[idx];
        }
        throw new Error('Event not found');
      }

      const { data: updated, error: err } = await supabase
        .from('events')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (err) throw err;
      setEvents(prev => prev.map(e => e.id === id ? updated : e));
      return updated;
    } catch (err) {
      console.error('Failed to update event:', err);
      setError(err.message);
      throw err;
    }
  }, [profile?.id]);

  const deleteEvent = useCallback(async (id) => {
    try {
      setError(null);

      if (isDemoMode) {
        demoEvents = demoEvents.filter(e => e.id !== id);
        demoEventAssignments = demoEventAssignments.filter(a => a.event_id !== id);
        setEvents(prev => prev.filter(e => e.id !== id));
        return;
      }

      const { error: err } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (err) throw err;
      setEvents(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      console.error('Failed to delete event:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  const assignWorker = useCallback(async (eventId, workerId) => {
    try {
      setError(null);

      if (isDemoMode) {
        const assignment = {
          id: `assignment-${Date.now()}`,
          event_id: eventId,
          user_id: workerId,
          assigned_at: new Date().toISOString(),
        };
        demoEventAssignments.push(assignment);
        return assignment;
      }

      const { data, error: err } = await supabase
        .from('event_assignments')
        .insert([{ event_id: eventId, user_id: workerId }])
        .select()
        .single();

      if (err) throw err;
      return data;
    } catch (err) {
      console.error('Failed to assign worker:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  const removeWorkerAssignment = useCallback(async (eventId, workerId) => {
    try {
      setError(null);

      if (isDemoMode) {
        demoEventAssignments = demoEventAssignments.filter(
          a => !(a.event_id === eventId && a.user_id === workerId)
        );
        return;
      }

      const { error: err } = await supabase
        .from('event_assignments')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', workerId);

      if (err) throw err;
    } catch (err) {
      console.error('Failed to remove worker assignment:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  const getEventAssignments = useCallback(async (eventId) => {
    try {
      setError(null);

      if (isDemoMode) {
        return demoEventAssignments.filter(a => a.event_id === eventId);
      }

      const { data, error: err } = await supabase
        .from('event_assignments')
        .select('*')
        .eq('event_id', eventId);

      if (err) throw err;
      return data || [];
    } catch (err) {
      console.error('Failed to fetch event assignments:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    events,
    loading,
    error,
    addEvent,
    updateEvent,
    deleteEvent,
    assignWorker,
    removeWorkerAssignment,
    getEventAssignments,
    refetch: fetchEvents,
  };
}
