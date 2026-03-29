// Team images
const images = {
  "Chennai Super Kings": 'images/CSK.jpg',
  "Royal Challengers Bengaluru": 'images/RCB.jpg',
  "Punjab Kings": 'images/PBKS.jpg',
  "Delhi Capitals": 'images/DC.jpg',
  "Kolkata Knight Riders": 'images/KKR.jpg',
  "Sunrisers Hyderabad": 'images/SRH.jpg',
  "Rajasthan Royals": 'images/RR.jpg',
  "Lucknow Super Giants": 'images/LSG.jpg',
  "Gujarat Titans": 'images/GT.jpg',
  "Mumbai Indians": 'images/MI.jpg',
};

const teamCodes = {
    "Chennai Super Kings": "CSK",
    "Royal Challengers Bengaluru": "RCB",
    "Punjab Kings": "PBKS",
    "Delhi Capitals": "DC",
    "Kolkata Knight Riders": "KKR",
    "Sunrisers Hyderabad": "SRH",
    "Rajasthan Royals": "RR",
    "Lucknow Super Giants": "LSG",
    "Gujarat Titans": "GT",
    "Mumbai Indians": "MI"
};

let allMatchesData = [];
let standingsData = [];

const RAPID_API_HOST = 'livescore6.p.rapidapi.com';
const RAPID_API_KEY = '644c313eb1msh54941d04889366cp18e9f9jsn5ba62ab2afde';

// ════════════════════════════════════════════════════════════
// FETCH AND INITIALIZE DATA
// ════════════════════════════════════════════════════════════

const fetchLiveScores = async () => {
    const url = 'https://livescore6.p.rapidapi.com/matches/v2/list-by-league?Category=cricket&Ccd=india&Scd=ipl&Timezone=5.75';
    const options = {
        method: 'GET',
        headers: {
                    'x-rapidapi-key': RAPID_API_KEY,
                    'x-rapidapi-host': RAPID_API_HOST
      }
    };

    try {
        const response = await fetch(url, options);
        const result = await response.json();
        
        // Store matches data
        allMatchesData = result.Stages[0]?.Events || [];
        console.log(allMatchesData);
        // Store standings data
        standingsData = result.Stages[0]?.LeagueTable?.L?.[0]?.Tables?.[0]?.team || [];
        
        // Render active section on load
        const activeSection = document.querySelector('.nav-link.active')?.dataset.section || 'matches';
        renderSection(activeSection);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};

// ════════════════════════════════════════════════════════════
// SECTION SWITCHING AND NAV MANAGEMENT
// ════════════════════════════════════════════════════════════
function setActiveNav(sectionName) {
    // Remove active class from all nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Add active class to clicked link
    document.querySelector(`.nav-link[data-section="${sectionName}"]`)?.classList.add('active');
}

function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show selected section
    const selectedSection = document.getElementById(sectionName);
    if (selectedSection) {
        selectedSection.style.display = 'flex';
    }
}

function renderSection(sectionName) {
    setActiveNav(sectionName);
    showSection(sectionName);
    
    if (sectionName === 'matches') {
        renderUpcomingMatches();
    } else if (sectionName === 'results') {
        renderCompletedMatches();
    } else if (sectionName === 'standings') {
        renderStandingsSection();
    }
}

function initHomePage() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            if (!section) return;
            renderSection(section);
        });
    });

    document.querySelectorAll('.footer-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            if (!section) return;
            renderSection(section);
            window.scrollTo(0, 0);
        });
    });

    fetchLiveScores();
}

// ════════════════════════════════════════════════════════════
// MATCH FILTERING
// ════════════════════════════════════════════════════════════

