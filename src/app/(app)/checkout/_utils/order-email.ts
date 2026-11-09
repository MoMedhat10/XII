import "server-only"
import { Resend } from "resend"

import { formatPrice } from "@/components/dashboard/watches/watch-utils"

import prisma from "../../../../../lib/prisma"
import { logger } from "../../../../../lib/pino"
import { orderRef } from "../../orders/_utils/order-format"
import { countryName } from "./countries"
import { formatPhoneDisplay } from "./phone"

/** Customer-entered text goes into HTML, so it's always escaped. */
const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")

type EmailOrder = {
  id: string
  totalCents: number
  customerEmail: string
  address: string[]
  items: {
    name: string
    model: string
    brand: string
    quantity: number
    unitPriceCents: number
  }[]
}

function orderConfirmationTemplate(order: EmailOrder, link: string | null) {
  const ref = orderRef(order.id)
  const rows = order.items
    .map(
      (i) => `
        <tr>
          <td style="padding: 14px 0; border-bottom: 1px solid #dddddd;">
            <div style="font-size: 12px; letter-spacing: 1px; color: #666666; text-transform: uppercase;">${escapeHtml(i.brand)} · ${escapeHtml(i.model)}</div>
            <div style="font-size: 16px; font-weight: bold;">${escapeHtml(i.name)}</div>
            <div style="font-size: 13px; color: #666666;">${i.quantity} × ${formatPrice(i.unitPriceCents)}</div>
          </td>
          <td align="right" style="padding: 14px 0; border-bottom: 1px solid #dddddd; font-weight: bold; color: #b08d57;">
            ${formatPrice(i.unitPriceCents * i.quantity)}
          </td>
        </tr>`
    )
    .join("")

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your XII order ${ref}</title>
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
              <div style="font-size: 12px; font-weight: bold; letter-spacing: 2px; color: #b08d57; text-transform: uppercase;">Order confirmed</div>
              <h1 style="margin: 8px 0 12px; font-size: 28px;">${ref}</h1>
              <p style="margin: 0 0 24px; font-size: 15px; line-height: 24px; color: #444444;">
                Thank you. Your payment was received and your pieces are being prepared for insured delivery.
              </p>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                ${rows}
                <tr>
                  <td style="padding: 18px 0 0; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Total paid</td>
                  <td align="right" style="padding: 18px 0 0; font-size: 22px; font-weight: bold; color: #b08d57;">${formatPrice(order.totalCents)}</td>
                </tr>
              </table>

              <div style="margin-top: 28px; padding: 18px; border: 2px solid #000000;">
                <div style="font-size: 12px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px;">Ship to</div>
                <div style="font-size: 14px; line-height: 22px;">${order.address.map(escapeHtml).join("<br />")}</div>
              </div>

              ${
                link
                  ? `<a href="${escapeHtml(link)}" style="display: inline-block; margin-top: 28px; padding: 16px 28px; background-color: #b08d57; color: #ffffff; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; text-decoration: none; border: 2px solid #000000;">View your order</a>`
                  : ""
              }
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

/**
 * Emails the receipt for a placed order. Runs after the response, so it
 * never fails or delays the order; problems are only logged.
 */
export async function sendOrderConfirmation(orderId: string) {
  try {
    const order = await prisma.order.findUniqueOrThrow({
      where: { id: orderId },
      select: {
        id: true,
        totalCents: true,
        customerEmail: true,
        shipName: true,
        shipPhone: true,
        shipLine1: true,
        shipLine2: true,
        shipCity: true,
        shipRegion: true,
        shipPostalCode: true,
        shipCountry: true,
        orderItems: {
          select: {
            watchName: true,
            watchModel: true,
            brandName: true,
            quantity: true,
            unitPriceCents: true,
          },
          orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        },
      },
    })

    const address = [
      order.shipName,
      order.shipLine1,
      order.shipLine2,
      [order.shipCity, order.shipRegion, order.shipPostalCode]
        .filter(Boolean)
        .join(", "),
      order.shipCountry && countryName(order.shipCountry),
      order.shipPhone && formatPhoneDisplay(order.shipPhone),
    ].filter((l): l is string => Boolean(l))

    const appUrl = process.env.APP_URL?.replace(/\/$/, "")
    const html = orderConfirmationTemplate(
      {
        id: order.id,
        totalCents: order.totalCents,
        customerEmail: order.customerEmail,
        address,
        items: order.orderItems.map((i) => ({
          name: i.watchName,
          model: i.watchModel,
          brand: i.brandName,
          quantity: i.quantity,
          unitPriceCents: i.unitPriceCents,
        })),
      },
      appUrl ? `${appUrl}/orders/${order.id}` : null
    )

    const resend = new Resend(process.env.RESEND_API_KEY)
    const { error } = await resend.emails.send({
      from: "Test <onboarding@resend.dev>",
      to: [order.customerEmail],
      subject: `Your XII order ${orderRef(order.id)}`,
      html,
    })
    if (error) logger.error({ error, orderId }, "Order email rejected")
  } catch (error) {
    logger.error({ error, orderId }, "Error sending order email")
  }
}
