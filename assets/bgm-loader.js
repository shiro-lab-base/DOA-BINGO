

async function loadProtectedBgm(audio, track) {

  if (audio.dataset.bgmTrack === track && audio.src) return;

  if (!audio._bgmPromise) {

    audio._bgmPromise = (async () => {

      const res = await fetch(

        '/api/bgm?track=' + encodeURIComponent(track),

        { cache: 'no-store' }

      );

      if (!res.ok) {

        throw new Error('BGM fetch failed: ' + res.status);

      }

      const hex = res.headers.get('X-Bgm-Key');

      if (!hex || !/^[a-f0-9]{64}$/i.test(hex)) {

        throw new Error('BGM key unavailable');

      }

      const keyBytes = Uint8Array.from(

        hex.match(/.{2}/g),

        n => parseInt(n, 16)

      );

      const bytes = new Uint8Array(await res.arrayBuffer());

      const key = await crypto.subtle.importKey(

        'raw',

        keyBytes,

        'AES-GCM',

        false,

        ['decrypt']

      );

      const raw = await crypto.subtle.decrypt(

        {

          name: 'AES-GCM',

          iv: bytes.slice(0, 12)

        },

        key,

        bytes.slice(12)

      );

      const url = URL.createObjectURL(

        new Blob([raw], { type: 'audio/mpeg' })

      );

      audio.src = url;

      audio.dataset.bgmTrack = track;

      audio.load();

    })();

  }

  try {

    await audio._bgmPromise;

  } catch (e) {

    audio._bgmPromise = null;

    throw e;

  }

}
