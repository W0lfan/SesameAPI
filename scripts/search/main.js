


function fetchData(url, callback) {
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => callback(null, data))
        .catch(error => callback(error));
}

function QueryOfficial() {
    const Identifiers = [];
    const Datas = { mods: 0, users: 0, codes: 0 };

    function ViewOfficial(content, title, type) {
        if (content.official) {
            const push = {
                type: title,
                mod: content,
                prior: 3
            };
            Identifiers.push(push);
            Datas[type]++;
        }
    }

    fetchData("https://raw.githubusercontent.com/W0lfan/W0lfan.github.io/main/sesame/database/mods.json", (error, mods) => {
        if (error) {
            console.error('Fetch error:', error);
        } else {
            for (const mod of mods) {
                ViewOfficial(mod, "Mod", "mods");
            }
        }
    });

    return [Identifiers, Datas];
}

function QueryItems(r, allmods = false) {
    const Identifiers = [];
    let Datas = { mods: 0, users: 0, codes: 0 };

    function ViewDatas(content, title, type) {
        const name = content.name.toLowerCase();
        const description = content.description.toLowerCase();
        const check = [];
        let push = {
            type: title,
            mod: content,
            prior: 0
        };

        if (allmods || name.includes(r) || (content.abvrt && content.abvrt.toLowerCase().includes(r))) {
            push.prior = 3;
            Identifiers.push(push);
            Datas[type]++;
            return;
        } else if (description.includes(r)) {
            push.prior = 2;
            Identifiers.push(push);
            Datas[type]++;
            return;
        }

        push.prior = 1;
        for (const aut of content.author) {
            if (aut.name[0].toLowerCase().includes(r) && !check.includes(aut.name[0].toLowerCase())) {
                Identifiers.push(push);
                Datas[type]++;
                check.push(aut.name[0].toLowerCase());
                return;
            }
        }
    }

    fetchData("https://raw.githubusercontent.com/W0lfan/W0lfan.github.io/main/sesame/database/mods.json", (modsError, mods) => {
        if (modsError) {
            console.error('Fetch error:', modsError);
        } else {
            fetchData("https://raw.githubusercontent.com/W0lfan/W0lfan.github.io/main/sesame/database/codes.json", (codesError, codes) => {
                if (codesError) {
                    console.error('Fetch error:', codesError);
                } else {
                    fetchData("../database/users.json", (usersError, users) => {
                        if (usersError) {
                            console.error('Fetch error:', usersError);
                        } else {
                            for (const mod of mods) {
                                ViewDatas(mod, "Mod", "mods");
                            }
                            for (const code of codes) {
                                ViewDatas(code, "Code", "codes");
                            }
                            for (us of users) {
                                let userName = Object.keys(us)[0].toLowerCase();
                                console.log(userName, r.includes(userName))
                                console.log(userName, userName.includes(r))
                                console.log(us)
                                if (r.includes(userName) || userName.includes(r)) {
                                    Identifiers.push({
                                        prior : 3,
                                        user : us,
                                        type:"User",
                                        name : Object.keys(us)[0],
                                        sure : `${r.replace(' ','') === userName.replace(' ','') ? true : false}`
                                    });
                                }
                            }
                            
                            console.log("Before sorting:", Identifiers.map(item => item.prior));
                            Identifiers.sort((a, b) => b.prior - a.prior);
                            console.log("After sorting:", Identifiers.map(item => item.prior));
                        }
                    });
                }
            });
        }
    });
    console.log('sorting:')
    console.log(Identifiers,Datas)
    return [Identifiers, Datas];
}

    if (!localStorage.getItem('display')) {
        localStorage.setItem('display','grid');
    }

