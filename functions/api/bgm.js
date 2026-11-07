

export async function onRequestGet({ request, env }) {

  const track = new URL(request.url).searchParams.get('track');

  if (track !== 'db' && track !== 'dtg') {

    return new Response('Not found', { status: 404 });

  }

  const object = await env.BGM_BUCKET.get(track + '.bin');

  const key = track === 'db'

    ? env.BGM_KEY_DB

    : env.BGM_KEY_DTG;

  if (!object || !key) {

    return new Response('BGM not configured', { status: 404 });

  }

  return new Response(object.body, {

    headers: {

      'Content-Type': 'application/octet-stream',

      'Cache-Control': 'no-store',

      'X-Bgm-Key': key,

      'X-Content-Type-Options': 'nosniff'

    }

  });

}
