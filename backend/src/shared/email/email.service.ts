import nodemailer, { type Transporter } from "nodemailer";
import { env } from "../../config/environment.js";

type EnrollmentEmailData = {
  name: string;
  email: string;
  workshop: {
    title: string;
    className: string;
    price: { toString(): string } | number;
    meetings: Array<{ startsAt: Date; endsAt: Date; location: string }>;
  };
  cancellationUrl?: string;
  paymentUrl?: string;
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
  const meetings = data.workshop.meetings
    .map((meeting, index) => `${index + 1}ª aula: ${formatDate(meeting.startsAt)} — ${meeting.location}`)
    .join("\n");
  const price = Number(data.workshop.price);

  return [
    `Oficina: ${data.workshop.title}`,
    `Turma: ${data.workshop.className}`,
    `Valor: ${price > 0 ? price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "Gratuita"}`,
    meetings,
  ].join("\n");
}

function cancellationInstructions(data: EnrollmentEmailData) {
  return data.cancellationUrl
    ? `\n\nSe não puder participar, cancele sua inscrição por este link:\n${data.cancellationUrl}`
    : "";
}

function paymentInstructions(data: EnrollmentEmailData) {
  return data.paymentUrl
    ? `\n\nEsta é uma demonstração acadêmica: nenhum PIX real será cobrado. Simule o pagamento por este link:\n${data.paymentUrl}`
    : "";
}

export const emailService = {
  sendEnrollmentReceived(data: EnrollmentEmailData) {
    return sendSafely(
      data.email,
      `Recebemos sua inscrição — ${data.workshop.title}`,
      `Olá, ${data.name}!\n\nRecebemos sua inscrição e ela está aguardando confirmação.\n\n${workshopDetails(data)}${paymentInstructions(data)}${cancellationInstructions(data)}\n\nFeito à Mão`,
    );
  },

  sendEnrollmentConfirmed(data: EnrollmentEmailData) {
    return sendSafely(
      data.email,
      `Inscrição confirmada — ${data.workshop.title}`,
      `Olá, ${data.name}!\n\nSua inscrição foi confirmada. Sua vaga está garantida.\n\n${workshopDetails(data)}${cancellationInstructions(data)}\n\nEsperamos você!\nFeito à Mão`,
    );
  },

  sendEnrollmentCanceled(data: EnrollmentEmailData) {
    return sendSafely(
      data.email,
      `Inscrição cancelada — ${data.workshop.title}`,
      `Olá, ${data.name}.\n\nSua inscrição foi cancelada e a vaga foi liberada.\n\n${workshopDetails(data)}\n\nFeito à Mão`,
    );
  },

  sendPaymentReceived(data: EnrollmentEmailData) {
    return sendSafely(
      data.email,
      `Pagamento registrado — ${data.workshop.title}`,
      `Olá, ${data.name}!\n\nO pagamento ilustrativo foi registrado. Sua inscrição continua pendente até a confirmação da equipe.\n\n${workshopDetails(data)}${cancellationInstructions(data)}\n\nFeito à Mão`,
    );
  },

  sendPaymentNotificationToAdmin(data: EnrollmentEmailData) {
    return sendSafely(
      env.ADMIN_EMAIL,
      `Pagamento aguardando análise — ${data.workshop.title}`,
      `${data.name} (${data.email}) simulou o pagamento da inscrição.\n\n${workshopDetails(data)}\n\nAcesse o painel para confirmar a inscrição.`,
    );
  },
};
