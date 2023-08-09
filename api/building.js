/*

    Sesame Database API Dev Log

    📅 Created: Aug. 9, 2023
    🔄 Last Update: Aug. 9, 2023

    🙌 Shoutout to Naflouille and Rithy for making this possible!

    🔧 Inside this script: a toolkit of functions to seamlessly access the Sesame Database.

    🚀 Ready to roll? Download and integrate into your HTML with: <script src="https://raw.githubusercontent.com/W0lfan/Sesame/main/API/building

 */
    const __Path__ = "https://raw.githubusercontent.com/W0lfan/Sesame/main/database/";

    const __LINKS__ = {
        codes: "codes.json",
        users: "users.json",
        mods: "mods.json",
        clans: "clans.json"
    };
    
    const __Version__ = "0.0.1";
    
    
    function fetchData(url) {
        return fetch(url).then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        });
    }
    
    async function FetchDataFromDatabase(directory, gathering) {
    
        /*
        
                NOTE : gathering is set to 1 for a whole return.
        
            */
    
        // Checking if the directory is available
        if (!__LINKS__.hasOwnProperty(directory)) {
            console.error(`Error: "${directory}" key not found in the object.\nAvailable keys: ${Object.keys(__LINKS__).join(", ")}`);
            return;
        }
    
        let path = __Path__ + directory + ".json";
        console.log('New request to the Sesame database. Fetching from ' + path);
    
        try {
            const content = await fetchData(path);
    
            console.log(`Sesame Database - ${directory}.json\nFound ${content.length} replies. Extracting datas.`);
    
            if (gathering === 1) {
                console.log(`Returning all datas from ${directory}.json.`);
                return content;
            } else {
                gathering = gathering.map(value => value.toLowerCase());
                const gathering_available = content.filter(item => gathering.includes(item.name.toLowerCase()));
            
                console.log(`Compatibility found in ${directory}.json for "${gathering.join(', ')}". Returning datas.`);
                return gathering_available;
            }
        } catch (error) {
            console.error('Fetch error:', error);
        }
    }
    
    
    (async () => {
        let mod = await FetchDataFromDatabase('mods', ["Rumble","Mega Rumble"]);
        console.log(mod);
    })();