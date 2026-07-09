---
title: Autenticación y Selección de Rol
status: in_progress
priority: urgent
type: feature
tags: [auth, supabase, roles]
created_by: agent
created_at: 2026-07-09T04:23:16Z
position: 2
---

## Notes

Implementar el sistema de autenticación dual:
- Login/Signup con Supabase Auth
- Selección de rol (Deidad/Fiel) durante registro
- Protección de rutas según rol
- Perfiles de usuario en tabla profiles

## Checklist

- [x] Landing page con selección visual de rol
- [x] Formularios de login/signup estilizados
- [x] Contexto de autenticación React
- [ ] Configurar tabla profiles en Supabase
- [ ] Políticas RLS para seguridad
- [ ] Redirección post-login según rol

## Acceptance

- [x] El usuario puede elegir entre Deidad y Fiel
- [x] El sistema de login/signup funciona con Supabase
- [ ] Las rutas están protegidas según el rol