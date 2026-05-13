-- MyFlexio Database Schema V2
-- Complete schema for Uzman and Hasta registration system

-- Drop existing tables if needed (for fresh start)
-- DROP TABLE IF EXISTS medical_reports;
-- DROP TABLE IF EXISTS sertifikalar;
-- DROP TABLE IF EXISTS uzmanlik_alanlari;
-- DROP TABLE IF EXISTS hasta_profiles;
-- DROP TABLE IF EXISTS uzman_profiles;
-- DROP TABLE IF EXISTS users;

-- Users table (updated with role and status)
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('uzman', 'hasta', 'admin') NOT NULL,
  status ENUM('pending_approval', 'approved', 'rejected', 'active') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Uzman profiles table
CREATE TABLE IF NOT EXISTS uzman_profiles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT UNIQUE NOT NULL,
  
  -- Basic Info (from registration)
  ad VARCHAR(100) NOT NULL,
  soyad VARCHAR(100) NOT NULL,
  unvan VARCHAR(50) NOT NULL,
  telefon VARCHAR(20) NOT NULL,
  diploma_url VARCHAR(500),
  kvkk_onay BOOLEAN DEFAULT false,
  sozlesme_onay BOOLEAN DEFAULT false,
  
  -- Profile Completion (after approval)
  dogum_tarihi DATE,
  cinsiyet ENUM('erkek', 'kadin', 'diger'),
  profil_fotograf_url VARCHAR(500),
  biyografi TEXT,
  mezuniyet_okul VARCHAR(255),
  mezuniyet_yili INT,
  sehir VARCHAR(100),
  ilce VARCHAR(100),
  
  -- Timestamps
  profile_completed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Uzmanlik alanlari table
CREATE TABLE IF NOT EXISTS uzmanlik_alanlari (
  id INT PRIMARY KEY AUTO_INCREMENT,
  uzman_profile_id INT NOT NULL,
  kategori ENUM('vucutBolgesi', 'tedaviYontemleri', 'ozelAlanlar', 'hastaliklar') NOT NULL,
  deger VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (uzman_profile_id) REFERENCES uzman_profiles(id) ON DELETE CASCADE,
  INDEX idx_uzman_kategori (uzman_profile_id, kategori)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sertifikalar table
CREATE TABLE IF NOT EXISTS sertifikalar (
  id INT PRIMARY KEY AUTO_INCREMENT,
  uzman_profile_id INT NOT NULL,
  adi VARCHAR(255) NOT NULL,
  dosya_url VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (uzman_profile_id) REFERENCES uzman_profiles(id) ON DELETE CASCADE,
  INDEX idx_uzman_profile (uzman_profile_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Hasta profiles table
CREATE TABLE IF NOT EXISTS hasta_profiles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT UNIQUE NOT NULL,
  
  -- Basic Info (from registration)
  ad VARCHAR(100) NOT NULL,
  soyad VARCHAR(100) NOT NULL,
  telefon VARCHAR(20) NOT NULL,
  kvkk_onay BOOLEAN DEFAULT false,
  
  -- Profile Completion (optional, later)
  sehir VARCHAR(100),
  ilce VARCHAR(100),
  agri_bolgesi VARCHAR(100),
  tedavi_tercihi ENUM('online', 'evde', 'klinik'),
  dogum_tarihi DATE,
  cinsiyet ENUM('erkek', 'kadin', 'diger'),
  agri_seviyesi INT, -- 1-10
  
  -- Medical History
  ameliyat_gecmisi BOOLEAN DEFAULT false,
  ameliyat_detay TEXT,
  kronik_hastalik BOOLEAN DEFAULT false,
  kronik_hastalik_detay TEXT,
  surekli_ilac BOOLEAN DEFAULT false,
  ilac_listesi TEXT,
  alerjiler TEXT,
  
  -- Timestamps
  profile_completed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Medical reports table
CREATE TABLE IF NOT EXISTS medical_reports (
  id INT PRIMARY KEY AUTO_INCREMENT,
  hasta_profile_id INT NOT NULL,
  tip ENUM('mr', 'rontgen', 'kan_tahlili', 'diger') NOT NULL,
  dosya_url VARCHAR(500) NOT NULL,
  aciklama TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (hasta_profile_id) REFERENCES hasta_profiles(id) ON DELETE CASCADE,
  INDEX idx_hasta_profile (hasta_profile_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Assessments table (Patient Pain Evaluation)
CREATE TABLE IF NOT EXISTS assessments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  
  -- Step 1: Pain Profile
  pain_region VARCHAR(100) NOT NULL,
  pain_severity INT NOT NULL, -- 1-5
  pain_duration VARCHAR(50) NOT NULL,
  pain_types JSON NOT NULL, -- ["keskin", "künt", "zonklayıcı"]
  
  -- Step 2: Functional Impact
  daily_activities_impact INT NOT NULL, -- 1-5
  sleep_impact INT NOT NULL, -- 1-5
  work_impact INT NOT NULL, -- 1-5
  social_impact INT NOT NULL, -- 1-5
  
  -- Step 3: Triggers
  pain_triggers JSON NOT NULL, -- ["hareket", "oturma"]
  pain_relievers JSON NOT NULL, -- ["istirahat", "ilaç"]
  
  -- Step 4: Goals
  treatment_goals JSON NOT NULL, -- ["ağrıyı azaltmak"]
  expected_duration VARCHAR(50) NOT NULL,
  additional_notes TEXT,
  
  -- Results
  recommended_specialists JSON, -- [{"type": "Fizyoterapist", "score": 85}]
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_pain_region (pain_region),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
