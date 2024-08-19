const DOMAIN = "zone01normandie.org"
let token;
let totalXp = 0;
let skillMap = new Map();
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const credentials = btoa(`${username}:${password}`); // Encoder les identifiants en base64
    fetch(`https://${DOMAIN}/api/auth/signin`, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${credentials}`
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Invalid credentials');
            }
            return response.json();
        })
        .then(data => {
            console.log('Login successful:', data);
            localStorage.setItem('jwt', data); // Stocker le JWT localement
            token = data;
            localStorage.clear();
            fetchUserData(); // Récupérer les données utilisateur après la connexion
        })
        .catch(error => {
            console.error('Login failed:', error);
            // Afficher le message d'erreur à l'utilisateur
            alert('Login failed: ' + error.message);
        });
}
async function fetchUserData() {
    fetch(`https://${DOMAIN}/api/graphql-engine/v1/graphql`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Ajoutez le JWT dans l'en-tête d'autorisation
        },
        body: JSON.stringify({
            query: `
      query {
        user {
            id
            login
            attrs
            totalUp
            totalDown
            transactions ( where: {eventId: {_eq: 148}}, order_by: {createdAt:asc}){
              amount
              type
              createdAt
            }
        }
    }
    `
        })
    })
        .then(response => response.json())
        .then(data => {
            console.log(data); // Affiche les données de l'utilisateur dans la console
            loadDataPage(data);
        })
        .catch(error => {
            console.error('Erreur lors de la récupération des données utilisateur:', error);
        });
}
function Init() {
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.remove();
    }
    const divs = document.getElementsByClassName("modulable")
    for (let i = 0; i < divs.length; i++) {
        divs[i].innerHTML = "";
    }
    console.log("Jorisapprendacoder27#")
    const header = document.getElementById("header");
    const username = document.createElement("input");
    username.type = "text";
    username.placeholder = "Username";
    username.id = "username";
    header.appendChild(username);
    const password = document.createElement("input");
    password.type = "password";
    password.placeholder = "Password";
    password.id = "password";
    header.appendChild(password);
    
    const loginBtn = document.createElement("button");
    loginBtn.innerHTML = "Login";
    loginBtn.onclick = login;
    header.appendChild(loginBtn);
}
function loadDataPage(data) {
    getGraphData(data.data.user[0].transactions);
    getSkillsData(data.data.user[0].transactions);
    const header = document.getElementById("header");
    header.innerHTML = "<h1>GraphQL</h1>";
    const stats = document.getElementById("stats");
    stats.style.display = "flex";
    const base_data = document.getElementById("base_data");
    const user = document.createElement("div");
    user.innerHTML = `User: ${data.data.user[0].login}`;
    base_data.appendChild(user);
    const userXp = document.createElement("div");
    userXp.innerHTML = `User XP: ${totalXp}`;
    base_data.appendChild(userXp);
    // console.log(typeof data.data.user[0].totalUp)
    const logoutBtn = document.createElement("button");
    logoutBtn.innerHTML = "Logout";
    logoutBtn.id = "logoutBtn";
    logoutBtn.onclick = Init;
    header.appendChild(logoutBtn);
    // const inner = setRatioInner(data.data.totalUp, data.data.totalDown);
    let totalDown_data;
    let totalUp_data;
    if (data.data.user[0].totalDown > data.data.user[0].totalUp) {
        totalDown_data = 400;
        totalUp_data = 400 * (data.data.user[0].totalUp / data.data.user[0].totalDown);
    } else {
        totalUp_data = 400;
        totalDown_data = 400 * (data.data.user[0].totalDown / data.data.user[0].totalUp);
    }
    const ratio_container = document.getElementById("ratio_container");
    const line_container = document.getElementById("line_container");
    const lines = document.getElementById("lines");
    lines.innerHTML = `<svg width="500" height="200">
    <line x1="10" y1="90" x2="${totalDown_data}" y2="90" stroke="orange" stroke-width="4" /> 
    <line x1="10" y1="130" x2="${totalUp_data}" y2="130" stroke="green" stroke-width="4" /> 
</svg>`
    line_container.prepend(lines);
    const upDiv = document.getElementById("totalUp")
    upDiv.innerHTML = `Total up: ${data.data.user[0].totalUp}`;
    const downDiv = document.getElementById("totalDown")
    downDiv.innerHTML = `Total down: ${data.data.user[0].totalDown}`;
    const ratio = document.getElementById("ratio");
    const ratioValue = data.data.user[0].totalUp / data.data.user[0].totalDown;
    ratio.innerText = `Ratio: ${ratioValue.toFixed(2)}`;
}
function getSkillsData(data) {
    const skill_data = document.getElementById("skill_data");
    for(let i = 0; i < data.length; i++) {
        if(data[i].type.includes("skill")) {
            skillMap.set(data[i].type, data[i].amount);
        }
    }
    for (let [key, value] of skillMap) {
        const skill = document.createElement("div");
        skill.innerHTML = `${key}: ${value}`;
        skill_data.appendChild(skill);
    }
    console.log(skillMap);
}
function getGraphData(data) {
    // console.log(data);
    let xpTab = [];
    for (let i = 0; i < data.length; i++) {
        if (data[i].type === "xp") {
            xpTab.push(data[i]);
        }
    }
    // console.log(xpTab)
    setGraph(xpTab);
}
function setGraph(tab) {
    const graph_container = document.getElementById("graph_container");
    const first_date = new Date(tab[0].createdAt);
    const last_date = new Date(tab[tab.length-1].createdAt);
    // const duration = last_date - first_date;
    // Convertir les dates en timestamps pour faciliter les calculs
    const startTimestamp = new Date(tab[0].createdAt).getTime();
    const endTimestamp = new Date(tab[tab.length - 1].createdAt).getTime();
    // Calculer la durée totale de la période
    // Calculer combien de temps s'est écoulé depuis la date de début jusqu'à la date donnée
    // Calculer la position x en fonction de la durée écoulée et de la largeur du graphique
    let axeX = 0;
    let axeXContent = ``
    for (let i = 0; i < 12; i++) {
        axeX += 50;
        if (first_date.getMonth() + i > 12) {
            axeXContent += `<text x="${axeX}" y="620" font-family="Verdana" font-size="15" fill="black">${first_date.getMonth() + i - 12}/${(first_date.getFullYear() + 1) % 100}</text>`;
        } else {
            axeXContent += `<text x="${axeX}" y="620" font-family="Verdana" font-size="15" fill="black">${first_date.getMonth() + i}/${first_date.getFullYear() % 100}</text>`;
        }
    }
    let points = "";
    for (let i = 0; i < tab.length; i++) {
        totalXp += tab[i].amount;
    }
    let currentXp = 0;
    for (let i = 0; i < tab.length; i++) {
        currentXp += tab[i].amount;
        const y = 600 * (1 - (currentXp / totalXp));
        // const temp = new Date(tab[i].createdAt);
        const dateTimestamp = new Date(tab[i].createdAt).getTime();
        const totalDuration = endTimestamp - startTimestamp;
        const elapsedDuration = dateTimestamp - startTimestamp;
        const x = 50 + (elapsedDuration / totalDuration) * axeX;
        console.log(elapsedDuration, totalDuration, x);
        points += `${x},${y} `;
    }
    let step = totalXp / 12;
    console.log("step l 205", totalXp);
    console.log("step l 205", step);
    graph_container.innerHTML = `
    <svg width="50vw" height="650">
    <polyline fill="none" stroke="black" stroke-width="1" 
        points="${points}" />
        <!-- Axes -->
    <line x1="50" y1="600" x2="650" y2="600" stroke="black" stroke-width="2" />
    <line x1="50" y1="600" x2="50" y2="0" stroke="black" stroke-width="2" />
    <!-- Étiquettes pour l'axe des x -->
    ${axeXContent}
    <!-- Étiquettes pour l'axe des y -->
    <text x="0" y="40" font-family="Verdana" font-size="15" fill="black">${totalXp}</text>
    <text x="0" y="90" font-family="Verdana" font-size="15" fill="black">${step.toFixed(0) * 10}</text>
    <text x="0" y="140" font-family="Verdana" font-size="15" fill="black">${step.toFixed(0) * 9}</text>
    <text x="0" y="190" font-family="Verdana" font-size="15" fill="black">${step.toFixed(0) * 8}</text>
    <text x="0" y="240" font-family="Verdana" font-size="15" fill="black">${step.toFixed(0) * 7}</text>
    <text x="0" y="290" font-family="Verdana" font-size="15" fill="black">${step.toFixed(0) * 6}</text>
    <text x="0" y="340" font-family="Verdana" font-size="15" fill="black">${step.toFixed(0) * 5}</text>
    <text x="0" y="390" font-family="Verdana" font-size="15" fill="black">${step.toFixed(0) * 4}</text>
    <text x="0" y="440" font-family="Verdana" font-size="15" fill="black">${step.toFixed(0) * 3}</text>
    <text x="0" y="490" font-family="Verdana" font-size="15" fill="black">${step.toFixed(0) * 2}</text>
    <text x="0" y="540" font-family="Verdana" font-size="15" fill="black">${step.toFixed(0) * 1}</text>
    <text x="0" y="590" font-family="Verdana" font-size="15" fill="black">0</text>
</svg>`
}
// function setRatioInner(totalUp, totalDown) {
//     return inner;
// }
Init();