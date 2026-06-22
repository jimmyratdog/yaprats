import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gklddqscvzuvxjvwlpwh.supabase.co'
const supabaseKey = 'sb_publishable_Dlu6vJG5abSOdF3vvH2a5Q_e3uM2MfO'

export const supabase = createClient(supabaseUrl,supabaseKey)