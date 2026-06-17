# ExitSurveyBot

Bot de Discord desarrollado en Node.js para enviar automáticamente una encuesta de salida a los miembros cuando ingresan al servidor.

La idea principal del bot es entregar al usuario, desde el primer contacto con la comunidad, un enlace de encuesta que pueda guardar y utilizar si en algún momento decide abandonar el servidor. Adicionalmente, el bot puede registrar en un canal de logs cuándo se envió el mensaje de bienvenida y cuándo un usuario sale del servidor.

## Funcionalidades

* Detecta cuando un nuevo miembro entra al servidor.
* Envía un mensaje directo de bienvenida al usuario.
* Incluye un enlace configurable a una encuesta de salida.
* Registra en un canal de logs si el DM fue enviado correctamente.
* Registra cuando un miembro abandona el servidor.
* Maneja errores cuando Discord no permite enviar mensajes directos al usuario.
* Usa variables de entorno para proteger credenciales y configuraciones sensibles.

## Stack tecnológico

* Node.js
* discord.js
* dotenv

## Requisitos

* Node.js 18 o superior recomendado.
* Una aplicación creada en Discord Developer Portal.
* Token de bot de Discord.
* Permisos adecuados dentro del servidor.
* Intents necesarios habilitados para detectar miembros.

## Variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
DISCORD_TOKEN=TU_TOKEN_DEL_BOT
SURVEY_URL=https://tu-enlace-de-encuesta.com
LOG_CHANNEL_ID=ID_DEL_CANAL_DE_LOGS
```

### Descripción de variables

| Variable         | Obligatoria | Descripción                                                    |
| ---------------- | ----------: | -------------------------------------------------------------- |
| `DISCORD_TOKEN`  |          Sí | Token del bot generado desde Discord Developer Portal.         |
| `SURVEY_URL`     |          No | URL de la encuesta de salida que se enviará al usuario por DM. |
| `LOG_CHANNEL_ID` |          No | ID del canal donde se registrarán mensajes de auditoría.       |

Si `SURVEY_URL` no está configurada, el bot enviará un texto indicando que la variable no fue configurada.

## Permisos requeridos en Discord

El bot necesita permisos para:

* Ver canales.
* Enviar mensajes.
* Leer historial de mensajes.
* Enviar mensajes directos a usuarios cuando Discord lo permita.

Además, en Discord Developer Portal se recomienda habilitar:

* Server Members Intent.

## Instalación

Clonar el repositorio:

```bash
git clone https://github.com/itachi364/ExitSurveyBot.git
cd ExitSurveyBot
```

Instalar dependencias:

```bash
npm install
```

Crear archivo `.env`:

```bash
cp .env.example .env
```

Si no existe `.env.example`, crea manualmente el archivo `.env` con las variables indicadas.

Ejecutar el bot:

```bash
npm start
```

## Ejecución en producción con PM2

Instalar PM2:

```bash
npm install -g pm2
```

Iniciar el bot:

```bash
pm2 start npm --name ExitSurveyBot -- start
```

Guardar configuración:

```bash
pm2 save
```

Configurar arranque automático:

```bash
pm2 startup
```

Ver logs:

```bash
pm2 logs ExitSurveyBot
```

Reiniciar:

```bash
pm2 restart ExitSurveyBot
```

## Funcionamiento

Cuando un usuario entra al servidor, el bot ejecuta el evento de entrada de miembros y construye un mensaje directo de bienvenida. Ese mensaje incluye el enlace configurado en `SURVEY_URL`.

Si el envío del DM es exitoso, el bot puede publicar un mensaje de confirmación en el canal configurado en `LOG_CHANNEL_ID`.

Si Discord bloquea el DM por configuración de privacidad del usuario, el bot captura el error y registra una advertencia en el canal de logs, si está configurado.

Cuando un usuario abandona el servidor, el bot no intenta enviarle un DM en ese momento. Solo registra la salida en el canal de logs, indicando que el enlace ya había sido enviado cuando el usuario ingresó.

## Consideraciones importantes

* Discord puede impedir el envío de mensajes directos si el usuario tiene bloqueados los DMs del servidor.
* El bot no almacena información en base de datos.
* El enlace de encuesta debe mantenerse actualizado desde la variable `SURVEY_URL`.
* El token del bot nunca debe subirse al repositorio.
* El archivo `.env` debe estar incluido en `.gitignore`.

## Estructura general

```text
ExitSurveyBot
├── index.js
├── package.json
└── .env
```

## Seguridad

No subas el archivo `.env` al repositorio.

Ejemplo recomendado de `.gitignore`:

```gitignore
node_modules/
.env
npm-debug.log*
```

## Comandos útiles

Instalar dependencias:

```bash
npm install
```

Ejecutar localmente:

```bash
npm start
```

Ejecutar con PM2:

```bash
pm2 start npm --name ExitSurveyBot -- start
```

Ver logs:

```bash
pm2 logs ExitSurveyBot
```

Reiniciar:

```bash
pm2 restart ExitSurveyBot
```

## Posibles mejoras futuras

* Persistir métricas de usuarios contactados.
* Registrar respuestas de encuesta si se integra con una API externa.
* Agregar comandos administrativos para cambiar la URL de encuesta.
* Agregar soporte para múltiples servidores.
* Agregar Dockerfile para despliegue en contenedores.
* Agregar GitHub Actions para validación automática.

## Licencia

Proyecto de uso personal/comunitario. Ajustar la licencia según las necesidades del repositorio.
