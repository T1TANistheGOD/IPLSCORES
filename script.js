'use strict';

const API_KEY = '644c313eb1msh54941d04889366cp18e9f9jsn5ba62ab2afde';
const API_HOST = 'livescore6.p.rapidapi.com';

const ENDPOINTS = {
  matches: 'https://livescore6.p.rapidapi.com/matches/v2/list-by-league?Category=soccer&Ccd=champions-league&Timezone=5.75',
  standings: 'https://livescore6.p.rapidapi.com/leagues/v2/get-table?Category=soccer&Ccd=champions-league&Scd=league-stage',
};

const HEADERS = {
  'x-rapidapi-key': API_KEY,
  'x-rapidapi-host': API_HOST,
  'Content-Type': 'application/json',
};

const state = {
  currentPage: 'matches',
  matchFilter: 'all',
  matches: [],
  standings: [],
  loaded: { matches: false, standings: false },
};

const TEAM_LOGO_MAP = {
  ajax: 'images/ajax.png',
  arsenal: 'images/arsenal.png',
  athletic: 'images/athletic.png',
  atalanta: 'images/atalanta.png',
  atleti: 'images/atleti.png',
  'atletico madrid': 'images/atleti.png',
  barcelona: 'images/barcelona.png',
  'bayern munich': 'images/bayernmunich.png',
  bayern: 'images/bayernmunich.png',
  benfica: 'images/benfica.png',
  'bodo glimt': 'images/bodo.png',
  bodo: 'images/bodo.png',
  brugge: 'images/brugge.png',
  celtic: 'images/celtic.png',
  chelsea: 'images/chelsea.png',
  copenhagen: 'images/copenhagen.png',
  dortmund: 'images/dortmund.png',
  frankfurt: 'images/frankfurt.png',
  galatasaray: 'images/galatasaray.png',
  inter: 'images/inter.png',
  juventus: 'images/juventus.png',
  leverkusen: 'images/leverkusen.png',
  liverpool: 'images/liverpool.png',
  'man city': 'images/mancity.png',
  'manchester city': 'images/mancity.png',
  marseille: 'images/marseille.png',
  monaco: 'images/monaco.png',
  napoli: 'images/napoli.png',
  newcastle: 'images/newcastle.png',
  olympiacos: 'images/olympiacos.png',
  'paris sg': 'images/PSG.png',
  'paris saint-germain': 'images/PSG.png',
  'paris saint germain': 'images/PSG.png',
  psg: 'images/PSG.png',
  'real madrid': 'images/realmadrid.png',
  slavia: 'images/slavia.png',
  sporting: 'images/sporting.png',
  psv: 'images/psv.png',
  villarreal: 'images/villarreal.png',
};

const TEAM_COUNTRY_MAP = {
  ajax: 'Netherlands',
  arsenal: 'England',
  athletic: 'Spain',
  atalanta: 'Italy',
  atleti: 'Spain',
  'atletico madrid': 'Spain',
  barcelona: 'Spain',
  'bayern munich': 'Germany',
  bayern: 'Germany',
  benfica: 'Portugal',
  'bodo glimt': 'Norway',
  bodo: 'Norway',
  brugge: 'Belgium',
  celtic: 'Scotland',
  chelsea: 'England',
  copenhagen: 'Denmark',
  dortmund: 'Germany',
  frankfurt: 'Germany',
  galatasaray: 'Turkey',
  inter: 'Italy',
  juventus: 'Italy',
  leverkusen: 'Germany',
  liverpool: 'England',
  'man city': 'England',
  'manchester city': 'England',
  marseille: 'France',
  monaco: 'France',
  napoli: 'Italy',
  newcastle: 'England',
  olympiacos: 'Greece',
  'paris sg': 'France',
  'paris saint-germain': 'France',
  'paris saint germain': 'France',
  psg: 'France',
  'real madrid': 'Spain',
  slavia: 'Czech Republic',
  sporting: 'Portugal',
  psv: 'Netherlands',
  villarreal: 'Spain',
};

