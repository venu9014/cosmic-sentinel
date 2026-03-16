import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Edit2, Save, User, Github, Linkedin, Twitter, Globe, X, Plus, Trash2 } from 'lucide-react';
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

const socialIcons = [
  { key: 'github_url' as const, icon: Github, label: 'GitHub', placeholder: 'https://github.com/username' },
  { key: 'linkedin_url' as const, icon: Linkedin, label: 'LinkedIn', placeholder: 'https://linkedin.com/in/username' },
  { key: 'twitter_url' as const, icon: Twitter, label: 'X', placeholder: 'https://x.com/username' },
  { key: 'website_url' as const, icon: Globe, label: 'Web', placeholder: 'https://yoursite.com' },
];

export function DeveloperSection() {
  const [developers, setDevelopers] = useState<DeveloperInfo[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<DeveloperInfo>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDevelopers();
  }, []);

  const fetchDevelopers = async () => {
    const { data, error } = await supabase
      .from('developer_info')
      .select('*')
      .order('created_at', { ascending: true });

    if (!error && data) {
      setDevelopers(data as DeveloperInfo[]);
    }
    setLoading(false);
  };

  const handleAdd = async () => {
    try {
      const { error } = await supabase
        .from('developer_info')
        .insert({ developer_name: 'New Developer' });

      if (error) {
        console.error('Add developer error:', error);
        toast.error(`Failed to add developer: ${error.message}`);
      } else {
        toast.success('Developer added');
        fetchDevelopers();
      }
    } catch (err: any) {
      console.error('Network error adding developer:', err);
      toast.error('Network error — please try again');
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('developer_info')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete');
    } else {
      toast.success('Developer removed');
      if (editingId === id) setEditingId(null);
      fetchDevelopers();
    }
  };

  const handleSave = async () => {
    if (!editingId) return;

    const name = (editData.developer_name || '').trim();
    if (!name || name.length > 100) {
      toast.error('Name must be between 1 and 100 characters');
      return;
    }

    for (const link of socialIcons) {
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
      .eq('id', editingId);

    if (error) {
      toast.error('Failed to save');
    } else {
      toast.success('Saved');
      setEditingId(null);
      fetchDevelopers();
    }
  };

  const startEdit = (dev: DeveloperInfo) => {
    setEditingId(dev.id);
    setEditData(dev);
  };

  if (loading) {
    return (
      <div className="card-space rounded-xl p-4 animate-pulse">
        <div className="h-5 bg-muted rounded w-1/3 mb-3" />
        <div className="h-8 bg-muted rounded w-1/2" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className="card-space rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-primary/20 flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-orbitron text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Developed By
          </h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAdd}
          className="h-7 px-2 text-xs gap-1 hover:bg-primary/20"
        >
          <Plus className="w-3 h-3" />
          Add
        </Button>
      </div>

      <div className="p-3 space-y-2">
        {developers.length === 0 && (
          <p className="text-xs text-muted-foreground italic text-center py-3">No developers added yet</p>
        )}

        {developers.map((dev) => (
          <div key={dev.id} className="bg-background/40 border border-border/50 rounded-lg p-3">
            {editingId === dev.id ? (
              /* Edit mode */
              <div className="space-y-2">
                <Input
                  value={editData.developer_name || ''}
                  onChange={(e) => setEditData({ ...editData, developer_name: e.target.value })}
                  className="bg-background/50 border-primary/30 focus-visible:ring-primary h-8 text-sm"
                  placeholder="Developer name"
                  maxLength={100}
                />
                <div className="grid grid-cols-2 gap-2">
                  {socialIcons.map((link) => (
                    <div key={link.key} className="flex items-center gap-1.5">
                      <link.icon className="w-3 h-3 text-muted-foreground shrink-0" />
                      <Input
                        value={editData[link.key] || ''}
                        onChange={(e) => setEditData({ ...editData, [link.key]: e.target.value })}
                        className="bg-background/50 border-primary/30 focus-visible:ring-primary h-7 text-xs"
                        placeholder={link.placeholder}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSave} size="sm" className="h-7 text-xs gap-1 flex-1">
                    <Save className="w-3 h-3" /> Save
                  </Button>
                  <Button
                    onClick={() => setEditingId(null)}
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs gap-1"
                  >
                    <X className="w-3 h-3" /> Cancel
                  </Button>
                </div>
              </div>
            ) : (
              /* Display mode */
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-sm font-semibold text-foreground truncate">{dev.developer_name}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {socialIcons.map((link) =>
                      dev[link.key] ? (
                        <a
                          key={link.key}
                          href={dev[link.key]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 hover:bg-primary/20 hover:border-primary/40 transition-all flex items-center justify-center"
                          title={link.label}
                        >
                          <link.icon className="w-3 h-3 text-primary" />
                        </a>
                      ) : null
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEdit(dev)}
                    className="h-6 w-6 p-0 hover:bg-primary/20"
                  >
                    <Edit2 className="w-3 h-3 text-primary" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(dev.id)}
                    className="h-6 w-6 p-0 hover:bg-destructive/20"
                  >
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
