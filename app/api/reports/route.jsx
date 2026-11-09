import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
import { getSessionToken } from '../../../lib/auth';

export async function GET() {
  const token = getSessionToken();
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .order('time', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ reports: data ?? [] });
}

export async function POST(req) {
  const deviceKey = req.headers.get('x-device-key');
  if (deviceKey !== process.env.DEVICE_API_KEY) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const form = await req.formData();
  const time = form.get('time');
  const status = form.get('status');
  const image = form.get('image');

  if (!time || !status || !image) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const buffer = Buffer.from(await image.arrayBuffer());
  const fileName = `reports/${Date.now()}_${image.name.replace(/\s+/g, '_')}`;

  const { error: upErr } = await supabase.storage
    .from('reports')
    .upload(fileName, buffer, { contentType: image.type, cacheControl: '3600' });

  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  const { data: pub } = supabase.storage.from('reports').getPublicUrl(fileName);

  const { error: dbErr } = await supabase
    .from('reports')
    .insert({ time, status, image_url: pub.publicUrl });

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });

  return NextResponse.json({ ok: true, imageUrl: pub.publicUrl });
}
