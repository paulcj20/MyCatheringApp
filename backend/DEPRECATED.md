# Backend retirado

Este backend de Spring Boot fue reemplazado en agosto de 2026. No se despliega
y no forma parte del sistema en producción.

**Qué lo reemplazó:** las reservas se guardan en Supabase (Postgres) y el
endpoint que recibe el formulario público vive en el fork de wacrm, que además
provee el panel administrativo, el calendario y la integración con WhatsApp.

**Por qué:** con las reservas en Supabase y el panel en wacrm, la única función
que le quedaba a este servicio era recibir un POST e insertar una fila. wacrm ya
es una app Next.js con acceso a Supabase y ya está desplegada en el mismo
servidor.

**Por qué no se borró:** para que la eliminación sea una decisión separada. El
código no molesta donde está, y conserva el modelo de datos original por si hace
falta consultarlo.

Detalle completo en `docs/superpowers/specs/2026-08-08-e-e-gastronomia-puesta-en-produccion-design.md`.
