# Email

Payload's email functionality provides a flexible way to send transactional emails, notifications, and communications from your application. This feature integrates with various email providers and includes templates, sending schedules, and delivery tracking.

## Overview

Payload's email system enables you to:

- **Email Templates**: Create reusable email templates
- **Multiple Providers**: Use Resend, SendGrid, or custom SMTP configurations
- **Transactional Emails**: Send emails based on user actions
- **Scheduled Sending**: Queue emails for later delivery
- **Template Variables**: Dynamic content insertion
- **Delivery Tracking**: Monitor email delivery status
- **Multi-language Support**: Send localized emails

## Configuration

### Basic Email Setup

```typescript
import { buildConfig } from 'payload/config'
import { resendAdapter } from '@payloadcms/email-resend'

export default buildConfig({
  email: {
    fromName: 'Your App',
    fromAddress: 'noreply@yourapp.com',
    adapter: resendAdapter({
      apiKey: process.env.RESEND_API_KEY,
    }),
  },
  collections: [
    // Your collections here
  ],
})
```

### SendGrid Configuration

```typescript
import { buildConfig } from 'payload/config'
import { sendgridAdapter } from '@payloadcms/email-sendgrid'

export default buildConfig({
  email: {
    fromName: 'Your App',
    fromAddress: 'noreply@yourapp.com',
    adapter: sendgridAdapter({
      apiKey: process.env.SENDGRID_API_KEY,
    }),
  },
  collections: [
    // Your collections here
  ],
})
```

### SMTP Configuration

```typescript
import { buildConfig } from 'payload/config'
import { smtpAdapter } from '@payloadcms/email-smtp'

export default buildConfig({
  email: {
    fromName: 'Your App',
    fromAddress: 'noreply@yourapp.com',
    adapter: smtpAdapter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    }),
  },
  collections: [
    // Your collections here
  ],
})
```

## Email Templates

### Basic Template

