import { supabase, Parcel, Delivery } from './supabase';

export class ParcelService {
  static async createParcel(parcelData: {
    sender_id: string;
    receiver_name: string;
    receiver_phone?: string;
    pickup_address: string;
    dropoff_address: string;
    parcel_description?: string;
    weight_kg?: number;
  }) {
    try {
      const { data, error } = await supabase
        .from('parcels')
        .insert([parcelData])
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async getUserParcels(userId: string) {
    try {
      const { data, error } = await supabase
        .from('parcels')
        .select(`
          *,
          deliveries (
            id,
            driver_id,
            pickup_time,
            dropoff_time,
            delivery_status,
            driver:users!deliveries_driver_id_fkey (
              id,
              full_name,
              phone_number
            )
          )
        `)
        .eq('sender_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async getAllParcels() {
    try {
      const { data, error } = await supabase
        .from('parcels')
        .select(`
          *,
          sender:users!parcels_sender_id_fkey (
            id,
            full_name,
            email,
            phone_number
          ),
          deliveries (
            id,
            driver_id,
            pickup_time,
            dropoff_time,
            delivery_status,
            driver:users!deliveries_driver_id_fkey (
              id,
              full_name,
              phone_number
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async updateParcelStatus(parcelId: string, status: Parcel['status']) {
    try {
      const { data, error } = await supabase
        .from('parcels')
        .update({ status })
        .eq('id', parcelId)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async assignDriverToParcel(parcelId: string, driverId: string) {
    try {
      // First, create or update delivery record
      const { data: deliveryData, error: deliveryError } = await supabase
        .from('deliveries')
        .upsert({
          parcel_id: parcelId,
          driver_id: driverId,
          delivery_status: 'assigned'
        })
        .select()
        .single();

      if (deliveryError) throw deliveryError;

      // Update parcel status to in_transit
      const { data: parcelData, error: parcelError } = await supabase
        .from('parcels')
        .update({ status: 'in_transit' })
        .eq('id', parcelId)
        .select()
        .single();

      if (parcelError) throw parcelError;

      return { data: { delivery: deliveryData, parcel: parcelData }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async getDriverDeliveries(driverId: string) {
    try {
      const { data, error } = await supabase
        .from('deliveries')
        .select(`
          *,
          parcel:parcels (
            *,
            sender:users!parcels_sender_id_fkey (
              id,
              full_name,
              phone_number
            )
          )
        `)
        .eq('driver_id', driverId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async updateDeliveryStatus(deliveryId: string, status: Delivery['delivery_status']) {
    try {
      const { data, error } = await supabase
        .from('deliveries')
        .update({ 
          delivery_status: status,
          ...(status === 'picked' && { pickup_time: new Date().toISOString() }),
          ...(status === 'delivered' && { dropoff_time: new Date().toISOString() })
        })
        .eq('id', deliveryId)
        .select(`
          *,
          parcel:parcels (*)
        `)
        .single();

      if (error) throw error;

      // Update parcel status based on delivery status
      if (status === 'delivered' && data.parcel) {
        await supabase
          .from('parcels')
          .update({ status: 'delivered' })
          .eq('id', data.parcel.id);
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async getDrivers() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'driver')
        .order('full_name');

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
}