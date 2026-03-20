---
name: daily-logbook
description: Gestiona una bitácora diaria (changelog) de las actividades realizadas y el tiempo invertido en el proyecto.
---

# 📖 Skill: Daily Logbook (Registro de Bitácora)

Este skill provee al asistente la capacidad de mantener un registro estructurado y cronológico del trabajo realizado diariamente en el proyecto.

## 🎯 Objetivo
Registrar consistentemente las actividades, logros y tiempo invertido al finalizar cada sesión de trabajo en un archivo centralizado llamado `docs/PROJECT_LOG.md`.

## 📂 Archivo Objetivo
El registro debe mantenerse en el archivo: `docs/PROJECT_LOG.md` (o la ruta que el usuario indique prefiera, por defecto esta).
*Si el archivo no existe, el asistente debe crearlo en su primer uso con un título principal como `# Diario del Proyecto - Bitácora`.*

## ⚙️ Cuándo usar este skill
- Cuando el usuario solicite un comando como: *"registra la bitácora"*, *"actualiza el documento de hoy"*, *"terminado por hoy"* o use un comando como `/log`.
- Siempre que requieras cerrar el ciclo de desarrollo del día y documentar el tiempo invertido.

## 📝 Pasos y Reglas de Ejecución

1. **Cálculo Dinámico del Tiempo Invertido:**
   - El asistente debe calcular el tiempo invertido de manera **automática** analizando el intervalo entre el inicio de la sesión de trabajo actual (la hora del primer mensaje de la conversación, o de la primera modificación de archivos) y la hora actual provista por el sistema (`ADDITIONAL_METADATA`).
   - El agente deducirá razonablemente la cantidad (ej. "1 hora y 15 minutos") evitando preguntarle al usuario de forma manual, a menos que el hilo de ejecución tenga pausas demasiado ambiguas.
   - Si el usuario decide especificar el tiempo explícitamente (ej. "fueron 3 horas"), se usarán esos datos en su lugar.

2. **Generar el Resumen de Tareas:**
   - El asistente debe analizar el historial de la conversación actual y extraer las tareas completadas, bugs solucionados, componentes creados y decisiones arquitectónicas.

3. **Formato a Agregar:**
   Las entradas deben ser añadidas al **inicio** del documento de bitácora, justo debajo del título principal, para que las entradas más recientes siempre aparezcan primero (orden cronológico inverso). 
   Deben estructurarse usando este formato Markdown estricto:

   ```markdown
   ## 📅 [Fecha de hoy (YYYY-MM-DD)]
   **⏱️ Tiempo invertido:** [X horas / Y minutos]

   ### ✅ Qué se logró
   - [Tarea 1 con descripción corta]
   - [Tarea 2 con descripción corta]

   ### 🚧 Pendientes para la siguiente sesión (Opcional)
   - [Algo documentado que haya quedado a medias]
   ---
   ```

4. **Confirmación:**
   Al actualizar `docs/PROJECT_LOG.md`, el asistente debe responder confirmando la acción y mostrando una previsualización de la tarjeta que agregó.

## 🚀 Flujo de Acceso Rápido
El usuario puede utilizar atajos directamente en el chat para disparar esta habilidad:
- `/log` -> El asistente calcula el tiempo desde que inició la conversación de esa sesión, resume los cambios, y registra la bitácora del día automáticamente.
- `Actualiza la bitácora` -> El asistente calcula el tiempo de la sesión actual de forma dinámica y consolida la información en `docs/PROJECT_LOG.md`.
