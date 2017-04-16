function getWeatherData() {
    const weatherAPI = 'https://query.yahooapis.com/v1/public/yql?q=select%20item%20from%20weather.forecast%20where%20woeid%20%3D%202487889&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys';
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
    document.getElementById('dayTemp').innerHTML = `Temperature: ${day.temp}F`;
}

(function() {
    let retrieveStream = Rx.Observable.interval(60000)
        .startWith(0) // allows to perform an immediate execute
        .map(() => Rx.Observable.fromPromise(getWeatherData()))
        .switch() // sets gotten observables to one sequence
        .map(data => data.query.results.channel.item)
        .distinct(entry => entry.pubDate); // pub date of this API updates then request result is updated, so we can distinct easily with this one

    let currentDayWidgetStream = retrieveStream.map(entry => {
        return {
            title: entry.title.split(',').shift(),
            type: entry.condition.text,
            temp: entry.condition.temp,
            img: `http://l.yimg.com/a/i/us/we/52/${entry.condition.code}.gif`
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