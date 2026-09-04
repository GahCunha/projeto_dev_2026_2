import nodemailer, { type Transporter } from "nodemailer";
import { env } from "../../config/environment.js";

type EnrollmentEmailData = {
  name: string;
  email: string;
  workshop: {
    title: string;
    startsAt: Date;
    location: string;
  };
};

let transporter: Transporter | undefined;

function getTransporter() {
  transporter ??= nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: false,
  });

  return transporter;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(date);
}

async function sendSafely(to: string, subject: string, text: string) {
  if (!env.EMAIL_ENABLED || process.env.VITEST) return;

  try {
    await getTransporter().sendMail({ from: env.SMTP_FROM, to, subject, text });
  } catch {
    console.error("Não foi possível enviar uma notificação por e-mail.");
  }
}

function workshopDetails(data: EnrollmentEmailData) {
  return [
    `Oficina: ${data.workshop.title}`,
    `Data: ${formatDate(data.workshop.startsAt)}`,
    `Local: ${data.workshop.location}`,
  ].join("\n");
}

export const emailService = {
  sendEnrollmentReceived(data: EnrollmentEmailData) {
    return sendSafely(
      data.email,
      `Recebemos sua inscrição — ${data.workshop.title}`,
      `Olá, ${data.name}!\n\nRecebemos sua inscrição e ela está aguardando confirmação.\n\n${workshopDetails(data)}\n\nFeito à Mão`,
    );
  },

  sendEnrollmentConfirmed(data: EnrollmentEmailData) {
    return sendSafely(
      data.email,
      `Inscrição confirmada — ${data.workshop.title}`,
      `Olá, ${data.name}!\n\nSua inscrição foi confirmada. Sua vaga está garantida.\n\n${workshopDetails(data)}\n\nEsperamos você!\nFeito à Mão`,
    );
  },

  sendEnrollmentCanceled(data: EnrollmentEmailData) {
    return sendSafely(
      data.email,
      `Inscrição cancelada — ${data.workshop.title}`,
      `Olá, ${data.name}.\n\nSua inscrição foi cancelada e a vaga foi liberada.\n\n${workshopDetails(data)}\n\nFeito à Mão`,
    );
  },
};
