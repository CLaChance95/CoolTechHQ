
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SendEmail, InvokeLLM } from '@/api/integrations';
import { X, Send, Mail, MessageCircle, Plus, Minus } from 'lucide-react';
import { format } from 'date-fns';
import { createPageUrl } from '@/utils';

export default function InvoiceSender({ invoice, client, onClose, onSent }) {
  const [method, setMethod] = useState('email');
  const [recipientEmail, setRecipientEmail] = useState(client?.email || '');
  const [recipientPhone, setRecipientPhone] = useState(client?.phone || '');
  const [customMessage, setCustomMessage] = useState('Please review the attached invoice. Payment is due by the specified due date.');
  const [isSending, setIsSending] = useState(false);
  const [showAdditionalMessage, setShowAdditionalMessage] = useState(false);
  const [additionalMessage, setAdditionalMessage] = useState('');

  const generateInvoiceContent = () => {
    const baseUrl = window.location.origin;
    const paymentUrl = `${baseUrl}${createPageUrl('InvoicePayment')}?id=${invoice.id}`;

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">Cool Tech Designs</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">HVAC Management Solutions</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Invoice #${invoice.invoice_number}</h2>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #374151; margin-top: 0;">Invoice Details</h3>
            <p><strong>Client:</strong> ${client?.client_name || 'N/A'}</p>
            <p><strong>Contact:</strong> ${client?.contact_name || 'N/A'}</p>
            <p><strong>Issue Date:</strong> ${format(new Date(invoice.issue_date), 'MMM d, yyyy')}</p>
            <p><strong>Due Date:</strong> ${invoice.due_date ? format(new Date(invoice.due_date), 'MMM d, yyyy') : 'N/A'}</p>
          </div>

          <div style="margin-bottom: 20px;">
            <h3 style="color: #374151;">Line Items</h3>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
              <thead>
                <tr style="background: #f3f4f6;">
                  <th style="padding: 10px; text-align: left; border: 1px solid #e5e7eb;">Description</th>
                  <th style="padding: 10px; text-align: center; border: 1px solid #e5e7eb;">Qty</th>
                  <th style="padding: 10px; text-align: right; border: 1px solid #e5e7eb;">Unit Price</th>
                  <th style="padding: 10px; text-align: right; border: 1px solid #e5e7eb;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.line_items?.map(item => `
                  <tr>
                    <td style="padding: 10px; border: 1px solid #e5e7eb;">${item.description}</td>
                    <td style="padding: 10px; text-align: center; border: 1px solid #e5e7eb;">${item.quantity}</td>
                    <td style="padding: 10px; text-align: right; border: 1px solid #e5e7eb;">$${item.unit_price?.toFixed(2)}</td>
                    <td style="padding: 10px; text-align: right; border: 1px solid #e5e7eb;">$${(item.quantity * item.unit_price)?.toFixed(2)}</td>
                  </tr>
                `).join('') || ''}
              </tbody>
            </table>
          </div>

          <div style="text-align: right; margin-bottom: 20px;">
            <p style="margin: 5px 0;"><strong>Subtotal: $${invoice.subtotal?.toFixed(2) || '0.00'}</strong></p>
            <p style="margin: 5px 0;"><strong>Tax: $${invoice.tax_amount?.toFixed(2) || '0.00'}</strong></p>
            <p style="margin: 10px 0; font-size: 18px; color: #059669;"><strong>Total: $${invoice.total_amount?.toFixed(2) || '0.00'}</strong></p>
          </div>

          ${invoice.notes ? `
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border: 1px solid #f59e0b; margin-bottom: 20px;">
              <h4 style="color: #92400e; margin-top: 0;">Additional Notes:</h4>
              <p style="color: #92400e; margin-bottom: 0;">${invoice.notes}</p>
            </div>
          ` : ''}

          <div style="margin-bottom: 20px;">
            <p style="color: #374151; margin-bottom: 10px;">${customMessage}</p>
            ${showAdditionalMessage && additionalMessage ? `
              <p style="color: #6b7280; font-style: italic; margin-bottom: 10px;">${additionalMessage}</p>
            ` : ''}
          </div>

          <div style="background: #f3f4f6; padding: 30px; border-radius: 10px; text-align: center;">
            <p style="margin-bottom: 20px; font-size: 16px; color: #374151;">Payment Information:</p>
            <p style="margin-bottom: 10px; color: #374151;">Please remit payment by ${invoice.due_date ? format(new Date(invoice.due_date), 'MMM d, yyyy') : 'the due date'}.</p>
            <p style="margin-bottom: 20px; color: #374151;">Contact us for payment arrangements or questions.</p>
            <a href="${paymentUrl}" style="background: #059669; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              💳 VIEW INVOICE DETAILS
            </a>
          </div>
        </div>
      </div>
    `;
  };

  const generateSMSContent = () => {
    const baseUrl = window.location.origin;
    const paymentUrl = `${baseUrl}${createPageUrl('InvoicePayment')}?id=${invoice.id}`;

    let message = `Cool Tech Designs - Invoice #${invoice.invoice_number}\n`;
    message += `Amount Due: $${invoice.total_amount?.toFixed(2) || '0.00'}\n`;
    if (invoice.due_date) {
      message += `Due Date: ${format(new Date(invoice.due_date), 'MMM d, yyyy')}\n`;
    }
    message += `\n${customMessage}\n\n`;
    
    if (showAdditionalMessage && additionalMessage) {
      message += `${additionalMessage}\n\n`;
    }
    
    message += `View Details: ${paymentUrl}`;

    return message;
  };

  const handleSend = async () => {
    if (method === 'email' && !recipientEmail) {
      alert('Please enter a valid email address');
      return;
    }

    if (method === 'sms' && !recipientPhone) {
      alert('Please enter a valid phone number');
      return;
    }

    setIsSending(true);
    try {
      if (method === 'email') {
        const htmlContent = generateInvoiceContent();
        
        await SendEmail({
          from_name: "Cool Tech Designs",
          to: recipientEmail,
          subject: `Invoice #${invoice.invoice_number} - Cool Tech Designs`,
          body: htmlContent
        });
        
        alert(`Invoice email sent successfully to ${recipientEmail}!`);
      } else if (method === 'sms') {
        const smsContent = generateSMSContent();
        await InvokeLLM({
          prompt: `Send an SMS message to ${recipientPhone} with the following content: ${smsContent}`,
          add_context_from_internet: false
        });
        alert('Invoice sent successfully via SMS!');
      }
      
      onSent();
    } catch (error) {
      console.error('Error sending invoice:', error);
      alert(`Failed to send invoice via ${method}. Please try again.`);
    }
    setIsSending(false);
  };

  return (
    <div className="w-full max-w-2xl max-h-[90vh] flex flex-col">
      <Card className="border-0 shadow-2xl bg-white flex-1 flex-col flex">
        <CardHeader className="border-b flex flex-row justify-between items-center flex-shrink-0">
          <CardTitle className="text-lg lg:text-xl font-bold">Send Invoice</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        <CardContent className="p-4 lg:p-6 space-y-4 lg:space-y-6 flex-1 overflow-y-auto">
          <div className="space-y-4">
            <div>
              <Label className="text-sm lg:text-base">Send Method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </div>
                  </SelectItem>
                  <SelectItem value="sms">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      SMS
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {method === 'email' && (
              <div>
                <Label className="text-sm lg:text-base">Client Email</Label>
                <Input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="client@example.com"
                  required
                />
              </div>
            )}

            {method === 'sms' && (
              <div>
                <Label className="text-sm lg:text-base">Phone Number</Label>
                <Input
                  type="tel"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  required
                />
              </div>
            )}

            <div>
              <Label className="text-sm lg:text-base">Message</Label>
              <Textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Enter your message to the client..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm lg:text-base">Additional Message</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdditionalMessage(!showAdditionalMessage)}
                >
                  {showAdditionalMessage ? (
                    <>
                      <Minus className="w-4 h-4 mr-1" />
                      Remove
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-1" />
                      Add Message
                    </>
                  )}
                </Button>
              </div>
              
              {showAdditionalMessage && (
                <Textarea
                  value={additionalMessage}
                  onChange={(e) => setAdditionalMessage(e.target.value)}
                  placeholder="Add any additional context or special instructions..."
                  rows={2}
                />
              )}
            </div>

            <div className="bg-slate-50 p-3 lg:p-4 rounded-lg">
              <h4 className="font-semibold text-slate-700 mb-2 text-sm lg:text-base">Preview:</h4>
              <p className="text-xs lg:text-sm text-slate-600">
                Invoice #{invoice.invoice_number} for ${invoice.total_amount?.toFixed(2) || '0.00'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Recipients will receive payment instructions and details
              </p>
            </div>
          </div>
        </CardContent>
        <div className="border-t p-4 lg:p-6 flex justify-end gap-3 flex-shrink-0">
          <Button variant="outline" onClick={onClose} disabled={isSending} className="text-sm lg:text-base">
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={isSending} className="bg-blue-600 hover:bg-blue-700 text-sm lg:text-base">
            {isSending ? (
              <>Sending...</>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send {method === 'email' ? 'Email' : 'SMS'}
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
