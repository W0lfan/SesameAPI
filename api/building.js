/*

    Sesame Database API Dev Log

    📅 Created: Aug. 9, 2023
    🔄 Last Update: Sept. 2, 2023

 */
    const __Path__ = "https://raw.githubusercontent.com/W0lfan/sesame/main/database/";


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
            
                    NOTE : gathering is set to 1 for a whole return
        
            
                */
    
        // Checking if the directory is available
        if (!__LINKS__.hasOwnProperty(directory)) {
            console.error(`Error: "${directory}" key not found in the object.\nAvailable keys: ${Object.keys(__LINKS__).join(", ")}`);
            return;
        }
    
        let path = __Path__ + directory + ".json";
    
        try {
            const content = await fetchData(path);
    
    
            if (gathering === 1) {
                return content;
            } else {
                gathering = gathering.map(value => value.toLowerCase());
                const gathering_available = content.filter(item =>
                    gathering.some(gather =>
                        item.name.toLowerCase().includes(gather) ||
                        (
                            item.description && item.description.toLowerCase().includes(gather.toLowerCase())
                        ) 
                        ||
                        (
                            item.author && item.author.some(
                                aut => aut && aut.name.toLowerCase().includes(gather.toLowerCase())
                            )
                        )
                    )
                );
    
    
    
                console.log(gathering_available,"EEEE")
                return gathering_available;
            }
        } catch (error) {
            console.error('Fetch error:', error);
        }
    }
    
    async function QuerySpecific(query, directory) {
        let path = "https://raw.githubusercontent.com/W0lfan/sesame/main/database/" + directory + ".json";
        try {
            const content = await fetchData(path);
            for (let value of content) {
                if (value.name && value.name == query) {
                    return value;
                }
            }
        } catch (error) {
            console.error('Fetch error:', error);
        }
    }
