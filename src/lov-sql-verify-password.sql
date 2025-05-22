
-- Função para verificar a senha de um usuário
CREATE OR REPLACE FUNCTION public.verify_password(username_input text, password_attempt text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  user_id UUID;
BEGIN
  SELECT id INTO user_id
  FROM public.system_users
  WHERE username = username_input
    AND status = 'active'
    AND password_hash = crypt(password_attempt, password_hash);
  
  RETURN user_id;
END;
$function$;

-- Esta função é usada apenas para gerar hashes de senha usando bcrypt
CREATE OR REPLACE FUNCTION public.verify_password2(username text, password_attempt text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  RETURN crypt(password_attempt, gen_salt('bf'));
END;
$function$;
