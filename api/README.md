# Sesame API

## About

The Sesame API provides seamless access to all Sesame data in the most user-friendly manner. Our mission is to make our data easily accessible to everyone and enhance their data viewing experience. The API, accessible at [building.js](https://raw.githubusercontent.com/W0lfan/Sesame/main/api/building.js), empowers users to effortlessly retrieve valuable information from our database.


## Download
## Using Sesame API in Your JavaScript File
### Blank JavaScript File

If you're working with a blank `.js` file, add the following code at the top of your `.js` file:

```javascript
fetch('https://raw.githubusercontent.com/W0lfan/Sesame/main/api/building.js')
    .then(response => response.text())
    .then(buildingCode => {
        // Execute the code from building.js using eval()
        eval(buildingCode);

        // Now you can use the functions from building.js
        // For example:
        async function fetchDataFromAPI() {
            let content = await FetchDataFromDatabase(MOD_TYPE, CONTENT);
            console.log(content);
        }

        // Call the function to demonstrate usage
        fetchDataFromAPI();
    })
    .catch(error => console.error('Error fetching building.js:', error));
```

### Using Sesame API in a Website
If you're working with a website, you can easily link the Sesame API to your HTML files:

Add the following code to the <head> section of your HTML file:
```html
<script src="https://raw.githubusercontent.com/W0lfan/Sesame/main/api/building.js"></script>
```
By adding this script tag, you'll have access to the Sesame API functions throughout your website.


## Usage

To gather information from the database, add the following code to your .js file, assuming it is linked with an HTML file where the API is avilable:

```javascript
(async () => {
    let contentYouWantToGather = await FetchDataFromDatabase(MOD_TYPE, CONTENT);
    console.log(contentYouWantToGather);
})();
```
Replace `MOD_TYPE` with the desired data type (e.g., "mods", "users", "codes", "clans").
Customize `CONTENT` as follows:
Use the value 1 to gather all available data from the link.
Create an array containing the specific data you wish to gather. Array values are not case-sensitive.

### Supported `MOD_TYPE` Values

The `MOD_TYPE` parameter corresponds to the following object keys:

```javascript
const __LINKS__ = {
    codes: "codes.json",
    users: "users.json",
    mods: "mods.json",
    clans: "clans.json"
};
```

### Example Usage
For instance, to fetch data for the "mods" type and gather information about "Rumble" and "Mega Rumble," use the following code:

```javascript
(async () => {
    let contentYouWantToGather = await FetchDataFromDatabase("mods", ["Rumble", "Mega Rumble"]);
    console.log(contentYouWantToGather);
})();
```


## Acknowledgments
We extend our heartfelt gratitude to the following individuals for their valuable contributions:

Naf - Code development and data gathering.<br>
Rithy - Data gathering.


Their dedication has been instrumental in making this API a reality. We appreciate their efforts in enhancing the Sesame data exploration experience.