function navigateTo(event, page) {
  if (event) event.preventDefault();

  document.querySelectorAll('.page').forEach((p) => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach((n) => n.classList.remove('active'));

  const pageEl = document.getElementById(`page-${page}`);
  const navEl = document.querySelector(`[data-page="${page}"]`);

  if (pageEl) pageEl.classList.add('active');
  if (navEl) navEl.classList.add('active');

  state.currentPage = page;
  document.getElementById('navLinks').classList.remove('open');

  if (page === 'matches' && !state.loaded.matches) loadMatches();
  if (page === 'standings' && !state.loaded.standings) loadStandings();
  if (page === 'teams') renderTeams();
}

function toggleMobileMenu() {
  const links = document.getElementById('navLinks');
  if (links) links.classList.toggle('open');
}

window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 10);
});

async function apiFetch(url) {
  const response = await fetch(url, { method: 'GET', headers: HEADERS });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  return response.json();
}

async function loadMatches() {
  const grid = document.getElementById('matchesGrid');
  grid.innerHTML = loadingHTML();

  try {
    const data = await apiFetch(ENDPOINTS.matches);
    state.matches = parseMatches(data);
    state.loaded.matches = true;
    renderMatchCards();
    renderTeams();
  } catch (err) {
    console.error('Matches fetch error:', err);
    grid.innerHTML = errorHTML('Could not load matches', err.message);
  }
}

function parseMatches(data) {
  const stages = data?.Stages || data?.stages || [];
  const matches = [];

  for (const stage of stages) {
    const stageName = stage?.Snm || stage?.name || '';
    if (isQualificationStage(stageName)) continue;

    const events = stage?.Events || stage?.events || [];

    for (const ev of events) {
      const home = ev?.T1?.[0] || {};
      const away = ev?.T2?.[0] || {};
      const dateInfo = parseDateInfo(ev?.Esd || '');

      matches.push({
        id: ev?.Eid || `${stageName}-${Math.random()}`,
        home: home?.Nm || home?.name || 'TBD',
        away: away?.Nm || away?.name || 'TBD',
        homeLogo: home?.Img || null,
        awayLogo: away?.Img || null,
        homeCountry: home?.Cnm || home?.country || null,
        awayCountry: away?.Cnm || away?.country || null,
        score1: hasNumeric(ev?.Tr1) ? Number(ev.Tr1) : null,
        score2: hasNumeric(ev?.Tr2) ? Number(ev.Tr2) : null,
        status: normalizeStatus(ev?.Eps || ev?.Epr || ev?.Esm || ''),
        dateLabel: dateInfo.label,
        dateSort: dateInfo.sort,
        timeLabel: dateInfo.time,
        roundLabel: detectRoundFromErnInf(ev?.ErnInf, stageName),
        aggregate: parseAggregate(ev),
      });
    }
  }

  matches.sort((a, b) => b.dateSort.localeCompare(a.dateSort));
  return matches;
}

function hasNumeric(value) {
  return value !== undefined && value !== null && value !== '' && !Number.isNaN(Number(value));
}

function isQualificationStage(name) {
  const n = String(name || '').toLowerCase();
  return ['qualification', 'qualifying', 'preliminary', 'play-off', 'playoff'].some((k) => n.includes(k));
}

function normalizeStatus(rawStatus) {
  const status = String(rawStatus || '').toLowerCase().trim();

  if (['ft', 'finished', 'full time', 'aet', 'pens'].some((k) => status.includes(k))) return 'ft';
  if (['live', '1h', '2h', 'ht'].some((k) => status === k || status.includes(` ${k}`))) return 'live';
  if (['postp', 'postponed', 'abandoned', 'cancelled', 'canc'].some((k) => status.includes(k))) return 'postponed';

  return 'upcoming';
}