function isMatchCompleted(match) {
    const eps = String(match?.Eps || '').toLowerCase();
    const epsLong = String(match?.EpsL || '').toLowerCase();
    const status = (match.ECo || '').toLowerCase();

    if (eps === 'ft' || epsLong.includes('finished') || epsLong.includes('completed')) {
        return true;
    }

    return [
        'ended',
        'finished',
        'won by',
        'beat',
        'tied',
        'draw',
        'abandoned',
        'no result',
        'cancelled'
    ].some((marker) => status.includes(marker));
}

function getUpcomingMatches(matches) {
    return matches.filter(match => !isMatchCompleted(match));
}

function getCompletedMatches(matches) {
    return matches.filter(match => isMatchCompleted(match));
}

function getMatchSortValue(match) {
    const raw = String(match?.Esd || '').trim();
    if (/^\d{14}$/.test(raw)) {
        return Number(raw);
    }

    const asDate = new Date(raw);
    return Number.isNaN(asDate.getTime()) ? 0 : asDate.getTime();
}

function buildMatchDetailsUrl(game) {
    if (!game?.Eid) {
        return '#';
    }

    const params = new URLSearchParams({
        eid: String(game.Eid),
        title: String(game.ErnInf || 'IPL Match'),
        t1: String(game?.T1?.[0]?.Nm || 'Team 1'),
        t2: String(game?.T2?.[0]?.Nm || 'Team 2'),
        date: formatMatchDateTime(game.Esd),
        status: formatMatchStatus(game.ECo),
        t1s: game.Tr1C1 !== undefined ? String(game.Tr1C1) : '-',
        t1w: game.Tr1CW1 !== undefined ? String(game.Tr1CW1) : '-',
        t1o: game.Tr1CO1 !== undefined ? String(game.Tr1CO1) : '-',
        t2s: game.Tr2C1 !== undefined ? String(game.Tr2C1) : '-',
        t2w: game.Tr2CW1 !== undefined ? String(game.Tr2CW1) : '-',
        t2o: game.Tr2CO1 !== undefined ? String(game.Tr2CO1) : '-',
        t1img: String(images[game?.T1?.[0]?.Nm] || ''),
        t2img: String(images[game?.T2?.[0]?.Nm] || ''),
        venue: String(game?.Vnm || game?.Ven || game?.Venue || 'Venue TBA')
    });

    return `match.html?${params.toString()}`;
}

function formatMatchStatus(statusText) {
    const status = String(statusText || '').trim();
    const normalized = status.toLowerCase();

    if (
        normalized.includes('teams will be announced at the toss') ||
        normalized.includes('teams will be announced at toss')
    ) {
        return 'Match not started';
    }

    return status || 'Status unavailable';
}

// ════════════════════════════════════════════════════════════
// DATE/TIME FORMATTING
// ════════════════════════════════════════════════════════════

function formatMatchDateTime(timestampStr) {
    if (!timestampStr) return 'TBA';
    
    try {
        const raw = String(timestampStr).trim();

        // API format: YYYYMMDDHHmmss (example: 20260328201500)
        if (/^\d{14}$/.test(raw)) {
            const monthIndex = parseInt(raw.slice(4, 6), 10) - 1;
            const day = parseInt(raw.slice(6, 8), 10);
            const hour24 = parseInt(raw.slice(8, 10), 10);
            const minute = parseInt(raw.slice(10, 12), 10);

            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const monthAbbr = months[monthIndex] || 'TBA';

            const suffix = hour24 >= 12 ? 'PM' : 'AM';
            const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
            const minutePadded = String(minute).padStart(2, '0');

            return `${monthAbbr} ${day} | ${hour12}:${minutePadded} ${suffix}`;
        }

        // Fallback for any non-standard date values
        const date = new Date(raw);
        if (Number.isNaN(date.getTime())) return 'TBA';

        const monthAbbr = date.toLocaleDateString('en-US', { month: 'short' });
        const day = date.getDate();
        const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

        return `${monthAbbr} ${day} | ${time}`;
    } catch (error) {
        console.error('Date formatting error:', error);
        return 'TBA';
    }
}

