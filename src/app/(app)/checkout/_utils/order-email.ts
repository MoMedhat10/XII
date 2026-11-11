import "server-only"
import { Resend } from "resend"

import { formatPrice } from "@/components/dashboard/watches/watch-utils"

import prisma from "../../../../../lib/prisma"
import { logger } from "../../../../../lib/pino"
import {
  formatShipping,
  shippingSelect,
} from "../../orders/_utils/order-address"
import { orderRef } from "../../orders/_utils/order-format"

// The three order emails: confirmation (checkout), shipped and cancelled
// (admin). Each runs after the response, so it never fails or delays the
// action that sent it; problems are only logged.

/** Customer-entered text goes into HTML, so it's always escaped. */
const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")

const emailSelect = {
  id: true,
  totalCents: true,
  customerEmail: true,
  carrier: true,
  trackingNumber: true,
  ...shippingSelect,
  orderItems: {
    select: {
      watchName: true,
      watchModel: true,
      brandName: true,
      quantity: true,
      unitPriceCents: true,
    },
    orderBy: [{ createdAt: "asc" as const }, { id: "asc" as const }],
  },
}

const loadOrder = (orderId: string) =>
  prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    select: emailSelect,
  })

type EmailOrder = Awaited<ReturnType<typeof loadOrder>>

/** Name, street lines and phone, one per line. */
function addressLines(order: EmailOrder) {
  const a = formatShipping(order)
  if (!a) return []
  return [a.name, ...a.lines, ...(a.phone ? [a.phone] : [])]
}

const orderLink = (orderId: string) => {
  const appUrl = process.env.APP_URL?.replace(/\/$/, "")
  return appUrl ? `${appUrl}/orders/${orderId}` : null
}

function itemRows(order: EmailOrder) {
  return order.orderItems
    .map(
      (i) => `
        <tr>
          <td style="padding: 14px 0; border-bottom: 1px solid #dddddd;">
            <div style="font-size: 12px; letter-spacing: 1px; color: #666666; text-transform: uppercase;">${escapeHtml(i.brandName)} · ${escapeHtml(i.watchModel)}</div>
            <div style="font-size: 16px; font-weight: bold;">${escapeHtml(i.watchName)}</div>
            <div style="font-size: 13px; color: #666666;">${i.quantity} × ${formatPrice(i.unitPriceCents)}</div>
          </td>
          <td align="right" style="padding: 14px 0; border-bottom: 1px solid #dddddd; font-weight: bold; color: #b08d57;">
            ${formatPrice(i.unitPriceCents * i.quantity)}
          </td>
        </tr>`
    )
    .join("")
}

function itemsTable(order: EmailOrder, totalLabel: string) {
  return `
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                ${itemRows(order)}
                <tr>
                  <td style="padding: 18px 0 0; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">${totalLabel}</td>
                  <td align="right" style="padding: 18px 0 0; font-size: 22px; font-weight: bold; color: #b08d57;">${formatPrice(order.totalCents)}</td>
                </tr>
              </table>`
}

/** A bordered box with a small caps heading, e.g. "Ship to". */
function box(heading: string, lines: string[]) {
  if (!lines.length) return ""
  return `
              <div style="margin-top: 28px; padding: 18px; border: 2px solid #000000;">
                <div style="font-size: 12px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px;">${heading}</div>
                <div style="font-size: 14px; line-height: 22px;">${lines.map(escapeHtml).join("<br />")}</div>
              </div>`
}

function linkButton(link: string | null) {
  return link
    ? `<a href="${escapeHtml(link)}" style="display: inline-block; margin-top: 28px; padding: 16px 28px; background-color: #b08d57; color: #ffffff; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; text-decoration: none; border: 2px solid #000000;">View your order</a>`
    : ""
}

/** The XII frame every order email shares. `body` is trusted HTML. */
function layout({
  title,
  eyebrow,
  ref,
  intro,
  body,
}: {
  title: string
  eyebrow: string
  ref: string
  intro: string
  body: string
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #eeeeee; font-family: Arial, Helvetica, sans-serif; color: #1a1c1c;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #eeeeee;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width: 100%; max-width: 600px; background-color: #ffffff; border: 2px solid #000000;">
          <tr>
            <td style="padding: 28px 32px; background-color: #000000; color: #ffffff;">
              <div style="font-size: 32px; font-weight: bold; letter-spacing: -1px;">XII</div>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <div style="font-size: 12px; font-weight: bold; letter-spacing: 2px; color: #b08d57; text-transform: uppercase;">${eyebrow}</div>
              <h1 style="margin: 8px 0 12px; font-size: 28px;">${ref}</h1>
              <p style="margin: 0 0 24px; font-size: 15px; line-height: 24px; color: #444444;">
                ${intro}
              </p>
${body}
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 32px; border-top: 2px solid #000000; font-size: 11px; letter-spacing: 1px; color: #666666; text-transform: uppercase;">
              © 2026 XII — The Luxury Timepiece Archive
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

async function send(
  orderId: string,
  kind: string,
  build: (order: EmailOrder) => { subject: string; html: string }
) {
  try {
    const order = await loadOrder(orderId)
    const { subject, html } = build(order)
    const resend = new Resend(process.env.RESEND_API_KEY)
    const { error } = await resend.emails.send({
      from: "Test <onboarding@resend.dev>",
      to: [order.customerEmail],
      subject,
      html,
    })
    if (error) logger.error({ error, orderId, kind }, "Order email rejected")
  } catch (error) {
    logger.error({ error, orderId, kind }, "Error sending order email")
  }
}

/** The receipt for a placed order. */
export const sendOrderConfirmation = (orderId: string) =>
  send(orderId, "confirmation", (order) => {
    const ref = orderRef(order.id)
    return {
      subject: `Your XII order ${ref}`,
      html: layout({
        title: `Your XII order ${ref}`,
        eyebrow: "Order confirmed",
        ref,
        intro:
          "Thank you. Your payment was received and your pieces are being prepared for insured delivery.",
        body:
          itemsTable(order, "Total paid") +
          box("Ship to", addressLines(order)) +
          linkButton(orderLink(order.id)),
      }),
    }
  })

/** Sent when an admin marks the order shipped, with its shipment number. */
export const sendOrderShipped = (orderId: string) =>
  send(orderId, "shipped", (order) => {
    const ref = orderRef(order.id)
    const shipment = order.trackingNumber
      ? [
          order.trackingNumber,
          ...(order.carrier ? [`via ${order.carrier}`] : []),
        ]
      : []
    return {
      subject: `Your XII order ${ref} has shipped`,
      html: layout({
        title: `Your XII order ${ref} has shipped`,
        eyebrow: "On its way",
        ref,
        intro:
          "Your pieces have left our atelier with an insured courier. A signature will be required on delivery.",
        body:
          box("Shipment number", shipment) +
          box("Ship to", addressLines(order)) +
          itemsTable(order, "Total paid") +
          linkButton(orderLink(order.id)),
      }),
    }
  })

/** Sent when an admin cancels the order. */
export const sendOrderCancelled = (orderId: string) =>
  send(orderId, "cancelled", (order) => {
    const ref = orderRef(order.id)
    return {
      subject: `Your XII order ${ref} was cancelled`,
      html: layout({
        title: `Your XII order ${ref} was cancelled`,
        eyebrow: "Order cancelled",
        ref,
        intro:
          "We've cancelled this order and it will not ship. Your payment will be refunded to the original card. Reply to this email if you have any questions.",
        body: itemsTable(order, "Refund") + linkButton(orderLink(order.id)),
      }),
    }
  })
