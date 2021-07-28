function daysInMonth (month, year) {
    return new Date(year, month, 0).getDate();
}

function drawGraphic (dataCur, curType) {
    const labels = dataCur.map(elem => new Date(elem.Date).getDate());

    const data = {
        labels: labels,
        datasets: [{
            label: curType.toUpperCase(),
            backgroundColor: 'rgb(255, 99, 132)',
            borderColor: 'rgb(255, 99, 132)',
            data: dataCur.map(elem => elem.Cur_OfficialRate)
        }]
        };
    
        const config = {
        type: 'line',
        data,
        options: {}
        };
    
    var myChart = new Chart(
        document.getElementById('myChart'), config);

        myChart.update('active');
}

function sendRequest (method, url) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.open(method, url);
        xhr.responseType = 'json';
        xhr.onload = () => {
            if (xhr.status >= 400) {
                reject(xhr.response);
            } else {
                resolve(xhr.response) 
            }
        }

        xhr.send();
    })
}

function createCurrencyReq (dataCur, curType) {
    const date = new Date();

    const dayNow = date.getDate();
    const monthNow = date.getMonth();
    const yearNow = date.getFullYear();

    let dayOld = dayNow;
    let monthOld = monthNow;

    if (dayNow - 6 <= 0) {
        monthOld--;
        dayOld = daysInMonth(monthOld, yearNow) - 6;
    }

    const startDate = `${yearNow}-${monthOld + 1}-${dayOld - 6}`;
    const endDate = `${yearNow}-${monthNow + 1}-${dayNow}`;

    if (curType === 'usd') {
        const usdID = dataCur.find(elem => elem.Cur_Abbreviation === 'USD').Cur_ID;
        return `https://www.nbrb.by/API/ExRates/Rates/Dynamics/${usdID}?startDate=${startDate}&endDate=${endDate}`;
    } else if (curType === 'eur') {
        const eurID = dataCur.find(elem => elem.Cur_Abbreviation === 'EUR').Cur_ID;
        return `https://www.nbrb.by/API/ExRates/Rates/Dynamics/${eurID}?startDate=${startDate}&endDate=${endDate}`;
    } else if (curType === 'rub'){
        const rubID = dataCur.find(elem => elem.Cur_Abbreviation === 'RUB').Cur_ID;
        return `https://www.nbrb.by/API/ExRates/Rates/Dynamics/${rubID}?startDate=${startDate}&endDate=${endDate}`;
    }
}

function showCurrencyLevel (curType = 'usd') {
    const requestURL = 'https://www.nbrb.by/api/exrates/rates?periodicity=0';
    
    sendRequest('GET', requestURL)
    .then(dataCur => {
        
        const newRequest = createCurrencyReq(dataCur, curType);

        sendRequest('GET', newRequest)
            .then(dataCur => {
                drawGraphic(dataCur, curType);
            })
            .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
}

showCurrencyLevel();

const select = document.querySelector('.select');

select.addEventListener('change', () => {
    document.querySelector(".graphic").innerHTML = '<canvas id="myChart"></canvas>';

    showCurrencyLevel(select.value);
});