// ════════════════════════════════════════════════════════════
// RENDER MATCHES (UPCOMING)
// ════════════════════════════════════════════════════════════

function renderUpcomingMatches() {
    const upcomingMatches = getUpcomingMatches(allMatchesData)
        .sort((a, b) => getMatchSortValue(a) - getMatchSortValue(b));
    const container = document.querySelector('#matches .container');
    renderMatches(upcomingMatches, container);
}

function renderCompletedMatches() {
    const completedMatches = getCompletedMatches(allMatchesData)
        .sort((a, b) => getMatchSortValue(b) - getMatchSortValue(a));
    const container = document.querySelector('#results .container');
    renderMatches(completedMatches, container);
}

function renderMatches(matches, element) {
    if (!matches || matches.length === 0) {
        element.innerHTML = '<div class="no-matches" style="text-align: center; padding: 2rem; color: rgba(29, 46, 113, 0.5);">No matches found</div>';
        return;
    }

    let matchesEl = matches.map((game) => {
        const id1 = game.T1[0].Nm; 
        const id2 = game.T2[0].Nm;

        const T1score = game.Tr1C1 !== undefined ? String(game.Tr1C1) : "-"; 
        const T1wickets = game.Tr1CW1 !== undefined ? String(game.Tr1CW1) : "-"; 
        const T1overs = game.Tr1CO1 !== undefined ? String(game.Tr1CO1) : "-"; 
        const T2score = game.Tr2C1 !== undefined ? String(game.Tr2C1) : "-"; 
        const T2wickets = game.Tr2CW1 !== undefined ? String(game.Tr2CW1) : "-"; 
        const T2overs = game.Tr2CO1 !== undefined ? String(game.Tr2CO1) : "-";
        
        // Format match date/time
        const matchDateTime = formatMatchDateTime(game.Esd);
        const matchStatus = formatMatchStatus(game.ECo);
                const detailsUrl = buildMatchDetailsUrl(game);
                const canOpenDetails = detailsUrl !== '#';

        return `
          <div class="box">
            <div class="matchinfo">
              <div class="mno">${game.ErnInf}</div>
              <div class="match-datetime">${matchDateTime}</div>
            </div>
            <div class="matchscore">
              <div class="team team-left">
                <img src="${images[id1]}" alt="${id1}"/>
                <div class="team-info team-info-left">
                  <div class="tname">${id1}</div>
                  <div class="tscore">
                    <div class="mains">${T1score}/${T1wickets}</div>
                    <div class="overs">${T1overs !== '-' ? T1overs + ' ov' : '-'}</div>
                  </div>
                </div>
              </div>
              <div class="vs-badge">VS</div>
              <div class="team team-right">
                <div class="team-info team-info-right">
                  <div class="tname">${id2}</div>
                  <div class="tscore">
                    <div class="mains">${T2score}/${T2wickets}</div>
                    <div class="overs">${T2overs !== '-' ? T2overs + ' ov' : '-'}</div>
                  </div>
                </div>
                <img src="${images[id2]}" alt="${id2}"/>
              </div>
            </div>
                        <div class="box-footer">
                            <div class="state">${matchStatus}</div>
                            <a class="match-info-btn${canOpenDetails ? '' : ' disabled'}" href="${detailsUrl}" title="View Match Details" aria-label="View Match Details"><span class="cricket-icon" aria-hidden="true"></span></a>
                        </div>
          </div>`
    }).join('');

    element.innerHTML = `<div class="matchcont">${matchesEl}</div>`;
}

// ════════════════════════════════════════════════════════════
// RENDER STANDINGS
// ════════════════════════════════════════════════════════════

function renderStandingsSection() {
    const container = document.querySelector('#standings .container');
    renderStandings(standingsData, container);
}