function parseDateInfo(ts) {
  const raw = String(ts || '');
  if (!raw) return { label: 'Date TBD', sort: '', time: '' };

  try {
    if (raw.length >= 12) {
      const y = raw.slice(0, 4);
      const m = raw.slice(4, 6);
      const d = raw.slice(6, 8);
      const hh = raw.slice(8, 10);
      const mm = raw.slice(10, 12);
      const date = new Date(`${y}-${m}-${d}T${hh}:${mm}:00`);

      return {
        label: date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }),
        sort: `${y}${m}${d}${hh}${mm}`,
        time: `${hh}:${mm}`,
      };
    }

    if (raw.length >= 8) {
      const y = raw.slice(0, 4);
      const m = raw.slice(4, 6);
      const d = raw.slice(6, 8);
      const date = new Date(`${y}-${m}-${d}`);

      return {
        label: date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }),
        sort: `${y}${m}${d}0000`,
        time: '',
      };
    }
  } catch {
    return { label: 'Date TBD', sort: '', time: '' };
  }

  return { label: 'Date TBD', sort: '', time: '' };
}

function detectRoundFromErnInf(ernInf, fallback) {
  const raw = String(ernInf || fallback || '').trim();
  if (!raw) return 'Champions League';

  const lower = raw.toLowerCase();
  const fallbackLower = String(fallback || '').toLowerCase();

  // The feed sometimes returns just "8" for league-stage matchday metadata.
  if (/^\d+$/.test(lower)) {
    if (fallbackLower.includes('league stage')) return 'League Stage';
    return `Matchday ${lower}`;
  }

  if (lower.includes('league stage')) return 'League Stage';
  if (lower.includes('group')) return 'Group Stage';

  if (lower.includes('1/8') || lower.includes('round of 16') || lower.includes('last 16') || lower.includes('r16')) return 'Round Of 16';
  if (lower.includes('1/4') || lower.includes('quarter')) return 'Quarter Finals';
  if (lower.includes('1/2') || lower.includes('semi')) return 'Semi Finals';
  if (lower === 'final' || lower === 'finals' || lower.endsWith(' final') || lower.endsWith(' finals')) return 'Finals';
  if (lower.includes('play-off') || lower.includes('playoff')) return 'Play-offs';
  if (lower.includes('league')) return 'League Stage';

  return fallback && String(fallback).trim() ? String(fallback).trim() : raw;
}

function parseAggregate(event) {
  const seriesInfo = firstVal(event?.SeriesInfo, event?.seriesInfo, event?.Si, event?.Sif, null);

  if (seriesInfo && typeof seriesInfo === 'object') {
    const leg = firstVal(seriesInfo?.currentLeg, seriesInfo?.CurrentLeg, null);
    const totalLegs = firstVal(seriesInfo?.totalLegs, seriesInfo?.TotalLegs, null);
    const aggTeam1 = firstVal(seriesInfo?.aggScoreTeam1, seriesInfo?.AggScoreTeam1, seriesInfo?.aggScore1, seriesInfo?.AggScore1, null);
    const aggTeam2 = firstVal(seriesInfo?.aggScoreTeam2, seriesInfo?.AggScoreTeam2, seriesInfo?.aggScore2, seriesInfo?.AggScore2, null);

    if (hasNumeric(aggTeam1) && hasNumeric(aggTeam2)) {
      const legText = hasNumeric(leg) && hasNumeric(totalLegs)
        ? ` (${Number(leg)}/${Number(totalLegs)})`
        : '';
      return `Agg: ${Number(aggTeam1)}-${Number(aggTeam2)}`;
    }
  }

  if (typeof seriesInfo === 'string' && seriesInfo.trim()) {
    return seriesInfo.trim();
  }

  const aggScoreTeam1 = firstVal(event?.aggScoreTeam1, event?.AggScoreTeam1, event?.aggScore1, event?.AggScore1);
  const aggScoreTeam2 = firstVal(event?.aggScoreTeam2, event?.AggScoreTeam2, event?.aggScore2, event?.AggScore2);
  if (hasNumeric(aggScoreTeam1) && hasNumeric(aggScoreTeam2)) {
    return `Agg: ${Number(aggScoreTeam1)}-${Number(aggScoreTeam2)}`;
  }

  const values = [
    event?.aggScore,
    event?.Etx,
    event?.Es,
  ];
  const found = values.find((v) => {
    if (typeof v !== 'string') return false;
    const s = v.toLowerCase();
    return s.includes('agg') || s.includes('series');
  });
  return found || '';
}

