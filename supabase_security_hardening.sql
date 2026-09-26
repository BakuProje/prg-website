-- ==============================================================================
-- PRG WEBSITE - SUPABASE CYBER SECURITY & HARDENING SCRIPT (V2 - CLEAN & NO RECURSION)
-- ==============================================================================
-- Jalankan skrip ini di SQL Editor Dashboard Supabase Anda:
-- https://supabase.com/dashboard/project/_/sql
-- ==============================================================================

-- 1. HAPUS KOLOM PASSWORD PLAINTEXT DARI PROFILES (KRITIKAL UNTUK KEAMANAN)
ALTER TABLE IF EXISTS public.profiles DROP COLUMN IF EXISTS password;

-- 2. BUAT HELPER FUNCTION UNTUK CEK HAK AKSES ADMIN (SECURITY DEFINER = BYPASS RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
      AND role = 'admin' 
      AND (is_active IS NULL OR is_active = true)
  );
$$;

-- 3. AKTIFKAN ROW LEVEL SECURITY (RLS) DI SEMUA TABEL UTAMA
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.loyalty_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 4. KEBIJAKAN KEAMANAN (RLS POLICIES) TABEL: PROFILES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Profiles view policy" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own avatar and last_seen" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own non-sensitive profile data" ON public.profiles;
DROP POLICY IF EXISTS "Admins full update on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins update profiles" ON public.profiles;

-- SELECT: Admin bisa melihat semua profil, Member bisa melihat profil sendiri
CREATE POLICY "Profiles select policy"
ON public.profiles FOR SELECT
TO authenticated
USING (public.is_admin() OR auth.uid() = id);

-- UPDATE: Admin memiliki akses penuh update semua profil
CREATE POLICY "Admins update profiles"
ON public.profiles FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- UPDATE: Member hanya boleh mengupdate profil miliknya sendiri
CREATE POLICY "Users update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- DELETE: Hanya Admin yang boleh menghapus profil
CREATE POLICY "Admins delete profiles"
ON public.profiles FOR DELETE
TO authenticated
USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 5. KEBIJAKAN KEAMANAN TABEL: LOYALTY_CARDS
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own loyalty card" ON public.loyalty_cards;
DROP POLICY IF EXISTS "Admins can manage loyalty cards" ON public.loyalty_cards;
DROP POLICY IF EXISTS "Loyalty cards select policy" ON public.loyalty_cards;
DROP POLICY IF EXISTS "Only admins can update loyalty cards" ON public.loyalty_cards;
DROP POLICY IF EXISTS "Only admins can insert loyalty cards" ON public.loyalty_cards;
DROP POLICY IF EXISTS "Only admins can delete loyalty cards" ON public.loyalty_cards;
DROP POLICY IF EXISTS "Admins manage loyalty cards" ON public.loyalty_cards;

-- SELECT: User bisa melihat kartu sendiri, Admin bisa melihat semua kartu
CREATE POLICY "Loyalty cards select policy"
ON public.loyalty_cards FOR SELECT
TO authenticated
USING (public.is_admin() OR auth.uid() = user_id);

-- HANYA ADMIN yang boleh menambah / mengubah / menghapus kartu & slot diskon
CREATE POLICY "Admins manage loyalty cards"
ON public.loyalty_cards FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 6. KEBIJAKAN KEAMANAN TABEL: VERIFICATIONS (BEBAS DARI RECURSION)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Verifications select policy" ON public.verifications;
DROP POLICY IF EXISTS "Users can insert own verification" ON public.verifications;
DROP POLICY IF EXISTS "Users insert verifications" ON public.verifications;
DROP POLICY IF EXISTS "Admins can update verification status" ON public.verifications;
DROP POLICY IF EXISTS "Verifications update policy" ON public.verifications;
DROP POLICY IF EXISTS "Admins update verifications" ON public.verifications;
DROP POLICY IF EXISTS "Users update own verifications" ON public.verifications;
DROP POLICY IF EXISTS "Admins can delete verifications" ON public.verifications;
DROP POLICY IF EXISTS "Admins delete verifications" ON public.verifications;

-- SELECT: User melihat foto sendiri, Admin melihat semua permohonan verifikasi
CREATE POLICY "Verifications select policy"
ON public.verifications FOR SELECT
TO authenticated
USING (public.is_admin() OR auth.uid() = user_id);

