---
title: Autenticación y Selección de Rol
status: done
priority: urgent
type: feature
tags: [auth, supabase, roles]
created_by: agent
created_at: 2026-07-09T04:23:16Z
position: 2
---

## Notes

Sistema de autenticación implementado con flujo completo:
- Landing page única con login/signup
- Checkbox +18 obligatorio con validación estricta
- Post-registro: onboarding para crear culto o unirse con código
- Contexto de autenticación React con Supabase
- Redirección automática según estado de onboarding

## Checklist

- [x] Landing page con selección visual de rol
- [x] Formularios de login/signup estilizados
- [x] Contexto de autenticación React
- [x] Checkbox de mayoría de edad obligatorio
- [x] Flujo de onboarding (crear culto / unirse con código)
- [x] Sistema de códigos de invitación estáticos

## Acceptance

- [x] El usuario puede elegir entre Deidad y Fiel
- [x] El sistema de login/signup funciona con Supabase
- [x] Las rutas están protegidas según el rol
- [x] El checkbox +18 bloquea el registro hasta confirmar