function filterMatches(button, filter) {
  document.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
  button.classList.add('active');
  state.matchFilter = filter;
  renderMatchCards();
}

function getFilteredMatches() {
  if (state.matchFilter === 'all') return state.matches;
  return state.matches.filter((m) => m.status === state.matchFilter);
}

function renderMatchCards() {
  const grid = document.getElementById('matchesGrid');
  const matches = getFilteredMatches();

  if (!matches.length) {
    grid.innerHTML = errorHTML('No matches found', 'No fixtures or results in this category yet.');
    return;
  }

  const grouped = groupMatchesByStageAndDate(matches);
  grid.innerHTML = grouped.map((group) => stageGroupHTML(group)).join('');
}

function groupMatchesByStageAndDate(matches) {
  const stageMap = new Map();

  for (const match of matches) {
    const stage = match.roundLabel || 'Champions League';
    if (!stageMap.has(stage)) {
      stageMap.set(stage, {
        stage,
        dates: new Map(),
      });
    }

    const stageBucket = stageMap.get(stage);
    const dateKey = match.dateSort ? match.dateSort.slice(0, 8) : 'tbd';
    if (!stageBucket.dates.has(dateKey)) {
      stageBucket.dates.set(dateKey, {
        dateKey,
        dateLabel: match.dateLabel,
        matches: [],
      });
    }

    stageBucket.dates.get(dateKey).matches.push(match);
  }

  const stagePriority = {
    Finals: 6,
    'Semi Finals': 5,
    'Quarter Finals': 4,
    'Round Of 16': 3,
    'League Stage': 2,
    'Group Stage': 1,
    'Play-offs': 0,
  };

  const ordered = [...stageMap.values()].sort((a, b) => {
    const p = (stagePriority[b.stage] || -1) - (stagePriority[a.stage] || -1);
    if (p !== 0) return p;
    return a.stage.localeCompare(b.stage);
  });

  for (const stageGroup of ordered) {
    stageGroup.dates = [...stageGroup.dates.values()].sort((a, b) => b.dateKey.localeCompare(a.dateKey));
    for (const dateGroup of stageGroup.dates) {
      dateGroup.matches.sort((a, b) => b.dateSort.localeCompare(a.dateSort));
    }
  }

  return ordered;
}

function stageGroupHTML(group) {
  const datesHTML = group.dates
    .map((dateGroup) => `
      <section class="match-date-group">
        <header class="match-group-head">
          <h3 class="match-group-date">${dateGroup.dateLabel}</h3>
        </header>
        <div class="match-group-list">
          ${dateGroup.matches.map((match) => matchCardHTML(match)).join('')}
        </div>
      </section>`)
    .join('');

  return `
    <section class="match-stage-group">
      <h3 class="match-stage-title">${group.stage}</h3>
      <div class="match-stage-content">
        ${datesHTML}
      </div>
    </section>`;
}

function matchCardHTML(match) {
  const hasScore = match.score1 !== null && match.score2 !== null;
  const score = hasScore
    ? `<div class="score-line">${match.score1}<span class="score-sep">:</span>${match.score2}</div>`
    : '<div class="score-line no-score">-<span class="score-sep">:</span>-</div>';

  const statusLabel =
    match.status === 'ft' ? 'Full time' :
    match.status === 'postponed' ? 'Postponed' :
    match.status === 'live' ? 'Live' :
    'Upcoming';

  const aggregate = match.aggregate ? `<div class="match-aggregate">${match.aggregate}</div>` : '';

  return `
    <article class="match-card">
      <div class="team-side home">
        ${crestHTML(match.homeLogo, match.home, 'team-crest')}
        <div class="team-name">${match.home}</div>
      </div>

      <div class="score-center">
        ${aggregate}
        ${score}
        <div class="match-status">${statusLabel}</div>
      </div>

      <div class="team-side away">
        ${crestHTML(match.awayLogo, match.away, 'team-crest')}
        <div class="team-name">${match.away}</div>
      </div>
    </article>`;
}

