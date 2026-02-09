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
    // Header
    newEvent: '+ TAPAHTUMA',
    newPerson: '+ HENKILÖ',
    newNote: '+ MUISTIINPANO',
    signOut: 'KIRJAUDU ULOS',
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
    // Header
    newEvent: '+ EVENT',
    newPerson: '+ PERSON',
    newNote: '+ NOTE',
    signOut: 'SIGN OUT',
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
