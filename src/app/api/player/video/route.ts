
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { CookieJar } from 'tough-cookie';
import { wrapper } from 'axios-cookiejar-support';

export async function GET(req: NextRequest) {
  const dataContent = req.nextUrl.searchParams.get('query');

  if (!dataContent) {
    return NextResponse.json({ error: 'Parameter query (data-content) wajib diisi.' }, { status: 400 });
  }

  try {
    const jar = new CookieJar();
    const client = wrapper(axios.create({ jar }));
    const url = `https://otakudesu.cloud/v/${dataContent}`;
    
    const response = await client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://otakudesu.cloud/',
      },
    });

    const html = response.data;
    const $ = cheerio.load(html);

    const iframeSrc = $('iframe').attr('src');
    if (!iframeSrc) {
        return NextResponse.json({ error: 'Player iframe tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json({ player: iframeSrc });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({
      error: 'Gagal mengambil data video player',
      detail: message
    }, { status: 500 });
  }
}

    