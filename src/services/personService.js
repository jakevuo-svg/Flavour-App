import { supabase, isDemoMode } from './supabaseClient';

let demoPersons = isDemoMode ? [
  {
    id: 'person-1',
    first_name: 'Matti',
    last_name: 'Virtanen',
    email: 'matti.virtanen@example.fi',
    phone: '040-1234567',
    company: 'Virtanen Consulting Oy',
    role: 'Toimitusjohtaja',
    type: 'Asiakas',
    notes: 'Pitkäaikainen yhteistyökumppani, tapaa mielellään kasvotusten.',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    modified_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'person-2',
    first_name: 'Anna',
    last_name: 'Korhonen',
    email: 'anna.korhonen@example.fi',
    phone: '050-9876543',
    company: 'EventPro Finland',
    role: 'Tapahtumakoordinaattori',
    type: 'Yhteistyökumppani',
    notes: 'Erikoistunut suuriin yritystapahtumiin.',
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
    modified_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'person-3',
    first_name: 'Pekka',
    last_name: 'Lahtinen',
    email: 'pekka.lahtinen@example.fi',
    phone: '045-1112233',
    company: 'Lahtinen Media',
    role: 'Luova johtaja',
    type: 'Toimittaja',
    notes: 'AV-tekniikka ja valaistus.',
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    modified_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'person-4',
    first_name: 'Laura',
    last_name: 'Nieminen',
    email: 'laura.nieminen@example.fi',
    phone: '040-5556677',
    company: 'Taste of Finland Oy',
    role: 'Keittiömestari',
    type: 'Toimittaja',
    notes: 'Catering-palvelut, erikoisruokavaliot huomioitu hyvin.',
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    modified_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: 'person-5',
    first_name: 'Sanna',
    last_name: 'Kallio',
    email: 'sanna.kallio@example.fi',
    phone: '050-3334455',
    company: 'Nordic Events Group',
    role: 'Projektipäällikkö',
    type: 'Asiakas',
    notes: 'Uusi kontakti, kiinnostunut vuosittaisesta yhteistyöstä.',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    modified_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
] : [];

let demoNextId = 100;

export const getPersons = async () => {
  if (isDemoMode) {
    return [...demoPersons].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  const { data, error } = await supabase
    .from('persons')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching persons:', error);
    throw error;
  }

  return data || [];
};

export const getPerson = async (id) => {
  if (isDemoMode) {
    return demoPersons.find(p => p.id === id) || null;
  }

  const { data, error } = await supabase
    .from('persons')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching person:', error);
    throw error;
  }

  return data || null;
};

export const createPerson = async (data) => {
  const personData = {
    ...data,
    created_at: new Date().toISOString(),
    modified_at: new Date().toISOString(),
  };

  if (isDemoMode) {
    const id = `person-${demoNextId++}`;
    const newPerson = { id, ...personData };
    demoPersons.push(newPerson);
    return newPerson;
  }

  const { data: newPerson, error } = await supabase
    .from('persons')
    .insert([personData])
    .select()
    .single();

  if (error) {
    console.error('Error creating person:', error);
    throw error;
  }

  return newPerson;
};

export const updatePerson = async (id, data) => {
  const updateData = {
    ...data,
    modified_at: new Date().toISOString(),
  };

  if (isDemoMode) {
    const person = demoPersons.find(p => p.id === id);
    if (person) {
      Object.assign(person, updateData);
      return person;
    }
    throw new Error('Person not found');
  }

  const { data: updatedPerson, error } = await supabase
    .from('persons')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating person:', error);
    throw error;
  }

  return updatedPerson;
};

export const deletePerson = async (id) => {
  if (isDemoMode) {
    demoPersons = demoPersons.filter(p => p.id !== id);
    return true;
  }

  const { error } = await supabase
    .from('persons')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting person:', error);
    throw error;
  }

  return true;
};
