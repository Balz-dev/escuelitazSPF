---
description: Sincronización Obligatoria de Tareas (EscuelitazSPF)
---

Cada vez que el AGENTE finaliza una subtarea o avanza de fase en el desarrollo de EscuelitazSPF, DEBE:

1.  **Actualizar `docs/TASKS.md`**: Marcar con `[x]` las tareas completadas y agregar nuevas subtareas si surgen bloqueos o necesidades de desarrollo nuevas.
2.  **Informar al Usuario**: En cada respuesta donde se haya alterado el código, el agente debe brevemente resumir el estado actual en el flujo de fases.
3.  **Proactividad**: Si una tarea depende de otra (ej: para hacer la UI de Login debo tener el Auth Service), el agente debe validar el cumplimiento de la dependencia antes de sugerir el siguiente paso.

**Archivo Maestro**: El único punto de verdad para el progreso del proyecto es [docs/TASKS.md](file:///mnt/HOME/Proyectos/escuelitazSPF/docs/TASKS.md).