function renderStandings(standings, element) {
    if (!standings || standings.length === 0) {
        element.innerHTML = '<div class="no-matches" style="text-align: center; padding: 2rem; color: rgba(29, 46, 113, 0.5);">No standings data available</div>';
        return;
    }

    let standingEl = standings.map((row) => {
        const id = row.Tnm;
        const rankNum = parseInt(row.rnk);
        const isQualifier = rankNum <= 4;

        return `
            <tr class="${isQualifier ? 'qualifier-row' : ''}">
                <td><span class="rank-badge ${isQualifier ? 'rank-qualifier' : ''}">${row.rnk}</span></td>
                <td><div class="tian"><img src="${images[id]}"/>${row.Tnm}</div></td>
                <td>${row.pld}</td>
                <td>${row.win}</td>
                <td>${row.lst}</td>
                <td><strong>${row.pts}</strong></td>
                <td>${row.nrr}</td>
            </tr>
        `;
    }).join('');

    element.innerHTML = `
    <div class="standing-container">
        <table class="standings-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Team</th>
                    <th>M</th>
                    <th>W</th>
                    <th>L</th>
                    <th>Pts</th>
                    <th>NRR</th>
                </tr>
            </thead>
            <tbody>
                ${standingEl}
            </tbody>
        </table>
    </div>
    <div class="qualifier-legend">
        <span class="qualifier-legend-dot"></span>
        Playoff qualification zone (Top 4)
    </div>
    `;
}

// ════════════════════════════════════════════════════════════
// MATCH DETAILS PAGE
// ════════════════════════════════════════════════════════════

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

function setImage(id, src, alt) {
    const el = document.getElementById(id);
    if (!el) return;

    if (src) {
        el.src = src;
        el.alt = alt || 'Team';
        el.style.display = 'block';
    } else {
        el.style.display = 'none';
    }
}

function sanitizeText(value, fallback = '-') {
    const text = String(value ?? '').trim();
    return text || fallback;
}

function formatScore(score, wickets) {
    const sc = sanitizeText(score, '-');
    const wk = sanitizeText(wickets, '-');
    return `${sc}/${wk}`;
}

function formatOvers(value) {
    const overs = sanitizeText(value, '-');
    return overs === '-' ? '-' : `${overs} ov`;
}

function parseMatchContext() {
    const query = new URLSearchParams(window.location.search);
    return {
        eid: sanitizeText(query.get('eid'), ''),
        title: sanitizeText(query.get('title'), 'IPL Match'),
        t1: sanitizeText(query.get('t1'), 'Team 1'),
        t2: sanitizeText(query.get('t2'), 'Team 2'),
        date: sanitizeText(query.get('date'), 'Date unavailable'),
        status: sanitizeText(query.get('status'), 'Status unavailable'),
        t1s: sanitizeText(query.get('t1s'), '-'),
        t1w: sanitizeText(query.get('t1w'), '-'),
        t1o: sanitizeText(query.get('t1o'), '-'),
        t2s: sanitizeText(query.get('t2s'), '-'),
        t2w: sanitizeText(query.get('t2w'), '-'),
        t2o: sanitizeText(query.get('t2o'), '-'),
        t1img: sanitizeText(query.get('t1img'), ''),
        t2img: sanitizeText(query.get('t2img'), ''),
        venue: sanitizeText(query.get('venue'), 'Venue TBA'),
    };
}

function getTeamCode(teamName) {
    return teamCodes[teamName] || String(teamName || 'TEAM').split(' ').map((word) => word.charAt(0)).join('').slice(0, 4).toUpperCase();
}

function buildPlayerMap(prns) {
    const map = new Map();
    if (!Array.isArray(prns)) return map;

    prns.forEach((player) => {
        const pid = Number(player?.Pid);
        if (!Number.isFinite(pid)) return;

        const first = String(player?.Fn || '').trim();
        const last = String(player?.Ln || '').trim();
        const short = String(player?.Snm || '').trim();
        const fullName = `${first} ${last}`.trim() || short || `Player ${pid}`;
        map.set(pid, fullName);
    });

    return map;
}

