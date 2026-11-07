

/* DTG SETTINGS: CPU / VS 共通 */

(() => {

  const screen = document.getElementById('settingsScreen');

  const container = screen?.querySelector('.container');

  const audio = document.getElementById('bgm');

  if (!container || !audio) return;

  const box = id =>

    document.getElementById(id)?.closest('.setting-box');

  const gameBoxes = [

    'gameMode', 'aliveCount', 'diceMode'

  ].map(box);

  const penaltyBox =

    document.getElementById('dtgPenaltyType')?.closest('div');

  const penaltyWrapper = penaltyBox?.parentElement;

  const deadBox = box('deadPenalty');

  const openedBox = box('openedPenalty');

  const startButton =

    document.getElementById('setupStartButton');

  if (gameBoxes.some(x => !x) || !penaltyWrapper ||

      !deadBox || !openedBox || !startButton) return;

  const heading = Array.from(container.children).find(

    el => el.tagName === 'H2' &&

      el.textContent.trim() === 'PENALTY'

  );

  const style = document.createElement('style');

  style.textContent = `

    #settingsScreen .dtg-accordion {

      margin-top:14px;

      border:1px solid rgba(60,45,20,.35);

      border-radius:9px;

      background:rgba(100,70,35,.12);

      text-align:left;

      overflow:hidden;

    }

    #settingsScreen .dtg-accordion > summary {

      cursor:pointer;

      list-style:none;

      padding:18px 15px;

      color:#fff;

      font-size:clamp(17px,4.2vw,22px);

      font-weight:800;

      letter-spacing:3px;

      display:flex;

      justify-content:space-between;

      align-items:center;

    }

    #settingsScreen .dtg-accordion > summary::-webkit-details-marker {

      display:none;

    }

    #settingsScreen .dtg-accordion > summary::after {

      content:'+';

      font-size:28px;

    }

    #settingsScreen .dtg-accordion[open] > summary::after {

      content:'−';

    }

    #settingsScreen .dtg-accordion-body {

      padding:0 14px 18px;

    }

    #settingsScreen .dtg-accordion-body > .setting-box:first-child {

      margin-top:10px;

    }

    #settingsScreen .dtg-sound-row {

      display:flex;

      align-items:center;

      justify-content:space-between;

      padding:14px 0;

      color:#15110c;

      font-weight:bold;

    }

    #settingsScreen .dtg-sound-row input {

      width:22px;

      height:22px;

      accent-color:#181818;

    }

    #settingsScreen #dtgBgmPlay {

      width:100%;

      min-height:46px;

      background:#1c1c1c;

      border:1px solid #666;

      color:#fff;

      border-radius:8px;

      font-weight:bold;

    }

    #settingsScreen #dtgBgmStatus {

      min-height:18px;

      margin-top:9px;

      color:#20160e;

      font-size:13px;

    }

  `;

  document.head.appendChild(style);

  function makeAccordion(name, before) {

    const details = document.createElement('details');

    details.className = 'dtg-accordion';

    const summary = document.createElement('summary');

    summary.textContent = name;

    details.appendChild(summary);

    const body = document.createElement('div');

    body.className = 'dtg-accordion-body';

    details.appendChild(body);

    container.insertBefore(details, before);

    return body;

  }

  const title = container.querySelector('h1');

  if (title) title.textContent = 'GAME SETTINGS';

  const gameBody = makeAccordion('GAME', gameBoxes[0]);

  gameBoxes.forEach(el => gameBody.appendChild(el));

  const penaltyBody = makeAccordion(

    'PENALTY', heading || penaltyWrapper

  );

  if (heading) heading.remove();

  [penaltyWrapper, deadBox, openedBox].forEach(

    el => penaltyBody.appendChild(el)

  );

  const soundBody = makeAccordion('SOUND', startButton);

  soundBody.innerHTML = `

    <label class="dtg-sound-row" for="dtgBgmEnabled">

      BGM <input id="dtgBgmEnabled" type="checkbox" checked>

    </label>

    <label class="dtg-sound-row" for="dtgSeEnabled">

      SE <input id="dtgSeEnabled" type="checkbox" checked>

    </label>

    <button type="button" id="dtgBgmPlay">PLAY BGM</button>

    <div id="dtgBgmStatus" aria-live="polite"></div>

  `;

  const bgmEnabled = document.getElementById('dtgBgmEnabled');

  const seEnabled = document.getElementById('dtgSeEnabled');

  const playButton = document.getElementById('dtgBgmPlay');

  const status = document.getElementById('dtgBgmStatus');

  const soundKey = 'dtg-sound-settings-v1';

  try {

    const saved = JSON.parse(

      localStorage.getItem(soundKey) || 'null'

    );

    if (saved) {

      bgmEnabled.checked = saved.bgm !== false;

      seEnabled.checked = saved.se !== false;

    }

  } catch (err) {

    console.warn('DTG SOUND restore:', err);

  }

  const effects = Array.from(

    document.querySelectorAll('audio')

  ).filter(el => el !== audio);

  function applySound() {

    audio.muted = !bgmEnabled.checked;

    effects.forEach(el => {

      el.muted = !seEnabled.checked;

    });

    if (!bgmEnabled.checked) {

      audio.pause();

      status.textContent = 'BGM OFF';

    }

    try {

      localStorage.setItem(

        soundKey,

        JSON.stringify({

          bgm: bgmEnabled.checked,

          se: seEnabled.checked

        })

      );

    } catch (err) {

      console.warn('DTG SOUND save:', err);

    }

  }

  applySound();

  const ready = loadProtectedBgm(audio, 'dtg')

    .catch(err => {

      status.textContent = 'BGM LOAD ERROR';

      console.error('DTG BGM load:', err);

      throw err;

    });

  ready.catch(() => {});

  let firstSettingsPlay = false;

  function playFromTap() {

    if (!bgmEnabled.checked) return;

    if (audio.src) {

      const p = audio.play();

      if (p) {

        p.then(() => {

          status.textContent = 'BGM PLAYING';

        }).catch(err => {

          status.textContent = 'BGM: TAP PLAY BGM';

          console.warn('DTG BGM playback:', err);

        });

      }

    } else {

      status.textContent = 'BGM LOADING — TAP PLAY BGM';

    }

  }

  screen.addEventListener('click', event => {

    if (event.target.closest('#backTitleButton')) return;

    if (event.target.closest('#dtgBgmPlay')) return;

    if (event.target.closest('#dtgBgmEnabled')) return;

    if (firstSettingsPlay || !bgmEnabled.checked) return;

    firstSettingsPlay = true;

    playFromTap();

  }, true);

  playButton.addEventListener('click', () => {

    firstSettingsPlay = true;

    playFromTap();

  });

  bgmEnabled.addEventListener('change', () => {

    applySound();

    if (bgmEnabled.checked) {

      firstSettingsPlay = true;

      playFromTap();

    } else {

      firstSettingsPlay = false;

    }

  });

  seEnabled.addEventListener('change', applySound);

})();
