import "dotenv/config";
import {
  Client,
  GatewayIntentBits,
  Partials,
  Events
} from "discord.js";

const {
  DISCORD_TOKEN,
  SURVEY_URL,
  LOG_CHANNEL_ID
} = process.env;

if (!DISCORD_TOKEN) {
  console.error("Falta DISCORD_TOKEN en el .env");
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,   // importante para GuildMemberRemove
    GatewayIntentBits.DirectMessages  // para manejar DMs
  ],
  partials: [Partials.Channel]        // necesario para DMs
});

client.once(Events.ClientReady, (c) => {
  console.log(`ExitSurveyBot conectado como ${c.user.tag}`);
});

/**
 * Se dispara cuando un miembro abandona el servidor:
 * - Salida voluntaria
 * - Kick
 * - Ban
 * (Discord no distingue directamente, pero para la encuesta nos sirve igual.)
 */
client.on(Events.GuildMemberRemove, async (member) => {
  try {
    const user = member.user;

    // 1) Intentamos enviar DM
    const dmMessage =
      `Hola **${user.username}**, vimos que has salido del servidor **${member.guild.name}**.\n\n` +
      `Nos ayudaría mucho entender tu experiencia para mejorar la comunidad.\n\n` +
      `📝 **Encuesta de salida:**\n${SURVEY_URL || "👉 (no se ha configurado SURVEY_URL)"}\n\n` +
      `¡Gracias por tu tiempo y por haber hecho parte del servidor! 🙌`;

    await user.send(dmMessage);
    console.log(`DM de encuesta enviado a ${user.tag} (${user.id})`);

    // 2) Log opcional en un canal del servidor
    if (LOG_CHANNEL_ID) {
      const logChannel = await member.guild.channels
        .fetch(LOG_CHANNEL_ID)
        .catch(() => null);

      if (logChannel && logChannel.isTextBased()) {
        console.log(`👋 **${user.tag}** (${user.id}) ha salido del servidor. Se intentó enviar DM con encuesta.`);
        await logChannel.send(
          `👋 **${user.tag}** (${user.id}) ha salido del servidor. Se intentó enviar DM con encuesta.`
        );
      }
    }
  } catch (err) {
    console.warn(
      `No pude enviar DM de encuesta a ${member.user?.tag ?? member.id}:`,
      err.message
    );

    // Log de fallo si hay canal de log
    if (LOG_CHANNEL_ID) {
      const logChannel = await member.guild.channels
        .fetch(LOG_CHANNEL_ID)
        .catch(() => null);

      if (logChannel && logChannel.isTextBased()) {
        await logChannel.send(
          `⚠️ No se pudo enviar DM de encuesta a **${member.user?.tag ?? member.id}** (quizá tenga los DMs cerrados o bloqueado al bot).`
        );
      }
    }
  }
});

client.login(DISCORD_TOKEN);