function getPlayerName(playerMap, pid) {
    const numericPid = Number(pid);
    return playerMap.get(numericPid) || `Player ${pid}`;
}

function checkIfImpactPlayer(rawText) {
    if (!rawText) return { isImpactRemoved: false, isImpactSubstituted: false };
    const text = String(rawText).toLowerCase();
    return {
        isImpactRemoved: text.includes('impact') && (text.includes('removed') || text.includes('out')),
        isImpactSubstituted: text.includes('impact') && text.includes('sub')
    };
}

function formatDismissalText(rawText, batter, playerMap) {
    const text = sanitizeText(rawText, '').replace(/\s+/g, ' ').trim();
    if (!text) return 'not out';

    const hasFielderToken = text.includes('[F]');
    const hasBowlerToken = text.includes('[B]');
    const fielder = hasFielderToken ? getPlayerName(playerMap, batter?.Fid) : '';
    const bowler = hasBowlerToken ? getPlayerName(playerMap, batter?.Bid) : '';

    return text
        .replace(/\[F\]/g, fielder)
        .replace(/\[B\]/g, bowler)
        .replace(/\s+/g, ' ')
        .trim();
}

function createBattingMarkup(innings, playerMap) {
    const batters = Array.isArray(innings?.Bat) ? innings.Bat : [];
    const battingRows = batters.filter((batter) => !String(batter?.LpTx || '').toLowerCase().includes('did not bat'));
    const didNotBat = batters.filter((batter) => String(batter?.LpTx || '').toLowerCase().includes('did not bat'));

    if (!battingRows.length) {
        return '<p class="section-title">No batting data available</p>';
    }

    // Detect impact player changes
    const impactChanges = battingRows.map((batter) => {
        const { isImpactRemoved, isImpactSubstituted } = checkIfImpactPlayer(batter.LpTx);
        return { batter, isImpactRemoved, isImpactSubstituted };
    });
    
    const impactRemoved = impactChanges.find(item => item.isImpactRemoved);
    const impactSubstituted = impactChanges.find(item => item.isImpactSubstituted);

    const rows = battingRows.map((batter) => {
        const name = getPlayerName(playerMap, batter.Pid);
        const dismissal = formatDismissalText(batter.LpTx, batter, playerMap);
        const { isImpactRemoved, isImpactSubstituted } = checkIfImpactPlayer(batter.LpTx);
        
        let playerIndicator = '';
        if (isImpactRemoved) {
            playerIndicator = '<span class="impact-removed" title="Impact Player Removed"><i class="fas fa-arrow-down"></i></span>';
        } else if (isImpactSubstituted) {
            playerIndicator = '<span class="impact-substituted" title="Impact Player Substituted"><i class="fas fa-arrow-up"></i></span>';
        }

        return `
      <tr${isImpactRemoved || isImpactSubstituted ? ' class="impact-change-row"' : ''}>
                <td class="batsman-name">${playerIndicator}${name}</td>
                <td>${dismissal}</td>
                <td class="batsman-runs">${sanitizeText(batter.R, '0')}</td>
        <td>${sanitizeText(batter.B, '0')}</td>
        <td>${sanitizeText(batter.$4, '0')}</td>
        <td>${sanitizeText(batter.$6, '0')}</td>
        <td>${sanitizeText(batter.Sr, '0')}</td>
      </tr>
    `;
    }).join('');

        const extrasRow = `
            <tr class="extras-row">
                <td class="batsman-name">Extras</td>
                <td>(NB ${sanitizeText(innings?.NB, '0')}, W ${sanitizeText(innings?.WB, '0')}, LB ${sanitizeText(innings?.LB, '0')}, B ${sanitizeText(innings?.B, '0')}, PEN ${sanitizeText(innings?.Pen, '0')})</td>
                <td class="batsman-runs">${sanitizeText(innings?.Ex, '0')}</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
            </tr>
        `;

    const didNotBatMarkup = didNotBat.length
        ? `<p class="did-not-bat"><span class="info-title">Did not bat:</span><br> <span class="info-names">${didNotBat.map((player) => getPlayerName(playerMap, player.Pid)).join(', ')}</span></p>`
        : '';
    
    // Impact player changes summary
    let impactMarkup = '';
    if (impactRemoved || impactSubstituted) {
        impactMarkup = '<div class="impact-player-summary">';
        if (impactRemoved) {
            const removedName = getPlayerName(playerMap, impactRemoved.batter.Pid);
            impactMarkup += `<p class="impact-info"><span class="impact-badge-removed"><i class="fas fa-arrow-down"></i> Removed</span> <strong>${removedName}</strong> (Impact Player)</p>`;
        }
        if (impactSubstituted) {
            const substitutedName = getPlayerName(playerMap, impactSubstituted.batter.Pid);
            impactMarkup += `<p class="impact-info"><span class="impact-badge-substituted"><i class="fas fa-arrow-up"></i> Substituted</span> <strong>${substitutedName}</strong> (Impact Player)</p>`;
        }
        impactMarkup += '</div>';
    }

    return `
    ${impactMarkup}
    <div class="table-scroll">
      <table class="score-table">
        <thead>
          <tr>
            <th>Batter</th>
            <th>Dismissal</th>
            <th>R</th>
            <th>B</th>
            <th>4s</th>
            <th>6s</th>
            <th>SR</th>
          </tr>
        </thead>
                <tbody>${rows}${extrasRow}</tbody>
      </table>
    </div>
    ${didNotBatMarkup}
  `;
}

