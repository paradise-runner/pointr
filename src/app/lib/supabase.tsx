import { createClient } from '@supabase/supabase-js'


// Initialize Supabase client
const supabaseUrl = 'https://cwjyvaobetcntzytbcnl.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3anl2YW9iZXRjbnR6eXRiY25sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQ5NDY3NDksImV4cCI6MjA0MDUyMjc0OX0.xS3KZdqQLxA1daGcBg_YniGkWyla-nJ4UXD-IJnnBvk'
const supabase = createClient(supabaseUrl, supabaseKey)

export { supabase }