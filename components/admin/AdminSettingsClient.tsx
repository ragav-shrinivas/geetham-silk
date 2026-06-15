'use client'
import { useEffect, useState } from 'react'
import { createAdminClient as createClient } from '@/lib/supabase/admin-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Save } from 'lucide-react'

interface SiteSettings {
  name: string; tagline: string; whatsapp: string; email: string
  phone: string; address: string; instagram: string; facebook: string
}

export default function AdminSettingsClient() {
  const [settings, setSettings] = useState<SiteSettings>({
    name: 'Geetham Silks', tagline: 'Elegance Woven in Every Thread',
    whatsapp: '919677093294', email: 'geethamssilks@gmail.com',
    phone: '+91 96770 93294', address: '388, Periyar Salai, Krishna Nagar, Palavakkam, Chennai, Tamil Nadu 600041',
    instagram: 'https://www.instagram.com/geethams_silks_ecr',
    facebook: 'https://www.facebook.com/GeethamsSilks/',
  })
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase.from('settings').select('value').eq('key', 'site').single()
      if (data?.value) setSettings(data.value as SiteSettings)
    }
    load()
  }, [])

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('settings').upsert({ key: 'site', value: settings })
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function f(key: keyof SiteSettings) {
    return { value: settings[key], onChange: (e: React.ChangeEvent<HTMLInputElement>) => setSettings((p) => ({ ...p, [key]: e.target.value })) }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-[var(--brand-charcoal)]">Settings</h1>
        <Button variant="rose" size="sm" className="gap-2" onClick={handleSave} disabled={saving}>
          <Save size={14} />{saved ? 'Saved!' : saving ? 'Saving…' : 'Save Changes'}
        </Button>
      </div>

      <div className="bg-white border border-gray-100 rounded-lg p-6 space-y-5">
        <h2 className="font-medium text-gray-700 text-sm">Brand & Contact</h2>
        <div><Label>Brand Name</Label><Input className="mt-1.5" {...f('name')} /></div>
        <div><Label>Tagline</Label><Input className="mt-1.5" {...f('tagline')} /></div>
        <div><Label>WhatsApp Number (with country code, no +)</Label><Input className="mt-1.5" {...f('whatsapp')} placeholder="919677093294" /></div>
        <div><Label>Phone</Label><Input className="mt-1.5" {...f('phone')} /></div>
        <div><Label>Email</Label><Input className="mt-1.5" {...f('email')} type="email" /></div>
        <div><Label>Store Address</Label><Input className="mt-1.5" {...f('address')} /></div>
        <div><Label>Instagram URL</Label><Input className="mt-1.5" {...f('instagram')} /></div>
        <div><Label>Facebook URL</Label><Input className="mt-1.5" {...f('facebook')} /></div>
      </div>
    </div>
  )
}
