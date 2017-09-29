
self.addEventListener('push', event => {
    const data = event.data.json()

    const title = data.title;
    const options = {
        body: data.body ,
        icon: 'http://p4.music.126.net/C46EsA5gsbTPWjOFNLXlTA==/109951163023120938.jpg?param=177y177',
        vibrate: [200, 100, 200, 100, 200, 100, 400],
    };
    
    event.waitUntil(self.registration.showNotification(title, options));
});