function githubToRaw(githubUrl) {
    const regex = /github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)/;
    const match = githubUrl.match(regex);

    if (match) {
        const [, user, repo, branch, path] = match;
        return `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${path}`;
    } else {
        console.error("Invalid GitHub URL format");
        return null;
    }
}
function wrapCodeWithSyntaxHighlighting(codeLines) {
    const highlightingRules = [
        { regex: /\.ace_numeric\b/, class: "ace_numeric" },
        { regex: /\.ace_boolean\b/, class: "ace_boolean" },
        { regex: /\.ace_string\b/, class: "ace_string" },
        { regex: /\.ace_type\b/, class: "ace_type" },
        { regex: /\.ace_function\b/, class: "ace_function" },
        { regex: /\.ace_keyword\b/, class: "ace_keyword" },
        { regex: /\.ace_escape\b/, class: "ace_escape" },
        { regex: /\.ace_variable .ace_language\b/, class: "ace_variable ace_language" },
        { regex: /\.ace_comment\b/, class: "ace_comment" }
    ];

    return codeLines.map(line => {
        for (const rule of highlightingRules) {
            if (line.match(rule.regex)) {
                return `<span class="${rule.class}">${line}</span><br>`;
            }
        }
        return `${line}<br>`;
    }).join('');
}

let search_input;
let show_info_user_display = false;

