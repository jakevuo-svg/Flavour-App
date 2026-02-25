import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../components/auth/AuthContext';

export const INQUIRY_STATUSES = ['UUSI', 'VASTATTU', 'TARJOTTU', 'VAHVISTETTU', 'LASKUTETTU', 'MAKSETTU', 'HÄVITTY'];

export const INQUIRY_STATUS_COLORS = {
  UUSI: '#ff4444',
  VASTATTU: '#ffaa00',
  TARJOTTU: '#4488ff',
  VAHVISTETTU: '#44bb44',
  LASKUTETTU: '#aa66ff',
  MAKSETTU: '#44ddaa',
  HÄVITTY: '#666',
};

export function useInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { profile } = useAuth();

  const fetchInquiries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: err } = await supabase
        .from('inquiries')
        .select('*')
        .order('received_at', { ascending: false });
      if (err) throw err;
      setInquiries(data || []);
    } catch (err) {
      console.error('Failed to fetch inquiries:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchInquiries(); }, [fetchInquiries]);

  const addInquiry = useCallback(async (data) => {
    try {
      setError(null);
      const inquiryData = {
        contact_name: data.contact_name || '',
        email: data.email || '',
        phone: data.phone || '',
        company: data.company || '',
        requested_date: data.requested_date || '',
        description: data.description || '',
        guest_count: data.guest_count || null,
        source: data.source || 'MANUAALINEN',
        status: data.status || 'UUSI',
        offered: data.offered || '',
        price: data.price || null,
        notes: data.notes || '',
        assigned_to: data.assigned_to || profile?.id,
        assigned_name: data.assigned_name || (profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : ''),
        received_at: data.received_at || new Date().toISOString(),
        created_by: profile?.id,
        created_at: new Date().toISOString(),
        modified_at: new Date().toISOString(),
      };
      const { data: created, error: err } = await supabase
        .from('inquiries')
        .insert([inquiryData])
        .select()
        .single();
      if (err) throw err;
      setInquiries(prev => [created, ...prev]);
      return created;
    } catch (err) {
      console.error('Failed to add inquiry:', err);
      setError(err.message);
      throw err;
    }
  }, [profile?.id, profile?.first_name, profile?.last_name]);

  const updateInquiry = useCallback(async (id, data) => {
    try {
      setError(null);
      const updateData = { ...data, modified_at: new Date().toISOString() };
      // Remove client-only fields
      delete updateData.id;
      delete updateData.created_at;
      delete updateData.created_by;
      const { data: updated, error: err } = await supabase
        .from('inquiries')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (err) throw err;
      setInquiries(prev => prev.map(i => i.id === id ? updated : i));
      return updated;
    } catch (err) {
      console.error('Failed to update inquiry:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  const deleteInquiry = useCallback(async (id) => {
    try {
      setError(null);
      const { error: err } = await supabase.from('inquiries').delete().eq('id', id);
      if (err) throw err;
      setInquiries(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      console.error('Failed to delete inquiry:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  // Convert inquiry to event — returns event data to be created
  const convertToEvent = useCallback(async (inquiry) => {
    const eventData = {
      name: inquiry.company ? `${inquiry.company} — ${inquiry.description?.slice(0, 50) || 'Tiedustelu'}` : inquiry.description?.slice(0, 60) || 'Tiedustelu',
      company: inquiry.company || '',
      booker: inquiry.contact_name || '',
      contact: inquiry.email || inquiry.phone || '',
      date: inquiry.requested_date || '',
      guest_count: inquiry.guest_count || 0,
      status: 'VAHVISTETTU',
      notes: `Tiedustelusta luotu.\n${inquiry.description || ''}`,
    };
    return eventData;
  }, []);

  // Link inquiry to created event
  const linkToEvent = useCallback(async (inquiryId, eventId) => {
    try {
      await updateInquiry(inquiryId, { event_id: eventId, status: 'VAHVISTETTU' });
    } catch (err) {
      console.error('Failed to link inquiry to event:', err);
    }
  }, [updateInquiry]);

  return {
    inquiries, loading, error,
    addInquiry, updateInquiry, deleteInquiry,
    convertToEvent, linkToEvent,
    refetch: fetchInquiries,
  };
}
