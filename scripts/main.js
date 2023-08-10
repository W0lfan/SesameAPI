document.addEventListener('DOMContentLoaded',function() {
    document.querySelector('.search-button').addEventListener('click',function() {
        Search();
    });
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            Search();
        }
    });
    document.addEventListener("click", function(event) {
        let ev = event.target;
        fetch("https://raw.githubusercontent.com/W0lfan/W0lfan.github.io/main/sesame/database/mods.json")
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
            let mods = data;
            for (let mod of mods) {
                if (mod.name === ev.id.replace('load-',"")) {
                    DownLoad(githubToRaw(mod.link.url), mod.name);
                }
            }
        })
        .catch(error => {
          console.error('Fetch error:', error);
        });
    
    
    });
});