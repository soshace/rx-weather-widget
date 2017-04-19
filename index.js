(function () {
    let chartInstance = null;

    let updatableStream = Rx.Observable.create(obs => {
        obs.next(true);

        Rx.Observable.fromEvent(document.getElementById('citySelect'), 'input')
            .subscribe(() => {
                obs.next(true);
            });
    })
        .switchMap((refresh) => {
            return Rx.Observable.interval(60000)
                .startWith(0); // allows to perform an immediate execute
        })
        .map(() => document.getElementById('citySelect').value);

    let retrieveStream = updatableStream
        .map((townId) => Rx.Observable.fromPromise(Helper.getWeatherData(townId)))
        .switch() // sets gotten observables to one sequence
        .filter(data => data.query.results)
        .map(data => {
            let basicItem = data.query.results.channel.item;
            basicItem.atmosphere = data.query.results.channel.atmosphere;
            basicItem.wind = data.query.results.channel.wind;

            return basicItem;
        })
        .distinctUntilChanged(); // pub date of this API updates then request result is updated, so we can distinct easily with this one

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
            let entryCopy = entry.forecast.slice(0);
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
                data: [config.x, config.low, config.high]
            }
        });

    currentDayWidgetStream.subscribe(day => {
        console.log('widget', day);
        Helper.applyDayToContainer(day);
    });
    forecastDaysStream.subscribe(config => {
        console.log('chart', config);
        if (!chartInstance) {
            chartInstance = Helper.drawChart('#chartContainer', config.data);
        } else {
            chartInstance.load({
                columns: config.data
            });
        }
    });
})();