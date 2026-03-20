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

let allMatchesData = [];
let standingsData = [];

// ════════════════════════════════════════════════════════════
// FETCH AND INITIALIZE DATA
// ════════════════════════════════════════════════════════════

const fetchLiveScores = async () => {
    const url = 'https://livescore6.p.rapidapi.com/matches/v2/list-by-league?Category=cricket&Ccd=india&Scd=ipl&Timezone=5.75';
    const options = {
        method: 'GET',
        headers: {
          'x-rapidapi-key': '1a9f131978msh03f06ea23601303p1d6cc4jsn0a94f4d36b5d',
          'x-rapidapi-host': 'livescore6.p.rapidapi.com'
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

// Add event listeners to nav links
document.addEventListener('DOMContentLoaded', () => {
    // Nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            renderSection(section);
        });
    });
    
    // Footer links
    document.querySelectorAll('.footer-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            renderSection(section);
            window.scrollTo(0, 0);
        });
    });
    
    // Initialize
    fetchLiveScores();
});

// ════════════════════════════════════════════════════════════
// MATCH FILTERING
// ════════════════════════════════════════════════════════════

function isMatchCompleted(match) {
    const status = (match.ECo || '').toLowerCase();
    return status.includes('ended') || status.includes('finished');
}

function getUpcomingMatches(matches) {
    return matches.filter(match => !isMatchCompleted(match));
}

function getCompletedMatches(matches) {
    return matches.filter(match => isMatchCompleted(match));
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
    const upcomingMatches = getUpcomingMatches(allMatchesData);
    const container = document.querySelector('#matches .container');
    renderMatches(upcomingMatches, container);
}

function renderCompletedMatches() {
    const completedMatches = getCompletedMatches(allMatchesData);
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
            <div class="state">${matchStatus}</div>
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
