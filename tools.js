(() => {
  'use strict';

  const sources = {
    nagoya: 'https://www3.apahotel.com/en/hotel/tokai/aichi/nagoyaekimae/',
    tokyo: 'https://www3.apahotel.com/hotel/syutoken/tokyo/kayabacho-hatchobori-ekimae/',
    hotelBus: 'https://www.tobuhotel.co.jp/narita/access/',
    meitetsu: 'https://www.centrair.jp/en/access/train.html',
    terminal: 'https://www.centrair.jp/en/access/terminal2/',
    shinkansen: 'https://smart-ex.jp/en/product/plan/service/',
    naritaExpress: 'https://www.jreast.co.jp/en/multi/nex/',
    toyota: 'https://www.toyota.co.jp/en/about_toyota/facility/toyota_kaikan/facility/index.html',
    visitJapan: 'https://services.digital.go.jp/en/visit-japan-web/',
    eTravel: 'https://etravel.gov.ph/'
  };

  const hotels = [
    {
      city: 'Nagoya', stay: 'Nov 24–26 · 2 nights', title: 'APA Hotel Nagoya Ekimae',
      address: '1-5-3 Noritake, Nakamura-ku, Nagoya 453-0014',
      arrival: 'After 15:00', departure: 'Before 10:00',
      details: 'Four non-smoking single rooms. From Nagoya Station, take the Taiko-dori exit or the ESCA passage to exit E7.',
      source: sources.nagoya
    },
    {
      city: 'Tokyo', stay: 'Nov 26–27 · 1 night', title: 'APA Hotel Kayabacho Hatchobori Ekimae',
      address: '3-8-5 Nihombashi-Kayabacho, Chuo-ku, Tokyo 103-0025',
      arrival: 'Confirm with hotel', departure: 'Confirm with hotel',
      details: 'Four standard single rooms. Kayabacho Station exit 2 is nearby. The booking gives no room times. Ask about bags before the office visit.',
      source: sources.tokyo
    },
    {
      city: 'Narita', stay: 'Nov 27–28 · 1 night', title: 'Narita Tobu Hotel Airport',
      address: '320-1 Tokko, Narita, Chiba 286-0106',
      arrival: 'After 15:00', departure: 'Before 11:00',
      details: 'Four adults share one non-smoking room. Breakfast is included. Confirm the Nov 27 morning bag drop with the hotel.',
      source: sources.hotelBus
    }
  ];

  const legs = [
    {
      label: 'Nov 24 · Centrair to Nagoya', mode: 'Rail + walk', title: 'From arrivals to the Nagoya hotel',
      stops: ['Centrair T2', 'Access Plaza', 'Meitetsu Nagoya', 'APA Nagoya'],
      description: 'From Terminal 2, follow signs to Access Plaza and the airport rail station. Ride Meitetsu to Nagoya, then walk to the hotel. A μ-SKY seat requires a μticket in addition to the base fare.',
      origin: 'Chubu Centrair International Airport Terminal 2', destination: hotels[0].title + ', ' + hotels[0].address, mapMode: 'transit',
      links: [['Centrair rail guide', sources.meitetsu], ['Terminal 2 access', sources.terminal]]
    },
    {
      label: 'Nov 25 · Nagoya to Toyota City', mode: 'Group vehicle', title: 'Toyota City visits',
      stops: ['APA Nagoya', 'Toyota City HQ', 'Toyota Kaikan'],
      description: 'Meet the group for the planned 07:45 drive. The map leads to Toyota Kaikan on the headquarters campus. Confirm the meeting entrance for the DNA Inheritance Hall and the vehicle return with the host.',
      origin: hotels[0].title + ', ' + hotels[0].address, destination: 'Toyota Kaikan Museum, 1 Toyota-cho, Toyota City, Japan', mapMode: 'driving',
      links: [['Toyota Kaikan visitor guide', sources.toyota]]
    },
    {
      label: 'Nov 26 · Nagoya to Tokyo', mode: 'Shinkansen', title: 'The Tokaido Shinkansen to Tokyo',
      stops: ['Nagoya Station', 'Tokaido Shinkansen', 'Tokyo Station'],
      description: 'Walk to JR Nagoya Station and follow the Tokaido Shinkansen signs. Choose a Tokyo-bound service. The agenda allows 07:30–09:30 for the journey. Confirm the train and seat before leaving the hotel.',
      origin: 'Nagoya Station, Aichi, Japan', destination: 'Tokyo Station, Tokyo, Japan', mapMode: 'transit',
      links: [['Shinkansen tickets', sources.shinkansen]]
    },
    {
      label: 'Nov 26 · Tokyo Station to the hotel', mode: 'Local rail + walk', title: 'From Tokyo Station to Kayabacho',
      stops: ['Tokyo Station', 'Hatchobori Station', 'APA Kayabacho'],
      description: 'One option is the JR Keiyo Line to Hatchobori, then a walk to the hotel. Allow time inside Tokyo Station to reach the Keiyo Line platforms. For a taxi, show the hotel’s full name and Kayabacho address.',
      origin: 'Tokyo Station, Tokyo, Japan', destination: hotels[1].title + ', ' + hotels[1].address, mapMode: 'transit',
      links: [['Hotel access', sources.tokyo]]
    },
    {
      label: 'Nov 26 · Hotel to Woven by Toyota', mode: 'Walk or taxi', title: 'The Woven office visit',
      stops: ['APA Kayabacho', 'Nihonbashi Muromachi Mitsui Tower'],
      description: 'Woven’s Tokyo headquarters is in Nihonbashi Muromachi Mitsui Tower, connected to Mitsukoshimae Station at exit A8. Confirm the reception point with the host before setting off.',
      origin: hotels[1].title + ', ' + hotels[1].address, destination: 'Nihonbashi Muromachi Mitsui Tower, 3-2-1 Nihonbashi Muromachi, Tokyo, Japan', mapMode: 'walking',
      links: [['Woven office directions', 'https://www.woven.toyota/en/company/']]
    },
    {
      label: 'Nov 27 · Tokyo to Narita', mode: 'Express rail + shuttle', title: 'Tokyo Station to the Narita hotel',
      stops: ['Tokyo Station', 'Airport Terminal 2·3', 'T2 bus stop 25', 'Narita Tobu'],
      description: 'A rail option is the Narita Express to Airport Terminal 2·3, then the hotel shuttle from Terminal 2, level 1, stop 25. Check the connection with the host. The planned 08:30 hotel stop depends on travel time and luggage storage.',
      origin: 'Tokyo Station, Tokyo, Japan', destination: hotels[2].title, mapMode: 'transit',
      links: [['JR East Narita Express', sources.naritaExpress], ['Hotel shuttle schedule', sources.hotelBus]]
    },
    {
      label: 'Nov 27 · Hotel to Narita Market', mode: 'Road transfer', title: 'The market site visit',
      stops: ['Narita Tobu', 'Narita City Wholesale Market'],
      description: 'The city wholesale market is in Tenjinmine, near the airport. Confirm the market, entrance and transport with the host for the 10:00 visit. Get the sorting facility’s address separately.',
      origin: hotels[2].title, destination: 'Narita City Wholesale Market, 80-1 Tenjinmine, Narita, Chiba, Japan', mapMode: 'driving',
      links: [['Official market access', 'https://www.city.narita.chiba.jp/business/page0139_00039.html']]
    },
    {
      label: 'Nov 28 · Narita hotel to Terminal 2', mode: 'Airport shuttle', title: 'To the Manila departure',
      stops: ['Narita Tobu', 'Hotel shuttle', 'Narita T2'],
      description: 'If returning to the hotel after fieldwork, the free shuttle leaves from the hotel entrance. If departing directly from a rental location, arrange a transfer with the group. Confirm your pickup and bag-drop deadline for the 19:00 departure.',
      origin: hotels[2].title, destination: 'Narita International Airport Terminal 2, Japan', mapMode: 'driving',
      links: [['Hotel shuttle schedule', sources.hotelBus]]
    }
  ];

  function link(label, url) {
    return `<a class="jt-link" href="${url}" target="_blank" rel="noopener noreferrer">${label}<span aria-hidden="true"> ↗</span></a>`;
  }

  function header(title, description) {
    return `<header class="jt-header"><h1>${title}</h1><p>${description}</p></header>`;
  }

  function routePanel(leg) {
    const map = new URL('https://www.google.com/maps/dir/');
    map.search = new URLSearchParams({api: '1', origin: leg.origin, destination: leg.destination, travelmode: leg.mapMode});
    return `<div class="jt-map-panel">
      <div class="jt-map-heading"><span class="jt-meta">${leg.mode}</span><h3>${leg.title}</h3></div>
      <ol class="jt-line" aria-label="Route stops">${leg.stops.map(stop => `<li>${stop}</li>`).join('')}</ol>
      <p>${leg.description}</p>
      <div class="jt-actions"><button type="button" class="jt-btn" id="jt-map-toggle" aria-expanded="false" aria-controls="jt-preview">Load map</button>${link('Open directions', map.href)}${leg.links.map(([label, url]) => link(label, url)).join('')}</div>
      <div id="jt-preview"></div>
    </div>`;
  }

  function flight(date, number, departure, origin, arrival, destination, day) {
    return `<article class="jt-ticket">
      <div class="jt-ticket-top"><span class="jt-meta">${date}</span><span class="jt-flight-no">Cebu Pacific ${number}</span></div>
      <div class="jt-flight-path">
        <div><strong>${departure}</strong><span>${origin}</span></div>
        <span class="jt-arrow" aria-hidden="true">→</span>
        <div><strong>${arrival}</strong><span>${destination}</span></div>
      </div><a class="jt-link" href="#day/${day}">Open day itinerary <span aria-hidden="true">→</span></a></article>`;
  }

  function hotelCard(h) {
    return `<article class="jt-stay">
      <div class="jt-stay-top"><span class="jt-meta">${h.city}</span><span>${h.stay}</span></div>
      <h3>${h.title}</h3><p class="jt-address">${h.address}</p>
      <dl class="jt-times"><div><dt>Check-in</dt><dd>${h.arrival}</dd></div><div><dt>Check-out</dt><dd>${h.departure}</dd></div></dl>
      <p>${h.details}</p>
      <div class="jt-actions">${link('Map', 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(h.title + ' ' + h.address))}${link('Hotel access', h.source)}</div>
    </article>`;
  }

  function transport(main) {
    main.innerHTML = `<div class="jt-view">${header('Transport & bookings', 'Rail connections, airport transfers and hotel details for the five-day route.')}
      <section class="jt-section"><h2>Route maps</h2>
        <div class="jt-map-box"><div class="jt-map-select"><label for="jt-leg">Route leg</label>
        <select id="jt-leg">${legs.map((leg, i) => `<option value="${i}">${leg.label}</option>`).join('')}</select></div>
        <div id="jt-map" aria-live="polite">${routePanel(legs[0])}</div></div>
      </section>
      <section class="jt-section"><h2>Ticketed flights</h2><div class="jt-flights">
        ${flight('Tue · Nov 24', '5J 5038', '07:35 PHT', 'Manila · MNL T3', '12:35 JST', 'Nagoya · NGO T2', '24')}
        ${flight('Sat · Nov 28', '5J 5057', '19:00 JST', 'Narita · NRT T2', '23:35 PHT', 'Manila · MNL T3', '28')}
      </div><p class="jt-footnote">Japan is one hour ahead of Manila. Each traveler on the flight booking has one 20 kg checked bag each way. Check your boarding pass for gate and boarding time.</p></section>
      <section class="jt-section"><h2>Hotel bookings</h2><div class="jt-hotels">${hotels.map(hotelCard).join('')}</div></section></div>`;
    main.querySelector('#jt-leg').addEventListener('change', event => {
      main.querySelector('#jt-map').innerHTML = routePanel(legs[event.target.value]);
    });
    main.querySelector('#jt-map').addEventListener('click', event => {
      const button = event.target.closest('#jt-map-toggle');
      if (!button) return;
      const leg = legs[main.querySelector('#jt-leg').value];
      const preview = main.querySelector('#jt-preview');
      const show = !preview.hasChildNodes();
      preview.replaceChildren();
      if (show) {
        const frame = document.createElement('iframe');
        const url = new URL('https://www.google.com/maps');
        url.search = new URLSearchParams({
          saddr: leg.origin, daddr: leg.destination,
          dirflg: {transit: 'r', walking: 'w', driving: 'd'}[leg.mapMode], output: 'embed'
        });
        frame.src = url.href;
        frame.title = 'Route map · ' + leg.label;
        frame.loading = 'lazy';
        frame.referrerPolicy = 'no-referrer-when-downgrade';
        frame.allowFullscreen = true;
        preview.append(frame);
      }
      button.setAttribute('aria-expanded', String(show));
      button.textContent = show ? 'Hide map' : 'Load map';
    });
  }

  const preparations = [
    ['passport', 'Passport and Japan visa', 'Keep both with you for check-in and immigration.'],
    ['flight', 'Flight confirmation', 'Save both flight details for offline use.'],
    ['hotels', 'Three hotel confirmations', 'Save the Nagoya, Tokyo and Narita bookings.'],
    ['insurance', 'Travel insurance', 'Keep the policy and assistance contact handy for Nov 24–28.'],
    ['agenda', 'Business itinerary', 'Save meeting locations and confirm host pickup details.'],
    ['bag-drop', 'Nov 27 morning bag drop', 'Ask Narita Tobu if it can store your bags before the room is available.'],
    ['airport-transfer', 'Nov 28 airport transfer', 'Agree on a pickup time and bag-drop deadline for Narita T2.'],
    ['visit-japan', 'Visit Japan Web', 'Register the Japan arrival and have the entry QR ready.'],
    ['etravel-out', 'Outbound eTravel QR', 'Register the Manila departure and save the QR.'],
    ['etravel-back', 'Return eTravel QR', 'Register the Manila arrival and save its QR separately.']
  ];
  const { shops: hobbyStops, progress } = window.JapanTrip;
  const shops = hobbyStops.map(shop => {
    const when = 'Nov ' + shop.days.join(' or ');
    const detail = [shop.area, when].join(' · ') + (shop.note ? '. ' + shop.note : '');
    return [shop.id, shop.name, detail, shop.map];
  });

  function checkGroup(title, items, group, checked) {
    const rows = items.map(([id, name, note, url]) => `<li>
      <label><input type="checkbox" value="${id}" ${checked[id] === true ? 'checked' : ''}>
      <span><strong>${name}</strong><small>${note}</small></span></label>
      ${url ? link('Map', url) : ''}</li>`).join('');
    return `<section class="jt-section"><div class="jt-section-title"><h2>${title}</h2><span class="jt-count" id="jt-${group}-count" role="status"></span></div>
      <ul class="jt-checklist">${rows}</ul></section>`;
  }

  function checklist(main) {
    const checked = progress.read();
    main.innerHTML = `<div class="jt-view">${header('Trip checklist', 'Get your documents ready, save your entry QRs and mark the optional shops you visit.')}
      <section class="jt-section"><h2>Entry forms</h2><div class="jt-forms">
        <article class="jt-form"><span class="jt-meta">Japan arrival</span><h3>Visit Japan Web</h3>
          <p>Before flying to Nagoya, enter your passport details, arrival flight and first hotel. Complete immigration and customs, then show your entry QR on arrival.</p>
          <div class="jt-actions">${link('Open Visit Japan Web', sources.visitJapan)}</div></article>
        <article class="jt-form"><span class="jt-meta">Philippine departure & return</span><h3>Philippine eTravel</h3>
          <p>Filipino travelers can register within 72 hours of leaving or arriving in the Philippines. Registration is free. Save each QR before boarding.</p>
          <dl class="jt-times jt-etravel"><div><dt>Outbound window opens</dt><dd>Nov 21 · 07:35 PHT</dd></div><div><dt>Return window opens</dt><dd>Nov 25 · 23:35 PHT</dd></div></dl>
          <div class="jt-actions">${link('Open eTravel', sources.eTravel)}${link('Official FAQs', 'https://etravel.gov.ph/en/frequently-asked-questions')}</div></article>
      </div></section>
      ${checkGroup('Preparation', preparations, 'prep', checked)}
      <p class="jt-footnote" id="jt-storage">Checklist progress is saved in this browser.</p>
      ${checkGroup('Optional hobby shops', shops, 'shops', checked)}
      <p class="jt-footnote">${link('Narita Airport T1 shop access', 'https://www.narita-airport.jp/en/shop/shop-search/t1sw03_t0002m/')}</p>
    </div>`;
    function counts() {
      const total = items => items.filter(([id]) => main.querySelector(`input[value="${id}"]`).checked).length;
      main.querySelector('#jt-prep-count').textContent = `${total(preparations)} of ${preparations.length} ready`;
      main.querySelector('#jt-shops-count').textContent = `${total(shops)} of ${shops.length} visited`;
      main.querySelector('#jt-storage').textContent = !progress.sessionOnly
        ? 'Checklist progress is saved in this browser.'
        : 'This browser is keeping progress for this session only.';
    }
    main.querySelector('.jt-view').addEventListener('change', event => {
      if (event.target.type !== 'checkbox') return;
      progress.set(event.target.value, event.target.checked);
      counts();
    });
    counts();
  }

  const phraseGroups = {
    'Everyday': [
      ['Hello / good afternoon', 'こんにちは。', 'Konnichiwa.'],
      ['Good morning', 'おはようございます。', 'Ohayō gozaimasu.'],
      ['Good evening', 'こんばんは。', 'Konbanwa.'],
      ['Thank you very much', 'ありがとうございます。', 'Arigatō gozaimasu.'],
      ['Excuse me', 'すみません。', 'Sumimasen.'],
      ['Yes', 'はい。', 'Hai.'],
      ['No', 'いいえ。', 'Iie.'],
      ['I don’t understand', 'よく分かりません。', 'Yoku wakarimasen.'],
      ['Do you speak English?', '英語を話せますか。', 'Eigo o hanasemasu ka?'],
      ['Please speak a little more slowly', 'もう少しゆっくり話してください。', 'Mō sukoshi yukkuri hanashite kudasai.'],
      ['Where is the restroom?', 'お手洗いはどこですか。', 'Otearai wa doko desu ka?']
    ],
    'Trains & taxis': [
      ['Which platform does this train leave from?', 'この電車は何番線から出ますか。', 'Kono densha wa nan-bansen kara demasu ka?'],
      ['Does this train go to Tokyo Station?', 'この電車は東京駅に行きますか。', 'Kono densha wa Tōkyō-eki ni ikimasu ka?'],
      ['Where do I change trains?', 'どこで乗り換えますか。', 'Doko de norikaemasu ka?'],
      ['Four reserved seats to Tokyo, please', '東京まで指定席を四席お願いします。', 'Tōkyō made shiteiseki o yonseki onegai shimasu.'],
      ['Where is the Shinkansen gate?', '新幹線の改札はどこですか。', 'Shinkansen no kaisatsu wa doko desu ka?'],
      ['Can I use an IC card?', 'ICカードは使えますか。', 'Ai-shī kādo wa tsukaemasu ka?'],
      ['Please take me to this address', 'この住所までお願いします。', 'Kono jūsho made onegai shimasu.'],
      ['Please stop here', 'ここで止めてください。', 'Koko de tomete kudasai.'],
      ['Where is the elevator?', 'エレベーターはどこですか。', 'Erebētā wa doko desu ka?']
    ],
    'At the airport': [
      ['Where is the Cebu Pacific counter?', 'セブパシフィック航空のカウンターはどこですか。', 'Sebu Pashifikku Kōkū no kauntā wa doko desu ka?'],
      ['Where can I check this bag?', 'この荷物はどこで預けられますか。', 'Kono nimotsu wa doko de azukeraremasu ka?'],
      ['Which gate is the Manila flight?', 'マニラ行きの搭乗口はどこですか。', 'Manira-yuki no tōjōguchi wa doko desu ka?'],
      ['How do I get to Terminal 2?', '第2ターミナルにはどう行けばいいですか。', 'Dai-ni tāminaru ni wa dō ikeba ii desu ka?'],
      ['Where is the hotel shuttle stop?', 'ホテルの送迎バス乗り場はどこですか。', 'Hoteru no sōgei basu noriba wa doko desu ka?'],
      ['What time does boarding start?', '搭乗は何時に始まりますか。', 'Tōjō wa nanji ni hajimarimasu ka?']
    ],
    'At the hotel': [
      ['I have a reservation', '予約しています。', 'Yoyaku shite imasu.'],
      ['May I check in?', 'チェックインをお願いします。', 'Chekkuin o onegai shimasu.'],
      ['Could you hold my luggage?', '荷物を預かっていただけますか。', 'Nimotsu o azukatte itadakemasu ka?'],
      ['What time is check-out?', 'チェックアウトは何時ですか。', 'Chekkuauto wa nanji desu ka?'],
      ['What time is breakfast?', '朝食は何時ですか。', 'Chōshoku wa nanji desu ka?'],
      ['Could you call a taxi?', 'タクシーを呼んでいただけますか。', 'Takushī o yonde itadakemasu ka?'],
      ['What time is the airport shuttle?', '空港行きの送迎バスは何時に出ますか。', 'Kūkō-yuki no sōgei basu wa nanji ni demasu ka?']
    ],
    'Food & dining': [
      ['A table for four, please', '四人です。', 'Yonin desu.'],
      ['May I see the English menu?', '英語のメニューはありますか。', 'Eigo no menyū wa arimasu ka?'],
      ['I’ll have this, please', 'これをお願いします。', 'Kore o onegai shimasu.'],
      ['Water, please', 'お水をください。', 'Omizu o kudasai.'],
      ['Is there pork in this?', 'これに豚肉は入っていますか。', 'Kore ni butaniku wa haitte imasu ka?'],
      ['I have a food allergy', '食物アレルギーがあります。', 'Shokumotsu arerugī ga arimasu.'],
      ['It was delicious', 'おいしかったです。', 'Oishikatta desu.'],
      ['The bill, please', 'お会計をお願いします。', 'Okaikei o onegai shimasu.']
    ],
    'Shopping': [
      ['How much is this?', 'これはいくらですか。', 'Kore wa ikura desu ka?'],
      ['Is this item in stock?', 'この商品の在庫はありますか。', 'Kono shōhin no zaiko wa arimasu ka?'],
      ['Is this secondhand?', 'これは中古品ですか。', 'Kore wa chūkohin desu ka?'],
      ['May I pay by card?', 'カードで払えますか。', 'Kādo de haraemasu ka?'],
      ['A receipt, please', 'レシートをください。', 'Reshīto o kudasai.'],
      ['Do you offer tax-free shopping?', '免税はできますか。', 'Menzei wa dekimasu ka?']
    ],
    'Business visits': [
      ['Nice to meet you', '初めまして。よろしくお願いいたします。', 'Hajimemashite. Yoroshiku onegai itashimasu.'],
      ['Thank you for your time today', '本日はお時間をいただき、ありがとうございます。', 'Honjitsu wa ojikan o itadaki, arigatō gozaimasu.'],
      ['We’re here for a meeting', '打ち合わせに参りました。', 'Uchiawase ni mairimashita.'],
      ['Where is reception?', '受付はどこですか。', 'Uketsuke wa doko desu ka?'],
      ['May I take a photo?', '写真を撮ってもよろしいですか。', 'Shashin o totte mo yoroshii desu ka?'],
      ['Could you repeat that?', 'もう一度お願いできますか。', 'Mō ichido onegai dekimasu ka?']
    ],
    'Getting help': [
      ['Please help me', '助けてください。', 'Tasukete kudasai.'],
      ['I’m lost', '道に迷いました。', 'Michi ni mayoimashita.'],
      ['I have lost my passport', 'パスポートをなくしました。', 'Pasupōto o nakushimashita.'],
      ['Where is the nearest police box?', '一番近い交番はどこですか。', 'Ichiban chikai kōban wa doko desu ka?'],
      ['Please call an ambulance', '救急車を呼んでください。', 'Kyūkyūsha o yonde kudasai.'],
      ['Please call the police', '警察を呼んでください。', 'Keisatsu o yonde kudasai.'],
      ['I need to see a doctor', '医師の診察を受けたいです。', 'Ishi no shinsatsu o uketai desu.']
    ]
  };

  function searchText(value) {
    return value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[’']/g, '').trim();
  }

  async function copyJapanese(text, button) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const field = document.createElement('textarea');
      field.className = 'jt-copy-field';
      field.value = text;
      field.readOnly = true;
      button.after(field);
      field.select();
      try {
        return document.execCommand('copy');
      } catch {
        return false;
      } finally {
        field.remove();
        button.focus();
      }
    }
  }

  function phrases(main) {
    const groups = Object.keys(phraseGroups);
    const all = Object.entries(phraseGroups).flatMap(([group, items]) => items.map(([en, ja, romaji]) => ({
      group, en, ja, romaji, search: searchText(`${en} ${ja} ${romaji} ${group}`)
    })));
    main.innerHTML = `<div class="jt-view">${header('Japanese phrasebook', 'Find the words for a train ride, a hotel desk or a meeting. Show the Japanese in large type or copy it for a message.')}
      <div class="jt-filters"><label for="jt-query">Search phrases<input id="jt-query" type="search" placeholder="English, 日本語 or rōmaji" autocomplete="off"></label>
      <label for="jt-situation">Situation<select id="jt-situation"><option value="">All situations</option>${groups.map(group => `<option>${group}</option>`).join('')}</select></label></div>
      <p class="jt-results-count" role="status" id="jt-results-count"></p><div id="jt-phrases"></div>
      <p class="jt-footnote">${link('JNTO language guide', 'https://www.japan.travel/en/plan/japanese-language/')}</p>
      <dialog class="jt-dialog" aria-labelledby="jt-dialog-en"><form method="dialog"><button type="submit" class="jt-btn" autofocus>Close</button></form>
        <p class="jt-dialog-ja" lang="ja"></p><p class="jt-dialog-roman"></p><h2 id="jt-dialog-en"></h2></dialog>
      <div id="jt-copy-status" class="jt-sr" role="status"></div></div>`;

    const query = main.querySelector('#jt-query');
    const situation = main.querySelector('#jt-situation');
    const results = main.querySelector('#jt-phrases');
    const dialog = main.querySelector('dialog');
    let opener;
    function update() {
      const terms = searchText(query.value).split(/\s+/).filter(Boolean);
      const matches = all.filter(p => (!situation.value || situation.value === p.group) && terms.every(term => p.search.includes(term)));
      main.querySelector('#jt-results-count').textContent = `${matches.length} ${matches.length === 1 ? 'phrase' : 'phrases'}`;
      results.innerHTML = groups.map(group => {
        const cards = matches.filter(p => p.group === group).map(p => `<article class="jt-phrase">
          <h3>${p.en}</h3><p class="jt-script" lang="ja">${p.ja}</p><p class="jt-roman">${p.romaji}</p>
          <div class="jt-phrase-actions"><button type="button" class="jt-btn" data-show="${all.indexOf(p)}" aria-label="Show ${p.en} in large type">Show phrase</button>
          <button type="button" class="jt-btn jt-quiet" data-copy="${all.indexOf(p)}" aria-label="Copy Japanese for ${p.en}">Copy</button></div></article>`).join('');
        return cards ? `<section class="jt-section jt-phrase-group"><h2>${group}</h2><div class="jt-phrase-grid">${cards}</div></section>` : '';
      }).join('');
      if (!matches.length) results.innerHTML = '<div class="jt-empty"><h2>No matching phrases</h2><p>Try another word or choose a different situation.</p><button type="button" class="jt-btn" data-clear>Clear filters</button></div>';
    }
    query.addEventListener('input', update);
    situation.addEventListener('change', update);
    results.addEventListener('click', async event => {
      const button = event.target.closest('button');
      if (!button) return;
      if (button.hasAttribute('data-clear')) {
        query.value = '';
        situation.value = '';
        update();
        query.focus();
      } else if (button.hasAttribute('data-show')) {
        const p = all[button.dataset.show];
        dialog.querySelector('.jt-dialog-ja').textContent = p.ja;
        dialog.querySelector('.jt-dialog-roman').textContent = p.romaji;
        dialog.querySelector('h2').textContent = p.en;
        opener = button;
        dialog.showModal();
      } else if (button.hasAttribute('data-copy')) {
        const p = all[button.dataset.copy];
        const copied = await copyJapanese(p.ja, button);
        button.textContent = copied ? 'Copied' : 'Copy';
        const card = button.closest('article');
        card.querySelector('.jt-copy-hint')?.remove();
        if (!copied) {
          const selection = window.getSelection();
          if (selection) {
            const range = document.createRange();
            range.selectNodeContents(card.querySelector('[lang="ja"]'));
            selection.removeAllRanges();
            selection.addRange(range);
          }
          const hint = document.createElement('small');
          hint.className = 'jt-copy-hint';
          hint.textContent = 'Japanese selected. Use your device’s Copy command.';
          card.append(hint);
        }
        const status = main.querySelector('#jt-copy-status');
        if (status) {
          status.textContent = copied ? `Copied Japanese for ${p.en}.` : 'Japanese selected. Use your device’s Copy command.';
        }
      }
    });
    dialog.addEventListener('close', () => opener?.focus());
    update();
  }

  const renderers = { transport, checklist, phrases };
  window.JapanTools = { render(main, route) { renderers[route](main); } };
})();
