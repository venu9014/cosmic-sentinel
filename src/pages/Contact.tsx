import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mail, Phone, User, AtSign, FileText, MessageSquare, Rocket, Satellite, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

function FloatingAsteroid({ delay, x, y, size }: { delay: number; x: string; y: string; size: number }) {
  return (
    <motion.div
      className="absolute rounded-full opacity-40"
      style={{
        left: x,
        top: y,
        width: size,
        height: size,
        background: `radial-gradient(circle at 30% 30%, hsl(var(--muted-foreground) / 0.6), hsl(var(--muted) / 0.3))`,
        boxShadow: `0 0 ${size / 2}px hsl(var(--primary) / 0.15)`,
      }}
      animate={{
        y: [0, -15, 0, 10, 0],
        x: [0, 8, -5, 3, 0],
        rotate: [0, 45, 90, 135, 180],
      }}
      transition={{ duration: 12 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
    />
  );
}

function RadarPulse() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden opacity-20">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-primary/30"
          style={{ width: 300 + i * 200, height: 300 + i * 200 }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.05, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, delay: i * 1.2, ease: 'easeInOut' }}
        />
      ))}
      <motion.div
        className="absolute w-[2px] h-[200px] origin-bottom"
        style={{ background: 'linear-gradient(to top, hsl(var(--primary) / 0.5), transparent)' }}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

