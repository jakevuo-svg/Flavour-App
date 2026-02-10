import { createContext, useContext, useState } from 'react';

const translations = {
  fi: {
    // Navigation
    HOME: 'KOTI',
    PERSONS: 'HENKILÖT',
    EVENTS: 'TAPAHTUMAT',
    LOCATIONS: 'SIJAINNIT',
    NOTES: 'MUISTIINPANOT',
    ADMIN: 'HALLINTA',
    CALENDAR: 'KALENTERI',
    // Tab keys (match internal tab names)
    tab_PERSON: 'HENKILÖT',
    tab_DATE: 'KALENTERI',
    tab_EVENTS: 'TAPAHTUMAT',
    tab_LOCATIONS: 'SIJAINNIT',
    tab_NOTES: 'MUISTIINPANOT',
    tab_ADMIN: 'HALLINTA',
    searchLabel: 'HAKU',
    go: 'HAE',
    noAccess: 'Sinulla ei ole oikeutta käyttää tätä osiota.',
    personAdded: 'Henkilö lisätty onnistuneesti',
    eventAdded: 'Tapahtuma lisätty onnistuneesti',
    noteAdded: 'Muistiinpano lisätty onnistuneesti',
    noteDeleted: 'Muistiinpano poistettu',
    personDeleted: 'Henkilö poistettu',
    eventDeleted: 'Tapahtuma poistettu',
    addedNoteTo: 'Lisäsi muistiinpanon',
    // Header
    newEvent: '+ TAPAHTUMA',
    newPerson: '+ HENKILÖ',
    newNote: '+ MUISTIINPANO',
    signOut: 'KIRJAUDU ULOS',
    changePassword: 'VAIHDA SALASANA',
    // Common
    save: 'TALLENNA',
    cancel: 'PERUUTA',
    edit: 'MUOKKAA',
    delete: 'POISTA',
    add: 'LISÄÄ',
    back: '← TAKAISIN',
    search: 'Haku...',
    empty: 'Tyhjä',
    loading: 'Ladataan...',
    noResults: 'Ei tuloksia',
    // Event form
    eventName: 'Tapahtuman nimi',
    type: 'Tyyppi',
    status: 'Status',
    date: 'Päivämäärä',
    startTime: 'Alkaa',
    endTime: 'Päättyy',
    location: 'Sijainti',
    guestCount: 'Pax',
    language: 'Kieli',
    company: 'Yritys',
    contact: 'Yhteystieto',
    booker: 'Varaaja',
    goal: 'Tavoite',
    attentionNotes: 'Huomioitavaa',
    schedule: 'Aikataulu',
    menu: 'Menu',
    decorations: 'Dekoraatiot',
    logistics: 'Logistiikka',
    pricing: 'Hinnoittelu',
    notes: 'Muistiinpanot',
    tasks: 'Tehtävät',
    workers: 'Työntekijät',
    materials: 'Materiaalit / Liitteet',
    order: 'Order / Tilaus',
    uploadFile: '+ LATAA TIEDOSTO',
    addLink: '+ LISÄÄ LINKKI',
    driveLink: 'Google Drive -linkki',
    total: 'YHTEENSÄ',
    food: 'Ruoka',
    drinks: 'Juomat',
    tech: 'Tekniikka',
    program: 'Ohjelma',
    price: 'hinta (€)',
    // Allergens
    allergens: 'ERV / Allergeenit',
    allergenNotes: 'Lisätiedot allergioista',
    // Dashboard
    upcomingEvents: 'Tulevat tapahtumat',
    recentActivity: 'Viimeaikainen toiminta',
    quickStats: 'Nopeat tilastot',
    // Admin
    userManagement: 'KÄYTTÄJÄHALLINTA',
    createUser: '+ LUO KÄYTTÄJÄ',
    email: 'Sähköposti',
    password: 'Salasana',
    firstName: 'Etunimi',
    lastName: 'Sukunimi',
    role: 'Rooli',
    roleAdmin: 'Järjestelmänvalvoja',
    roleWorker: 'Työntekijä',
    roleTemporary: 'Väliaikainen',
    active: 'Aktiivinen',
    inactive: 'Passiivinen',
    expiresAt: 'Vanhentumispäivä',
    deactivate: 'DEAKTIVOI',
    activate: 'AKTIVOI',
    deleteUser: 'POISTA',
    confirmDeleteUser: 'Haluatko varmasti poistaa tämän käyttäjän? Tätä ei voi perua.',
    userDeleted: 'Käyttäjä poistettu',
    cannotDeleteSelf: 'Et voi poistaa omaa käyttäjätiliäsi',
    eventAccess: 'TAPAHTUMAOIKEUDET',
    eventAccessDesc: 'Valitse mihin tapahtumiin työntekijöillä on pääsy. Työntekijä näkee vain valitut tapahtumat.',
    noWorkersYet: 'Ei työntekijöitä. Luo ensin työntekijä käyttäjähallinnasta.',
    // Language
    langFi: 'Suomi',
    langEn: 'English',
  },
  en: {
    // Navigation
    HOME: 'HOME',
    PERSONS: 'PERSONS',
    EVENTS: 'EVENTS',
    LOCATIONS: 'LOCATIONS',
    NOTES: 'NOTES',
    ADMIN: 'ADMIN',
    CALENDAR: 'CALENDAR',
    // Tab keys
    tab_PERSON: 'PERSONS',
    tab_DATE: 'CALENDAR',
    tab_EVENTS: 'EVENTS',
    tab_LOCATIONS: 'LOCATIONS',
    tab_NOTES: 'NOTES',
    tab_ADMIN: 'ADMIN',
    searchLabel: 'SEARCH',
    go: 'GO',
    noAccess: 'You do not have permission to access this section.',
    personAdded: 'Person added successfully',
    eventAdded: 'Event added successfully',
    noteAdded: 'Note added successfully',
    noteDeleted: 'Note deleted',
    personDeleted: 'Person deleted',
    eventDeleted: 'Event deleted',
    addedNoteTo: 'Added note to',
    // Header
    newEvent: '+ EVENT',
    newPerson: '+ PERSON',
    newNote: '+ NOTE',
    signOut: 'SIGN OUT',
    changePassword: 'CHANGE PASSWORD',
    // Common
    save: 'SAVE',
    cancel: 'CANCEL',
    edit: 'EDIT',
    delete: 'DELETE',
    add: 'ADD',
    back: '← BACK',
    search: 'Search...',
    empty: 'Empty',
    loading: 'Loading...',
    noResults: 'No results',
    // Event form
    eventName: 'Event name',
    type: 'Type',
    status: 'Status',
    date: 'Date',
    startTime: 'Start',
    endTime: 'End',
    location: 'Location',
    guestCount: 'Guests',
    language: 'Language',
    company: 'Company',
    contact: 'Contact',
    booker: 'Booker',
    goal: 'Goal',
    attentionNotes: 'Notes',
    schedule: 'Schedule',
    menu: 'Menu',
    decorations: 'Decorations',
    logistics: 'Logistics',
    pricing: 'Pricing',
    notes: 'Notes',
    tasks: 'Tasks',
    workers: 'Workers',
    materials: 'Materials / Attachments',
    order: 'Order',
    uploadFile: '+ UPLOAD FILE',
    addLink: '+ ADD LINK',
    driveLink: 'Google Drive link',
    total: 'TOTAL',
    food: 'Food',
    drinks: 'Drinks',
    tech: 'Tech',
    program: 'Program',
    price: 'price (€)',
    // Allergens
    allergens: 'Dietary / Allergens',
    allergenNotes: 'Allergen details',
    // Dashboard
    upcomingEvents: 'Upcoming events',
    recentActivity: 'Recent activity',
    quickStats: 'Quick stats',
    // Admin
    userManagement: 'USER MANAGEMENT',
    createUser: '+ CREATE USER',
    email: 'Email',
    password: 'Password',
    firstName: 'First name',
    lastName: 'Last name',
    role: 'Role',
    roleAdmin: 'Administrator',
    roleWorker: 'Worker',
    roleTemporary: 'Temporary',
    active: 'Active',
    inactive: 'Inactive',
    expiresAt: 'Expiration date',
    deactivate: 'DEACTIVATE',
    activate: 'ACTIVATE',
    deleteUser: 'DELETE',
    confirmDeleteUser: 'Are you sure you want to delete this user? This cannot be undone.',
    userDeleted: 'User deleted',
    cannotDeleteSelf: 'You cannot delete your own account',
    eventAccess: 'EVENT ACCESS',
    eventAccessDesc: 'Choose which events workers can access. Workers only see selected events.',
    noWorkersYet: 'No workers yet. Create a worker in User Management first.',
    // Language
    langFi: 'Suomi',
    langEn: 'English',
  },
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem('typedwn-lang') || 'fi'; } catch { return 'fi'; }
  });

  const toggleLang = () => {
    const next = lang === 'fi' ? 'en' : 'fi';
    setLang(next);
    try { localStorage.setItem('typedwn-lang', next); } catch {}
  };

  const setLanguage = (l) => {
    setLang(l);
    try { localStorage.setItem('typedwn-lang', l); } catch {}
  };

  const t = (key) => translations[lang]?.[key] || translations.fi[key] || key;

  return (
    <LanguageContext.Provider value={{ lang, setLang: setLanguage, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be inside LanguageProvider');
  return ctx;
}
