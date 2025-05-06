const { createClient } = require('@supabase/supabase-js');

async function checkEnvironment() {
  console.log('Checking environment variables...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log('Environment variables status:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing');

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('\n❌ Missing required environment variables!');
    console.log('\nPlease create a .env.local file with:');
    console.log('NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key');
    process.exit(1);
  }

  try {
    console.log('\nTesting Supabase connection...');
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Supabase connection error:', error.message);
      process.exit(1);
    }
    
    console.log('✅ Supabase connection successful!');
    console.log('\nEnvironment check completed successfully!');
  } catch (error) {
    console.error('❌ Error testing Supabase connection:', error.message);
    process.exit(1);
  }
}

checkEnvironment(); 