const standingsEl = document.querySelector('.pts');
const allMatchesEl = document.querySelector('.poff');

const fetchsStandings = async () => {
    const url = 'https://livescore6.p.rapidapi.com/matches/v2/list-by-league?Category=cricket&Ccd=india&Scd=ipl&Timezone=9.5';
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

        const standings = result.Stages[0].LeagueTable.L[0].Tables[0].team.slice(0,4);
        const matches=result.Stages[0].Events.slice(70, 74);
        console.log(matches);
        rendersStandings(standings, standingsEl);

		renderMatches(matches,allMatchesEl);

    } catch{}
};

fetchsStandings();

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

function rendersStandings(standings, element) {

    let standingEl = standings.map((row) => { 
        
        const id = row.Tnm ;
        
        return `
            <div class="card"> 
                <div class="top">
                    <div class="rank">${row.rnk}</div>
                    <div class="tnm">
                       <p>${row.Tnm}</p>
                       <img src="${images[id]}" alt="${row.Tnm}">
                    </div>
                </div>
                <div class="tinf">
                    <div class="tbinf">
                        <div class="tbi">${row.pts}</div>
                        <div class="tbh">Points</div>
                    </div>
                    <div class="tbinf">
                        <div class="tbi">${row.pld}</div>
                        <div class="tbh">Played</div>
                    </div>
                    <div class="tbinf">
                        <div class="tbi">${row.win}</div>
                        <div class="tbh">Won</div>
                    </div>
                    <div class="tbinf">
                        <div class="tbi">${row.nrr}</div>
                        <div class="tbh">NRR</div>
                    </div>
                </div>  
            </div>
        `;
    }).join('');

    element.innerHTML = `
        <div> 
            <h2>Points Table</h2> 
            <div class="cards-container"> 
                ${standingEl}
            </div>
            <div class="buttoncont">
                <a href="standings.html"><button>Full PtsTable</button></a>
            </div>
        </div>
    `;
}

function renderMatches(matches,element){
    
	let matchesEl = matches.map((game) => {

    const id1 = game.T1[0].Nm; 
    const id2 = game.T2[0].Nm;
    const T1score = game.Tr1C1 !== undefined ? String(game.Tr1C1) : "-"; 
    const T1wickets = game.Tr1CW1 !== undefined ? String(game.Tr1CW1) : "-"; 
    const T1overs = game.Tr1CO1 !== undefined ? String(game.Tr1CO1) : "-"; 
    const T2score = game.Tr2C1 !== undefined ? String(game.Tr2C1) : "-"; 
    const T2wickets = game.Tr2CW1 !== undefined ? String(game.Tr2CW1) : "-"; 
    const T2overs= game.Tr2CO1 !== undefined ? String(game.Tr2CO1) : "-";

		return `
		  <div class="box">
            <div class="mno">${game.ErnInf}</div>
            <div class="matchscore">
              <div class="team">
                <img src="${images[id1]}" alt="${game.T1[0].Nm}"/>
                <div class="tscore">
					        <div class="mains">${T1score}/${T1wickets}</div>
                  <div class="overs">${T1overs}</div>
                </div>
              </div>
              <div class="team">
                <div class="tscore">
					        <div class="mains">${T2score}/${T2wickets}</div>
                  <div class="overs">${T2overs}</div>
                </div>
                <img src="${images[id2]}" alt="${game.T2[0].Nm}"/>
              </div>
            </div>
            <hr color="#1D2E71">
            <div class="state">${game.ECo}</div>
          </div>`
	}).join('');

	element.innerHTML = `
        <div> 
            <h2>Playoffs</h2> 
            <div class="matchcont">
                ${matchesEl}
            </div>
            <div class="buttoncont">
                <a href="index.html"><button>All Matches</button></a>
            </div>
        </div>
	    `;
}
