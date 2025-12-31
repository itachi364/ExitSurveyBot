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
    GatewayIntentBits.GuildMembers,    // necesario para GuildMemberAdd / Remove
    GatewayIntentBits.DirectMessages   // necesario para enviar DMs
  ],
  partials: [
    Partials.Channel,      // DMs
    Partials.User,
    Partials.GuildMember
  ]
});

client.once(Events.ClientReady, (c) => {
  console.log(`ExitSurveyBot conectado como ${c.user.tag}`);
});

/**
 * Cuando un miembro entra al servidor:
 * - Se intenta enviar un DM de bienvenida con el link a la encuesta.
 */
client.on(Events.GuildMemberAdd, async (member) => {
  console.log("➡️ GuildMemberAdd:", {
    id: member.id,
    tag: member.user?.tag
  });

  try {
    const user = member.user;

    const dmMessage =
      `¡Hola **${user.username}**, bienvenido a **${member.guild.name}**! 🎉\n\n` +
      `Nos alegra que te unas a la comunidad.\n\n` +
      `Si algún día decides irte, nos ayudaría mucho conocer tu opinión para mejorar el servidor.\n\n` +
      `📝 **Encuesta de salida (puedes guardarla):**\n` +
      `${SURVEY_URL || "👉 (no se ha configurado SURVEY_URL)"}\n\n` +
      `¡Disfruta tu estancia en el servidor!`;

    await user.send(dmMessage);
    console.log(`DM de bienvenida enviado a ${user.tag} (${user.id})`);

    // Log opcional
    if (LOG_CHANNEL_ID) {
      const logChannel = await member.guild.channels
        .fetch(LOG_CHANNEL_ID)
        .catch(() => null);

      if (logChannel && logChannel.isTextBased()) {
        await logChannel.send(
          `✅ Se envió DM de bienvenida con encuesta a **${user.tag}** (${user.id}).`
        );
      }
    }
  } catch (err) {
    console.warn(
      `No pude enviar DM de bienvenida a ${member.user?.tag ?? member.id}:`,
      err
    );

    if (LOG_CHANNEL_ID) {
      const logChannel = await member.guild.channels
        .fetch(LOG_CHANNEL_ID)
        .catch(() => null);

      if (logChannel && logChannel.isTextBased()) {
        if (err.code === 50007) {
          await logChannel.send(
            `⚠️ No se pudo enviar DM de bienvenida a **${member.user?.tag ?? member.id}** porque Discord no permite enviarle mensajes directos (configuración de privacidad o bloqueo).`
          );
        } else {
          await logChannel.send(
            `⚠️ Error inesperado al enviar DM de bienvenida a **${member.user?.tag ?? member.id}**. Código: \`${err.code}\`.`
          );
        }
      }
    }
  }
});

/**
 * Opcional: mantener GuildMemberRemove solo para log,
 * sin depender de poder enviar DM en ese momento.
 */
client.on(Events.GuildMemberRemove, async (member) => {
  console.log("➡️ GuildMemberRemove:", {
    id: member.id,
    tag: member.user?.tag
  });

  if (!LOG_CHANNEL_ID) return;

  try {
    const logChannel = await member.guild.channels
      .fetch(LOG_CHANNEL_ID)
      .catch(() => null);

    if (logChannel && logChannel.isTextBased()) {
      await logChannel.send(
        `👋 **${member.user?.tag ?? member.id}** ha salido del servidor. ` +
        `Ya había recibido el link de la encuesta al entrar.`
      );
    }
  } catch (err) {
    console.warn("Error enviando log de salida:", err);
  }
});

client.login(DISCORD_TOKEN);
