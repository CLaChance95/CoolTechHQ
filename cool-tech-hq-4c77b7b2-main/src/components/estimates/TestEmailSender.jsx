import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SendEmail } from '@/api/integrations';
import { User } from '@/api/entities';
import { X, Send, TestTube } from 'lucide-react';

export default function TestEmailSender({ estimate, client, onClose }) {
  const [isSending, setIsSending] = useState(false);

  const generateToken = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const generateTestEstimateContent = () => {
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
        
        <div style="background: #fef3c7; padding: 15px; text-align: center; border: 1px solid #f59e0b;">
          <h2 style="color: #92400e; margin: 0;">⚠️ TEST EMAIL ⚠️</h2>
          <p style="color: #92400e; margin: 5px 0 0 0; font-size: 14px;">This is a test email sent to you for testing the approve/decline functionality</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Estimate #${estimate.estimate_number}</h2>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #374151; margin-top: 0;">Project Details</h3>
            <p><strong>Client:</strong> ${client?.client_name || 'Test Client'}</p>
            <p><strong>Contact:</strong> ${client?.contact_name || 'Test Contact'}</p>
            <p><strong>Issue Date:</strong> ${new Date(estimate.issue_date).toLocaleDateString()}</p>
            <p><strong>Valid Until:</strong> ${estimate.expiry_date ? new Date(estimate.expiry_date).toLocaleDateString() : 'N/A'}</p>
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
            <p style="font-size: 18px; margin: 10px 0; color: #059669;"><strong>Total: $${estimate.total_amount?.toFixed(2) || '0.00'}</strong></p>
          </div>

          <div style="text-align: center; padding: 20px; background: #f9fafb; border-radius: 8px;">
            <h3 style="color: #374151; margin-bottom: 20px;">Please respond to this estimate:</h3>
            <div style="display: inline-block;">
              <a href="${approveUrl}" style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 0 10px; font-weight: bold;">✓ APPROVE ESTIMATE</a>
              <a href="${declineUrl}" style="display: inline-block; background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 0 10px; font-weight: bold;">✗ DECLINE ESTIMATE</a>
            </div>
            <p style="margin-top: 15px; font-size: 14px; color: #6b7280;">Click one of the buttons above to respond to this estimate.</p>
          </div>
        </div>
      </div>
    `;
  };

  const handleSendTestEmail = async () => {
    setIsSending(true);
    try {
      const currentUser = await User.me();
      const htmlContent = generateTestEstimateContent();
      
      await SendEmail({
        to: currentUser.email,
        subject: `🧪 TEST - Estimate #${estimate.estimate_number} - Cool Tech Designs`,
        body: htmlContent
      });
      
      alert(`Test estimate email sent to ${currentUser.email}! Check your inbox and click the approve/decline buttons to test the functionality.`);
      onClose();
    } catch (error) {
      console.error('Error sending test email:', error);
      alert('Failed to send test email. Please try again.');
    }
    setIsSending(false);
  };

  return (
    <div className="w-full max-w-md">
      <Card className="border-0 shadow-2xl bg-white">
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            Test Email Functions
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        
        <CardContent className="p-6 space-y-4">
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-yellow-800 mb-2">Test Email Functionality</h4>
            <p className="text-sm text-yellow-700">
              This will send the estimate email to your own inbox so you can test the approve/decline buttons.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-slate-600">
              <strong>Estimate:</strong> #{estimate.estimate_number}
            </p>
            <p className="text-sm text-slate-600">
              <strong>Client:</strong> {client?.client_name || 'Unknown'}
            </p>
            <p className="text-sm text-slate-600">
              <strong>Total:</strong> ${estimate.total_amount?.toFixed(2) || '0.00'}
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSendTestEmail} 
              disabled={isSending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4 mr-2" />
              {isSending ? 'Sending...' : 'Send Test Email'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}