async function loadStandings() {
  const container = document.getElementById('standingsContainer');
  container.innerHTML = loadingHTML();

  try {
    const data = await apiFetch(ENDPOINTS.standings);
    state.standings = parseStandings(data);
    state.loaded.standings = true;
    renderStandingsTable();
    renderTeams();
  } catch (err) {
    console.error('Standings fetch error:', err);
    container.innerHTML = errorHTML('Could not load standings', err.message);
  }
}

function parseStandings(data) {
  const rows =
    data?.LeagueTable?.L?.[0]?.Tables?.[0]?.team ||
    data?.LeagueTable?.L?.[0]?.Tables?.[0]?.teams ||
    [];

  if (!Array.isArray(rows)) return [];
  return rows.map(parseStandingRow).filter((row) => row.name && !Number.isNaN(row.pos));
}

function parseStandingRow(row) {
  const team = row?.team || row?.T || row;

  const gf = Number(firstVal(row?.gf, row?.GF, row?.goalsFor, 0));
  const ga = Number(firstVal(row?.ga, row?.GA, row?.goalsAgainst, 0));
  const gdRaw = firstVal(row?.gd, row?.GD, row?.goalDifference, gf - ga);

  return {
    pos: Number(firstVal(row?.rnk, row?.Rnk, row?.rank, row?.position, 0)),
    name: String(firstVal(team?.Tnm, team?.Nm, row?.Tnm, row?.name, 'Unknown')),
    logo: firstVal(team?.Img, row?.Img, row?.logo, null),
    country: String(firstVal(team?.Cnm, team?.Cn, row?.Cnm, row?.country, 'Unknown')),
    pld: Number(firstVal(row?.pld, row?.Pld, row?.pl, row?.Pl, row?.mp, row?.MP, row?.played, row?.Played, 0)),
    won: Number(firstVal(row?.win, row?.Win, row?.won, row?.W, 0)),
    lost: Number(firstVal(row?.lst, row?.Lst, row?.lost, row?.L, 0)),
    drawn: Number(firstVal(row?.drw, row?.Drw, row?.drawn, row?.D, 0)),
    gf,
    gd: Number(gdRaw),
    ga,
    ptsn: Number(firstVal(row?.ptsn, row?.Ptsn, row?.pts, row?.Pts, row?.P, 0)),
  };
}

function firstVal(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return null;
}

function renderStandingsTable() {
  const container = document.getElementById('standingsContainer');
  const rows = [...state.standings];

  if (!rows.length) {
    container.innerHTML = errorHTML('No standings data', 'Standings feed has no team rows right now.');
    return;
  }

  rows.sort((a, b) => a.pos - b.pos || b.ptsn - a.ptsn);

  const body = rows
    .map((row, index) => {
      const position = row.pos || index + 1;
      const zoneClass = position <= 8 ? 'knockout' : position <= 24 ? 'playoff' : 'eliminated';
      const gdClass = row.gd > 0 ? 'pos' : row.gd < 0 ? 'neg' : '';
      const gdValue = row.gd > 0 ? `+${row.gd}` : `${row.gd}`;

      return `
        <tr>
          <td><span class="pos-num ${zoneClass}">${position}</span></td>
          <td>
            <div class="st-team-cell">
              ${crestHTML(row.logo, row.name, 'st-crest')}
              <span class="st-name">${row.name}</span>
            </div>
          </td>
          <td class="td-pld">${row.pld || row.won + row.lost + row.drawn}</td>
          <td>${row.won}</td>
          <td>${row.lost}</td>
          <td>${row.drawn}</td>
          <td>${row.gf}</td>
          <td class="td-gd ${gdClass}">${gdValue}</td>
          <td>${row.ga}</td>
          <td class="td-pts">${row.ptsn}</td>
        </tr>`;
    })
    .join('');

  container.innerHTML = `
    <div class="standings-shell">
      <table class="standings-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Team</th>
            <th>Played</th>
            <th>W</th>
            <th>L</th>
            <th>D</th>
            <th>GF</th>
            <th>GD</th>
            <th>GA</th>
            <th>PTS</th>
          </tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    </div>`;
}