function createBowlingMarkup(innings, playerMap) {
    const bowlers = Array.isArray(innings?.Bow) ? innings.Bow : [];

    if (!bowlers.length) {
        return '<p class="section-title">No bowling data available</p>';
    }

    const rows = bowlers.map((bowler) => {
        const name = getPlayerName(playerMap, bowler.Pid);
        return `
      <tr>
                <td class="bowler-name">${name}</td>
        <td>${sanitizeText(bowler.Ov, '0')}</td>
        <td>${sanitizeText(bowler.Md, '0')}</td>
        <td>${sanitizeText(bowler.R, '0')}</td>
        <td>${sanitizeText(bowler.Wk, '0')}</td>
        <td>${sanitizeText(bowler.Er, '0')}</td>
      </tr>
    `;
    }).join('');

    return `
    <div class="table-scroll">
      <table class="score-table">
        <thead>
          <tr>
            <th>Bowler</th>
            <th>O</th>
            <th>M</th>
            <th>R</th>
            <th>W</th>
            <th>Econ</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function createFallOfWicketsMarkup(innings, playerMap) {
    const fow = Array.isArray(innings?.FoW) ? innings.FoW : [];
    if (!fow.length) return '';

    const text = fow
        .map((item) => {
            const playerName = getPlayerName(playerMap, item.Pid);
            return `${sanitizeText(item.R, '0')}/${sanitizeText(item.WkN, '-')} (<span class="fow-name">${playerName}</span>, ${sanitizeText(item.B, '-')} ov)`;
        })
        .join(', ');

    return `<p class="fall-of-wickets"><span class="info-title">Fall of wickets:</span><br> ${text}</p>`;
}

function createInningsPanel(innings, playerMap, context, index, fullPayload = null) {
    const battingTeam = Number(innings?.Tn) === 2 ? context.t2 : context.t1;
    const battingCode = getTeamCode(battingTeam);
    const battingTeamImg = Number(innings?.Tn) === 2 ? context.t2img : context.t1img;
    const score = `${sanitizeText(innings?.Pt, '0')}/${sanitizeText(innings?.Wk, '0')}`;
    const overs = sanitizeText(innings?.Ov, '0');
    const runRate = sanitizeText(innings?.Rr, '-');
    const panelId = `panel-${index}`;
    
    // Extract impact player changes (with full payload for dedicated fields)
    const impactChanges = extractImpactPlayerChanges(innings, playerMap, fullPayload);
    
    // Build impact player section
    let impactSection = '';
    if (impactChanges.removed || impactChanges.substituted) {
        impactSection = '<div class="impact-section">';
        if (impactChanges.removed) {
            impactSection += `
              <div class="impact-change">
                <div class="impact-badge removed-badge">
                  <i class="fas fa-arrow-down"></i>
                  <span>Impact Player Removed</span>
                </div>
                <div class="impact-player-name">${impactChanges.removed.name}</div>
              </div>
            `;
        }
        if (impactChanges.substituted) {
            impactSection += `
              <div class="impact-change">
                <div class="impact-badge substituted-badge">
                  <i class="fas fa-arrow-up"></i>
                  <span>Impact Player In</span>
                </div>
                <div class="impact-player-name">${impactChanges.substituted.name}</div>
              </div>
            `;
        }
        impactSection += '</div>';
    }

    return `
        <article class="innings-panel${index === 0 ? ' active' : ''}" data-panel="${panelId}">
      <div class="innings-card">
        <div class="innings-card-header">
          <div class="innings-header-left">
            <img src="${battingTeamImg}" alt="${battingTeam}" class="innings-team-logo" />
            <div>
              <h3>${battingCode} Innings</h3>
              <p>${battingTeam}</p>
            </div>
          </div>
          <div class="innings-header-right">
            <h3>${score} (${overs} ov)</h3>
            <p>Run Rate: ${runRate}</p>
          </div>
        </div>
        
        ${impactSection}

        <div class="innings-section">
          ${createBattingMarkup(innings, playerMap)}
        </div>

        <div class="innings-section">
          ${createFallOfWicketsMarkup(innings, playerMap)}
        </div>

        <div class="innings-section">
          ${createBowlingMarkup(innings, playerMap)}
        </div>
       </div>
      </div>
    </article>
  `;
}

function setupInningsTabs() {
    const tabs = document.querySelectorAll('.innings-tab');
    const panels = document.querySelectorAll('.innings-panel');

    tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.panel;

            tabs.forEach((item) => item.classList.remove('active'));
            tab.classList.add('active');

            panels.forEach((panel) => {
                panel.classList.toggle('active', panel.dataset.panel === target);
            });
        });
    });
}

async function fetchInnings(eid) {
    const url = `https://livescore6.p.rapidapi.com/matches/v2/get-innings?Category=cricket&Eid=${encodeURIComponent(eid)}`;
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': RAPID_API_KEY,
            'x-rapidapi-host': RAPID_API_HOST,
            'Content-Type': 'application/json'
        }
    };

    const response = await fetch(url, options);
    if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
    }

    return response.json();
}

