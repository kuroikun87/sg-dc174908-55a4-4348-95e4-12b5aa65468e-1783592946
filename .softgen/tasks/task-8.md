---
title: Implementar sistemas faltantes de Códice Oscuro
status: todo
priority: high
type: feature
tags: [profiles, faith-points, rewards, consequences, favor, permissions]
created_by: agent
created_at: 2026-07-15T03:30:00Z
position: 8
---

## Notes
Faltan varios sistemas críticos según el documento de requisitos:
- Perfiles completos con todos los campos
- Puntos de Fe con historial
- Premios con requisitos de PF y Favor
- Consecuencias
- Puntos de Favor por deidad-fiel
- Sistema de permisos para deidades
- Fichas personales consolidadas
- Títulos coleccionables con bloqueo
- Tareas con evidencias fotográficas
- Campos personalizados
- Historial general de actividad

## Checklist

### Perfiles completos
- [ ] Agregar columnas a profiles: apodo, titulo, descripcion, pronombres, fecha_nacimiento
- [ ] Actualizar página de perfil para mostrar/editar todos los campos
- [ ] Implementar lógica de bloqueo de título (temporal/permanente)

### Puntos de Fe
- [ ] Crear tabla faith_points_log (movimientos de PF)
- [ ] Agregar columna faith_points a profiles
- [ ] UI para ver balance actual de PF
- [ ] UI para historial de movimientos
- [ ] Función para otorgar/retirar PF manualmente

### Premios
- [ ] Crear tabla rewards (nombre, descripción, imagen, costo_pf, requisito_favor, etiquetas)
- [ ] Crear tabla user_rewards (premios asignados/comprados por usuario)
- [ ] UI para crear premios (solo deidades con permiso)
- [ ] UI de tienda de premios (fieles pueden comprar con PF)
- [ ] Sistema de requisitos: verificar PF suficiente + nivel de Favor

### Consecuencias
- [ ] Crear tabla consequences (nombre, descripción, costo_eliminacion_pf, etiquetas)
- [ ] Crear tabla user_consequences (consecuencias asignadas)
- [ ] UI para crear consecuencias (solo deidades)
- [ ] UI para ver consecuencias activas/cumplidas
- [ ] Sistema de eliminación con PF

### Puntos de Favor
- [ ] Crear tabla favor_points (deity_id, follower_id, points 0-100)
- [ ] UI de barra visual (corazón roto → corazón completo)
- [ ] Solo deidad propietaria puede modificar
- [ ] Mostrar en ficha de cada fiel

### Sistema de permisos
- [ ] Crear tabla deity_permissions (deity_id, permiso, valor boolean)
- [ ] UI para asignar permisos (solo Deidad Principal)
- [ ] Verificar permisos en cada acción

### Fichas personales
- [ ] Crear vista consolidada de ficha individual
- [ ] Mostrar: perfil, PF, Favor, tareas, premios, consecuencias, calendario, fetiches, notas
- [ ] Hacer click en nodo del árbol jerárquico → abrir ficha

### Títulos coleccionables
- [ ] Crear tabla titles (nombre, otorgado_por, fecha, bloqueado_hasta)
- [ ] UI para colección de títulos
- [ ] Sistema de bloqueo temporal/indefinido
- [ ] Solo deidades pueden cambiar/bloquear títulos

### Tareas con evidencias
- [ ] Agregar columna evidence_url a assigned_tasks
- [ ] UI para subir foto de evidencia
- [ ] Álbum de evidencias en ficha personal
- [ ] Permisos de visibilidad por deidad

### Administración de deidades
- [ ] Página para ver lista de deidades del culto
- [ ] Agregar nueva deidad (código de invitación)
- [ ] Eliminar deidad (solo Deidad Principal)
- [ ] Asignar/revocar permisos

## Acceptance
- [ ] Un fiel puede ver su balance de Puntos de Fe y el historial de movimientos
- [ ] Una deidad puede crear premios y consecuencias con requisitos configurables
- [ ] Los fieles pueden comprar premios en la tienda si cumplen requisitos de PF y Favor
- [ ] Al hacer click en un miembro del árbol jerárquico, se abre su ficha personal consolidada
- [ ] Las deidades pueden otorgar/modificar Puntos de Favor solo de sus propios fieles
- [ ] La Deidad Principal puede asignar permisos granulares a otras deidades