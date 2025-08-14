import { supabase, TABLES, createMedicationRecord } from '../lib/supabase'
import { v4 as uuidv4 } from 'uuid'

export class MedicationService {
  // Initialize tables if they don't exist
  static async initializeTables() {
    try {
      console.log('Initializing tables...');

      // Check if medications table exists
      const { data: medicationsTable } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', TABLES.MEDICATIONS)
        .single();

      if (!medicationsTable) {
        console.log(`Creating ${TABLES.MEDICATIONS} table...`);
        
        // Create medications table
        await supabase.query(`
          CREATE TABLE IF NOT EXISTS ${TABLES.MEDICATIONS} (
            id UUID PRIMARY KEY,
            name TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            date_time TIMESTAMPTZ NOT NULL,
            notes TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            user_id UUID
          )
        `);
        
        // Enable RLS and create policies
        await supabase.query(`
          ALTER TABLE ${TABLES.MEDICATIONS} ENABLE ROW LEVEL SECURITY;
          CREATE POLICY "Allow public access" ON ${TABLES.MEDICATIONS} USING (true);
          CREATE POLICY "Allow public insert" ON ${TABLES.MEDICATIONS} FOR INSERT WITH CHECK (true);
          CREATE POLICY "Allow public update" ON ${TABLES.MEDICATIONS} FOR UPDATE USING (true);
          CREATE POLICY "Allow public delete" ON ${TABLES.MEDICATIONS} FOR DELETE USING (true);
        `);
      }

      // Check if common medications table exists
      const { data: commonMedsTable } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', TABLES.COMMON_MEDICATIONS)
        .single();

      if (!commonMedsTable) {
        console.log(`Creating ${TABLES.COMMON_MEDICATIONS} table...`);
        
        // Create common medications table
        await supabase.query(`
          CREATE TABLE IF NOT EXISTS ${TABLES.COMMON_MEDICATIONS} (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            usage_count INTEGER DEFAULT 1,
            last_used TIMESTAMPTZ DEFAULT NOW(),
            user_id UUID
          )
        `);
        
        // Enable RLS and create policies
        await supabase.query(`
          ALTER TABLE ${TABLES.COMMON_MEDICATIONS} ENABLE ROW LEVEL SECURITY;
          CREATE POLICY "Allow public access" ON ${TABLES.COMMON_MEDICATIONS} USING (true);
          CREATE POLICY "Allow public insert" ON ${TABLES.COMMON_MEDICATIONS} FOR INSERT WITH CHECK (true);
          CREATE POLICY "Allow public update" ON ${TABLES.COMMON_MEDICATIONS} FOR UPDATE USING (true);
          CREATE POLICY "Allow public delete" ON ${TABLES.COMMON_MEDICATIONS} FOR DELETE USING (true);
        `);

        // Add default medications
        const defaultMeds = [
          'Paracetamol', 'Ibuprofeno', 'Aspirina', 'Naproxeno', 'Diclofenaco',
          'Ketorolaco', 'Tramadol', 'Codeína', 'Metamizol', 'Celecoxib'
        ];
        
        for (const med of defaultMeds) {
          await supabase
            .from(TABLES.COMMON_MEDICATIONS)
            .insert({
              name: med,
              usage_count: 0,
              last_used: new Date().toISOString()
            })
            .catch(err => console.error(`Error adding default medication ${med}:`, err));
        }
      }

      console.log('Tables initialized successfully');
      return true;
    } catch (error) {
      console.error('Error initializing tables:', error);
      return false;
    }
  }

  // Get all medications
  static async getAllMedications() {
    try {
      console.log('Getting all medications...');
      
      // Initialize tables if needed
      await this.initializeTables();

      const { data, error } = await supabase
        .from(TABLES.MEDICATIONS)
        .select('*')
        .order('date_time', { ascending: false });

      if (error) {
        console.error('Error in getAllMedications:', error);
        throw error;
      }

      console.log(`Retrieved ${data?.length || 0} medications`);
      
      // Transform data to match app format
      return (data || []).map(med => ({
        id: med.id,
        name: med.name,
        quantity: med.quantity,
        dateTime: med.date_time,
        notes: med.notes,
        createdAt: med.created_at
      }));
    } catch (error) {
      console.error('Error fetching medications:', error);
      return [];
    }
  }