-- INSERT: User bisa mengirim foto verifikasi miliknya
CREATE POLICY "Users insert verifications"
ON public.verifications FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- UPDATE ADMIN: Admin menyetujui / menolak verifikasi (Full Update)
CREATE POLICY "Admins update verifications"
ON public.verifications FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- UPDATE USER: Member hanya boleh mengupdate verifikasi miliknya (misal tandai read)
CREATE POLICY "Users update own verifications"
ON public.verifications FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE: Hanya admin yang boleh menghapus data verifikasi
CREATE POLICY "Admins delete verifications"
ON public.verifications FOR DELETE
TO authenticated
USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 7. KEBIJAKAN KEAMANAN TABEL: MESSAGES (CHAT PRIVASI)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Messages select policy" ON public.messages;
DROP POLICY IF EXISTS "Messages insert policy" ON public.messages;
DROP POLICY IF EXISTS "Messages update policy" ON public.messages;
DROP POLICY IF EXISTS "Messages delete policy" ON public.messages;

CREATE POLICY "Messages select policy"
ON public.messages FOR SELECT
TO authenticated
USING (
  public.is_admin() 
  OR auth.uid() = sender_id 
  OR auth.uid() = receiver_id
);

CREATE POLICY "Messages insert policy"
ON public.messages FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Messages update policy"
ON public.messages FOR UPDATE
TO authenticated
USING (auth.uid() = receiver_id OR public.is_admin())
WITH CHECK (auth.uid() = receiver_id OR public.is_admin());

CREATE POLICY "Messages delete policy"
ON public.messages FOR DELETE
TO authenticated
USING (public.is_admin() OR auth.uid() = sender_id);

-- ------------------------------------------------------------------------------
-- 8. KEBIJAKAN KEAMANAN TABEL: NOTIFICATIONS
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Notifications select policy" ON public.notifications;
DROP POLICY IF EXISTS "Notifications insert policy" ON public.notifications;
DROP POLICY IF EXISTS "Notifications delete policy" ON public.notifications;

CREATE POLICY "Notifications select policy"
ON public.notifications FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Notifications insert policy"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Notifications delete policy"
ON public.notifications FOR DELETE
TO authenticated
USING (auth.uid() = user_id OR public.is_admin());

-- ------------------------------------------------------------------------------
-- 9. PENGAMANAN FUNGSI SAKTI (RPC FUNCTIONS DENGAN VALIDASI ADMIN KETAT)
-- ------------------------------------------------------------------------------

-- Fungsi Konfirmasi Login Member oleh Admin
CREATE OR REPLACE FUNCTION public.confirm_user_login(user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- Validasi: Hanya Admin aktif yang diizinkan mengeksekusi
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Akses ditolak: Hanya admin yang berhak mengonfirmasi akun member.';
  END IF;

  -- Konfirmasi di auth.users (hanya update email_confirmed_at)
  UPDATE auth.users
  SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
  WHERE id = user_id;

  -- Konfirmasi di profiles
  UPDATE public.profiles
  SET email_confirmed_at = NOW()
  WHERE id = user_id;
END;
$$;

-- Fungsi Reset Password Member oleh Admin
CREATE OR REPLACE FUNCTION public.admin_reset_user_password(target_user_id UUID, new_password TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
BEGIN
  -- Validasi: Hanya Admin aktif yang diizinkan mengeksekusi
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Akses ditolak: Hanya admin yang berhak mereset password.';
  END IF;

  IF length(new_password) < 6 THEN
    RAISE EXCEPTION 'Password minimal harus 6 karakter.';
  END IF;

  -- Update password terenkripsi di sistem autentikasi Supabase
  UPDATE auth.users
  SET encrypted_password = crypt(new_password, gen_salt('bf')),
      updated_at = NOW()
  WHERE id = target_user_id;
END;
$$;

-- Fungsi Hapus Akun Member oleh Admin
CREATE OR REPLACE FUNCTION public.delete_user_by_id(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- Validasi: Hanya Admin aktif yang diizinkan mengeksekusi
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Akses ditolak: Hanya admin yang berhak menghapus akun.';
  END IF;

  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$;

-- Fungsi Login via Nama (Sanitasi & Proteksi Input)
CREATE OR REPLACE FUNCTION public.get_email_from_name(search_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  found_email TEXT;
BEGIN
  SELECT email INTO found_email
  FROM public.profiles
  WHERE LOWER(TRIM(full_name)) = LOWER(TRIM(search_name))
  LIMIT 1;

  RETURN found_email;
END;
$$;
