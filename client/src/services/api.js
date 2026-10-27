import { supabase, isSupabaseConfigured, getSupabaseConfigStatus } from '../lib/supabaseClient';

// Helper to normalize opportunity records from PostgreSQL schema to UI format
const mapOpportunityRow = (row) => {
  if (!row) return null;

  // Format category name for UI presentation
  let categoryLabel = 'Opportunity';
  if (row.opportunity_type === 'internship') categoryLabel = 'Internship';
  else if (row.opportunity_type === 'full_time') categoryLabel = 'Full-time';
  else if (row.opportunity_type === 'part_time') categoryLabel = 'Part-time';
  else if (row.opportunity_type === 'contract') categoryLabel = 'Contract';
  else if (row.opportunity_type === 'hackathon') categoryLabel = 'Hackathon';
  else if (row.opportunity_type === 'conference') categoryLabel = 'Conference';
  else if (row.opportunity_type === 'workshop') categoryLabel = 'Workshop';
  else if (row.opportunity_type === 'open_source') categoryLabel = 'Open Source';
  else if (row.opportunity_type === 'fellowship') categoryLabel = 'Fellowship';

  // Format mode
  let modeLabel = 'Remote';
  if (row.work_mode === 'hybrid') modeLabel = 'Hybrid';
  else if (row.work_mode === 'onsite') modeLabel = 'On-site';

  return {
    id: row.id,
    _id: row.id,
    title: row.title,
    name: row.title,
    company: row.company,
    organizer: row.company,
    organization: row.company,
    category: categoryLabel,
    opportunityType: row.opportunity_type,
    location: row.location || 'Remote',
    city: row.location || 'Remote',
    mode: modeLabel,
    description: row.description,
    applicationUrl: row.canonical_url,
    officialUrl: row.canonical_url,
    registrationUrl: row.canonical_url,
    sourceUrl: row.source_url,
    sourceName: row.source_id,
    skills: row.skills || [],
    technologies: row.skills || [],
    tags: row.tags || [],
    stipend: row.stipend,
    experienceLevel: row.experience_level || 'Entry Level',
    difficulty: row.experience_level === 'Intermediate' ? 'Intermediate' : 'Beginner',
    deadline: row.deadline,
    registrationDeadline: row.deadline,
    applicationDeadline: row.deadline,
    startDate: row.event_start_date || row.deadline,
    endDate: row.event_end_date,
    status: row.status === 'active' ? 'Open' : (row.status === 'closing_soon' ? 'Closing Soon' : 'Expired'),
    programStatus: row.status === 'active' ? 'Open' : 'Closed',
    isBeginnerFriendly: row.experience_level !== 'Intermediate' && row.experience_level !== 'Advanced',
    lastVerifiedAt: row.last_verified_at,
    firstDiscoveredAt: row.first_discovered_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
};

export const api = {
  // System & Database Health
  async getHealth() {
    const config = getSupabaseConfigStatus();
    if (!config.configured) {
      return {
        status: 'unconfigured',
        database: {
          mode: 'supabase-postgresql',
          status: 'pending-credentials',
          message: config.message
        }
      };
    }

    try {
      const { error } = await supabase.from('opportunity_sources').select('id').limit(1);
      if (error) throw error;
      return {
        status: 'healthy',
        service: 'Launchpad Supabase Client',
        database: {
          mode: 'supabase-postgresql',
          status: 'connected'
        }
      };
    } catch (err) {
      return {
        status: 'degraded',
        database: {
          mode: 'supabase-postgresql',
          status: 'query-error',
          message: err.message
        }
      };
    }
  },

  // Opportunities / Jobs
  async getOpportunities(params = {}) {
    if (!isSupabaseConfigured()) {
      return {
        total: 0,
        page: 1,
        totalPages: 1,
        data: [],
        unconfigured: true,
        message: 'Supabase credentials are not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.'
      };
    }

    const {
      search,
      category,
      location,
      mode,
      skills,
      sort = 'newest',
      page = 1,
      limit = 12,
      includeExpired = false
    } = params;

    let query = supabase
      .from('opportunities')
      .select('*', { count: 'exact' });

    if (!includeExpired) {
      query = query.neq('status', 'archived').neq('status', 'expired');
    }

    if (category && category !== 'All') {
      const typeMap = {
        'Internship': 'internship',
        'Full-time': 'full_time',
        'Part-time': 'part_time',
        'Contract': 'contract',
        'Hackathon': 'hackathon',
        'Open Source': 'open_source',
        'Conference': 'conference',
        'Workshop': 'workshop'
      };
      const mappedType = typeMap[category];
      if (mappedType) {
        query = query.eq('opportunity_type', mappedType);
      }
    }

    if (location && location !== 'All') {
      query = query.ilike('location', `%${location}%`);
    }

    if (mode && mode !== 'All') {
      const modeMap = {
        'Remote': 'remote',
        'Hybrid': 'hybrid',
        'On-site': 'onsite'
      };
      const mappedMode = modeMap[mode];
      if (mappedMode) {
        query = query.eq('work_mode', mappedMode);
      }
    }

    if (skills) {
      const skillsArray = skills.split(',').map((s) => s.trim()).filter(Boolean);
      if (skillsArray.length > 0) {
        query = query.overlaps('skills', skillsArray);
      }
    }

    if (search && search.trim()) {
      const term = search.trim();
      query = query.or(`title.ilike.%${term}%,company.ilike.%${term}%,description.ilike.%${term}%`);
    }

    if (sort === 'deadline') {
      query = query.order('deadline', { ascending: true, nullsFirst: false });
    } else if (sort === 'company') {
      query = query.order('company', { ascending: true });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 12;
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) {
      console.error('Supabase getOpportunities error:', error);
      throw new Error(error.message);
    }

    const total = count || 0;
    return {
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      data: (data || []).map(mapOpportunityRow)
    };
  },

  async getOpportunityById(id) {
    if (!isSupabaseConfigured() || !id) return null;
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase getOpportunityById error:', error);
      return null;
    }
    return mapOpportunityRow(data);
  },

  async getFeaturedOpportunities() {
    const res = await this.getOpportunities({ limit: 4 });
    return res.data;
  },

  // Events & Hackathons
  async getEvents(params = {}) {
    if (!isSupabaseConfigured()) {
      return {
        total: 0,
        page: 1,
        totalPages: 1,
        data: [],
        unconfigured: true
      };
    }

    const {
      search,
      city,
      category,
      mode,
      upcoming = true,
      sort = 'date',
      page = 1,
      limit = 12
    } = params;

    let query = supabase
      .from('opportunities')
      .select('*', { count: 'exact' })
      .in('opportunity_type', ['hackathon', 'conference', 'workshop']);

    if (city && city !== 'All') {
      query = query.ilike('location', `%${city}%`);
    }

    if (category && category !== 'All') {
      const typeMap = {
        'Hackathon': 'hackathon',
        'Conference': 'conference',
        'Workshop': 'workshop'
      };
      const mapped = typeMap[category];
      if (mapped) query = query.eq('opportunity_type', mapped);
    }

    if (mode && mode !== 'All') {
      const modeMap = { 'Online': 'remote', 'In-Person (Offline)': 'onsite', 'Offline': 'onsite', 'Hybrid': 'hybrid' };
      const mapped = modeMap[mode];
      if (mapped) query = query.eq('work_mode', mapped);
    }

    if (upcoming) {
      query = query.or(`deadline.gte.${new Date().toISOString()},event_start_date.gte.${new Date().toISOString()}`);
    }

    if (search && search.trim()) {
      const term = search.trim();
      query = query.or(`title.ilike.%${term}%,company.ilike.%${term}%,description.ilike.%${term}%`);
    }

    if (sort === 'newest') {
      query = query.order('created_at', { ascending: false });
    } else {
      query = query.order('deadline', { ascending: true, nullsFirst: false });
    }

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 12;
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) {
      console.error('Supabase getEvents error:', error);
      throw new Error(error.message);
    }

    const total = count || 0;
    return {
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      data: (data || []).map(mapOpportunityRow)
    };
  },

  async getEventById(id) {
    return this.getOpportunityById(id);
  },

  // Open Source Programs
  async getOpenSource(params = {}) {
    if (!isSupabaseConfigured()) {
      return {
        total: 0,
        page: 1,
        totalPages: 1,
        data: [],
        unconfigured: true
      };
    }

    const {
      search,
      technology,
      difficulty,
      programStatus,
      beginnerFriendly,
      page = 1,
      limit = 12
    } = params;

    let query = supabase
      .from('opportunities')
      .select('*', { count: 'exact' })
      .eq('opportunity_type', 'open_source');

    if (technology && technology !== 'All') {
      query = query.overlaps('skills', [technology]);
    }

    if (difficulty && difficulty !== 'All') {
      query = query.eq('experience_level', difficulty === 'Beginner' ? 'Entry Level' : difficulty);
    }

    if (programStatus && programStatus !== 'All') {
      query = query.eq('status', programStatus.toLowerCase() === 'open' ? 'active' : 'expired');
    }

    if (beginnerFriendly === 'true' || beginnerFriendly === true) {
      query = query.eq('experience_level', 'Entry Level');
    }

    if (search && search.trim()) {
      const term = search.trim();
      query = query.or(`title.ilike.%${term}%,company.ilike.%${term}%,description.ilike.%${term}%`);
    }

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 12;
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) {
      console.error('Supabase getOpenSource error:', error);
      throw new Error(error.message);
    }

    const total = count || 0;
    return {
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      data: (data || []).map(mapOpportunityRow)
    };
  },

  async getOpenSourceById(id) {
    return this.getOpportunityById(id);
  },

  // Token / Session Helper
  hasToken() {
    return isSupabaseConfigured();
  },

  // User Opportunity Tracking (Protected by Supabase RLS)
  async getMyOpportunities(status) {
    if (!isSupabaseConfigured()) return null;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    let query = supabase
      .from('user_opportunities')
      .select('*, opportunities(*)')
      .eq('user_id', session.user.id)
      .order('updated_at', { ascending: false });

    if (status && status !== 'All') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Supabase getMyOpportunities error:', error);
      throw new Error(error.message);
    }

    return (data || []).map((row) => ({
      id: row.id,
      opportunityId: row.opportunity_id,
      itemType: row.opportunities?.opportunity_type === 'hackathon' ? 'Event' : (row.opportunities?.opportunity_type === 'open_source' ? 'OpenSourceProgram' : 'Opportunity'),
      applicationStatus: row.status,
      saved: true,
      title: row.opportunities?.title || row.custom_title,
      company: row.opportunities?.company || row.custom_company,
      category: row.opportunities?.opportunity_type || 'Opportunity',
      location: row.opportunities?.location || 'Remote',
      deadline: row.opportunities?.deadline || row.custom_deadline,
      applicationUrl: row.opportunities?.canonical_url || row.custom_url,
      notes: row.notes || '',
      updatedAt: row.updated_at,
      createdAt: row.created_at
    }));
  },

  async saveOpportunity(data) {
    if (!isSupabaseConfigured()) return null;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      throw new Error('Sign in required to save opportunity to database');
    }

    const opportunityId = data.opportunityId || data.id;

    // Verify if opportunityId is a valid UUID matching canonical opportunities
    const isUuid = typeof opportunityId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(opportunityId);

    const payload = {
      user_id: session.user.id,
      opportunity_id: isUuid ? opportunityId : null,
      status: data.applicationStatus || 'SAVED',
      notes: data.notes || '',
      custom_title: data.title || '',
      custom_company: data.company || '',
      custom_deadline: data.deadline ? new Date(data.deadline).toISOString() : null,
      custom_url: data.applicationUrl || ''
    };

    // Upsert tracking record
    const { data: saved, error } = await supabase
      .from('user_opportunities')
      .upsert(payload, { onConflict: 'user_id,opportunity_id' })
      .select()
      .single();

    if (error) {
      console.error('Supabase saveOpportunity error:', error);
      throw new Error(error.message);
    }

    return saved;
  },

  async updateOpportunityStatus(opportunityId, applicationStatus, notes) {
    if (!isSupabaseConfigured()) return null;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) throw new Error('Sign in required');

    const isUuid = typeof opportunityId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(opportunityId);

    const updates = {
      updated_at: new Date().toISOString()
    };
    if (applicationStatus) updates.status = applicationStatus;
    if (notes !== undefined) updates.notes = notes;

    let query = supabase
      .from('user_opportunities')
      .update(updates)
      .eq('user_id', session.user.id);

    if (isUuid) {
      query = query.or(`opportunity_id.eq.${opportunityId},id.eq.${opportunityId}`);
    } else {
      query = query.eq('id', opportunityId);
    }

    const { data, error } = await query.select().single();
    if (error) {
      console.error('Supabase updateOpportunityStatus error:', error);
      throw new Error(error.message);
    }
    return data;
  },

  async removeOpportunity(opportunityId) {
    if (!isSupabaseConfigured()) return null;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) throw new Error('Sign in required');

    const isUuid = typeof opportunityId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(opportunityId);

    let query = supabase
      .from('user_opportunities')
      .delete()
      .eq('user_id', session.user.id);

    if (isUuid) {
      query = query.or(`opportunity_id.eq.${opportunityId},id.eq.${opportunityId}`);
    } else {
      query = query.eq('id', opportunityId);
    }

    const { error } = await query;
    if (error) {
      console.error('Supabase removeOpportunity error:', error);
      throw new Error(error.message);
    }
    return true;
  },

  // User Profile
  async getProfile() {
    if (!isSupabaseConfigured()) return null;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error) {
      // Profile might not exist yet; return basic user info
      return {
        id: session.user.id,
        email: session.user.email,
        name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
        skills: [],
        interests: [],
        preferredLocations: [],
        role: 'student'
      };
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      skills: data.skills || [],
      interests: data.interests || [],
      preferredLocations: data.preferred_locations || [],
      educationLevel: data.education_level || 'Undergraduate',
      graduationYear: data.graduation_year || 2027,
      college: data.college || '',
      bio: data.bio || '',
      role: data.role || 'student'
    };
  },

  async updateProfile(updates = {}) {
    if (!isSupabaseConfigured()) return null;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) throw new Error('Sign in required');

    const payload = {};
    if (updates.name) payload.name = updates.name;
    if (updates.skills) payload.skills = updates.skills;
    if (updates.interests) payload.interests = updates.interests;
    if (updates.preferredLocations) payload.preferred_locations = updates.preferredLocations;
    if (updates.educationLevel) payload.education_level = updates.educationLevel;
    if (updates.graduationYear) payload.graduation_year = updates.graduationYear;
    if (updates.college !== undefined) payload.college = updates.college;
    if (updates.bio !== undefined) payload.bio = updates.bio;

    const { data, error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', session.user.id)
      .select()
      .single();

    if (error) {
      console.error('Supabase updateProfile error:', error);
      throw new Error(error.message);
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      skills: data.skills || [],
      interests: data.interests || [],
      preferredLocations: data.preferred_locations || [],
      educationLevel: data.education_level,
      graduationYear: data.graduation_year,
      college: data.college,
      bio: data.bio,
      role: data.role
    };
  },

  // Authentication Flows
  async login(email, password) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured. Please set your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password
    });

    if (error) {
      throw new Error(error.message || 'Login failed. Please check your credentials.');
    }

    return {
      token: data.session?.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || data.user.email.split('@')[0],
        role: 'student'
      }
    };
  },

  async register(formData) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured. Please set your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    }

    const { email, password, name, graduationYear } = formData;
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          name: name?.trim() || '',
          graduation_year: graduationYear || 2027
        }
      }
    });

    if (error) {
      throw new Error(error.message || 'Registration failed.');
    }

    return {
      token: data.session?.access_token,
      user: {
        id: data.user?.id,
        email: data.user?.email,
        name: name || data.user?.email?.split('@')[0],
        role: 'student'
      }
    };
  },

  async logout() {
    if (!isSupabaseConfigured()) return;
    await supabase.auth.signOut();
  }
};
