import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Edit2, Save, User, Github, Linkedin, Twitter, Globe, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DeveloperInfo {
  id: string;
  developer_name: string;
  github_url: string;
  linkedin_url: string;
  twitter_url: string;
  website_url: string;
}

const socialLinks = [
  { key: 'github_url' as const, icon: Github, label: 'GitHub', placeholder: 'https://github.com/username' },
  { key: 'linkedin_url' as const, icon: Linkedin, label: 'LinkedIn', placeholder: 'https://linkedin.com/in/username' },
  { key: 'twitter_url' as const, icon: Twitter, label: 'Twitter / X', placeholder: 'https://x.com/username' },
  { key: 'website_url' as const, icon: Globe, label: 'Website', placeholder: 'https://yoursite.com' },
];

export function DeveloperSection() {
  const [info, setInfo] = useState<DeveloperInfo | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<DeveloperInfo>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInfo();
  }, []);

  const fetchInfo = async () => {
    const { data, error } = await supabase
      .from('developer_info')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      setInfo(data as DeveloperInfo);
      setEditData(data as DeveloperInfo);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!info?.id) return;

    const name = (editData.developer_name || '').trim();
    if (!name || name.length > 100) {
      toast.error('Name must be between 1 and 100 characters');
      return;
    }

    // Validate URLs
    for (const link of socialLinks) {
      const val = (editData[link.key] || '').trim();
      if (val && !val.startsWith('https://')) {
        toast.error(`${link.label} URL must start with https://`);
        return;
      }
    }

    const { error } = await supabase
      .from('developer_info')
      .update({
        developer_name: name,
        github_url: (editData.github_url || '').trim(),
        linkedin_url: (editData.linkedin_url || '').trim(),
        twitter_url: (editData.twitter_url || '').trim(),
        website_url: (editData.website_url || '').trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', info.id);

    if (error) {
      toast.error('Failed to save');
    } else {
      toast.success('Developer info saved');
      setIsEditing(false);
      fetchInfo();
    }
  };

  if (loading) {
    return (
      <div className="card-space rounded-xl p-6 animate-pulse">
        <div className="h-6 bg-muted rounded w-1/3 mb-4" />
        <div className="h-10 bg-muted rounded w-1/2" />
      </div>
    );
  }

  if (!info) return null;

  const activeSocials = socialLinks.filter((s) => info[s.key]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className="card-space rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-orbitron text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Developed By
          </h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (isEditing) {
              setEditData(info);
            }
            setIsEditing(!isEditing);
          }}
          className="h-8 w-8 p-0 hover:bg-primary/20"
        >
          {isEditing ? <X className="w-4 h-4 text-muted-foreground" /> : <Edit2 className="w-4 h-4 text-primary" />}
        </Button>
      </div>

      <div className="p-5 space-y-5">
        {/* Developer Name Sub-section */}
        <div className="bg-background/40 border border-border/50 rounded-lg p-4">
          <p className="text-xs font-orbitron text-muted-foreground uppercase tracking-wider mb-2">Developer Name</p>
          {isEditing ? (
            <Input
              value={editData.developer_name || ''}
              onChange={(e) => setEditData({ ...editData, developer_name: e.target.value })}
              className="bg-background/50 border-primary/30 focus-visible:ring-primary"
              placeholder="Enter developer name"
              maxLength={100}
            />
          ) : (
            <p className="text-lg font-semibold text-foreground">{info.developer_name}</p>
          )}
        </div>

        {/* Social Media Links Sub-section */}
        <div className="bg-background/40 border border-border/50 rounded-lg p-4">
          <p className="text-xs font-orbitron text-muted-foreground uppercase tracking-wider mb-3">Social Links</p>

          {isEditing ? (
            <div className="space-y-3">
              {socialLinks.map((link) => (
                <div key={link.key} className="flex items-center gap-2">
                  <link.icon className="w-4 h-4 text-muted-foreground shrink-0" />
                  <Input
                    value={editData[link.key] || ''}
                    onChange={(e) => setEditData({ ...editData, [link.key]: e.target.value })}
                    className="bg-background/50 border-primary/30 focus-visible:ring-primary text-sm"
                    placeholder={link.placeholder}
                  />
                </div>
              ))}
            </div>
          ) : activeSocials.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {activeSocials.map((link) => (
                <a
                  key={link.key}
                  href={info[link.key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 hover:bg-primary/20 hover:border-primary/40 transition-all text-sm text-foreground"
                >
                  <link.icon className="w-3.5 h-3.5 text-primary" />
                  {link.label}
                </a>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">No social links added yet</p>
          )}
        </div>

        {/* Save Button */}
        {isEditing && (
          <Button onClick={handleSave} className="w-full gap-2" variant="default">
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        )}
      </div>
    </motion.div>
  );
}
