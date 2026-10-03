# Cómo agregar tu negocio

Este archivo es el ejercicio de Pull Request del curso. TurnoListo lee cada `.json` de esta carpeta y publica una página en `/{slug}`.

## Pasos

1. Copia `barberia-don-lucho.json` con el nombre de tu archivo, por ejemplo `cafeteria-la-esquina.json`.
2. Cambia los datos. El `slug` es la URL: si pones `"slug": "cafeteria-la-esquina"`, la página queda en `/cafeteria-la-esquina`.
3. Completa los siete días del `horario`. Un día abierto lleva `abre` y `cierra` en formato `HH:mm`. Un día cerrado lleva `{ "cerrado": true }`.
4. Agrega de 3 a 5 servicios. Cada uno necesita `id`, `nombre`, `duracionMin` y `precioSoles`.
5. Abre un Pull Request con ese JSON. No hace falta base de datos: con `DATA_MODE=mock` el archivo alcanza.

## Campos

| Campo | Ejemplo | Notas |
| --- | --- | --- |
| `slug` | `barberia-don-lucho` | Minúsculas y guiones. Tiene que coincidir con lo que quieras en la URL. |
| `nombre` | `Barbería Don Lucho` | Se muestra en la portada y en la ficha. |
| `rubro` | `Barbería` | Texto corto. |
| `distrito` | `Surquillo` | Distrito de Lima u otra ciudad. |
| `descripcion` | Una frase o dos | Sale debajo del nombre. |
| `telefonoWhatsapp` | `51987654321` | Código de país `51` más el celular, sin `+` ni espacios. |
| `colorMarca` | `#9a3412` | Color de la cabecera, en hexadecimal. |
| `horario` | Ver los JSON demo | Claves: `lunes`, `martes`, `miercoles`, `jueves`, `viernes`, `sabado`, `domingo`. Sin tildes. |
| `servicios` | Lista | `duracionMin` es la duración en minutos. `precioSoles` es el precio en soles. |

Las horas se ofrecen cada 30 minutos, siempre que el servicio termine antes del cierre y nadie más haya reservado ese tramo.
