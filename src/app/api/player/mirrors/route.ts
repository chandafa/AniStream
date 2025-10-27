
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { CookieJar } from 'tough-cookie';
import { wrapper } from 'axios-cookiejar-support';

export async function GET(req: NextRequest) {
  const episodeUrl = req.nextUrl.searchParams.get('query');

  if (!episodeUrl) {
    return NextResponse.json({ error: 'Parameter url wajib diisi.' }, { status: 400 });
  }

  try {
    const jar = new CookieJar();
    const client = wrapper(axios.create({ jar }));
    const url = `https://otakudesu.cloud/episode/${encodeURIComponent(episodeUrl)}`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
        'referer': 'https://otakudesu.cloud/',
      },
    });
    const html = response.data;

    const $ = cheerio.load(html);

    const qualities = ['m360p', 'm480p', 'm720p'];
    const mirrors = qualities.map((className) => {
      const ul = $(`div.mirrorstream > ul.${className}`);
      const links = ul.find('li > a').map((_, el) => {
        return {
          label: $(el).text().trim(),
          data_content: $(el).attr('data-content') || null,
        };
      }).get();

      return {
        quality: className.replace('m', '') + 'p',
        mirrors: links,
      };
    });

    return NextResponse.json({ mirrors });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({
      error: 'Gagal mengambil data mirror stream',
      detail: message
    }, { status: 500 });
  }
}
