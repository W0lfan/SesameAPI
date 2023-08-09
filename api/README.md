# Sesame API

## About

The Sesame API provides seamless access to all Sesame data in the most user-friendly manner. Our mission is to make our data easily accessible to everyone and enhance their data viewing experience. The API, accessible at [building.js](https://raw.githubusercontent.com/W0lfan/Sesame/main/api/building.js), empowers users to effortlessly retrieve valuable information from our database.

## Usage

To gather information from the database, follow these steps:

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
Supported `MOD_TYPE` Values
The `MOD_TYPE` parameter corresponds to the following object keys:

```javascript
const __LINKS__ = {
    codes: "codes.json",
    users: "users.json",
    mods: "mods.json",
    clans: "clans.json"
};
```
Example Usage
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


