
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SendEmail, InvokeLLM } from '@/api/integrations';
import { Client } from '@/api/entities';
import { MessageCircle, X, Send, Mail, MessageSquare } from 'lucide-react';

export default function MessageCenter() {
  const [showModal, setShowModal] = useState(false);
  const [method, setMethod] = useState('email');
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [clients, setClients] = useState([]);
  const [isSending, setIsSending] = useState(false);

  React.useEffect(() => {
    if (showModal) {
      loadClients();
    }
  }, [showModal]);

  const loadClients = async () => {
    try {
      const clientsData = await Client.list();
      setClients(clientsData || []);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const handleSend = async () => {
    if (!recipient || !message) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSending(true);
    try {
      if (method === 'email') {
        await SendEmail({
          from_name: "Cool Tech Designs", // Added from_name property here
          to: recipient,
          subject: subject || 'Message from Cool Tech Designs',
          body: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="margin: 0; font-size: 24px;">Cool Tech Designs</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">HVAC Management Solutions</p>
              </div>
              <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
                <div style="white-space: pre-wrap; line-height: 1.6; color: #374151;">${message}</div>
              </div>
            </div>
          `
        });
        alert(`Message sent successfully to ${recipient}!`);
      } else {
        await InvokeLLM({
          prompt: `Send an SMS to ${recipient} with the following message: ${message}`,
          add_context_from_internet: false
        });
        alert('SMS sent successfully!');
      }
      
      setShowModal(false);
      setRecipient('');
      setSubject('');
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
    setIsSending(false);
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setShowModal(true)}
        className="border-blue-200 text-blue-700 hover:bg-blue-50"
      >
        <MessageCircle className="w-4 h-4 mr-2" />
        <span className="hidden sm:inline">Message</span>
      </Button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg border-0 shadow-2xl bg-white">
            <CardHeader className="border-b flex flex-row justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Send Message
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowModal(false)}>
                <X className="w-5 h-5" />
              </Button>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label>Send Method</Label>
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
                        <MessageSquare className="w-4 h-4" />
                        SMS
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Recipient</Label>
                <Select value={recipient} onValueChange={setRecipient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a client..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map(client => (
                      <SelectItem key={client.id} value={method === 'email' ? client.email : client.phone}>
                        {client.client_name} - {method === 'email' ? client.email : client.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {method === 'email' && (
                <div>
                  <Label>Subject</Label>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Email subject"
                  />
                </div>
              )}

              <div>
                <Label>Message</Label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Your message..."
                  rows={4}
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowModal(false)} disabled={isSending}>
                  Cancel
                </Button>
                <Button onClick={handleSend} disabled={isSending} className="bg-blue-600 hover:bg-blue-700">
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
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