function extractImpactPlayerChanges(innings, playerMap, fullPayload = null) {
    if (!innings) return { removed: null, substituted: null };
    
    const changes = { removed: null, substituted: null };
    
    // First, check if there's dedicated impact player data in the full payload
    if (fullPayload) {
        // Check for Impact changes field
        if (fullPayload.ImpactChanges && Array.isArray(fullPayload.ImpactChanges)) {
            fullPayload.ImpactChanges.forEach(impact => {
                if (impact.Type === 'removed' || impact.Type === 'Removed') {
                    changes.removed = {
                        name: getPlayerName(playerMap, impact.Pid) || impact.PlayerName,
                        pid: impact.Pid
                    };
                } else if (impact.Type === 'substituted' || impact.Type === 'Substituted') {
                    changes.substituted = {
                        name: getPlayerName(playerMap, impact.Pid) || impact.PlayerName,
                        pid: impact.Pid
                    };
                }
            });
            if (changes.removed || changes.substituted) {
                return changes;
            }
        }
    }
    
    // Fallback: Look through batting lineup for impact player indicators in dismissal text
    const batters = Array.isArray(innings.Bat) ? innings.Bat : [];
    
    batters.forEach(batter => {
        const rawText = String(batter?.LpTx || '').toLowerCase();
        const playerName = getPlayerName(playerMap, batter.Pid);
        
        if (rawText.includes('impact') && (rawText.includes('removed') || rawText.includes('sub out') || rawText.includes('substituted out'))) {
            changes.removed = {
                name: playerName,
                pid: batter.Pid
            };
        }
        else if (rawText.includes('impact') && rawText.includes('sub') && !rawText.includes('out')) {
            changes.substituted = {
                name: playerName,
                pid: batter.Pid
            };
        }
    });
    
    return changes;
}

