class Helper {
    static getWeatherData() {
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

    static applyDayToContainer(day) {
        document.getElementById('dayImg').src = day.img;
        document.getElementById('dayTitle').innerHTML = day.title;
        document.getElementById('dayType').innerHTML = day.type;
        document.getElementById('dayTemp').innerHTML = `<b>Temperature:</b> ${day.temp} F`;
        document.getElementById('dayAtmPres').innerHTML = `<b>Atmosphere pressure:</b> ${day.atmPressure} in`;
        document.getElementById('dayWindSpeed').innerHTML = `<b>Wind speed:</b> ${day.windSpeed} mph`;
    }

    static drawChart(containerSelector, xAxis, dataCollection) {
        let data = [];
        data.push(xAxis);

        return c3.generate({
            bindto: containerSelector,
            data: {
                x: 'x',
                columns: data.concat(dataCollection),
                type: 'bar'
            },
            axis: {
                x: {
                    type: 'category'
                }
            }
        });
    }
}