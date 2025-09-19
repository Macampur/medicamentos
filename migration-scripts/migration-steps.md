# Supabase Database Migration Guide

## Step 1: Export Data from Current Database (Macampur)

1. Go to your current Supabase project dashboard in Macampur organization
2. Navigate to SQL Editor
3. Run the export queries from `export-data.sql`
4. Copy and save the generated INSERT statements
5. Note down the record counts for verification

## Step 2: Create New Project in Proton-01

1. Go to Supabase dashboard
2. Switch to Proton-01 organization
3. Create a new project
4. Wait for the project to be fully initialized
5. Note down the new project URL and anon key

## Step 3: Setup New Database Structure

1. In the new project, go to SQL Editor
2. Run the setup script from `setup-new-database.sql`
3. Verify that tables are created successfully

## Step 4: Import Data

1. In the new project's SQL Editor
2. Run the INSERT statements you copied from Step 1
3. Verify data import by checking record counts

## Step 5: Update Application Configuration

1. Update the Supabase credentials in your app
2. Test the connection
3. Verify all functionality works

## Step 6: Cleanup (Optional)

1. Once verified, you can delete the old project in Macampur
2. Update any bookmarks or references

## Verification Checklist

- [ ] All tables created in new database
- [ ] All medication records migrated
- [ ] All common medications migrated
- [ ] Record counts match between old and new database
- [ ] Application connects to new database
- [ ] All CRUD operations work correctly
- [ ] Offline sync functionality works