  // Add new medication
  static async addMedication(medication) {
    try {
      console.log('Adding medication:', medication);
      
      // Initialize tables if needed
      await this.initializeTables();

      // Generate a new UUID if one is not provided
      const medicationId = medication.id || uuidv4();
      
      const medicationRecord = {
        id: medicationId,
        name: medication.name,
        quantity: parseInt(medication.quantity),
        date_time: medication.dateTime,
        notes: medication.notes || '',
        created_at: medication.createdAt || new Date().toISOString()
      };

      console.log('Medication record to insert:', medicationRecord);

      const { data, error } = await supabase
        .from(TABLES.MEDICATIONS)
        .insert([medicationRecord]);

      if (error) {
        console.error('Error in addMedication:', error);
        throw error;
      }

      console.log('Medication added successfully');

      // Update common medications usage
      await this.updateCommonMedicationUsage(medication.name);

      // Return the created medication with app format
      return {
        id: medicationId,
        name: medication.name,
        quantity: parseInt(medication.quantity),
        dateTime: medication.dateTime,
        notes: medication.notes || '',
        createdAt: medication.createdAt || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error adding medication:', error);
      throw error;
    }
  }

  // Update medication
  static async updateMedication(id, updates) {
    try {
      console.log('Updating medication:', id, updates);
      
      const updateRecord = {
        name: updates.name,
        quantity: parseInt(updates.quantity),
        date_time: updates.dateTime,
        notes: updates.notes || ''
      };

      const { data, error } = await supabase
        .from(TABLES.MEDICATIONS)
        .update(updateRecord)
        .eq('id', id)
        .select();

      if (error) {
        console.error('Error in updateMedication:', error);
        throw error;
      }

      console.log('Medication updated successfully');

      // Update common medications if name changed
      await this.updateCommonMedicationUsage(updates.name);

      return {
        id,
        name: updates.name,
        quantity: parseInt(updates.quantity),
        dateTime: updates.dateTime,
        notes: updates.notes || '',
        createdAt: data && data[0] ? data[0].created_at : new Date().toISOString()
      };
    } catch (error) {
      console.error('Error updating medication:', error);
      throw error;
    }
  }

  // Delete medication
  static async deleteMedication(id) {
    try {
      console.log('Deleting medication:', id);
      
      const { error } = await supabase
        .from(TABLES.MEDICATIONS)
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error in deleteMedication:', error);
        throw error;
      }
      
      console.log('Medication deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting medication:', error);
      throw error;
    }
  }

  // Get common medications
  static async getCommonMedications() {
    try {
      console.log('Getting common medications...');
      
      // Initialize tables if needed
      await this.initializeTables();

      const { data, error } = await supabase
        .from(TABLES.COMMON_MEDICATIONS)
        .select('name')
        .order('usage_count', { ascending: false })
        .order('name', { ascending: true });

      if (error) {
        console.error('Error in getCommonMedications:', error);
        throw error;
      }

      console.log(`Retrieved ${data?.length || 0} common medications`);
      return (data || []).map(item => item.name);
    } catch (error) {
      console.error('Error fetching common medications:', error);
      // Return default list if error
      return [
        'Paracetamol', 'Ibuprofeno', 'Aspirina', 'Naproxeno', 'Diclofenaco',
        'Ketorolaco', 'Tramadol', 'Codeína', 'Metamizol', 'Celecoxib'
      ];
    }
  }

  // Add or update common medication usage
  static async updateCommonMedicationUsage(medicationName) {
    try {
      console.log('Updating common medication usage:', medicationName);
      
      const name = medicationName.trim();
      if (!name) return;

      // Initialize tables if needed
      await this.initializeTables();

      // Check if medication already exists
      const { data, error } = await supabase
        .from(TABLES.COMMON_MEDICATIONS)
        .select('*')
        .eq('name', name)
        .maybeSingle();

      if (error) {
        console.error('Error checking for common medication:', error);
        return;
      }

      if (data) {
        // Update usage count
        console.log('Updating existing common medication');
        await supabase
          .from(TABLES.COMMON_MEDICATIONS)
          .update({
            usage_count: (data.usage_count || 0) + 1,
            last_used: new Date().toISOString()
          })
          .eq('name', name);
      } else {
        // Create new entry
        console.log('Adding new common medication');
        await supabase
          .from(TABLES.COMMON_MEDICATIONS)
          .insert([{
            name,
            usage_count: 1,
            last_used: new Date().toISOString()
          }]);
      }
      
      console.log('Common medication updated successfully');
    } catch (error) {
      console.error('Error updating common medication usage:', error);
    }
  }

  // Add new common medication manually
  static async addCommonMedication(medicationName) {
    try {
      console.log('Manually adding common medication:', medicationName);
      
      const name = medicationName.trim();
      if (!name) return false;

      // Initialize tables if needed
      await this.initializeTables();

      // Check if already exists
      const { data, error: checkError } = await supabase
        .from(TABLES.COMMON_MEDICATIONS)
        .select('name')
        .eq('name', name)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking for common medication:', checkError);
        return false;
      }

      if (data) {
        console.log('Common medication already exists');
        return false; // Already exists
      }

      // Add new medication
      console.log('Adding new common medication');
      const { error: insertError } = await supabase
        .from(TABLES.COMMON_MEDICATIONS)
        .insert([{
          name,
          usage_count: 0,
          last_used: new Date().toISOString()
        }]);

      if (insertError) {
        console.error('Error adding common medication:', insertError);
        return false;
      }

      console.log('Common medication added successfully');
      return true;
    } catch (error) {
      console.error('Error adding common medication:', error);
      return false;
    }
  }

  // Clear all user data
  static async clearAllData() {
    try {
      console.log('Clearing all data...');
      
      // Delete all medications
      const { error: medError } = await supabase
        .from(TABLES.MEDICATIONS)
        .delete()
        .neq('id', 'impossible-id'); // Delete all

      if (medError) {
        console.error('Error clearing medications:', medError);
      }

      // Reset common medications to default
      const { error: commonError } = await supabase
        .from(TABLES.COMMON_MEDICATIONS)
        .delete()
        .neq('id', 'impossible-id'); // Delete all

      if (commonError) {
        console.error('Error clearing common medications:', commonError);
      }

      // Re-initialize tables with default data
      await this.initializeTables();
      
      console.log('All data cleared successfully');
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  }
}