function renderTeams() {
  const grid = document.getElementById('teamsGrid');
  const teams = buildTeamList();

  if (!teams.length) {
    grid.innerHTML = loadingHTML('Team images will appear after fixtures or standings load.');
    return;
  }

  grid.innerHTML = teams
    .map((team) => `
      <article class="team-card">
        <div class="team-card-crest-wrap">
          ${crestHTML(team.logo, team.name, 'team-card-crest')}
        </div>
        <h3 class="team-card-name">${team.name}</h3>
        <p class="team-card-country">${team.country || resolveTeamCountry(team.name)}</p>
      </article>`)
    .join('');
}

function buildTeamList() {
  const teamMap = new Map();

  for (const match of state.matches) {
    if (match.home && match.home !== 'TBD' && !teamMap.has(match.home)) {
      teamMap.set(match.home, {
        name: match.home,
        logo: match.homeLogo,
        country: match.homeCountry || resolveTeamCountry(match.home),
      });
    }
    if (match.away && match.away !== 'TBD' && !teamMap.has(match.away)) {
      teamMap.set(match.away, {
        name: match.away,
        logo: match.awayLogo,
        country: match.awayCountry || resolveTeamCountry(match.away),
      });
    }
  }

  for (const team of state.standings) {
    if (team.name && !teamMap.has(team.name)) {
      teamMap.set(team.name, {
        name: team.name,
        logo: team.logo,
        country: team.country || resolveTeamCountry(team.name),
      });
    }
  }

  return [...teamMap.values()].sort((a, b) => a.name.localeCompare(b.name));
}

function crestHTML(logoUrl, name, className) {
  const safeName = name || 'Team';
  const localLogo = resolveTeamLogo(safeName);
  const src = localLogo || logoUrl;

  if (src) {
    return `<div class="${className}"><img src="${src}" alt="${safeName}" onerror="this.parentNode.textContent='${abbrev(safeName)}'" /></div>`;
  }

  return `<div class="${className}">${abbrev(safeName)}</div>`;
}

function resolveTeamLogo(teamName) {
  const key = String(teamName || '').toLowerCase().trim();
  if (TEAM_LOGO_MAP[key]) return TEAM_LOGO_MAP[key];

  const normalized = key
    .replace(/\./g, '')
    .replace(/\b(fc|cf|ac|sc|afc)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (TEAM_LOGO_MAP[normalized]) return TEAM_LOGO_MAP[normalized];

  for (const [alias, path] of Object.entries(TEAM_LOGO_MAP)) {
    if (normalized.includes(alias) || alias.includes(normalized)) return path;
  }

  return null;
}

function resolveTeamCountry(teamName) {
  const key = String(teamName || '').toLowerCase().trim();
  if (TEAM_COUNTRY_MAP[key]) return TEAM_COUNTRY_MAP[key];

  const normalized = key
    .replace(/\./g, '')
    .replace(/\b(fc|cf|ac|sc|afc)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (TEAM_COUNTRY_MAP[normalized]) return TEAM_COUNTRY_MAP[normalized];

  for (const [alias, country] of Object.entries(TEAM_COUNTRY_MAP)) {
    if (normalized.includes(alias) || alias.includes(normalized)) return country;
  }

  return 'Unknown';
}

function abbrev(name) {
  return String(name || '?')
    .split(/[\s\-/]+/)
    .map((w) => w[0] || '')
    .join('')
    .slice(0, 3)
    .toUpperCase();
}

function loadingHTML(message) {
  const text = message || 'Loading data...';
  return `<div class="loading-state"><div class="spinner"></div><p>${text}</p></div>`;
}

function errorHTML(title, detail) {
  return `
    <div class="error-state">
      <div class="error-icon">!</div>
      <div class="error-title">${title}</div>
      <div class="error-sub">${detail || 'Please try again in a few moments.'}</div>
    </div>`;
}

document.addEventListener('DOMContentLoaded', () => {
  loadMatches();
  loadStandings();

  setInterval(() => {
    if (state.currentPage === 'matches') loadMatches();
  }, 120000);
});
