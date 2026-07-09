---
title: Sistema de Diseño Grimorio
status: in_progress
priority: urgent
type: chore
tags: [design-system, theme, gothic]
created_by: agent
created_at: 2026-07-09T04:23:16Z
position: 1
---

## Notes

Establecer el tema visual gótico/ritualista para toda la aplicación. Incluye:
- Variables CSS en globals.css
- Configuración de Tailwind con colores y fuentes
- Componentes base estilizados (botones, tarjetas, inputs)
- Animaciones de página (transiciones tipo libro)
- Fondo con textura sutil de papel envejecido

## Checklist

- [ ] Configurar globals.css con variables de color góticas y fuentes Cinzel/EB Garamond
- [ ] Actualizar tailwind.config.ts con colores personalizados y fuentes
- [ ] Crear componente BookPage para transiciones de página
- [ ] Crear componente RitualButton con variantes doradas y vino
- [ ] Crear componente ParchmentCard para contenedores tipo pergamino
- [ ] Verificar contraste WCAG AA en combinaciones principales

## Acceptance

- [ ] La app muestra el tema oscuro gótico con acentos dorados
- [ ] Las fuentes Cinzel y EB Garamond se cargan correctamente
- [ ] Los componentes base tienen estilo ritualista coherente