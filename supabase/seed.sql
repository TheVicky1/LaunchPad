-- ============================================================================
-- LaunchPad Local Seed Data
-- Description: Realistic initial data for sources and canonical opportunities.
-- ============================================================================

-- 1. Initial Opportunity Sources
INSERT INTO public.opportunity_sources (id, name, source_type, base_url, is_active, rate_limit_per_minute)
VALUES
  ('devpost-hackathons', 'Devpost Hackathons RSS', 'rss', 'https://devpost.com/hackathons.rss', true, 30),
  ('github-student-pack', 'GitHub Student Opportunity Listings', 'api', 'https://api.github.com/repos/topics/student-opportunities', true, 60),
  ('direct-career-curated', 'LaunchPad Verified Direct Listings', 'curated', 'https://launchpad.dev', true, 120)
ON CONFLICT (id) DO NOTHING;

-- 2. Initial Canonical Opportunities
INSERT INTO public.opportunities (
  id,
  source_id,
  external_id,
  title,
  company,
  opportunity_type,
  work_mode,
  location,
  description,
  canonical_url,
  source_url,
  skills,
  tags,
  stipend,
  experience_level,
  deadline,
  status
)
VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'direct-career-curated',
    'curated-google-swe-2027',
    'Software Engineering Intern - Summer 2027',
    'Google',
    'internship',
    'hybrid',
    'Bengaluru, Karnataka, India',
    'Join Google engineering teams to design large-scale web services, distributed systems, and modern web applications with mentors.',
    'https://careers.google.com/jobs/results/internship-software-engineer-2027',
    'https://careers.google.com',
    ARRAY['Algorithms', 'Data Structures', 'C++', 'Java', 'Python'],
    ARRAY['FAANG', 'Product Engineering', 'High Stipend'],
    '₹1,25,000 / month',
    'Entry Level',
    NOW() + INTERVAL '45 days',
    'active'
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'direct-career-curated',
    'curated-microsoft-swe-2027',
    'Software Engineer Intern (Undergraduate)',
    'Microsoft',
    'internship',
    'hybrid',
    'Hyderabad, Telangana, India',
    'Collaborate on cloud infrastructure, Azure serverless computing, and developer productivity tooling across world-class teams.',
    'https://careers.microsoft.com/students/us/en/job/microsoft-intern-2027',
    'https://careers.microsoft.com',
    ARRAY['C#', '.NET', 'TypeScript', 'Azure', 'Algorithms'],
    ARRAY['Cloud Computing', 'Enterprise', 'Top Tier'],
    '₹1,20,000 / month',
    'Entry Level',
    NOW() + INTERVAL '30 days',
    'active'
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'direct-career-curated',
    'curated-jpmc-analyst-2027',
    'Software Engineer Program Analyst Intern',
    'JPMorganChase',
    'internship',
    'hybrid',
    'Bengaluru, Karnataka, India',
    'Build reliable, distributed, ultra-low latency fintech platforms and financial APIs supporting millions of transactions daily.',
    'https://careers.jpmorgan.com/global/en/students/programs/software-engineer-intern',
    'https://careers.jpmorgan.com',
    ARRAY['Java', 'Spring Boot', 'SQL', 'React', 'Git'],
    ARRAY['Fintech', 'Investment Banking', 'Banking'],
    '₹85,000 / month',
    'Entry Level',
    NOW() + INTERVAL '25 days',
    'active'
  ),
  (
    '00000000-0000-0000-0000-000000000004',
    'devpost-hackathons',
    'devpost-hack-bangalore-2027',
    'HackBangalore 2027: Citywide Student Hackathon',
    'Bengaluru Tech Community & Karnataka Innovation',
    'hackathon',
    'onsite',
    'Bengaluru, Karnataka, India',
    'Annual 36-hour in-person hackathon bringing together 800+ student developers to build AI for climate, public transit, and smart urban governance.',
    'https://hackbangalore2027.devpost.com',
    'https://devpost.com/hackathons',
    ARRAY['React', 'Node.js', 'Python', 'FastAPI', 'Machine Learning'],
    ARRAY['Hackathon', 'Prize Pool', 'Networking', 'Free Food'],
    '₹5,00,000 Prize Pool',
    'All Levels',
    NOW() + INTERVAL '18 days',
    'active'
  ),
  (
    '00000000-0000-0000-0000-000000000005',
    'github-student-pack',
    'gsoc-2027',
    'Google Summer of Code (GSoC) 2027',
    'Open Source Initiative & Google Open Source',
    'open_source',
    'remote',
    'Remote (Worldwide)',
    'Global, online program focused on bringing new contributors into open source software development under guided mentorship.',
    'https://summerofcode.withgoogle.com',
    'https://summerofcode.withgoogle.com',
    ARRAY['Open Source', 'Git', 'C++', 'Rust', 'Python', 'Go'],
    ARRAY['Stipend', 'Global Mentorship', 'Prestige'],
    '$1,500 - $3,000 Total Stipend',
    'Beginner to Intermediate',
    NOW() + INTERVAL '60 days',
    'active'
  )
ON CONFLICT (id) DO NOTHING;
