function getWeatherData() {
    const weatherAPI = 'https://query.yahooapis.com/v1/public/yql?q=select%20item%2C%20wind%2C%20atmosphere%20from%20weather.forecast%20where%20woeid%20%3D%202487889&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys';
    return new Promise(resolve => {
        let xhr = new XMLHttpRequest();

        xhr.open('GET', weatherAPI);
        xhr.onreadystatechange = () => {
            xhr.readyState == 4 && xhr.status == 200 && resolve(JSON.parse(xhr.response));
        };

        xhr.send()
    });
}

function applyDayToContainer(day) {
    document.getElementById('dayImg').src = day.img;
    document.getElementById('dayTitle').innerHTML = day.title;
    document.getElementById('dayType').innerHTML = day.type;
    document.getElementById('dayTemp').innerHTML = `<b>Temperature:</b> ${day.temp} F`;
    document.getElementById('dayAtmPres').innerHTML = `<b>Atmosphere pressure:</b> ${day.atmPressure} in`;
    document.getElementById('dayWindSpeed').innerHTML = `<b>Wind speed:</b> ${day.windSpeed} mph`;
}

(function() {
    let retrieveStream = Rx.Observable.interval(60000)
        .startWith(0) // allows to perform an immediate execute
        .map(() => Rx.Observable.fromPromise(getWeatherData()))
        .switch() // sets gotten observables to one sequence
        .map(data => {
            let basicItem = data.query.results.channel.item;
            basicItem.atmosphere = data.query.results.channel.atmosphere;
            basicItem.wind = data.query.results.channel.wind;

            return basicItem;
        })
        .distinct(entry => entry.pubDate); // pub date of this API updates then request result is updated, so we can distinct easily with this one

    let currentDayWidgetStream = retrieveStream.map(entry => {
        return {
            title: entry.title.split(',').shift(),
            type: entry.condition.text,
            temp: entry.condition.temp,
            img: `http://l.yimg.com/a/i/us/we/52/${entry.condition.code}.gif`,
            atmPressure: entry.atmosphere.pressure,
            windSpeed: entry.wind.speed
        };
    });

    let forecastDaysStream = retrieveStream.map(entry => {
        return {
            days: entry.forecast
        };
    });

    currentDayWidgetStream.subscribe(day => applyDayToContainer(day));
    forecastDaysStream.subscribe(next => console.log(next));
})();