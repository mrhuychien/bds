-- =====================================================
-- BATDONGSAN.DIGITAL - Database Schema
-- Personal OS for Vietnamese Real Estate Agents
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "unaccent";     -- Vietnamese text handling
CREATE EXTENSION IF NOT EXISTS "pg_trgm";      -- Fuzzy search

-- =====================================================
-- PROFILES: Agent profiles (extends Supabase Auth)
-- =====================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic info
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(15) NOT NULL,
  email VARCHAR(255),
  avatar_url TEXT,

  -- Professional info
  company_name VARCHAR(200),              -- Company/agency name
  title VARCHAR(100) DEFAULT 'Chuyên viên tư vấn BĐS',
  bio TEXT,                               -- Self introduction

  -- Working areas (for filtering, suggestions)
  working_areas TEXT[],                   -- e.g., ['Quận 1', 'Quận 7', 'Thủ Đức']

  -- Default watermark settings
  watermark_settings JSONB DEFAULT '{
    "template": "style_1",
    "position": "bottom_right",
    "show_phone": true,
    "show_name": true,
    "opacity": 0.9
  }'::jsonb,

  -- Social links (for Microsite)
  zalo_link VARCHAR(255),
  facebook_link VARCHAR(255),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for search
CREATE INDEX idx_profiles_phone ON profiles(phone);

-- RLS: Agents can only view/edit their own profile
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Trigger to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, phone, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Môi giới'),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- PROPERTIES: Real estate inventory
-- =====================================================
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Basic info
  title VARCHAR(200) NOT NULL,            -- "Nhà phố Nguyễn Trãi, Q1"
  slug VARCHAR(250) UNIQUE,               -- "nha-pho-nguyen-trai-q1-abc123"

  -- Type & Status
  property_type VARCHAR(50) NOT NULL,     -- 'nha_pho', 'can_ho', 'dat_nen', 'biet_thu', 'mat_bang'
  status VARCHAR(30) DEFAULT 'available', -- 'available', 'deposited', 'sold', 'rented'
  listing_type VARCHAR(20) DEFAULT 'sale',-- 'sale', 'rent'

  -- Price
  price BIGINT NOT NULL,                  -- VNĐ (billion x 1,000,000,000)
  price_unit VARCHAR(20) DEFAULT 'total', -- 'total', 'per_m2', 'per_month'
  is_negotiable BOOLEAN DEFAULT true,

  -- Dimensions
  area DECIMAL(10,2),                     -- m2
  frontage DECIMAL(6,2),                  -- Front width (m)
  floors INT,                             -- Number of floors
  bedrooms INT,
  bathrooms INT,

  -- Location
  province VARCHAR(100),                  -- Province/City
  district VARCHAR(100),                  -- District
  ward VARCHAR(100),                      -- Ward
  street VARCHAR(200),                    -- Street
  address_detail TEXT,                    -- Detailed address (private)

  -- Coordinates (for map - blur when public)
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),

  -- Legal & Features
  legal_status VARCHAR(50),               -- 'so_do', 'so_hong', 'hop_dong', 'dang_cho'
  direction VARCHAR(20),                  -- 'dong', 'tay', 'nam', 'bac', 'dong_nam'...
  features TEXT[],                        -- ['Hẻm xe hơi', 'Gần trường', 'View sông']

  -- Description
  description TEXT,                       -- Detailed description
  ai_description TEXT,                    -- AI-generated description

  -- Images
  images TEXT[],                          -- Original image URLs (Supabase Storage)
  watermarked_images TEXT[],              -- Watermarked image URLs
  thumbnail_url TEXT,                     -- Thumbnail image

  -- Microsite settings
  is_public BOOLEAN DEFAULT false,        -- Is microsite published
  microsite_views INT DEFAULT 0,          -- View count

  -- Source
  source VARCHAR(100),                    -- 'Chính chủ', 'Sàn ABC', 'Đồng nghiệp'
  commission_rate DECIMAL(4,2),           -- Commission %
  notes TEXT,                             -- Private notes

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for search & filter
CREATE INDEX idx_properties_owner ON properties(owner_id);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_type ON properties(property_type);
CREATE INDEX idx_properties_price ON properties(price);
CREATE INDEX idx_properties_district ON properties(district);
CREATE INDEX idx_properties_slug ON properties(slug);

