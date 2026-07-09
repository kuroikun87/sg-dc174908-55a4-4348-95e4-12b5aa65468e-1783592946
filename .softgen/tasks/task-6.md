---
title: Esquema de Base de Datos Supabase
status: done
priority: urgent
type: chore
tags: [database, supabase, schema]
created_by: agent
created_at: 2026-07-09T04:23:16Z
position: 6
---

## Notes

Esquema completo creado exitosamente con 14 tablas y políticas RLS.

## Checklist

- [x] Tabla cults (nombre, imagen, descripción, deidad principal)
- [x] Tabla profiles (usuarios con rol, rango, culto asignado)
- [x] Tabla ranks (rangos con niveles por culto)
- [x] Tabla rules (reglas, leyes, mandamientos, oraciones)
- [x] Tabla tasks (tareas con puntos de fe y evidencia)
- [x] Tabla rewards/consequences (premios y castigos con puntos)
- [x] Tabla fetishes (fetiches/prácticas con reacciones de fieles)
- [x] Tabla calendar_events (almanaque infinito)
- [x] Tabla notes (notas personales)
- [x] Tabla hierarchy (jerarquía de asignaciones)
- [x] Tabla session_cards (tarjetas de sesión BDSM)
- [x] Tabla session_patterns (patrones de beats guardados)
- [x] Políticas RLS para seguridad

## Acceptance

- [x] El esquema de base de datos está completo
- [x] Las políticas RLS están configuradas
- [x] Los tipos TypeScript se generaron automáticamente