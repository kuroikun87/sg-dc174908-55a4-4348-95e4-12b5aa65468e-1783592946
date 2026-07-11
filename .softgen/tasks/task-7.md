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
1. Códigos de invitación dicen "inválido" al usarlos → RLS corregido, BD limpia
2. Navegación extraña: hay que dar múltiples clics para entrar → useEffect arreglado
3. No se pueden borrar usuarios/cultos en Supabase → ON DELETE CASCADE agregado
4. Fiel no ve opción de "Sesión" en el menú → Agregado
5. Datos mock/falsos aparecieron en el dashboard → Eliminados de código y BD

## Causas raíz identificadas
- RLS de invitation_codes bloqueaba lectura a no-creadores → CORREGIDO
- useEffect en index.tsx forzaba onboarding antes de cargar perfil → CORREGIDO
- Foreign keys sin ON DELETE CASCADE → CORREGIDO
- FollowerMenu no incluía link a /dashboard/sesion → CORREGIDO
- Datos mock hardcodeados en culto.tsx y jerarquia.tsx → CORREGIDO

## Checklist
- [x] Arreglar RLS de invitation_codes para lectura pública de códigos activos
- [x] Arreglar useEffect de navegación para no forzar onboarding prematuramente
- [x] Agregar ON DELETE CASCADE a foreign keys críticas
- [x] Agregar "Sesión" al menú de fiel
- [x] Verificar que no queden datos mock en ninguna página del dashboard
- [ ] Probar flujo completo: crear culto → ver códigos → invitar fiel → unirse con código
- [ ] Verificar que la deidad principal pueda ver su código de deidad