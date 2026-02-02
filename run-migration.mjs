import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vpgavbsmspcqhzkdbyly.supabase.co';
// Use the service role key (bypasses RLS)
const serviceRoleKey = 'sb_secret_L14VcrEekWejZc1gYNXKuQ_ObYWDSYR';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('Testing insert with new business type (wholesaler)...');
const { data: testData, error: testError } = await supabase
  .from('leads')
  .insert({
    first_name: 'Test',
    last_name: 'Migration',
    email: 'test-migration-' + Date.now() + '@example.com',
    company_name: 'Test Migration Co',
    business_type: 'wholesaler',
    location_count: 1,
    primary_interest: ['proteins'],
    lead_status: 'new',
    lead_score: 50
  })
  .select()
  .single();

if (testError) {
  console.log('Insert failed:', testError.message);
  console.log('Full error:', JSON.stringify(testError, null, 2));

  if (testError.message.includes('valid_business_type') || testError.code === '23514') {
    console.log('\n⚠️  DATABASE CONSTRAINT NEEDS UPDATE');
    console.log('Run this SQL in Supabase Dashboard → SQL Editor:');
    console.log(`
ALTER TABLE leads DROP CONSTRAINT IF EXISTS valid_business_type;
ALTER TABLE leads ADD CONSTRAINT valid_business_type CHECK (
  business_type IN (
    'regional_distributor', 'wholesaler', 'buying_group',
    'broadliner', 'specialty_distributor', 'cash_and_carry',
    'restaurant', 'food_truck', 'caterer', 'institution',
    'grocery', 'ghost_kitchen', 'other'
  )
);
    `);
  }
} else {
  console.log('✅ Insert succeeded! ID:', testData.id);
  console.log('Database constraint already accepts new business types.');

  // Clean up test record
  const { error: deleteError } = await supabase.from('leads').delete().eq('id', testData.id);
  if (!deleteError) {
    console.log('Test record cleaned up.');
  }
}
