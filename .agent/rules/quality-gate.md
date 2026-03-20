---
description: Quality Gate for Development Tasks in EscuelitazSPF
---

Cada vez que se complete una tarea de desarrollo o modificación de código, el AGENTE DEBE verificar los siguientes puntos:

1.  **Tipado**: ¿Se utilizó `any`? (Si es así, corregirlo antes de finalizar).
2.  **Arquitectura**: ¿El código está en la capa correcta? (Dominio, Aplicación, Infraestructura, UI).
3.  **Mapeo**: ¿Se está exponiendo una fila de base de datos directamente a la UI o se usó un mapeador al dominio?
4.  **Aislamiento**: ¿La operación en la base de datos respeta el `school_id`?
5.  **Validación**: ¿Se creó o actualizó el archivo `.test.ts` correspondiente? (Si no, crearlo).
6.  **Compilación**: ¿Pasa `pnpm exec tsc --noEmit` sin errores?

**Procedimiento de Entrega de Tarea**:
- El agente informará al usuario si se detectaron desviaciones y las corregirá proactivamente antes de dar por cerrada la tarea.
