const standingsEl = document.querySelector('.container');

const fetchStandings = async () => {
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
        console.log(result.Stages[0].LeagueTable.L[0].Tables[0].team);
        const standings = result.Stages[0].LeagueTable.L[0].Tables[0].team;
        renderStandings(standings, standingsEl);
    } catch (error) {
        console.error(error);
    }
};

fetchStandings();

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

function renderStandings(standings, element) {


    let standingEl = standings.map((row) => {

        console.log(row.Tnm);


        const id = row.Tnm ;
        
        return `
            <tr>
                <td>${row.rnk}</td>
                <td><div class="tian"><img src="${images[id]}"/>${row.Tnm}</div></td>
                <td>${row.pld}</td>
                <td>${row.win}</td>
                <td>${row.lst}</td>
                <td>${row.pts}</td>
                <td>${row.nrr}</td>
            </tr>
        `;
    }).join('');

    element.innerHTML = `
    <div class="standing-container">
        <table class="standings-table">
            <thead>
                <tr>
                    <th>Rank</th>
                    <th>Team</th>
                    <th>Matches</th>
                    <th>Wins</th>
                    <th>Losses</th>
                    <th>Points</th>
                    <th>NRR</th>
                </tr>
            </thead>
            <tbody>
                ${standingEl}
            </tbody>
        </table>
    </div>
    `;
}