```typescript
import type { Payload } from 'payload'

const welcomeEmailTemplate = async ({ req, payload }: { req: any; payload: Payload }) => {
  const { doc } = req // Assuming the user document is passed in req.doc

  return {
    subject: `Welcome to ${process.env.APP_NAME || 'Our Platform'}!`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: #007bff;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 5px 5px 0 0;
            }
            .content {
              background: #f8f9fa;
              padding: 30px;
              border-radius: 0 0 5px 5px;
            }
            .button {
              display: inline-block;
              background: #007bff;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Welcome, ${doc.firstName || doc.email}!</h1>
          </div>
          <div class="content">
            <p>Thank you for signing up for our platform. We're excited to have you on board!</p>
            <p>To get started, please confirm your email address and complete your profile.</p>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/confirm-email?token=${doc.verificationToken}" class="button">
              Confirm Email Address
            </a>
            <p>If you have any questions, feel free to reply to this email.</p>
            <p>Best regards,<br>The Team</p>
          </div>
        </body>
      </html>
    `,
    text: `
      Welcome to ${process.env.APP_NAME || 'Our Platform'}!

      Thank you for signing up, ${doc.firstName || doc.email}!

      To get started, please confirm your email address:
      ${process.env.NEXT_PUBLIC_SITE_URL}/confirm-email?token=${doc.verificationToken}

      Best regards,
      The Team
    `,
  }
}
```

### Advanced Template with Dynamic Content

```typescript
const orderConfirmationEmail = async ({ req, payload }: { req: any; payload: Payload }) => {
  const { order, user } = req // Assuming order and user are passed in req

  // Fetch order details
  const fullOrder = await payload.findByID({
    collection: 'orders',
    id: order.id,
    depth: 2, // Populate related data
  })

  const orderDate = new Date(fullOrder.createdAt).toLocaleDateString()
  const subtotal = fullOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const tax = subtotal * 0.08 // 8% tax
  const total = subtotal + tax

  return {
    subject: `Order Confirmation #${fullOrder.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Order Confirmation</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #28a745; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 5px 5px; }
            .order-details { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; border: 1px solid #dee2e6; }
            .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .total-row { font-weight: bold; border-top: 2px solid #333; padding-top: 10px; margin-top: 10px; }
            .button { display: inline-block; background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Order Confirmed!</h1>
            <p>Order #${fullOrder.orderNumber}</p>
          </div>
          <div class="content">
            <p>Hi ${user.firstName || user.email},</p>
            <p>Thank you for your order! Here are the details:</p>

            <div class="order-details">
              <h3>Order Information</h3>
              <p><strong>Date:</strong> ${orderDate}</p>
              <p><strong>Status:</strong> ${fullOrder.status}</p>

              <h4>Items</h4>
              ${fullOrder.items.map(item => `
                <div class="item">
                  <div>${item.name}</div>
                  <div>${item.quantity} × $${item.price.toFixed(2)} = $${(item.quantity * item.price).toFixed(2)}</div>
                </div>
              `).join('')}

              <div class="total-row">
                <div>Subtotal:</div>
                <div>$${subtotal.toFixed(2)}</div>
              </div>
              <div class="total-row">
                <div>Tax (8%):</div>
                <div>$${tax.toFixed(2)}</div>
              </div>
              <div class="total-row">
                <div><strong>Total:</strong></div>
                <div><strong>$${total.toFixed(2)}</strong></div>
              </div>
            </div>

            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/orders/${fullOrder.id}" class="button">
              View Order Details
            </a>

            <p>Thank you for your business!</p>
            <p>Best regards,<br>The Team</p>
          </div>
        </body>
      </html>
    `,
    text: `
      Order Confirmation #${fullOrder.orderNumber}

      Date: ${orderDate}
      Status: ${fullOrder.status}

      Items:
      ${fullOrder.items.map(item =>
        `${item.name} - ${item.quantity} × $${item.price.toFixed(2)} = $${(item.quantity * item.price).toFixed(2)}`
      ).join('\n')}

      Subtotal: $${subtotal.toFixed(2)}
      Tax (8%): $${tax.toFixed(2)}
      Total: $${total.toFixed(2)}

      View your order: ${process.env.NEXT_PUBLIC_SITE_URL}/orders/${fullOrder.id}

      Thank you for your business!
    `,
  }
}
```

## Email Hooks Integration

### User Registration Email

```typescript
import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  fields: [
    {
      name: 'firstName',
      type: 'text',
    },
    {
      name: 'lastName',
      type: 'text',
    },
    {
      name: 'email',
      type: 'email',
      required: true,
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation === 'create') {
          try {
            await req.payload.sendEmail({
              to: doc.email,
              from: process.env.FROM_EMAIL_ADDRESS,
              subject: 'Welcome to our platform!',
              html: welcomeEmailTemplate({ req: { ...req, doc }, payload: req.payload }).html,
              text: welcomeEmailTemplate({ req: { ...req, doc }, payload: req.payload }).text,
            })
          } catch (error) {
            console.error('Failed to send welcome email:', error)
            // Don't throw the error to prevent blocking user registration
          }
        }
      },
    ],
  },
}
```

### Password Reset Email

```typescript
export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  fields: [
    // Your fields here
  ],
  hooks: {
    beforeOperation: [
      async ({ args, operation }) => {
        if (operation === 'forgotPassword') {
          // Store the reset token and expiration
          args.data.resetToken = generateRandomToken()
          args.data.resetTokenExpiration = new Date(Date.now() + 3600000) // 1 hour
          return args
        }
        return args
      },
    ],
    afterOperation: [
      async ({ args, operation, req }) => {
        if (operation === 'forgotPassword') {
          try {
            const user = await req.payload.findByID({
              collection: 'users',
              id: args.where.id,
            })

            await req.payload.sendEmail({
              to: user.email,
              subject: 'Reset Your Password',
              html: `
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="utf-8">
                  <title>Password Reset</title>
                </head>
                <body>
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2>Password Reset Request</h2>
                    <p>Hi ${user.firstName || user.email},</p>
                    <p>You requested to reset your password. Click the link below to reset it:</p>
                    <a href="${process.env.NEXT_PUBLIC_SITE_URL}/reset-password?token=${user.resetToken}"
                       style="display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
                      Reset Password
                    </a>
                    <p>This link will expire in 1 hour.</p>
                    <p>If you didn't request this password reset, you can safely ignore this email.</p>
                    <p>Best regards,<br>The Team</p>
                  </div>
                </body>
                </html>
              `,
              text: `
                Password Reset Request

                Hi ${user.firstName || user.email},

                You requested to reset your password. Click the link below to reset it:
                ${process.env.NEXT_PUBLIC_SITE_URL}/reset-password?token=${user.resetToken}

                This link will expire in 1 hour.

                If you didn't request this password reset, you can safely ignore this email.

                Best regards,
                The Team
              `,
            })
          } catch (error) {
            console.error('Failed to send password reset email:', error)
          }
        }
      },
    ],
  },
}

function generateRandomToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}
```

### Order Status Updates

```typescript
export const Orders: CollectionConfig = {
  slug: 'orders',
  fields: [
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Processing', value: 'processing' },
        { label: 'Shipped', value: 'shipped' },
        { label: 'Delivered', value: 'delivered' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      required: true,
    },
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    // Other fields...
  ],
  hooks: {
    afterChange: [
      async ({ doc, previousDoc, req }) => {
        // Send email when order status changes
        if (doc.status !== previousDoc?.status) {
          const customer = await req.payload.findByID({
            collection: 'users',
            id: doc.customer,
          })

          try {
            await req.payload.sendEmail({
              to: customer.email,
              subject: `Order Status Update: ${doc.status}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <h2>Order Status Update</h2>
                  <p>Hi ${customer.firstName || customer.email},</p>
                  <p>Your order #${doc.orderNumber} status has been updated to: <strong>${doc.status}</strong></p>
                  ${doc.status === 'shipped' ? `
                    <p>Tracking Information:</p>
                    <p>Tracking Number: ${doc.trackingNumber}</p>
                    <p>Carrier: ${doc.carrier}</p>
                  ` : ''}
                  <a href="${process.env.NEXT_PUBLIC_SITE_URL}/orders/${doc.id}"
                     style="display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
                    View Order Details
                  </a>
                </div>
              `,
              text: `
                Order Status Update

                Hi ${customer.firstName || customer.email},

                Your order #${doc.orderNumber} status has been updated to: ${doc.status}

                ${doc.status === 'shipped' ? `
                  Tracking Information:
                  Tracking Number: ${doc.trackingNumber}
                  Carrier: ${doc.carrier}
                ` : ''}

                View your order: ${process.env.NEXT_PUBLIC_SITE_URL}/orders/${doc.id}
              `,
            })
          } catch (error) {
            console.error('Failed to send status update email:', error)
          }
        }
      },
    ],
  },
}
```

## Advanced Email Features

### Bulk Email Sending

```typescript
import type { Payload } from 'payload'

const sendNewsletterEmail = async (payload: Payload) => {
  // Get all subscribers
  const subscribers = await payload.find({
    collection: 'subscribers',
    where: {
      active: { equals: true },
    },
  })

  // Create email template
  const newsletterTemplate = {
    subject: 'Our Latest Newsletter',
    html: getNewsletterHTML(), // Your newsletter HTML
    text: getNewsletterText(),  // Newsletter text version
  }

  // Send to all subscribers with delay to avoid rate limiting
  for (const subscriber of subscribers.docs) {
    try {
      await payload.sendEmail({
        to: subscriber.email,
        ...newsletterTemplate,
        // Add personalization
        personalizations: [{
          to: subscriber.email,
          customArgs: {
            subscriber_id: subscriber.id,
          },
        }],
      })

      // Add delay between sends
      await new Promise(resolve => setTimeout(resolve, 100)) // 100ms delay
    } catch (error) {
      console.error(`Failed to send newsletter to ${subscriber.email}:`, error)
    }
  }
}

// Helper functions
function getNewsletterHTML(): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1>Latest Updates from Our Platform</h1>
      <!-- Newsletter content here -->
    </div>
  `
}

function getNewsletterText(): string {
  return `
    Latest Updates from Our Platform

    <!-- Newsletter content here -->
  `
}
```

### Email Scheduling

```typescript
interface ScheduledEmail {
  id: string
  to: string
  subject: string
  html: string
  text: string
  scheduledFor: Date
  status: 'pending' | 'sent' | 'failed'
}

const sendScheduledEmails = async (payload: Payload) => {
  const now = new Date()

  // Get pending scheduled emails
  const scheduledEmails = await payload.find({
    collection: 'scheduled-emails',
    where: {
      scheduledFor: { less_than_equal: now },
      status: { equals: 'pending' },
    },
  })

  for (const scheduledEmail of scheduledEmails.docs) {
    try {
      await payload.sendEmail({
        to: scheduledEmail.to,
        subject: scheduledEmail.subject,
        html: scheduledEmail.html,
        text: scheduledEmail.text,
      })

      // Mark as sent
      await payload.update({
        collection: 'scheduled-emails',
        id: scheduledEmail.id,
        data: {
          status: 'sent',
          sentAt: new Date(),
        },
      })
    } catch (error) {
      console.error(`Failed to send scheduled email ${scheduledEmail.id}:`, error)

      // Mark as failed
      await payload.update({
        collection: 'scheduled-emails',
        id: scheduledEmail.id,
        data: {
          status: 'failed',
          error: error.message,
          failedAt: new Date(),
        },
      })
    }
  }
}
```

## Email Analytics

### Tracking Email Delivery