function Search(opt = null,official = false,all = false) {
    let key_word;
    show_info_user_display = false;
    if (!opt) {
        key_word = document.querySelector('#search-input').value;
    } else {
        key_word = opt;
    }
    if (key_word.length <= 0 && official === false && all === false) {
        return;
    } 

    let result;
    if (official === false && all === false) {
         result = QueryItems(key_word.toLowerCase());
    } else {
        if (official) {
            result = QueryOfficial();
        } else if (all) {
            result = QueryItems('',true);
        }
    }

    search_input = key_word;
    const Display = localStorage.getItem('display');

    const Metrics = result[1];
    const Datas = result[0];
    UI('results');


    setTimeout(() => {
        document.querySelector('.display-research').innerHTML+= `
            <div class="results">
                <div class="infos">
                    <div class="global">Results for <span>${key_word}</span></div>
                    <div class="metrics">
                        <div class="metric">
                            <svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48"><path d="M320-242 80-482l242-242 43 43-199 199 197 197-43 43Zm318 2-43-43 199-199-197-197 43-43 240 240-242 242Z"/></svg>
                            ${Metrics.mods}
                        </div>
                        <div class="metric">
                            <svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48"><path d="M480-481q-66 0-108-42t-42-108q0-66 42-108t108-42q66 0 108 42t42 108q0 66-42 108t-108 42ZM160-160v-94q0-38 19-65t49-41q67-30 128.5-45T480-420q62 0 123 15.5T731-360q31 14 50 41t19 65v94H160Z"/></svg>
                            ${Metrics.users}
                        </div>
                        <div class="metric">
                        <svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48"><path d="M274-360q-15 0-24.5-9.5T240-394v-66h48v52h84v-192h48v206q0 15-9.5 24.5T386-360H274Zm240 0q-15 0-24.5-9.5T480-394v-46h48v32h104v-53H514q-14 0-24-10t-10-24v-71q0-15 9.5-24.5T514-600h132q15 0 24.5 9.5T680-566v46h-48v-32H528v53h118q14 0 24 10t10 24v71q0 15-9.5 24.5T646-360H514Z"/></svg>
                            ${Metrics.codes}
                        </div>
                    </div>
                </div>
                <div class="sort-type">
                    <div class="class-sort">
                        <div class="class-s">
                        <svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48"><path d="M320-242 80-482l242-242 43 43-199 199 197 197-43 43Zm318 2-43-43 199-199-197-197 43-43 240 240-242 242Z"/></svg>

                        </div>
                        <div class="class-s">
                        <svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48"><path d="M480-481q-66 0-108-42t-42-108q0-66 42-108t108-42q66 0 108 42t42 108q0 66-42 108t-108 42ZM160-160v-94q0-38 19-65t49-41q67-30 128.5-45T480-420q62 0 123 15.5T731-360q31 14 50 41t19 65v94H160Z"/></svg>

                        </div>
                        <div class="class-s">
                        <svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48"><path d="M274-360q-15 0-24.5-9.5T240-394v-66h48v52h84v-192h48v206q0 15-9.5 24.5T386-360H274Zm240 0q-15 0-24.5-9.5T480-394v-46h48v32h104v-53H514q-14 0-24-10t-10-24v-71q0-15 9.5-24.5T514-600h132q15 0 24.5 9.5T680-566v46h-48v-32H528v53h118q14 0 24 10t10 24v71q0 15-9.5 24.5T646-360H514Z"/></svg>

                        </div>                        
                    </div>
                    <div class="view-line" onclick="ManageDisplay()">
                        <svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48"><path d="M350-160h470q24.75 0 42.375-17.625T880-220v-114H350v174ZM80-626h210v-174H140q-24.75 0-42.375 17.625T80-740v114Zm0 233h210v-173H80v173Zm60 233h150v-174H80v114q0 24.75 17.625 42.375T140-160Zm210-233h530v-173H350v173Zm0-233h530v-114q0-24.75-17.625-42.375T820-800H350v174Z"/></svg>
                    </div>
                    <div class="view-grid" onclick="ManageDisplay()">
                        <svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48"><path d="M120-510v-330h330v330H120Zm0 390v-330h330v330H120Zm390-390v-330h330v330H510Zm0 390v-330h330v330H510Z"/></svg>
                    </div>
                </div>
            </div>
            <div class="user-results ${Display}-user-results">

            </div>
            <div class="results-container ${Display}-display" >

            </div>
        `;
        function formatAuthors(authors) {
            return authors.map(author => {
                return `<a href="${author.link}" target="_blank">${author.name}</a>`;
            }).join(', ');
        }
        for (let data of Datas) {
            if (data.type==="Mod") {
                document.querySelector('.results-container').innerHTML += `
                    <div class="result-${Display}">
                        <div class="top-image">
                            <img src="${data.mod.img ? data.mod.img : "webutils/img/SMSE.png"}">
                        </div>
                        <div class="identifier">
                            <svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48"><path d="M320-242 80-482l242-242 43 43-199 199 197 197-43 43Zm318 2-43-43 199-199-197-197 43-43 240 240-242 242Z"/></svg>
                        </div>
                        <div class="sort-infos">
                            Indexing : ${__PRIOR__[data.prior]}
                            <svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48"><path d="M453-280h60v-240h-60v240Zm26.982-314q14.018 0 23.518-9.2T513-626q0-14.45-9.482-24.225-9.483-9.775-23.5-9.775-14.018 0-23.518 9.775T447-626q0 13.6 9.482 22.8 9.483 9.2 23.5 9.2Zm.284 514q-82.734 0-155.5-31.5t-127.266-86q-54.5-54.5-86-127.341Q80-397.681 80-480.5q0-82.819 31.5-155.659Q143-709 197.5-763t127.341-85.5Q397.681-880 480.5-880q82.819 0 155.659 31.5Q709-817 763-763t85.5 127Q880-563 880-480.266q0 82.734-31.5 155.5T763-197.684q-54 54.316-127 86Q563-80 480.266-80Z"/></svg>
                        </div>
                        <div class="container tohover">
                            <div class="header">
                                <div class="title">
                                    <div class="status">${data.mod.official ? '<svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48"><path d="m346-60-76-130-151-31 17-147-96-112 96-111-17-147 151-31 76-131 134 62 134-62 77 131 150 31-17 147 96 111-96 112 17 147-150 31-77 130-134-62-134 62Zm91-287 227-225-45-41-182 180-95-99-46 45 141 140Z"/></svg>' : ''}</div>
                                    <div class="name">${data.mod.name}</div>
                                </div>
                                <div class="author">
                                    <svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48"><path d="M38-160v-94q0-35 18-63.5t50-42.5q73-32 131.5-46T358-420q62 0 120 14t131 46q32 14 50.5 42.5T678-254v94H38Zm700 0v-94q0-63-32-103.5T622-423q69 8 130 23.5t99 35.5q33 19 52 47t19 63v94H738ZM358-481q-66 0-108-42t-42-108q0-66 42-108t108-42q66 0 108 42t42 108q0 66-42 108t-108 42Zm360-150q0 66-42 108t-108 42q-11 0-24.5-1.5T519-488q24-25 36.5-61.5T568-631q0-45-12.5-79.5T519-774q11-3 24.5-5t24.5-2q66 0 108 42t42 108Z"/></svg>
                                    <div class="vertical-sep"></div>
                                    <div class="container">${formatAuthors(data.mod.author)}</div>
                                </div>
                                </div>
                                <div class="description">
                                    ${data.mod.description}
                                </div>
                                <div class="actions">
                                    <div style="display:${data.mod.link.type ? 'none' : 'flex'}" " class="action" id="load-${data.mod.name}">
                                        <svg id ="load-${data.mod.name}" xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48"><path d="M480-313 287-506l43-43 120 120v-371h60v371l120-120 43 43-193 193ZM220-160q-24 0-42-18t-18-42v-143h60v143h520v-143h60v143q0 24-18 42t-42 18H220Z"/></svg>
                                    </div>
                                    <div class="action" id="open-${data.mod.name}">
                                        <svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48"><path d="M180-120q-24 0-42-18t-18-42v-600q0-24 18-42t42-18h279v60H180v600h600v-279h60v279q0 24-18 42t-42 18H180Zm202-219-42-43 398-398H519v-60h321v321h-60v-218L382-339Z"/></svg>
                                    </div>
                            </div>
                        </div>

                    </div>
                `;
                setTimeout(() => {
                    document.getElementById(`open-${data.mod.name}`).addEventListener('click',function() {
                        window.open(data.mod.link.url,"_blank");
                        console.log(data.mod.link.url)
                    });
                }, __DISPLAY_WAIT__);
            } else if (data.type == "Code") {
                document.querySelector('.results-container').innerHTML += `
                    <div class="result-${Display}" id="code-view-${Display}">

                        <div class="container">
                            <div class="header">
                                <div class="title">
                                    <div class="name">${data.mod.name}</div>
                                </div>
                                <div class="author">
                                    <svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48"><path d="M38-160v-94q0-35 18-63.5t50-42.5q73-32 131.5-46T358-420q62 0 120 14t131 46q32 14 50.5 42.5T678-254v94H38Zm700 0v-94q0-63-32-103.5T622-423q69 8 130 23.5t99 35.5q33 19 52 47t19 63v94H738ZM358-481q-66 0-108-42t-42-108q0-66 42-108t108-42q66 0 108 42t42 108q0 66-42 108t-108 42Zm360-150q0 66-42 108t-108 42q-11 0-24.5-1.5T519-488q24-25 36.5-61.5T568-631q0-45-12.5-79.5T519-774q11-3 24.5-5t24.5-2q66 0 108 42t42 108Z"/></svg>
                                    <div class="vertical-sep"></div>
                                    <div class="container">${formatAuthors(data.mod.author)}</div>
                                </div>
                                </div>
                                <div class="description">
                                    ${data.mod.description}
                                </div>
                                <div class="code-container"><code>${wrapCodeWithSyntaxHighlighting(data.mod.code)}</code><div class="copy" ><svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48"><path d="M180-81q-24 0-42-18t-18-42v-603h60v603h474v60H180Zm120-120q-24 0-42-18t-18-42v-560q0-24 18-42t42-18h440q24 0 42 18t18 42v560q0 24-18 42t-42 18H300Zm0-60h440v-560H300v560Zm0 0v-560 560Z"/></svg></div><div>
                            </div>
                        </div>

                    </div>

                `;
            document.querySelector('.copy').addEventListener('click',function() {
                CopyText(data.mod.code.join('\n'))
            })
            } else if (data.type == "User") {
                if (JSON.parse(data.sure) != true) {
                    if (!show_info_user_display) {
                        document.querySelector('.user-results').innerHTML += `
                        <div class="user-result ${Display}-user"  id="lookingfor">
                                <div class="info">
                                    <svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48"><path d="M453-280h60v-240h-60v240Zm26.982-314q14.018 0 23.518-9.2T513-626q0-14.45-9.482-24.225-9.483-9.775-23.5-9.775-14.018 0-23.518 9.775T447-626q0 13.6 9.482 22.8 9.483 9.2 23.5 9.2Zm.284 514q-82.734 0-155.5-31.5t-127.266-86q-54.5-54.5-86-127.341Q80-397.681 80-480.5q0-82.819 31.5-155.659Q143-709 197.5-763t127.341-85.5Q397.681-880 480.5-880q82.819 0 155.659 31.5Q709-817 763-763t85.5 127Q880-563 880-480.266q0 82.734-31.5 155.5T763-197.684q-54 54.316-127 86Q563-80 480.266-80Z"/></svg>
                                    Are you looking for this user?
                                </div>
                        </div>
                        `;
                    }
                    document.querySelector('.user-result').innerHTML += `

                            <div class="userInfos userInfos-hover" id="click-${data.name}">
                                <div class="user_pfp">
                                    <img src="${data.user[data.name].pfp != "unknown" ? data.user[data.name].pfp : "https://raw.githubusercontent.com/W0lfan/W0lfan.github.io/main/sesame/img/user.png"}">
                                </div>
                                <div class="user_name">
                                    ${data.name}
                                </div>
                            </div>
                    `;
                    setTimeout(() => {
                        document.querySelector(`#click-${data.name}`).addEventListener('click',function() {
                            console.log("clicked")
                            Search(data.name)
                        });
                    }, __DISPLAY_WAIT__);
                    show_info_user_display = true;
                } else  {
                    document.querySelector('.user-results').innerHTML = `
                        <div class="user-result ${Display}-user" id="viewuser">
                            <div class="userInfos" id="${data.name}">
                                <div class="userheader">
                                    <div class="user_pfp">
                                        <img src="${data.user[data.name].pfp != "unknown" ? data.user[data.name].pfp : "https://raw.githubusercontent.com/W0lfan/W0lfan.github.io/main/sesame/img/user.png"}">
                                    </div>
                                    <div class="user_name">
                                        <div class="distinction">

                                            ${
                                                data.user[data.name].about.isStaff ? '<div id="staff"><svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48"><path d="m436-356 228-228-42-41-183 183-101-101-44 44 142 143Zm44 275q-140-35-230-162.5T160-523v-238l320-120 320 120v238q0 152-90 279.5T480-81Z"/></svg></div>' : ""
                                            }
                                            ${
                                                data.user[data.name].about.isContrib ? '<div id="contrib"><svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48"><path d="m346-60-76-130-151-31 17-147-96-112 96-111-17-147 151-31 76-131 134 62 134-62 77 131 150 31-17 147 96 111-96 112 17 147-150 31-77 130-134-62-134 62Zm91-287 227-225-45-41-182 180-95-99-46 45 141 140Z"/></svg></div>' : ""
                                            }
                                            ${
                                                data.user[data.name].about.isModder ? '<div id="mod"><svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48"><path d="M705-128 447-388q-23 8-46 13t-47 5q-97 0-165-67.5T121-602q0-31 8-60.5t23-55.5l145 145 92-86-149-149q26-15 55-23.5t59-8.5q99 0 168.5 69.5T592-602q0 24-5 47t-13 46l259 258q11 11 11 26.5T833-198l-76 70q-11 11-26 11t-26-11Z"/></svg></div>' : ""
                                            }
                                            ${
                                                data.user[data.name].about.isUCP ? '<div id="ucp"><svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48"><path d="M280-880h400v333q0 23-11.5 42T637-474l-141 82 26 97h134l-109 81 42 134-109-81-110 81 42-134-109-81h135l25-97-140-82q-20-12-31.5-31T280-547v-333Zm174 60v350l30 16 30-16v-350h-60Z"/></svg></div>' : ""
                                            }
                                        </div>
                                        <div class="username-container">
                                        ${data.name}
                                        ${
                                            data.user[data.name].about.isSesame ? `<div class="sesame-tag">
                                            <svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48"><path d="M480.172-450Q537-450 577-490.172q40-40.171 40-97Q617-644 576.828-684q-40.171-40-97-40Q423-724 383-683.828q-40 40.171-40 97Q343-530 383.172-490q40.171 40 97 40ZM480-81q-148-38-234-162.541Q160-368.083 160-523v-238l320-120 320 120v238q0 154.917-86 279.459Q628-119 480-81Zm0-62q60-20 108-59.5t83-90.5q-44.668-21.022-92.972-32.011Q529.724-336 479.862-336 430-336 381.79-325.011 333.581-314.022 289-293q35 51 83 90.5T480-143Z"/></svg>
                                            Sesame</div>
                                            ` : ""
                                        }
                                        </div>
                                    </div>
                                </div>
                                <div class="user-links">
                                    ${
                                        data.user[data.name].links[0] ? `
                                            <div class="link">

                                            </div>
                                        ` : ''
                                    }
                                </div>
                            </div>
                        </div>
                        <div class="all-works-here">
                            All creations of ${data.name} are available below
                        </div>
                    `;
                }
            }
        }
        check_ui_display();
        document.querySelector('#search-input').value = key_word;


    }, 500);
}
function CopyText(text) {

    navigator.clipboard.writeText(text);
}