function ScanGrid() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
      <div
        className="w-full h-full"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
      <motion.div
        className="absolute left-0 right-0 h-[2px]"
        style={{ background: 'linear-gradient(90deg, transparent, hsl(var(--primary) / 0.4), transparent)' }}
        animate={{ top: ['0%', '100%'] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

export default function Contact() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    setSending(true);
    await new Promise((r) => setTimeout(r, 2000));
    setSending(false);
    setSent(true);
    toast.success('Transmission sent successfully! 🚀');
    setFormData({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setSent(false), 4000);
  };

  const asteroids = [
    { delay: 0, x: '5%', y: '10%', size: 12 },
    { delay: 2, x: '85%', y: '15%', size: 8 },
    { delay: 4, x: '15%', y: '75%', size: 16 },
    { delay: 1, x: '90%', y: '60%', size: 10 },
    { delay: 3, x: '50%', y: '5%', size: 6 },
    { delay: 5, x: '70%', y: '80%', size: 14 },
    { delay: 2.5, x: '30%', y: '90%', size: 9 },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <ScanGrid />
      <RadarPulse />
      {asteroids.map((a, i) => (
        <FloatingAsteroid key={i} {...a} />
      ))}

      {/* Orbit paths */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[400, 600, 800].map((size, i) => (
          <div
            key={i}
            className="absolute rounded-full border border-primary/5"
            style={{
              width: size,
              height: size,
              left: `calc(50% - ${size / 2}px)`,
              top: `calc(40% - ${size / 2}px)`,
            }}
          />
        ))}
      </div>

      {/* Tiny aliens hidden around */}
      <motion.div
        className="absolute text-lg opacity-30 pointer-events-none"
        style={{ right: '8%', top: '20%' }}
        animate={{ y: [0, -5, 0], rotate: [0, 10, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        👽
      </motion.div>
      <motion.div
        className="absolute text-sm opacity-20 pointer-events-none"
        style={{ left: '3%', bottom: '30%' }}
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
      >
        🛸
      </motion.div>
      <motion.div
        className="absolute text-xs opacity-25 pointer-events-none"
        style={{ right: '15%', bottom: '15%' }}
        animate={{ x: [0, 5, 0], opacity: [0.25, 0.4, 0.25] }}
        transition={{ duration: 6, repeat: Infinity }}
      >
        🛰️
      </motion.div>

      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-2">
            <Satellite className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-xs text-muted-foreground font-mono">COMM CHANNEL OPEN</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 relative"
        >
          <div className="inline-block relative">
            {/* Radar rings behind title */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {[0, 1].map((i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full border border-primary/10"
                  style={{ width: 200 + i * 100, height: 200 + i * 100 }}
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20 + i * 10, repeat: Infinity, ease: 'linear' }}
                />
              ))}
            </div>

            <Card className="backdrop-blur-xl bg-card/40 border-primary/20 p-8 relative overflow-hidden">
              <motion.div
                className="absolute -right-2 -top-2 text-3xl"
                animate={{ y: [0, -5, 0], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                👾
              </motion.div>
              <h1 className="font-orbitron text-3xl md:text-4xl font-bold text-gradient-cosmic mb-3">
                🚀 Contact Mission Control
              </h1>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Have questions about asteroid detection or our AI tracking system? Send us a message.
              </p>
            </Card>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 relative"
          >
            {/* Radar signal behind card */}
            <div className="absolute -inset-4 pointer-events-none opacity-10">
              <motion.div
                className="absolute top-1/2 left-1/2 w-[300px] h-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/30"
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </div>

            <Card className="backdrop-blur-xl bg-card/40 border-primary/20 p-6 md:p-8 relative overflow-hidden">
              <motion.div
                className="absolute right-4 top-4 text-xl opacity-40"
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                🤖
              </motion.div>

              <h2 className="font-orbitron text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Radio className="w-5 h-5 text-primary" />
                Transmission Form
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" /> Name *
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                      placeholder="Commander Name"
                      maxLength={100}
                      className="bg-background/50 border-border focus:border-primary focus:shadow-[0_0_15px_hsl(var(--primary)/0.3)] transition-shadow"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <AtSign className="w-3.5 h-3.5" /> Email *
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                      placeholder="commander@space.station"
                      maxLength={255}
                      className="bg-background/50 border-border focus:border-primary focus:shadow-[0_0_15px_hsl(var(--primary)/0.3)] transition-shadow"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Subject
                  </label>
                  <Input
                    value={formData.subject}
                    onChange={(e) => setFormData((p) => ({ ...p, subject: e.target.value }))}
                    placeholder="Mission briefing subject"
                    maxLength={200}
                    className="bg-background/50 border-border focus:border-primary focus:shadow-[0_0_15px_hsl(var(--primary)/0.3)] transition-shadow"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" /> Message *
                  </label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
                    placeholder="Describe your mission inquiry..."
                    maxLength={1000}
                    rows={5}
                    className="bg-background/50 border-border focus:border-primary focus:shadow-[0_0_15px_hsl(var(--primary)/0.3)] transition-shadow resize-none"
                  />
                  <p className="text-xs text-muted-foreground text-right">{formData.message.length}/1000</p>
                </div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    disabled={sending}
                    className="w-full gap-2 h-12 font-orbitron text-sm group relative overflow-hidden"
                    variant="cosmic"
                  >
                    <AnimatePresence mode="wait">
                      {sending ? (
                        <motion.span
                          key="sending"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex items-center gap-2"
                        >
                          <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                            🛰️
                          </motion.span>
                          Transmitting...
                        </motion.span>
                      ) : sent ? (
                        <motion.span
                          key="sent"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          ✅ Transmission Received!
                        </motion.span>
                      ) : (
                        <motion.span
                          key="default"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-2"
                        >
                          <Rocket className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                          Send Transmission
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Button>
                </motion.div>
              </form>
            </Card>
          </motion.div>

          {/* Contact Info Panel */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <h2 className="font-orbitron text-lg font-bold text-foreground flex items-center gap-2">
              <Satellite className="w-4 h-4 text-primary" />
              Signal Channels
            </h2>

            {/* Email card */}
            <motion.div whileHover={{ scale: 1.03 }}>
              <Card className="backdrop-blur-xl bg-card/40 border-primary/20 p-5 group hover:border-primary/50 hover:shadow-[0_0_20px_hsl(var(--primary)/0.2)] transition-all duration-300 relative overflow-hidden">
                <motion.span
                  className="absolute right-3 bottom-3 text-lg opacity-20 group-hover:opacity-40 transition-opacity"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  📡
                </motion.span>
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20 group-hover:shadow-[0_0_12px_hsl(var(--primary)/0.3)] transition-shadow">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Email Frequency</p>
                    <a
                      href="mailto:contactastrotrackingai@gmail.com"
                      className="text-sm text-foreground hover:text-primary transition-colors font-mono"
                    >
                      contactastrotrackingai@gmail.com
                    </a>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Phone card */}
            <motion.div whileHover={{ scale: 1.03 }}>
              <Card className="backdrop-blur-xl bg-card/40 border-primary/20 p-5 group hover:border-primary/50 hover:shadow-[0_0_20px_hsl(var(--primary)/0.2)] transition-all duration-300 relative overflow-hidden">
                <motion.span
                  className="absolute right-3 bottom-3 text-lg opacity-20 group-hover:opacity-40 transition-opacity"
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  👽
                </motion.span>
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-secondary/10 border border-secondary/20 group-hover:shadow-[0_0_12px_hsl(var(--secondary)/0.3)] transition-shadow">
                    <Phone className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Voice Channel</p>
                    <a
                      href="tel:+919014194696"
                      className="text-sm text-foreground hover:text-secondary transition-colors font-mono"
                    >
                      +91 90141 94696
                    </a>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Status card */}
            <Card className="backdrop-blur-xl bg-card/40 border-success/20 p-5 mt-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-xs font-orbitron text-success">SYSTEMS ONLINE</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Our AI tracking systems are operational 24/7. Average response time: &lt;24 Earth hours.
              </p>
            </Card>

            {/* Fun alien card */}
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Card className="backdrop-blur-xl bg-card/20 border-accent/10 p-4 text-center">
                <div className="text-3xl mb-2">👾🛸👽</div>
                <p className="text-xs text-muted-foreground italic">
                  "We come in peace... and with asteroid data."
                </p>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
