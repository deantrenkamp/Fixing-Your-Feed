/* Fixing Your Feed: shared script for all three pages. Each block runs only if its page elements exist. */
(function () {
  'use strict';

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === 'text') node.textContent = attrs[k];
        else if (k === 'class') node.className = attrs[k];
        else node.setAttribute(k, attrs[k]);
      });
    }
    (children || []).forEach(function (c) { if (c) node.appendChild(c); });
    return node;
  }

  function load(key, fallback) {
    try { var v = JSON.parse(window.localStorage.getItem(key)); return v || fallback; } catch (e) { return fallback; }
  }
  function save(key, value) {
    try { window.localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage unavailable: progress lasts for this visit only */ }
  }

  /* ---------- How Algorithms Work: platform tabs ---------- */
  var PLATFORMS = {
    tiktok: {
      name: 'TikTok',
      signals: [
        'What you do: likes, shares, comments, follows, and videos you post',
        'Video details: captions, sounds, and hashtags',
        'Device and account settings like language and country (weighted lowest)',
        'Not used: a creator’s follower count or past viral hits'
      ],
      key: 'Finishing a longer video from start to end is one of the strongest signals of interest.',
      controls: [
        ['Refresh your For You feed', 'Start over as if you just signed up (added 2023).'],
        ['Manage topics and keyword filters', 'Turn topics up or down and filter up to 200 keywords (added 2025).'],
        ['Not interested', 'Long-press a video to see less like it.']
      ],
      url: 'https://newsroom.tiktok.com/en-us/how-tiktok-recommends-videos-for-you/'
    },
    instagram: {
      name: 'Instagram',
      signals: [
        'Your activity: likes, saves, shares, and comments',
        'Your history with the account that posted',
        'How popular a post is and how fast people engage',
        'Predicted actions like lingering, sharing, or finishing a Reel'
      ],
      key: 'Feed, Stories, Explore, and Reels each rank differently. Explore and Reels lean harder on popularity.',
      controls: [
        ['Reset suggested content', 'Clears recommendations in Explore, Reels, and Feed (added 2024).'],
        ['Snooze suggested posts', 'Pauses suggestions in Feed for 30 days.'],
        ['Favorites and Following', 'Switch Feed to only accounts you choose.'],
        ['Not interested', 'Shows less of that type of suggested post.']
      ],
      url: 'https://about.instagram.com/blog/announcements/instagram-ranking-explained'
    },
    youtube: {
      name: 'YouTube',
      signals: [
        'Watch history and search history',
        'Channels you subscribe to',
        'Likes and dislikes',
        'Not interested and Don’t recommend channel feedback',
        'Satisfaction surveys about videos you watched'
      ],
      key: 'Surveys let YouTube measure whether you liked a video, not just how long you watched.',
      controls: [
        ['Pause or clear watch history', 'Removes the biggest input to your recommendations.'],
        ['Don’t recommend channel', 'Remove a whole channel from suggestions.'],
        ['Not interested', 'Flag one video you don’t want.']
      ],
      url: 'https://support.google.com/youtube/answer/16089387'
    }
  };

  var panel = document.getElementById('platform-panel');
  if (panel) {
    var CHECK_SVG = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5B3FD6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="5 12 10 17 19 7"></polyline></svg>';
    var renderPlatform = function (key) {
      var p = PLATFORMS[key];
      panel.innerHTML = '';
      panel.setAttribute('aria-labelledby', 'tab-' + key);
      var left = el('div');
      var head = el('div', { style: 'display:flex;justify-content:space-between;align-items:center;gap:8px' }, [
        el('h3', { text: 'What ' + p.name + ' tracks' }),
        el('span', { class: 'official', text: 'Official' })
      ]);
      left.appendChild(head);
      p.signals.forEach(function (s) {
        var row = el('div', { class: 'check' });
        row.innerHTML = CHECK_SVG;
        row.appendChild(el('span', { text: s }));
        left.appendChild(row);
      });
      var note = el('div', { class: 'note' }, [el('strong', { text: 'Worth knowing: ' })]);
      note.appendChild(document.createTextNode(p.key));
      left.appendChild(note);

      var right = el('div', { class: 'controls' }, [el('h3', { text: 'Controls you can use' })]);
      p.controls.forEach(function (c) {
        right.appendChild(el('div', { class: 'ctrl' }, [el('strong', { text: c[0] }), el('span', { text: c[1] })]));
      });
      right.appendChild(el('a', { href: p.url, text: 'Read ' + p.name + '’s explainer →', style: 'font-size:14px;font-weight:700;padding-top:4px' }));
      panel.appendChild(left);
      panel.appendChild(right);
    };
    var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab[data-platform]'));
    tabs.forEach(function (t) {
      t.addEventListener('click', function () {
        tabs.forEach(function (o) { o.setAttribute('aria-selected', o === t ? 'true' : 'false'); });
        renderPlatform(t.getAttribute('data-platform'));
      });
    });
    renderPlatform('tiktok');
  }

  /* ---------- Reset Guide: checklists ---------- */
  var GUIDES = {
    tiktok: { name: 'TikTok', steps: [
      { t: 'Refresh your For You feed', top: true, how: 'Profile → menu (☰) → Settings and privacy → Content preferences → Refresh your For You feed → Continue → Refresh.', why: 'TikTok says this shows your feed “as if you just signed up,” then rebuilds it from your new activity.', src: 'TikTok, 2023' },
      { t: 'Turn topics up or down', how: 'Settings and privacy → Content preferences → Manage topics. Slide topics you want less of toward “less.”', why: 'Manage Topics changes how often a topic appears without hiding it completely.', src: 'TikTok, 2025' },
      { t: 'Add keyword filters', how: 'Settings and privacy → Content preferences → Filter keywords. Add words for content you never want to see.', why: 'You can filter up to 200 keywords, and TikTok also catches similar words and slang.', src: 'TikTok, 2025' },
      { t: 'Press and hold → Not interested', how: 'When an unwanted video plays, press and hold it, then tap Not interested.', why: 'TikTok lists Not interested as a direct way to tell the feed what you don’t want.', src: 'TikTok, 2020' },
      { t: 'Unfollow accounts you always skip', how: 'Profile → Following. Remove accounts you scroll past.', why: 'Follows are one of the interactions TikTok uses to recommend videos.', src: 'TikTok, 2020' },
      { t: 'Swipe past what you don’t want', how: 'Don’t let unwanted videos play to the end. Swipe right away.', why: 'Finishing a video is a strong interest signal, and lingering alone trained the WSJ’s bots.', src: 'TikTok 2020; WSJ 2021' }
    ] },
    instagram: { name: 'Instagram', steps: [
      { t: 'Reset suggested content', top: true, how: 'Profile → menu (☰) → under “What you see,” Content preferences → Reset suggested content → Next.', why: 'Clears your recommendations in Explore, Reels, and Feed so they start over.', src: 'Instagram, 2024' },
      { t: 'Review who you follow', how: 'During the reset, Instagram shows the accounts you follow. Unfollow the ones you no longer want.', why: 'Your history with an account is a top ranking signal in Feed, Stories, and Reels.', src: 'Instagram, 2023' },
      { t: 'Snooze suggested posts', how: 'On a suggested post in Home, tap the X → Snooze all suggested posts in feed for 30 days.', why: 'Pauses suggested posts from accounts you don’t follow for 30 days.', src: 'Instagram, 2023' },
      { t: 'Set up Favorites', how: 'Tap the Instagram logo at the top left → Favorites, and add up to 50 accounts. Or tap ⋯ on a post → Add to favorites.', why: 'Favorites show higher in Feed, and you can filter Feed to only those accounts.', src: 'Instagram, 2023' },
      { t: 'Tap Not interested on suggestions', how: 'On a suggested post or Reel, tap ⋯ → Not interested.', why: 'Instagram shows less of that type of recommended content.', src: 'Instagram, 2023' },
      { t: 'Check sensitive content settings', how: 'Profile → menu (☰) → Content preferences → Sensitive content, then choose Less.', why: 'Controls how much sensitive content you see from accounts you don’t follow.', src: 'Instagram, 2023' }
    ] },
    youtube: { name: 'YouTube', steps: [
      { t: 'Pause or clear watch history', top: true, how: 'Profile picture → Settings → Manage all history. Tap Delete to clear it, or open Controls and turn history off.', why: 'Watch history is one of the main signals YouTube uses to recommend videos.', src: 'YouTube Help' },
      { t: 'Clear search history', how: 'On the same Manage all history page, deleting also clears searches from that time range. Tap the X beside one search to remove just that one.', why: 'YouTube lists search history as a recommendation signal.', src: 'YouTube Help' },
      { t: 'Don’t recommend channel', how: 'On Home, tap More (⋮) next to a video from that channel → Don’t recommend channel.', why: 'The strongest control Mozilla tested: it stopped 43% of unwanted recommendations.', src: 'Mozilla, 2022' },
      { t: 'Remove single videos from history', how: 'You → History. Tap More (⋮) next to a video → Remove from watch history.', why: 'Removes one-off videos so they stop shaping your recommendations.', src: 'YouTube Help' },
      { t: 'Tap Not interested', how: 'Tap More (⋮) next to a video → Not interested, then Tell us why.', why: 'It helps, but Mozilla found it stopped only 11% of unwanted recommendations, so pair it with step 3.', src: 'Mozilla, 2022' },
      { t: 'Answer satisfaction surveys', how: 'When YouTube asks how you liked a video, answer honestly.', why: 'Surveys tell YouTube whether you actually liked a video, not just how long you watched.', src: 'YouTube Help' }
    ] }
  };

  var list = document.getElementById('checklist');
  if (list) {
    var STORE = 'fyf-reset';
    var done = load(STORE, { tiktok: {}, instagram: {}, youtube: {} });
    var active = 'tiktok';
    var appTabs = Array.prototype.slice.call(document.querySelectorAll('.app-tab'));

    var countDone = function (key) {
      var d = done[key] || {};
      return GUIDES[key].steps.filter(function (s, i) { return !!d[i]; }).length;
    };

    var updateProgress = function () {
      var total = GUIDES[active].steps.length;
      var n = countDone(active);
      var pct = Math.round(n / total * 100);
      document.getElementById('progress-title').textContent = 'Your ' + GUIDES[active].name + ' progress';
      document.getElementById('progress-count').textContent = n + ' of ' + total;
      var bar = document.getElementById('progress-bar');
      bar.setAttribute('aria-valuenow', String(pct));
      bar.firstElementChild.style.width = pct + '%';
      document.getElementById('done-msg').hidden = n !== total;
      Object.keys(GUIDES).forEach(function (k) {
        var c = document.querySelector('[data-count="' + k + '"]');
        if (c) c.textContent = countDone(k) + ' of ' + GUIDES[k].steps.length + ' done';
      });
    };

    var renderList = function () {
      list.innerHTML = '';
      var d = done[active] || {};
      GUIDES[active].steps.forEach(function (s, i) {
        var id = 'step-' + active + '-' + i;
        var box = el('input', { type: 'checkbox', id: id });
        box.checked = !!d[i];
        var head = el('span', { class: 'head' }, [el('b', { text: (i + 1) + '. ' + s.t })]);
        if (s.top) head.appendChild(el('span', { class: 'badge', text: 'BIGGEST IMPACT' }));
        var label = el('label', { for: id }, [box, el('span', { style: 'display:flex;flex-direction:column;gap:6px;min-width:0' }, [head, el('span', { class: 'how', text: s.how })])]);
        var why = el('div', { class: 'why' }, [el('strong', { text: 'Why it works: ', style: 'color: var(--ink)' })]);
        why.appendChild(document.createTextNode(s.why + ' '));
        why.appendChild(el('cite', { text: '(' + s.src + ')' }));
        var li = el('li', { class: 'item' + (box.checked ? ' is-done' : '') }, [label, why]);
        box.addEventListener('change', function () {
          done[active] = done[active] || {};
          done[active][i] = box.checked;
          li.classList.toggle('is-done', box.checked);
          save(STORE, done);
          updateProgress();
        });
        list.appendChild(li);
      });
      updateProgress();
    };

    appTabs.forEach(function (t) {
      t.addEventListener('click', function () {
        active = t.getAttribute('data-app');
        appTabs.forEach(function (o) { o.setAttribute('aria-selected', o === t ? 'true' : 'false'); });
        renderList();
      });
    });
    document.getElementById('clear-btn').addEventListener('click', function () {
      done[active] = {};
      save(STORE, done);
      renderList();
    });
    renderList();
  }

  /* ---------- Quiz ---------- */
  var QUESTIONS = [
    { habit: 'Watching to the end', weight: 3,
      text: 'How often do you watch videos all the way through, or rewatch them?',
      evidence: 'TikTok says finishing a longer video is a strong sign of interest, and Instagram ranks Reels partly on whether you’ll watch to the end.',
      src: 'TikTok 2020; Instagram 2023',
      result: 'Every video you finish tells the app “more of this.” That makes watch time one of the loudest signals you send.',
      fixTitle: 'Swipe away sooner',
      fix: 'Skip videos you don’t want more of before they finish. Then use TikTok’s Refresh or Instagram’s Reset to clear what you’ve already taught it.' },
    { habit: 'Lingering on posts', weight: 3,
      text: 'How often do you pause on posts that annoy or upset you, even if you don’t like them?',
      evidence: 'The WSJ’s 100 TikTok bots never liked anything. They only lingered, and TikTok learned their interests in under two hours.',
      src: 'Wall Street Journal, 2021',
      result: 'Pausing counts as interest even when you hate the post. Your feed may be serving you more of exactly what you don’t want.',
      fixTitle: 'Don’t hate-watch',
      fix: 'Scroll past content that bothers you right away, and add keyword filters or Not interested for topics you keep pausing on.' },
    { habit: 'Liking, commenting, sharing', weight: 2,
      text: 'How often do you like, comment on, save, or share posts?',
      evidence: 'Likes, comments, shares, and saves are listed signals on both TikTok and Instagram.',
      src: 'TikTok 2020; Instagram 2023',
      result: 'Likes, comments, and shares are some of the clearest signals you send. The more you engage with a topic, the more of it the app puts at the top of your feed.',
      fixTitle: 'Only like what you want more of',
      fix: 'Every like, comment, and share tells the app to show you more of that topic. Skip engaging with posts you don\u2019t want to see again, even to argue in the comments.' },
    { habit: 'Searching', weight: 2,
      text: 'How often do you search for topics or creators inside the app?',
      evidence: 'YouTube lists search history as a recommendation signal alongside watch history.',
      src: 'YouTube Help',
      result: 'One search can tilt your recommendations for days, especially on YouTube.',
      fixTitle: 'Clear your search history',
      fix: 'On YouTube, delete or pause search history. If you look something up once, remove it so it doesn’t keep shaping your feed.' },
    { habit: 'Following accounts you skip', weight: 2, labels: ['None', 'A few', 'A lot'],
      text: 'How many accounts do you follow that you usually scroll past?',
      evidence: 'Instagram ranks posts partly on your history with the account, and TikTok uses follows to recommend videos.',
      src: 'Instagram 2023; TikTok 2020',
      result: 'Old follows keep feeding the algorithm even when you’ve lost interest.',
      fixTitle: 'Clean up your follows',
      fix: 'Unfollow accounts you always skip, and use Instagram Favorites so the accounts you care about rank higher.' },
    { habit: 'Not using feed controls', weight: 1, reverse: true,
      text: 'How often do you use Not interested, Don’t recommend channel, or topic settings?',
      evidence: 'Controls help, but unevenly: Don’t recommend channel stopped 43% of unwanted YouTube picks, while Not interested stopped 11%.',
      src: 'Mozilla Foundation, 2022',
      result: 'Without feedback, your feed only hears your other habits. The controls are your way to talk back.',
      fixTitle: 'Use the strongest buttons',
      fix: 'Block whole sources with Don’t recommend channel or Hide creator, and set TikTok’s Manage Topics. These beat flagging single posts.' }
  ];

  var intro = document.getElementById('quiz-intro');
  if (intro) {
    var qBox = document.getElementById('quiz-question');
    var results = document.getElementById('quiz-results');
    var idx = 0;
    var answers = [];

    var show = function (which) {
      intro.hidden = which !== 'intro';
      qBox.hidden = which !== 'quiz';
      results.hidden = which !== 'results';
    };

    var renderQuestion = function () {
      var q = QUESTIONS[idx];
      document.getElementById('q-count').textContent = 'Question ' + (idx + 1) + ' of ' + QUESTIONS.length;
      document.getElementById('q-habit').textContent = q.habit;
      document.getElementById('q-bar').style.width = Math.round((idx + 1) / QUESTIONS.length * 100) + '%';
      document.getElementById('q-text').textContent = q.text;
      var opts = document.getElementById('q-options');
      opts.innerHTML = '';
      (q.labels || ['Rarely', 'Sometimes', 'Often']).forEach(function (label, v) {
        var b = el('button', { type: 'button', class: 'opt', 'aria-pressed': answers[idx] === v ? 'true' : 'false', text: label });
        b.addEventListener('click', function () {
          answers[idx] = v;
          if (idx + 1 >= QUESTIONS.length) renderResults();
          else { idx += 1; renderQuestion(); }
        });
        opts.appendChild(b);
      });
      show('quiz');
    };

    var renderResults = function () {
      var scored = QUESTIONS.map(function (q, i) {
        var v = answers[i] == null ? 0 : answers[i];
        var freq = q.reverse ? 2 - v : v;
        return { q: q, i: i, score: freq * q.weight };
      });
      scored.sort(function (a, b) { return b.score - a.score || b.q.weight - a.q.weight || a.i - b.i; });
      var top = scored[0].score === 0 ? {
        habit: 'You send very few signals',
        result: 'Based on your answers, none of these habits is shaping your feed much. Your feed may lean on popularity and your account settings instead.',
        evidence: 'TikTok says account settings like language and country carry the least weight, so feeds with few signals tend toward popular content.',
        src: 'TikTok, 2020',
        fixTitle: 'Teach it what you want',
        fix: 'Follow a few accounts you love and use Favorites or Manage Topics, so your feed has good signals to work with.'
      } : scored[0].q;

      document.getElementById('r-habit').textContent = top.habit;
      document.getElementById('r-result').textContent = top.result;
      document.getElementById('r-evidence').textContent = top.evidence;
      document.getElementById('r-src').textContent = '(' + top.src + ')';
      document.getElementById('r-fix-title').textContent = top.fixTitle;
      document.getElementById('r-fix').textContent = top.fix;

      var ranked = document.getElementById('r-ranked');
      ranked.innerHTML = '';
      scored.forEach(function (r, n) {
        var level = r.score >= 4 ? ['High impact', 'lvl-high', 'var(--violet)'] : (r.score >= 2 ? ['Medium impact', 'lvl-med', '#0E8A5F'] : ['Low impact', 'lvl-low', '#B7B3C4']);
        var pct = Math.max(4, Math.round(r.score / 6 * 100));
        var bar = el('div', { class: 'bar light' }, [el('i', { style: 'width:' + pct + '%;background:' + level[2] })]);
        var p = el('p', { text: r.q.evidence + ' ' });
        p.appendChild(el('cite', { text: '(' + r.q.src + ')' }));
        ranked.appendChild(el('div', { class: 'rank-row' }, [
          el('div', { class: 'lab' }, [el('span', { text: (n + 1) + '. ' + r.q.habit }), el('span', { class: 'lvl ' + level[1], text: level[0] })]),
          bar, p
        ]));
      });
      show('results');
      document.getElementById('r-habit').scrollIntoView({ block: 'center', behavior: 'smooth' });
    };

    document.getElementById('start-btn').addEventListener('click', function () { idx = 0; answers = []; renderQuestion(); });
    document.getElementById('back-btn').addEventListener('click', function () {
      if (idx === 0) show('intro');
      else { idx -= 1; renderQuestion(); }
    });
    document.getElementById('restart-btn').addEventListener('click', function () { idx = 0; answers = []; show('intro'); });
    show('intro');
  }
})();
