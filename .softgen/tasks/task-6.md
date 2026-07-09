---
title: Esquema de Base de Datos Supabase
status: in_progress
priority: urgent
type: chore
tags: [database, supabase, schema]
created_by: agent
created_at: 2026-07-09T04:23:16Z
position: 6
---

## Notes

Crear las tablas necesarias para toda la funcionalidad del grimorio:
- cults, profiles, ranks, rules, tasks, rewards, consequences
- fetishes, calendar_events, notes, hierarchy
- session_cards, session_patterns, session_messages

## Checklist

- [ ] Tabla cults (nombre, imagen, descripción, deidad principal)
- [ ] Tabla profiles (usuarios con rol, rango, culto asignado)
- [ ] Tabla ranks (rangos con niveles por culto)
- [ ] Tabla rules (reglas, leyes, mandamientos, oraciones)
- [ ] Tabla tasks (tareas con puntos de fe y evidencia)
- [ ] Tabla rewards/consequences (premios y castigos con puntos)
- [ ] Tabla fetishes (fetiches/prácticas con reacciones de fieles)
- [ ] Tabla calendar_events (almanaque infinito)
- [ ] Tabla notes (notas personales)
- [ ] Tabla hierarchy (jerarquía de asignaciones)
- [ ] Tabla session_cards (tarjetas de sesión BDSM)
- [ ] Tabla session_patterns (patrones de beats guardados)
- [ ] Políticas RLS para seguridad