function showMatchError(message) {
    const errorWrap = document.getElementById('error-state');
    const errorText = document.getElementById('error-text');
    const loading = document.getElementById('loading-state');
    const inningsRoot = document.getElementById('innings-root');
    const tabsWrap = document.getElementById('innings-tabs');

    if (loading) loading.hidden = true;
    if (inningsRoot) inningsRoot.hidden = true;
    if (tabsWrap) tabsWrap.hidden = true;

    if (errorWrap) {
        errorWrap.hidden = false;
        if (errorText) errorText.textContent = message;
    }
}

function setMatchHeader(context) {
    setText('match-title', context.title);
    setText('match-date', context.date);
    setText('match-status', context.status);
    setText('team-one-name', context.t1);
    setText('team-two-name', context.t2);
    setText('team-one-score', formatScore(context.t1s, context.t1w));
    setText('team-two-score', formatScore(context.t2s, context.t2w));
    setText('team-one-overs', formatOvers(context.t1o));
    setText('team-two-overs', formatOvers(context.t2o));
    setImage('team-one-logo', context.t1img, context.t1);
    setImage('team-two-logo', context.t2img, context.t2);
}

async function initMatchPage() {
    const context = parseMatchContext();
    setMatchHeader(context);

    if (!context.eid) {
        showMatchError('Missing match EID. Open this page from a Match Info button.');
        return;
    }

    try {
        const payload = await fetchInnings(context.eid);
        const innings = Array.isArray(payload?.SDInn) ? payload.SDInn : [];
        const playerMap = buildPlayerMap(payload?.Prns);

        const loading = document.getElementById('loading-state');
        const inningsRoot = document.getElementById('innings-root');
        const tabsWrap = document.getElementById('innings-tabs');

        if (loading) loading.hidden = true;
        if (loading) loading.remove();

        if (!innings.length) {
            showMatchError('No innings data available yet for this match.');
            return;
        }

        const sortedInnings = innings.sort((a, b) => Number(a?.Inn || 0) - Number(b?.Inn || 0));

        // Log API payload for debugging
        console.log('Full API Payload Structure:', payload);
        console.log('Innings Data:', innings);

        inningsRoot.innerHTML = sortedInnings
            .map((inning, index) => createInningsPanel(inning, playerMap, context, index, payload))
            .join('');

        tabsWrap.innerHTML = sortedInnings
            .map((inning, index) => {
                const teamName = Number(inning?.Tn) === 2 ? context.t2 : context.t1;
                const teamCode = getTeamCode(teamName);
                return `<button class="innings-tab${index === 0 ? ' active' : ''}" type="button" data-panel="panel-${index}">${teamCode} Innings</button>`;
            })
            .join('');

        tabsWrap.hidden = false;
        inningsRoot.hidden = false;
        setupInningsTabs();
    } catch (error) {
        console.error(error);
        showMatchError('Unable to fetch innings details at the moment.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('matches')) {
        initHomePage();
        return;
    }

    if (document.getElementById('match-page')) {
        initMatchPage();
    }
});
