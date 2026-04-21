'use client';

import { useState } from 'react';
import { Listing } from '@/types/listing';
import PhotoUpload from './PhotoUpload';
import MLSImport from './MLSImport';

type FormData = Omit<Listing, 'id' | 'slug' | 'createdAt' | 'updatedAt'>;

interface ListingFormProps {
  initial?: Partial<FormData>;
  onSave: (data: FormData) => Promise<void>;
  onCancel: () => void;
  isEdit?: boolean;
}

const PROPERTY_TYPES = ['Single Family', 'Condo', 'Townhouse', 'Multi-Family', 'Land', 'Commercial', 'Mobile Home', 'Other'];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-gray-200 rounded-xl p-6">
      <h3 className="text-base font-semibold mb-4" style={{ color: '#1a2744' }}>{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent";
const selectCls = `${inputCls} bg-white`;

export default function ListingForm({ initial, onSave, onCancel, isEdit }: ListingFormProps) {
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'details' | 'photos' | 'agent'>('basic');
  const [form, setForm] = useState<FormData>({
    status: 'draft',
    address: '',
    city: '',
    state: '',
    zip: '',
    neighborhood: '',
    county: '',
    price: 0,
    propertyType: 'Single Family',
    listingType: 'For Sale',
    bedrooms: 0,
    bathrooms: 0,
    halfBathrooms: undefined,
    sqft: 0,
    lotSize: '',
    yearBuilt: undefined,
    garage: '',
    stories: undefined,
    description: '',
    features: [],
    photos: [],
    virtualTourUrl: '',
    videoUrl: '',
    latitude: undefined,
    longitude: undefined,
    agentName: '',
    agentPhone: '',
    agentEmail: '',
    agentPhoto: '',
    agentTeam: '',
    brokerageName: '',
    schedulingUrl: '',
    mlsNumber: '',
    elementarySchool: '',
    middleSchool: '',
    highSchool: '',
    hoaFee: undefined,
    hoaFrequency: '',
    annualTaxes: undefined,
    ...initial,
  });

  const set = (field: keyof FormData, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleMLSImport = (data: Record<string, string>) => {
    setForm((prev) => ({
      ...prev,
      address: data.address || prev.address,
      city: data.city || prev.city,
      state: data.state || prev.state,
      zip: data.zip || prev.zip,
      neighborhood: data.neighborhood || prev.neighborhood,
      county: data.county || prev.county,
      price: data.price ? parseFloat(data.price.replace(/[^0-9.]/g, '')) : prev.price,
      propertyType: data.propertyType || prev.propertyType,
      bedrooms: data.bedrooms ? parseInt(data.bedrooms) : prev.bedrooms,
      bathrooms: data.bathrooms ? parseFloat(data.bathrooms) : prev.bathrooms,
      halfBathrooms: data.halfBathrooms ? parseInt(data.halfBathrooms) : prev.halfBathrooms,
      sqft: data.sqft ? parseInt(data.sqft.replace(/[^0-9]/g, '')) : prev.sqft,
      lotSize: data.lotSize || prev.lotSize,
      yearBuilt: data.yearBuilt ? parseInt(data.yearBuilt) : prev.yearBuilt,
      garage: data.garage || prev.garage,
      stories: data.stories ? parseInt(data.stories) : prev.stories,
      description: data.description || prev.description,
      agentName: data.agentName || prev.agentName,
      agentPhone: data.agentPhone || prev.agentPhone,
      agentEmail: data.agentEmail || prev.agentEmail,
      agentTeam: data.agentTeam || prev.agentTeam,
      brokerageName: data.brokerageName || prev.brokerageName,
      mlsNumber: data.mlsNumber || prev.mlsNumber,
      elementarySchool: data.elementarySchool || prev.elementarySchool,
      middleSchool: data.middleSchool || prev.middleSchool,
      highSchool: data.highSchool || prev.highSchool,
      hoaFee: data.hoaFee ? parseFloat(data.hoaFee.replace(/[^0-9.]/g, '')) : prev.hoaFee,
      annualTaxes: data.annualTaxes ? parseFloat(data.annualTaxes.replace(/[^0-9.]/g, '')) : prev.annualTaxes,
      latitude: data.latitude ? parseFloat(data.latitude) : prev.latitude,
      longitude: data.longitude ? parseFloat(data.longitude) : prev.longitude,
    }));
    setActiveTab('basic');
    alert('MLS data imported! Please review and fill in any missing fields.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'basic', label: 'Address & Price' },
    { id: 'details', label: 'Details' },
    { id: 'photos', label: `Photos (${form.photos.length})` },
    { id: 'agent', label: 'Agent Info' },
  ] as const;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* MLS Import */}
      <div>
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Quick Import</p>
        <MLSImport onImport={handleMLSImport} />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition ${
                activeTab === tab.id
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'basic' && (
        <div className="space-y-6">
          <Section title="Status & Type">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Field label="Status" required>
                <select className={selectCls} value={form.status} onChange={(e) => set('status', e.target.value)}>
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="sold">Sold</option>
                </select>
              </Field>
              <Field label="Listing Type" required>
                <select className={selectCls} value={form.listingType} onChange={(e) => set('listingType', e.target.value as Listing['listingType'])}>
                  <option>For Sale</option>
                  <option>For Rent</option>
                  <option>Sold</option>
                </select>
              </Field>
              <Field label="Property Type">
                <select className={selectCls} value={form.propertyType} onChange={(e) => set('propertyType', e.target.value)}>
                  {PROPERTY_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </Field>
            </div>
          </Section>

          <Section title="Address">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Street Address" required>
                <input className={inputCls} value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="123 Main Street" required />
              </Field>
              <Field label="Neighborhood / Subdivision">
                <input className={inputCls} value={form.neighborhood || ''} onChange={(e) => set('neighborhood', e.target.value)} placeholder="Savannah Court" />
              </Field>
              <Field label="City" required>
                <input className={inputCls} value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="Atlanta" required />
              </Field>
              <Field label="State" required>
                <input className={inputCls} value={form.state} onChange={(e) => set('state', e.target.value)} placeholder="GA" maxLength={2} required />
              </Field>
              <Field label="ZIP Code" required>
                <input className={inputCls} value={form.zip} onChange={(e) => set('zip', e.target.value)} placeholder="30301" required />
              </Field>
              <Field label="County">
                <input className={inputCls} value={form.county || ''} onChange={(e) => set('county', e.target.value)} placeholder="Fulton County" />
              </Field>
            </div>
          </Section>

          <Section title="Price">
            <div className="grid grid-cols-2 gap-4">
              <Field label="List Price" required>
                <input className={inputCls} type="number" value={form.price || ''} onChange={(e) => set('price', parseFloat(e.target.value))} placeholder="450000" required />
              </Field>
              <Field label="MLS Number">
                <input className={inputCls} value={form.mlsNumber || ''} onChange={(e) => set('mlsNumber', e.target.value)} placeholder="MLS-123456" />
              </Field>
            </div>
          </Section>

          <Section title="Description">
            <Field label="Property Description">
              <textarea
                className={`${inputCls} resize-none`}
                rows={6}
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Describe this stunning property…"
              />
            </Field>
          </Section>
        </div>
      )}

      {activeTab === 'details' && (
        <div className="space-y-6">
          <Section title="Key Stats">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Field label="Bedrooms">
                <input className={inputCls} type="number" value={form.bedrooms || ''} onChange={(e) => set('bedrooms', parseInt(e.target.value))} />
              </Field>
              <Field label="Full Bathrooms">
                <input className={inputCls} type="number" step="0.5" value={form.bathrooms || ''} onChange={(e) => set('bathrooms', parseFloat(e.target.value))} />
              </Field>
              <Field label="Half Bathrooms">
                <input className={inputCls} type="number" value={form.halfBathrooms || ''} onChange={(e) => set('halfBathrooms', parseInt(e.target.value))} />
              </Field>
              <Field label="Square Feet">
                <input className={inputCls} type="number" value={form.sqft || ''} onChange={(e) => set('sqft', parseInt(e.target.value))} />
              </Field>
              <Field label="Lot Size">
                <input className={inputCls} value={form.lotSize || ''} onChange={(e) => set('lotSize', e.target.value)} placeholder="0.25 acres" />
              </Field>
              <Field label="Year Built">
                <input className={inputCls} type="number" value={form.yearBuilt || ''} onChange={(e) => set('yearBuilt', parseInt(e.target.value))} placeholder="2005" />
              </Field>
              <Field label="Garage">
                <input className={inputCls} value={form.garage || ''} onChange={(e) => set('garage', e.target.value)} placeholder="2-car attached" />
              </Field>
              <Field label="Stories">
                <input className={inputCls} type="number" value={form.stories || ''} onChange={(e) => set('stories', parseInt(e.target.value))} />
              </Field>
            </div>
          </Section>

          <Section title="Features & Amenities">
            <Field label="Features (one per line)">
              <textarea
                className={`${inputCls} resize-none`}
                rows={8}
                value={form.features.join('\n')}
                onChange={(e) => set('features', e.target.value.split('\n').filter(Boolean))}
                placeholder={`Hardwood Floors\nGranite Countertops\nStainless Appliances\nMaster on Main\nFenced Backyard\nCovered Porch`}
              />
            </Field>
          </Section>

          <Section title="Schools">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Elementary School">
                <input className={inputCls} value={form.elementarySchool || ''} onChange={(e) => set('elementarySchool', e.target.value)} />
              </Field>
              <Field label="Middle School">
                <input className={inputCls} value={form.middleSchool || ''} onChange={(e) => set('middleSchool', e.target.value)} />
              </Field>
              <Field label="High School">
                <input className={inputCls} value={form.highSchool || ''} onChange={(e) => set('highSchool', e.target.value)} />
              </Field>
            </div>
          </Section>

          <Section title="Financial Details">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Field label="HOA Fee">
                <input className={inputCls} type="number" value={form.hoaFee || ''} onChange={(e) => set('hoaFee', parseFloat(e.target.value))} placeholder="150" />
              </Field>
              <Field label="HOA Frequency">
                <select className={selectCls} value={form.hoaFrequency || ''} onChange={(e) => set('hoaFrequency', e.target.value)}>
                  <option value="">None</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annually">Annually</option>
                </select>
              </Field>
              <Field label="Annual Taxes">
                <input className={inputCls} type="number" value={form.annualTaxes || ''} onChange={(e) => set('annualTaxes', parseFloat(e.target.value))} placeholder="3200" />
              </Field>
            </div>
          </Section>

          <Section title="Map Location (optional — auto-geocodes from address)">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Latitude">
                <input className={inputCls} type="number" step="any" value={form.latitude || ''} onChange={(e) => set('latitude', parseFloat(e.target.value))} placeholder="33.7490" />
              </Field>
              <Field label="Longitude">
                <input className={inputCls} type="number" step="any" value={form.longitude || ''} onChange={(e) => set('longitude', parseFloat(e.target.value))} placeholder="-84.3880" />
              </Field>
            </div>
          </Section>

          <Section title="Virtual Tour / Video">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Virtual Tour URL">
                <input className={inputCls} type="url" value={form.virtualTourUrl || ''} onChange={(e) => set('virtualTourUrl', e.target.value)} placeholder="https://my.matterport.com/…" />
              </Field>
              <Field label="Video URL">
                <input className={inputCls} type="url" value={form.videoUrl || ''} onChange={(e) => set('videoUrl', e.target.value)} placeholder="https://youtube.com/…" />
              </Field>
            </div>
          </Section>
        </div>
      )}

      {activeTab === 'photos' && (
        <PhotoUpload photos={form.photos} onChange={(photos) => set('photos', photos)} />
      )}

      {activeTab === 'agent' && (
        <Section title="Agent Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Agent Name" required>
              <input className={inputCls} value={form.agentName} onChange={(e) => set('agentName', e.target.value)} placeholder="Jane Realtor" />
            </Field>
            <Field label="Team Name">
              <input className={inputCls} value={form.agentTeam || ''} onChange={(e) => set('agentTeam', e.target.value)} placeholder="The Smith Team" />
            </Field>
            <Field label="Brokerage Name">
              <input className={inputCls} value={form.brokerageName || ''} onChange={(e) => set('brokerageName', e.target.value)} placeholder="ABC Realty" />
            </Field>
            <Field label="Phone">
              <input className={inputCls} type="tel" value={form.agentPhone} onChange={(e) => set('agentPhone', e.target.value)} placeholder="(555) 123-4567" />
            </Field>
            <Field label="Email">
              <input className={inputCls} type="email" value={form.agentEmail} onChange={(e) => set('agentEmail', e.target.value)} placeholder="agent@brokerage.com" />
            </Field>
            <Field label="Agent Photo">
              <div className="flex items-center gap-3">
                {form.agentPhoto && (
                  <img src={form.agentPhoto} alt="Agent" className="w-14 h-14 rounded-full object-cover border border-gray-200 shrink-0" />
                )}
                <div className="flex flex-col gap-2 flex-1">
                  <label
                    className="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 transition"
                    style={{ width: 'fit-content' }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12V4m0 0L8 8m4-4l4 4" />
                    </svg>
                    Upload Photo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const formData = new FormData();
                        formData.append('files', file);
                        const res = await fetch('/api/upload', { method: 'POST', body: formData });
                        if (res.ok) {
                          const { urls } = await res.json();
                          if (urls?.[0]) set('agentPhoto', urls[0]);
                        }
                      }}
                    />
                  </label>
                  {form.agentPhoto && (
                    <button type="button" className="text-xs text-red-400 hover:text-red-600 text-left" onClick={() => set('agentPhoto', '')}>
                      Remove photo
                    </button>
                  )}
                </div>
              </div>
            </Field>
            <Field label="Scheduling / Calendly URL">
              <input
                className={inputCls}
                type="url"
                value={form.schedulingUrl || ''}
                onChange={(e) => set('schedulingUrl', e.target.value)}
                placeholder="https://calendly.com/your-name/showing"
              />
              <p className="text-xs text-gray-400 mt-1">Paste your Calendly, Cal.com, or Acuity link — visitors will book directly on the property page.</p>
            </Field>
          </div>
        </Section>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <button type="button" onClick={onCancel} className="px-6 py-2.5 text-sm text-gray-600 hover:text-gray-900 transition">
          Cancel
        </button>
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-2.5 rounded-lg text-sm font-semibold text-white transition disabled:opacity-60"
            style={{ backgroundColor: '#1a2744' }}
          >
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Listing'}
          </button>
        </div>
      </div>
    </form>
  );
}