```typescript
export const EmailAnalytics: CollectionConfig = {
  slug: 'email-analytics',
  admin: {
    useAsTitle: 'subject',
  },
  fields: [
    {
      name: 'subject',
      type: 'text',
      required: true,
    },
    {
      name: 'to',
      type: 'text',
      required: true,
    },
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'Welcome', value: 'welcome' },
        { label: 'Order Confirmation', value: 'order_confirmation' },
        { label: 'Password Reset', value: 'password_reset' },
        { label: 'Newsletter', value: 'newsletter' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Sent', value: 'sent' },
        { label: 'Delivered', value: 'delivered' },
        { label: 'Opened', value: 'opened' },
        { label: 'Clicked', value: 'clicked' },
        { label: 'Bounced', value: 'bounced' },
        { label: 'Failed', value: 'failed' },
      ],
    },
    {
      name: 'sentAt',
      type: 'date',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'deliveredAt',
      type: 'date',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'openedAt',
      type: 'date',
      admin: {
        readOnly: true,
      },
    },
  ],
}

// Webhook handler for email events
const handleEmailWebhook = async (req: any) => {
  const { event, data } = req.body

  try {
    if (event === 'delivered') {
      await req.payload.update({
        collection: 'email-analytics',
        where: {
          messageId: { equals: data.messageId },
        },
        data: {
          status: 'delivered',
          deliveredAt: new Date(),
        },
      })
    } else if (event === 'opened') {
      await req.payload.update({
        collection: 'email-analytics',
        where: {
          messageId: { equals: data.messageId },
        },
        data: {
          status: 'opened',
          openedAt: new Date(),
        },
      })
    }
  } catch (error) {
    console.error('Failed to handle email webhook:', error)
  }
}
```

## Testing Emails

### Email Template Testing

```typescript
import type { Payload } from 'payload'

const testEmailTemplate = async (payload: Payload) => {
  const testUser = {
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
  }

  try {
    await payload.sendEmail({
      to: testUser.email,
      subject: 'Test Welcome Email',
      html: welcomeEmailTemplate({
        req: { doc: testUser },
        payload
      }).html,
      text: welcomeEmailTemplate({
        req: { doc: testUser },
        payload
      }).text,
    })

    console.log('Test email sent successfully')
  } catch (error) {
    console.error('Failed to send test email:', error)
  }
}
```

### Email Validation

```typescript
const validateEmailTemplate = async (template: () => Promise<any>, payload: Payload) => {
  const testData = {
    req: {
      doc: {
        email: 'test@example.com',
        firstName: 'Test',
      },
    },
    payload,
  }

  try {
    const emailContent = await template(testData)

    // Validate required fields
    if (!emailContent.subject) {
      throw new Error('Email template missing subject')
    }
    if (!emailContent.html) {
      throw new Error('Email template missing HTML content')
    }
    if (!emailContent.text) {
      throw new Error('Email template missing text content')
    }

    console.log('Email template validation passed')
    return true
  } catch (error) {
    console.error('Email template validation failed:', error)
    return false
  }
}
```

## Environment Configuration

### Environment Variables

```env
# Email Configuration
EMAIL_FROM_NAME=Your App
EMAIL_FROM_ADDRESS=noreply@yourapp.com

# Resend
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx

# SendGrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxx

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Site URLs
NEXT_PUBLIC_SITE_URL=https://yourapp.com
```

## Best Practices

### 1. Error Handling

```typescript
const safeSendEmail = async (payload: Payload, emailData: any) => {
  try {
    await payload.sendEmail(emailData)
    return { success: true }
  } catch (error) {
    console.error('Email sending failed:', error)

    // Log to analytics
    await payload.create({
      collection: 'email-errors',
      data: {
        error: error.message,
        emailData: JSON.stringify(emailData),
        timestamp: new Date(),
      },
    })

    return { success: false, error: error.message }
  }
}
```

### 2. Rate Limiting

```typescript
const rateLimitedSendEmail = async (payload: Payload, emailData: any) => {
  const recentSends = await payload.find({
    collection: 'email-analytics',
    where: {
      to: { equals: emailData.to },
      sentAt: { greater_than: new Date(Date.now() - 60000) }, // Last minute
    },
  })

  if (recentSends.totalDocs >= 5) {
    throw new Error('Too many emails sent to this address recently')
  }

  return await payload.sendEmail(emailData)
}
```

### 3. Template Management

```typescript
// Centralized template management
export const EmailTemplates = {
  welcome: welcomeEmailTemplate,
  orderConfirmation: orderConfirmationEmail,
  passwordReset: passwordResetTemplate,
  newsletter: newsletterTemplate,
}

const sendEmail = async (templateName: keyof typeof EmailTemplates, data: any, payload: Payload) => {
  const template = EmailTemplates[templateName]
  if (!template) {
    throw new Error(`Email template "${templateName}" not found`)
  }

  const emailContent = await template({ ...data, payload })

  return await payload.sendEmail(emailContent)
}
```

The email feature provides a comprehensive solution for all your email communication needs, with support for multiple providers, template management, and advanced delivery tracking.