---
title: Autenticación y Selección de Rol
status: todo
priority: urgent
type: feature
tags: [auth, supabase, roles]
created_by: agent
created_at: 2026-07-09T04:23:16Z
position: 2
---

## Notes

Pantalla de entrada con dos opciones: Deidad o Fiel. Sistema de autenticación con Supabase Auth. Al elegir un rol, se redirige al dashboard correspondiente.

## Checklist

- [ ] Crear pantalla de selección de rol con diseño ritualista
- [ ] Configurar Supabase Auth (signup/login)
- [ ] Crear contexto de autenticación y rol de usuario
- [ ] Proteger rutas según rol
- [ ] Crear pantalla de login/signup estilizada

## Acceptance

- [ ] El usuario puede elegir entre Deidad o Fiel al entrar
- [ ] El sistema de login/signup funciona con Supabase
- [ ] Las rutas están protegidas según el rol