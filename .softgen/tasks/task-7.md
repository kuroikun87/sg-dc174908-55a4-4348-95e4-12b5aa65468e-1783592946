---
title: Arreglar sistema de códigos de invitación y autenticación
status: in_progress
priority: urgent
type: bug
tags: [auth, invitation-codes, rls, onboarding]
created_by: agent
created_at: 2026-07-11T17:00:00Z
position: 7
---

## Notes
Problemas reportados por el usuario:
1. Códigos de invitación dicen "inválido" al usarlos
2. Navegación extraña: hay que dar múltiples clics para entrar
3. No se pueden borrar usuarios/cultos en Supabase
4. Fiel no ve opción de "Sesión" en el menú
5. Datos mock/falsos aparecieron en el dashboard

## Causas raíz identificadas
- RLS de invitation_codes bloquea lectura a no-creadores
- useEffect en index.tsx fuerza onboarding antes de cargar perfil
- Foreign keys sin ON DELETE CASCADE
- FollowerMenu no incluye link a /dashboard/sesion

## Checklist
- [ ] Arreglar RLS de invitation_codes para lectura pública de códigos activos
- [ ] Arreglar useEffect de navegación para no forzar onboarding prematuramente
- [ ] Agregar ON DELETE CASCADE a foreign keys críticas
- [ ] Agregar "Sesión" al menú de fiel
- [ ] Verificar que no queden datos mock en ninguna página del dashboard
- [ ] Probar flujo completo: crear culto → ver códigos → invitar fiel → unirse con código