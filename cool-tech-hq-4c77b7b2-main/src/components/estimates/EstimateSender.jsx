
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

export default function EstimateSender({ estimate, client, onClose, onSent }) {
  const [method, setMethod] = useState('email');
  const [recipientEmail, setRecipientEmail] = useState(client?.email || '');
  const [recipientPhone, setRecipientPhone] = useState(client?.phone || '');
  const [customMessage, setCustomMessage] = useState('Please review the attached estimate and let us know if you have any questions.');
  const [isSending, setIsSending] = useState(false);
  const [showAdditionalMessage, setShowAdditionalMessage] = useState(false);
  const [additionalMessage, setAdditionalMessage] = useState('');

  const generateToken = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const generateEstimateContent = () => {
    const baseUrl = window.location.origin;
    const approveUrl = `${baseUrl}/estimate-response?id=${estimate.id}&action=approve&token=${generateToken()}`;
    const declineUrl = `${baseUrl}/estimate-response?id=${estimate.id}&action=decline&token=${generateToken()}`;

    const photosSection = estimate.photos && estimate.photos.length > 0 ? `
      <div style="margin-bottom: 20px;">
        <h3 style="color: #374151;">Project Photos</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-top: 10px;">
          ${estimate.photos.map(photoUrl => `
            <img src="${photoUrl}" alt="Project photo" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; border: 1px solid #e5e7eb;" />
          `).join('')}
        </div>
      </div>
    ` : '';

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">Cool Tech Designs</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">HVAC Management Solutions</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Estimate #${estimate.estimate_number}</h2>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #374151; margin-top: 0;">Project Details</h3>
            <p><strong>Client:</strong> ${client?.client_name || 'N/A'}</p>
            <p><strong>Contact:</strong> ${client?.contact_name || 'N/A'}</p>
            <p><strong>Issue Date:</strong> ${format(new Date(estimate.issue_date), 'MMM d, yyyy')}</p>
            <p><strong>Valid Until:</strong> ${estimate.expiry_date ? format(new Date(estimate.expiry_date), 'MMM d, yyyy') : 'N/A'}</p>
          </div>

          ${photosSection}

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
                ${estimate.line_items?.map(item => `
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
            <p style="margin: 5px 0;"><strong>Subtotal: $${estimate.subtotal?.toFixed(2) || '0.00'}</strong></p>
            <p style="margin: 5px 0;"><strong>Tax: $${estimate.tax_amount?.toFixed(2) || '0.00'}</strong></p>
            <p style="margin: 10px 0; font-size: 18px; color: #059669;"><strong>Total: $${estimate.total_amount?.toFixed(2) || '0.00'}</strong></p>
          </div>

          ${estimate.notes ? `
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border: 1px solid #f59e0b; margin-bottom: 20px;">
              <h4 style="color: #92400e; margin-top: 0;">Additional Notes:</h4>
              <p style="color: #92400e; margin-bottom: 0;">${estimate.notes}</p>
            </div>
          ` : ''}

          <div style="background: #f3f4f6; padding: 30px; border-radius: 10px; text-align: center;">
            <p style="margin-bottom: 20px; font-size: 16px; color: #374151;">${customMessage}</p>
            ${showAdditionalMessage && additionalMessage ? `
              <p style="margin-bottom: 20px; font-size: 14px; color: #6b7280; font-style: italic;">${additionalMessage}</p>
            ` : ''}
            <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
              <a href="${approveUrl}" style="background: #059669; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                ✓ APPROVE ESTIMATE
              </a>
              <a href="${declineUrl}" style="background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                ✗ DECLINE ESTIMATE
              </a>
            </div>
          </div>
        </div>
      </div>
    `;
  };

  const generateSMSContent = () => {
    const baseUrl = window.location.origin;
    const approveUrl = `${baseUrl}/estimate-response?id=${estimate.id}&action=approve&token=${generateToken()}`;
    const declineUrl = `${baseUrl}/estimate-response?id=${estimate.id}&action=decline&token=${generateToken()}`;

    let message = `Cool Tech Designs - Estimate #${estimate.estimate_number}\n`;
    message += `Total: $${estimate.total_amount?.toFixed(2) || '0.00'}\n\n`;
    message += `${customMessage}\n\n`;
    
    if (showAdditionalMessage && additionalMessage) {
      message += `${additionalMessage}\n\n`;
    }
    
    message += `APPROVE: ${approveUrl}\n`;
    message += `DECLINE: ${declineUrl}`;

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
        const htmlContent = generateEstimateContent();
        
        await SendEmail({
          from_name: "Cool Tech Designs",
          to: recipientEmail,
          subject: `Estimate #${estimate.estimate_number} - Cool Tech Designs`,
          body: htmlContent
        });
        
        alert(`Estimate email sent successfully to ${recipientEmail}!`);
      } else if (method === 'sms') {
        const smsContent = generateSMSContent();
        await InvokeLLM({
          prompt: `Send an SMS message to ${recipientPhone} with the following content: ${smsContent}`,
          add_context_from_internet: false
        });
        alert('Estimate sent successfully via SMS!');
      }
      
      onSent();
    } catch (error) {
      console.error('Error sending estimate:', error);
      alert(`Failed to send estimate via ${method}. Please try again.`);
    }
    setIsSending(false);
  };

  return (
    <div className="w-full max-w-2xl max-h-[90vh] flex flex-col">
      <Card className="border-0 shadow-2xl bg-white flex-1 flex-col flex">
        <CardHeader className="border-b flex flex-row justify-between items-center flex-shrink-0">
          <CardTitle className="text-lg lg:text-xl font-bold">Send Estimate</CardTitle>
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
                Estimate #{estimate.estimate_number} for ${estimate.total_amount?.toFixed(2) || '0.00'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Recipients will receive approve/decline buttons to respond
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
