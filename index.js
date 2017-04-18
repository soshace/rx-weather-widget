(function () {
    let retrieveStream = Rx.Observable.interval(60000)
        .startWith(0) // allows to perform an immediate execute
        .map(() => Rx.Observable.fromPromise(Helper.getWeatherData()))
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

    let forecastDaysStream = retrieveStream
        .map(entry => {
            return {
                days: entry.forecast
            };
        })
        .map(entry => {
            let entryCopy = entry.days.slice(0);
            entryCopy.shift();

            let configObj = {
                x: ['x'],
                low: ['Low Temperature'],
                high: ['High Temperature']
            };
            entryCopy.map(el => {
                configObj.x.push(el.date);
                configObj.low.push(+el.low);
                configObj.high.push(+el.high);
            });

            return configObj;
        })
        .map(config => {
            return {
                x: config.x,
                data: [config.low, config.high]
            }
        });

    currentDayWidgetStream.subscribe(day => Helper.applyDayToContainer(day));
    forecastDaysStream.subscribe(config => Helper.drawChart('#chartContainer', config.x, config.data));
})();