-- Full-text search
CREATE INDEX idx_properties_search ON properties
  USING GIN (to_tsvector('simple', title || ' ' || COALESCE(description, '')));

-- RLS: Agents can only CRUD their own properties
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own properties"
  ON properties FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert own properties"
  ON properties FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own properties"
  ON properties FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own properties"
  ON properties FOR DELETE
  USING (auth.uid() = owner_id);

-- Policy for public microsites
CREATE POLICY "Anyone can view public properties"
  ON properties FOR SELECT
  USING (is_public = true);

-- Function to auto-generate slug
CREATE OR REPLACE FUNCTION generate_property_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL THEN
    NEW.slug := LOWER(
      REGEXP_REPLACE(
        UNACCENT(NEW.title),
        '[^a-z0-9]+', '-', 'g'
      )
    ) || '-' || SUBSTRING(NEW.id::text, 1, 8);
  END IF;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_property_insert
  BEFORE INSERT ON properties
  FOR EACH ROW EXECUTE FUNCTION generate_property_slug();

CREATE TRIGGER before_property_update
  BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION generate_property_slug();

-- =====================================================
-- CUSTOMERS: Potential customers/leads
-- =====================================================
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Basic info
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(15) NOT NULL,
  email VARCHAR(255),

  -- Classification
  customer_type VARCHAR(30) DEFAULT 'buyer', -- 'buyer', 'seller', 'investor', 'renter'
  status VARCHAR(30) DEFAULT 'new',          -- 'new', 'contacted', 'viewing', 'negotiating', 'closed', 'lost'
  priority VARCHAR(20) DEFAULT 'normal',     -- 'hot', 'warm', 'normal', 'cold'

  -- Demand (for buyer/renter)
  demand JSONB DEFAULT '{}'::jsonb,
  -- Structure: {
  --   "property_types": ["nha_pho", "can_ho"],
  --   "districts": ["Quận 1", "Quận 7"],
  --   "budget_min": 5000000000,
  --   "budget_max": 10000000000,
  --   "min_area": 80,
  --   "bedrooms_min": 3,
  --   "purpose": "o", -- "o" (living), "dau_tu", "kinh_doanh"
  --   "notes": "Cần gần trường học"
  -- }

  -- Lead source
  source VARCHAR(100),                       -- 'Facebook', 'Zalo', 'Giới thiệu', 'Microsite'
  source_property_id UUID REFERENCES properties(id), -- If from microsite

  -- Interaction history
  last_contact_at TIMESTAMPTZ,
  next_follow_up TIMESTAMPTZ,
  notes TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_customers_owner ON customers(owner_id);
CREATE INDEX idx_customers_status ON customers(status);
CREATE INDEX idx_customers_priority ON customers(priority);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_follow_up ON customers(next_follow_up);

-- RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own customers"
  ON customers FOR ALL
  USING (auth.uid() = owner_id);

-- Trigger update timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_customer_update
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- =====================================================
-- PROPERTY_VIEWS: Microsite view tracking
-- =====================================================
CREATE TABLE property_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,

  -- Visitor info
  visitor_ip VARCHAR(45),
  user_agent TEXT,
  referrer TEXT,

  -- Tracking
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_views_property ON property_views(property_id);
CREATE INDEX idx_views_date ON property_views(viewed_at);

-- No RLS needed - server-side only

-- =====================================================
-- CUSTOMER_INTERACTIONS: Customer interaction history
-- =====================================================
CREATE TABLE customer_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Interaction type
  type VARCHAR(50) NOT NULL,  -- 'call', 'zalo', 'viewing', 'note', 'email'
  content TEXT,

  -- Property link (if any)
  property_id UUID REFERENCES properties(id),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_interactions_customer ON customer_interactions(customer_id);

ALTER TABLE customer_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own interactions"
  ON customer_interactions FOR ALL
  USING (auth.uid() = owner_id);

-- =====================================================
-- STORAGE BUCKETS (Supabase Storage)
-- =====================================================

-- Create bucket for property images
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true);

-- Policy: User can only upload/delete their own images
CREATE POLICY "Users can upload own images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'property-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'property-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'property-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Public read access
CREATE POLICY "Public can view images"
ON storage.objects FOR SELECT
USING (bucket_id = 'property-images');
