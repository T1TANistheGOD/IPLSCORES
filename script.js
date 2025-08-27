const allMatchesEl = document.querySelector('.container');

const fetchLiveScores = async () => {
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
        console.log(result.Stages[0].Events);
		    const matches=result.Stages[0].Events;

		renderMatches(matches,allMatchesEl);
    }catch{}
};
fetchLiveScores();

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
	    <div class="matchcont">
          ${matchesEl}
      </div>`;
}
