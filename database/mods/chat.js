/**
 *                                    Starblast chatting system
 *                                         2023 halcyonXT
 *
 *                                        License: Copyleft
 * https://raw.githubusercontent.com/copyleft-next/copyleft-next/master/Releases/copyleft-next-0.3.1
 *                           tldr: you can do anything you want with this
 * 
 *                                  Contact on Discord - h.alcyon
 */
 
this.options = {
    root_mode: "",
    map_name: "",
    max_players: 12,
    starting_ship: 101,
    map_size: 100,
    speed_mod: 1.2,
    max_level: 1,
    weapons_store: false,
    soundtrack: "warp_drive.mp3",
    custom_map: "",
  };
  
  let staticMemory = {
      banSwearWords: false, //Change to true if you want to ban swear words
  
      retractableComponentIDs: ["mainControlsBackground"],
      layout: ['qwertyuiop'.split(''),'asdfghjkl'.split(''),'zxcvbnm'.split('')],
      layoutString: 'qwertyuiopasdfghjklzxcvbnm'
  }
  
  let sessionMemory = {
      rememberedIDs: [],
      admins: [],
      chatChannels: [
          {
              parties: ["global"],
              messages: []
          }
      ],
      banned: [
  
      ]
  }
  
  // consider replacing with better list
  
  const ECHO_SPAN = 105;
  let echoed = false;
  const centeredEcho = (msg, color = "") => echo(`${" ".repeat(~~((ECHO_SPAN / 2) - msg.length / 2))}${color}${msg}`)
  const anchoredEcho = (msgLeft, msgRight, color = "", anchor) => echo(color + `${" ".repeat(~~((ECHO_SPAN/2) - (anchor.length / 2)) - msgLeft.length)}${msgLeft}${anchor}${msgRight}` ," ")
  const commandEcho = (command, description, example, color) => echo(color + command + `[[;#FFFFFF30;]${" ".repeat(~~(((ECHO_SPAN /2) - command.length) - (description.length / 2)))}` + color + description + `[[;#FFFFFF30;]${" ".repeat(Math.ceil(((ECHO_SPAN /2) - example.length) - (description.length / 2)))}` + color + example)
  
  help = () => {
      echo(" ")
      centeredEcho("Command list:", "[[ub;#FF4f4f;]");
      commandEcho("Command", "Description", "Example usage", "[[b;#5FFFFF;]")
      commandEcho("showIDs()", "Prints a list with the IDs and names of all players", "showIDs()", "[[;#FFFFFF;]")
      commandEcho("help()", "Prints the list of commands", "help()", "[[;#FFFFFF;]")
      commandEcho("adminList()", "Prints the list of admins", "adminList()", "[[;#FFFFFF;]");
      commandEcho("giveAdmin(id)", "Gives player with the specified ID admin privileges", "giveAdmin(4)", "[[;#FFFFFF;]");
      commandEcho("removeAdmin(id)", "Removes admin privileges from player with specified ID", "removeAdmin(4)", "[[;#FFFFFF;]");
      echo(" ")
  }
  
  adminList = () => {
      echo(" ")
      centeredEcho("Admin list:", "[[ub;#FF4f4f;]");
      anchoredEcho("Player name ", " Player ID", "[[b;#5FFFFF;]", "|")
      for (let ship of sessionMemory.admins) {
          anchoredEcho(`${game.ships[fetchShip(ship)].name} `, ` ${ship}`, "[[;#FFFFFF;]", "|")
      }
      echo(" ")
  }
  
  if (!echoed) {
      setTimeout(() => {
          echo(" ")
          echo(" ")
          centeredEcho("This mod is using Halcyon's SB chatting system", "[[;#FFFFFF;]");
          echo(" ")
          centeredEcho("Contact:", "[[ub;#FF4f4f;]");
          centeredEcho("Discord - h.alcyon", "[[;#FFFFFF;]");
          help()
          echo(" ")
      }, 2000)
  
      echoed = true;
  }
  
  showIDs = function() {
      echo(" ")
      centeredEcho("Player list:", "[[ub;#FF4f4f;]");
      anchoredEcho("Player name ", " Player ID", "[[b;#5FFFFF;]", "|")
      for (let ship of game.ships) {
          anchoredEcho(`${ship.name} `, ` ${ship.id}`, "[[;#FFFFFF;]", "|")
      }
      echo(" ")
  }
  
  giveAdmin = (id) => {
      for (let ship of game.ships) {
          if (ship.id === id) {
              if (!(sessionMemory.admins.includes(id))) {
                  sessionMemory.admins.push(id)
                  game.ships[fetchShip(id)].isUIExpanded && renderExpandedMenu(game.ships[fetchShip(id)], "admin")
                  return statusMessage("success", `Player with the id of ${id} (${game.ships[fetchShip(id)].name}) has been granted admin privileges`)
              } else {
                  return statusMessage("error", `Player is already admin. Do removeAdmin(${id}) to remove`)
              }
          }
      }
      return statusMessage("error", `Player with the id of ${id} doesn't exist`)
  }
  
  removeAdmin = (id) => {
      for (let admin of sessionMemory.admins) {
          if (admin === id) {
              sessionMemory.admins = removeFromArray(sessionMemory.admins, id)
              let target = game.ships[fetchShip(id)]
              target.isUIExpanded && renderExpandedMenu(target, determineType(target))
              closeDashboard(target, game)
              return statusMessage("success", `Player with the id of ${id} (${target.name}) no longer has admin privileges`)
          }
      }
      return statusMessage("error", `There is no admin with the id of ${id}`)
  }
  
  const statusMessage = (status, message) => {
      let str = ""
      switch (status) {
          case "error":
              str = str + "[[b;#FF0000;] ERROR - "
              break
          case "success":
              str = str + "[[b;#00FF00;] SUCCESS - "
              break
          case "warn":
              str = str + "[[b;#FFFF00;] WARN - "
              break
          default:
              str = str + "[[b;#007bff;] AMBIGUOUS - "
              break
      }
      echo(str + "[[;#FFFFFF;]" + message)
  }
  
  const determineType = (ship) => sessionMemory.admins.includes(ship.id) ? "admin" : "regular"
  
  this.event = function (event, game) {
      switch (event.name) {
          case "ship_spawned":
              if (event.ship != null) {
                  if (sessionMemory.banned.includes(event.ship.name)) {
                      kickPlayer(event.ship)
                  }
                  event.ship.chatOpen = false
                  event.ship.draftMessage = ""
                  event.ship.chatTargetID = -1
                  event.ship.dashboardOpen = false
                  event.ship.recievedMessages = []
                  event.ship.globalChatExpanded = true
                  event.ship.set({x: 0, y: 0});
                  if (!(sessionMemory.rememberedIDs.includes(event.ship.id))) {
                      sessionMemory.rememberedIDs.push(event.ship.id)
                  }
                  renderExpandedMenu(event.ship, determineType(event.ship));
                  setTimeout(() => {
                      renderExpandedChat(event.ship, game)
                  }, 2000)
              }
              break;
          case "ui_component_clicked":
              var component = event.id;
              if (component == "expandButton") {
                  event.ship.isUIExpanded
                  ?
                  renderRetractedMenu(event.ship)
                  :
                  renderExpandedMenu(event.ship, determineType(event.ship))
              }
              if (component == "showShipTree") {
                  renderShipTree(event.ship)
              }
              if (component == "showDashboard") {
                  renderDashboard(event.ship, game)
              }
              if (component.startsWith("channel_")) {
                  handleOpenChat(event.ship, Number(component.split("_")[1]), game)
              }
              if (component.startsWith("key_")) {
                  handleDraftChange(event.ship, component.split("_")[1], game)
              }
              if (component == "sendMessage") {
                  handleSendMessage(event.ship, game)
              }
              if (component == "closeDashboard") {
                  closeDashboard(event.ship, game)
              }
              if (component == "back_chat") {
                  closeChat(event.ship, game)
              }
              if (component == "global_channel") {
                  openGlobalChat(event.ship, game)
              }
              if (component == "resize_global_chat") {
                  if (event.ship.globalChatExpanded) {
                      minimizeGlobalChat(event.ship)
                  } else {
                      renderExpandedChat(event.ship, game)
                  }
              }
              if (component.startsWith("kick_")) {
                  kickPlayer(game.ships[fetchShip(Number(component.split("_")[1]))])
              }
              if (component.startsWith("ban_")) {
                  sessionMemory.banned.push(game.ships[fetchShip(Number(component.split("_")[1]))].name)
                  kickPlayer(game.ships[fetchShip(Number(component.split("_")[1]))])
              }
              break;
      }
  };
  
  const kickPlayer = (ship) => ship.gameover({"Rating":"You have been kicked from participating","Score":0});
  
  const minimizeGlobalChat = (ship) => {
      ship.globalChatExpanded = false
      ship.setUIComponent({
          id: "global_chat_front",
          position: [0, 64, 30, 31],
          visible: false,
          clickable: false,
          components: []
      })
      ship.setUIComponent({
          id: "resize_global_chat",
          position: [1, 90, 5, 5],
          visible: true,
          clickable: true,
          components: [
              {type: "box", position: [0,0,100,100], fill: "#FFFFFF30", stroke: "#FFFFFF60", width: 1},
              {type: "text", position: [0,0,100,100], color: "#FFF", align: "center", value: "→"}
          ]
      })
  }
  
  const renderExpandedChat = (ship, game) => {
      ship.globalChatExpanded = true
      let components = [
          {type: "box", position: [0,0,100,100], fill: "#FFFFFF05"},
          {type: "box", position: [0,0,100,1], fill: "#FFFFFF50"},
          {type: "box", position: [0,99,100,1], fill: "#FFFFFF50"}
      ]
      let chat = [...sessionMemory.chatChannels[0].messages].reverse()
      for (let i = 0, Y_OFFSET = 0; i < chat.length; i++) {
          if (i >= 4) {break}
          components.push({
              type: "box",
              position: [0, 84 - Y_OFFSET, 100, 16],
              fill: "#FFFFFF05"
          })
          components.push({
              type: "text",
              position: [0, 84 - Y_OFFSET, 100, 16],
              color: "#FFFFFF",
              value: chat[i].message,
              align: "left"
          })
          if (fetchShip(chat[i].sentBy) !== -1) {
              components.push({
                  type: "player",
                  position: [0, 77.55 - Y_OFFSET, 40, 6.45],
                  color: "#FFFFFF00",
                  id: chat[i].sentBy
              })
              components.push({
                  type: "text",
                  position: [10, 77.55 - Y_OFFSET, 100, 6.45],
                  color: "#FFFFFF",
                  value: game.ships[fetchShip(chat[i].sentBy)].name,
                  align: "left"
              })
          } else {
              components.push({
                  type: "text",
                  position: [10, 77.55 - Y_OFFSET, 100, 6.45],
                  color: "#FFFFFF",
                  value: "Player left",
                  align: "left"
              })
          }
          Y_OFFSET += 25.675
      }
      ship.setUIComponent({
          id: "global_chat_front",
          position: [0, 64, 30, 31],
          visible: true,
          clickable: false,
          components: components
      })
      ship.setUIComponent({
          id: "resize_global_chat",
          position: [31, 90, 5, 5],
          visible: true,
          clickable: true,
          components: [
              { type:"box",position:[0,0,100,100],fill:"#24242450",stroke:"#FFFFFF50",width:2},
              {type: "text", position: [0,0,100,100], color: "#FFF", align: "center", value: "←"}
          ]
      })
  }
  
  //ship
  const renderKeyboard = (initiator, game) => {
      for (let i = 0; i < staticMemory.layout.length; i++) {
          for (let j = 0; j < staticMemory.layout[i].length; j++) {
              const X_OFFSET = i == 0 ? 0 : i == 1 ? 2 : 4
              initiator.setUIComponent({
                  id: `key_${staticMemory.layout[i][j]}`,
                  position: [20 + X_OFFSET + (j * 6), 65 + (i * 5), 6, 5],
                  visible: true,
                  shortcut: staticMemory.layout[i][j].toUpperCase(),
                  clickable: true,
                  components: [
                      {type:"box", position: [0, 0, 100, 100], fill: "#FFFFFF50", stroke:"#FFFFFF50"},
                      {type:"text",position: [0,0,100,100],color: "#FFF",value:staticMemory.layout[i][j],align:"center"},
                  ]
              })
          }
      }
      initiator.setUIComponent({
          id: "key_space",
          position: [30, 80, 30, 5],
          visible: true,
          shortcut: " ",
          clickable: true,
          components: [
              {type:"box", position: [0, 0, 100, 100], fill: "#FFFFFF50", stroke:"#FFFFFF50"},
          ]
      })
      try {
          initiator.setUIComponent({
              id: "typingSpace",
              position: [20, 60, 50, 5],
              visible: true,
              clickable: false,
              components: [
                  {type:"box", position: [0, 0, 100, 100], fill: "#FFFFFF10", stroke:"#FFFFFF50"},
                  {type:"text",position: [2,0,96,100],color: "#FFF",value: initiator.draftMessage,align:"left"},
              ]
          })   
      } catch (err) {
          echo(err)
          console.log(err)
      }
      initiator.setUIComponent({
          id: "key_backspace",
          position: [70, 60, 5, 5],
          visible: true,
          clickable: true,
          components: [
              {type:"box", position: [0, 0, 100, 100], fill: "#FFFFFF50", stroke:"#FFFFFF50"},
              {type:"text",position: [0,0,100,100],color: "#FFF",value:"↩",align:"center"},
          ]
      })
      initiator.setUIComponent({
          id: "sendMessage",
          position: [75, 60, 5, 5],
          visible: true,
          clickable: true,
          components: [
              {type:"box", position: [0, 0, 100, 100], fill: "#FFFFFF50", stroke:"#FFFFFF50"},
              {type:"text",position: [0,0,100,100],color: "#FFF",value:"➤",align:"center"},
          ]
      })
  }
  
  const openGlobalChat = (initiator, game) => {
      echo("PREPARING TO RENDER GLOBAL CHAT")
      initiator.chatTargetID = -1
      initiator.draftMessage = ""
      initiator.chatOpen = true
      initiator.recievedMessages = removeFromArray(initiator.recievedMessages, -1)
      echo("RENDERING GLOBAL CHAT")
      for (let i = 0; i < sessionMemory.rememberedIDs.length; i++) {
          initiator.setUIComponent({id: `channel_${sessionMemory.rememberedIDs[i]}`, visible: false})
          initiator.setUIComponent({id: `player_${sessionMemory.rememberedIDs[i]}`, visible: false})
          initiator.setUIComponent({id: `invite_${sessionMemory.rememberedIDs[i]}`, visible: false})
          initiator.setUIComponent({id: `ban_${sessionMemory.rememberedIDs[i]}`, visible: false})
          initiator.setUIComponent({id: `kick_${sessionMemory.rememberedIDs[i]}`, visible: false})
      }
      echo("FLAG 1")
      initiator.setUIComponent({id: `global_channel`, visible: false})
          initiator.setUIComponent({
              id:"back_chat",
              position:[72, 17, 4, 3],
              clickable: true,
              visible: true,
              components: [
                  {type:"box", position: [0, 0, 100, 100], fill: "#20202050", stroke:"#FFFFFF50"},
                  {type:"text",position: [0,0,100,100],color: "#FFF",value:"←",align:"center"},
              ]
          })
          initiator.setUIComponent({
              id:"chat_player_indicator",
              position:[22, 17, 45, 3],
              clickable: false,
              visible: true,
              components: [
                  {type: "text", position: [0,0,100,100], color: "#FFF", value: `Global Chat`, align: "left"}
              ]
          })
      echo("FLAG 2")
      renderKeyboard(initiator, game);
      renderGlobalMessages(initiator.id)
  }
  //targets
  const renderGlobalMessages = (ship) => {
      let target = ship.id
      let chat = sessionMemory.chatChannels[0]
      console.log(chat)
      console.log(sessionMemory)
      for (let i in game.ships) {
          for (let j = 0; j < chat.messages.length; j++) {
              if (game.ships[i].chatTargetID === -1) {
                  try {
                      let messageType = chat.messages[j].sentBy === game.ships[i].id ? "user" : "foreign"
                      game.ships[i].setUIComponent({
                          id: `message_${j}`,
                          position: [22.5, 22.2 + (j * 6.66), 56, 4],
                          clickable: false,
                          visible: game.ships[i].chatOpen,
                          components: [
                              {type:"box", position: [0, 0, 100, 100], fill: messageType == "foreign" ? "#00FF0060" : "#0000FF60", stroke:"#FFFFFF50"},
                              {type:"text",position: [2,2, 96, 96],color: "#FFF", value: chat.messages[j].message, align: messageType == "foreign" ? "left" : "right"},
                          ]
                      })
                      game.ships[i].setUIComponent({
                          id: `message_${j}_indicator`,
                          position: [22.5, 20.2 + (j * 6.66), 56, 2],
                          clickable: false,
                          visible: game.ships[i].chatOpen,
                          components: messageType === "foreign" ? 
                                      fetchShip(chat.messages[j].sentBy) !== -1 ?
                                      [
                                          {type: "player", id: chat.messages[j].sentBy, position: [0,0,100,100],color: "#FFF"},
                                      ]
                                      :
                                      [
                                          {type:"text",position: [0,0, 100, 100],color: "#FFF", value: "Player left", align:"right"},
                                      ]
                           : [
                              {type:"text",position: [0,0, 100, 100],color: "#FFF", value: "You", align:"right"},
                          ]
                      })
                  } catch (err) {
                      echo(err)
                      console.log(err)
                  }
              }
      }
      }
  }
  
  const handleDraftChange = (ship, key, game) => {
      function removeLastCharacter(str) {
          if (str === '') {
            return '';
          } else {
            return str.slice(0, -1);
          }
      }
      switch (key) {
          case "space":
              ship.draftMessage = ship.draftMessage + " "
              break
          case "backspace":
              ship.draftMessage = removeLastCharacter(ship.draftMessage)
              break
          default:
              ship.draftMessage = ship.draftMessage + key
      }
      ship.setUIComponent({
          id: "typingSpace",
          position: [20, 60, 50, 5],
          visible: true,
          clickable: false,
          components: [
              {type:"box", position: [0, 0, 100, 100], fill: "#FFFFFF10", stroke:"#FFFFFF50"},
              {type:"text",position: [2,0,96,100],color: "#FFF",value: ship.draftMessage,align:"left"},
          ]
      })
  }
  
  const handleSendMessage = (ship, game) => {
      if (ship.draftMessage === "") {return}
      let type = ship.chatTargetID === -1 ? "global" : "direct"
      let targets = [ship.id, ship.chatTargetID]
      let chatIndex = type === "global" ? 0 : fetchChat(targets[0], targets[1])
      sessionMemory.chatChannels[chatIndex].messages.length === 6 && sessionMemory.chatChannels[chatIndex].messages.shift()
      if (type === "direct") {
          sessionMemory.chatChannels[chatIndex].messages.push({
              sentBy: Math.min(ship.id, ship.chatTargetID) === ship.id ? 0 : 1,
              message: ship.draftMessage
          })
      } else {
          sessionMemory.chatChannels[chatIndex].messages.push({
              sentBy: ship.id,
              message: ship.draftMessage
          })
      }
      ship.draftMessage = ""
      ship.setUIComponent({
          id: "typingSpace",
          position: [20, 60, 50, 5],
          visible: true,
          clickable: false,
          components: [
              {type:"box", position: [0, 0, 100, 100], fill: "#FFFFFF10", stroke:"#FFFFFF50"},
              {type:"text",position: [2,0,96,100],color: "#FFF",value: ship.draftMessage,align:"left"},
          ]
      })
      if (type === "direct") {
          renderMessages(targets[0], targets[1])
          let target = game.ships[fetchShip(ship.chatTargetID)]
          if (!(target.recievedMessages.includes(ship.id))) {
              target.recievedMessages.push(ship.id)
          }
          if (target.chatOpen) {
              if (target.chatTargetID !== ship.id) {
                  notify(target)
              } else {
                  target.recievedMessages = removeFromArray(target.recievedMessages, ship.id)
              }
          } else if (target.dashboardOpen) {
              renderDashboard(target, game)
              notify(target)
          } else {
              notify(target)
          }
      } else {
          renderGlobalMessages(ship)
          for (let ship of game.ships) {
              if (ship.globalChatExpanded) {
                  renderExpandedChat(ship, game)
              }
          }
      }
  }
  
  const removeFromArray = (arr, target) => arr.filter(item => item !== target);
  
  const handleOpenChat = (initiator, targetID, game) => {
      initiator.chatTargetID = targetID
      initiator.draftMessage = ""
      initiator.chatOpen = true
      initiator.recievedMessages = removeFromArray(initiator.recievedMessages, targetID)
      for (let i = 0; i < sessionMemory.rememberedIDs.length; i++) {
          initiator.setUIComponent({id: `channel_${sessionMemory.rememberedIDs[i]}`, visible: false})
          initiator.setUIComponent({id: `player_${sessionMemory.rememberedIDs[i]}`, visible: false})
          initiator.setUIComponent({id: `invite_${sessionMemory.rememberedIDs[i]}`, visible: false})
          initiator.setUIComponent({id: `ban_${sessionMemory.rememberedIDs[i]}`, visible: false})
          initiator.setUIComponent({id: `kick_${sessionMemory.rememberedIDs[i]}`, visible: false})
      }
      initiator.setUIComponent({id: `global_channel`, visible: false})
          initiator.setUIComponent({
              id:"back_chat",
              position:[72, 17, 4, 3],
              clickable: true,
              visible: true,
              components: [
                  {type:"box", position: [0, 0, 100, 100], fill: "#20202050", stroke:"#FFFFFF50"},
                  {type:"text",position: [0,0,100,100],color: "#FFF",value:"←",align:"center"},
              ]
          })
          initiator.setUIComponent({
              id:"chat_player_indicator",
              position:[22, 17, 45, 3],
              clickable: false,
              visible: true,
              components: [
                  {type: "text", position: [0,0,100,100], color: "#FFF", value: `Chatting with: ${game.ships[fetchShip(targetID)].name}`, align: "left"}
              ]
          })
      renderKeyboard(initiator, game);
      if (fetchChat(initiator.id, targetID) !== -1) {
          renderMessages(initiator.id, targetID)
      } else {
          sessionMemory.chatChannels.push({
              parties: [initiator.id, targetID],
              messages: []
          })
      }
  }
  
  const fetchChat = (id1, id2) => sessionMemory.chatChannels.findIndex(el => el.parties !== undefined && el.parties.includes(id1) && el.parties.includes(id2))
  const fetchShip = (id) => game.ships.findIndex(el => el.id === id)
  
  const renderMessages = (id1, id2) => {
      let targets = [fetchShip(id1), fetchShip(id2)]
      const returnOtherTarget = (exc) => {
          for (let i of targets) {if (i !== targets[exc]) {return i}}
      }
      let chat = sessionMemory.chatChannels[fetchChat(id1, id2)]
      for (let i = 0; i < 2; i++) {
          targets = [fetchShip(id1), fetchShip(id2)]
          for (let j = 0; j < chat.messages.length; j++) {
              if (game.ships[targets[i]].chatTargetID == game.ships[returnOtherTarget(i)].id) {
                  let messageType = Math.min(game.ships[targets[i]].id, game.ships[returnOtherTarget(i)].id) == game.ships[targets[i]].id ? chat.messages[j].sentBy == 0 ? "user" : "foreign" : chat.messages[j].sentBy == 1 ? "user" : "foreign"
                  game.ships[targets[i]].setUIComponent({
                      id: `message_${j}`,
                      position: [22, 21 + (j * 6.66), 56, 5.2],
                      clickable: false,
                      visible: game.ships[targets[i]].chatOpen,
                      components: [
                          {type:"box", position: [0, 0, 100, 100], fill: messageType == "foreign" ? "#00FF0060" : "#0000FF60", stroke:"#FFFFFF50"},
                          {type:"text",position: [2,2, 96, 96],color: "#FFF", value: chat.messages[j].message, align: messageType == "foreign" ? "left" : "right"},
                      ]
                  })
              }
          }
      }
  }
  
  let notificationTimer = null
  const notify = (ship) => {
      clearTimeout(notificationTimer)
      ship.setUIComponent({
          id: "new_message",
          position: [0, 90, 78, 5],
          clickable: false,
          visible: true,
          components: [
              {type: "text", position: [0,0,100,100], color: "#FF4F4F", value: "New message", align: "right"}
          ]
      })
      notificationTimer = setTimeout(() => {
          ship.setUIComponent({
              id: "new_message",
              position: [0, 90, 78, 5],
              clickable: false,
              visible: false,
              components: [
                  {type: "text", position: [0,0,100,100], color: "#FF4F4F", value: "New message", align: "right"}
              ]
          })
      }, 2500)
  }
  
  const renderDashboard = (ship, game) => {
      if (ship.chatOpen) {return}
      ship.dashboardOpen = true
      ship.setUIComponent({
          id:"chat_player_indicator",
          position:[21, 17, 46, 3],
          clickable: false,
          visible: true,
          components: [
              {type: "text", position: [0,0,100,100], color: "#FFF", value: `Dashboard`, align: "left"}
          ]
      })
      ship.setUIComponent({
          id:`global_channel`,
          position: [20, 20, 60, 5],
          clickable: true,
          visible: true,
          components: [
              {type:"text", position: [0, 0, 100, 100], value: "Global Chat 🗪", color:"#FFF", align: "center"},
              {type:"box", position: [0, 0, 100, 100], fill: "#24242450"},
              {type:"box", position: [0, 99, 100, 1], fill: "#FFFFFF50"},
              {type:"box", position: [0, 0, 100, 1], fill: "#FFFFFF50"}
          ]
      })
      for (let i = 0, Y_OFFSET = 25; i < game.ships.length; i++) {
          if (game.ships[i].id === ship.id) {continue}
          ship.setUIComponent({
              id:`channel_${game.ships[i].id}`,
              position: [76, Y_OFFSET, 4, 5],
              clickable: true,
              visible: true,
              components: ship.recievedMessages.includes(game.ships[i].id) ? [
                  {type:"round",position:[0,0,29,35],fill:"#FF0000"},
                  {type:"box", position: [0, 0, 100, 100], fill: "#FFFFFF50", stroke:"#FFFFFF50"},
                  {type:"text",position: [5,0,90,100],color: "#FFF",value:"🗪",align:"center"},
              ] : [
                  {type:"box", position: [0, 0, 100, 100], fill: "#FFFFFF50", stroke:"#FFFFFF50"},
                  {type:"text",position: [5,0,90,100],color: "#FFF",value:"🗪",align:"center"},
              ]
          })
          ship.setUIComponent({
              id:`invite_${game.ships[i].id}`,
              position: [72, Y_OFFSET, 4, 5],
              clickable: true,
              visible: true,
              components: [
                  {type:"box", position: [0, 0, 100, 100], fill: "#FFFFFF50", stroke:"#FFFFFF50"},
                  {type:"text",position: [5,0,90,100],color: "#FFF",value:"✉",align:"center"},
              ]
          })
          if (determineType(ship) == "admin") {
              ship.setUIComponent({
                  id:`ban_${game.ships[i].id}`,
                  position: [68, Y_OFFSET, 4, 2.5],
                  clickable: true,
                  visible: true,
                  components: [
                      {type:"box", position: [0, 0, 100, 100], fill: "#FF000050", stroke:"#FF000050"},
                      {type:"text",position: [5,0,90,100],color: "#FFF",value:"Ban",align:"center"},
                  ]
              })
              ship.setUIComponent({
                  id:`kick_${game.ships[i].id}`,
                  position: [68, Y_OFFSET + 2.5, 4, 2.5],
                  clickable: true,
                  visible: true,
                  components: [
                      {type:"box", position: [0, 0, 100, 100], fill: "#FF000050", stroke:"#FF000050"},
                      {type:"text",position: [5,0,90,100],color: "#FFF",value:"Kick",align:"center"},
                  ]
              })
          }
          ship.setUIComponent({
              id:`player_${game.ships[i].id}`,
              position: [20, Y_OFFSET, 60, 5],
              clickable: false,
              visible: true,
              components: [
                  {type: "player", id: game.ships[i].id, position: [3,0,100,100],color: "#FFF"},
                  {type:"box", position: [0, 0, 100, 100], fill: "#24242450"},
                  {type:"box", position: [0, 99, 100, 1], fill: "#FFFFFF50"},
                  {type:"box", position: [0, 0, 100, 1], fill: "#FFFFFF50"}
              ]
          })
          Y_OFFSET += 5
      }
      ship.setUIComponent({
          id:"dashboard",
          position:[20, 20, 60, 65],
          clickable: false,
          visible: true,
          components: [
              {type:"box", position: [0, 0, 100, 100], fill: "#24242450"},
              {type:"box", position: [0, 99.5, 100, 0.5], fill: "#FFFFFF50"},
          ]
      })
      ship.setUIComponent({
          id:"closeDashboard",
          position:[76, 17, 4, 3],
          clickable: true,
          visible: true,
          components: [
              {type:"box", position: [0, 0, 100, 100], fill: "#FF000050", stroke:"#FFFFFF50"},
              {type:"text",position: [0,0,100,100],color: "#FFF",value:"✖",align:"center"},
          ]
      })
      ship.setUIComponent({
          id:"navbar",
          position: [20, 17, 60, 3],
          clickable: false,
          visible: true,
          components: [
              {type:"box", position: [0, 0, 100, 5], fill: "#FFFFFF50"},
              {type:"box", position: [0, 0, 100, 100], fill: "#FFFFFF20"},
              {type:"box", position: [0, 98, 100, 2], fill: "#FFFFFF50"},
          ]
      })
  }
  
  const closeDashboard = (ship, game) => {
          ship.dashboardOpen = false
          ship.chatOpen = false
          let elementsToClose = ['dashboard', 'typingSpace', 'sendMessage', 'key_space', 'key_backspace', 'closeDashboard', 'navbar', 'back_chat', 'global_channel', 'chat_player_indicator']
          for (let letter of staticMemory.layoutString.split('')) {
              elementsToClose.push(`key_${letter}`)
          }
          for (let ship of sessionMemory.rememberedIDs) {
              elementsToClose.push(`player_${ship}`)
              elementsToClose.push(`channel_${ship}`)
              elementsToClose.push(`invite_${ship}`)
              elementsToClose.push(`ban_${ship}`)
              elementsToClose.push(`kick_${ship}`)
          }
          for (let i = 0; i <= 6; i++) {
              elementsToClose.push(`message_${i}`)
              elementsToClose.push(`message_${i}_indicator`)
          } 
          for (let component of elementsToClose) {
              ship.setUIComponent({
                  id: component,
                  visible: false
              })
          }
  }
  
  const closeChat = (ship, game) => {
      ship.chatOpen = false
      let elementsToClose = ['typingSpace', 'sendMessage', 'key_space', 'key_backspace', 'back_chat']
      for (let letter of staticMemory.layoutString.split('')) {
          elementsToClose.push(`key_${letter}`)
      }
      for (let i = 0; i <= 6; i++) {
          elementsToClose.push(`message_${i}`)
          elementsToClose.push(`message_${i}_indicator`)
      } 
      for (let component of elementsToClose) {
          ship.setUIComponent({
              id: component,
              visible: false
          })
      }
      renderDashboard(ship, game)
  }
  
  const renderShipTree = (ship) => {
      ship.setUIComponent({
          id:"shipTree",
          position:[20, 20, 60, 60],
          clickable: false,
          visible: true,
          components: [
              {type:"box", position: [0, 0, 100, 100], fill: "#24242450"},
              {type:"box", position: [0, 99, 100, 1], fill: "#FFFFFF50"},
              {type:"box", position: [0, 0, 100, 1], fill: "#FFFFFF50"}
          ]
      })
  }
  
  const renderExpandedMenu = (ship, type) => {
      ship.isUIExpanded = true
      switch (type) {
          case "admin":
          case "regular":
              const BACKGROUND_WIDTH = 50
              const BUTTONS = [
                  {label: "Select Ship", id: "showShipTree"},
                  {label: type == "admin" ? "Admin Dashboard" : "Dashboard", id: "showDashboard"},
                  {label: "Adjust stats", id: "adjustStats"},
                  {label: "More soon..", id: "fffff"},
              ]
              staticMemory.retractableComponentIDs = [...staticMemory.retractableComponentIDs, ...BUTTONS.map(item => item.id)]
              for (let i = 0, 
                  REF_WIDTH = BACKGROUND_WIDTH - BUTTONS.length, 
                  X_OFFSET = (100 - BACKGROUND_WIDTH) / 2 + .5, 
                  BUTTON_WIDTH = REF_WIDTH / BUTTONS.length; 
                  i < BUTTONS.length; 
                  i++, 
                  X_OFFSET += BUTTON_WIDTH + 1) {
                      ship.setUIComponent({
                          id: BUTTONS[i].id,
                          position:[X_OFFSET, 1, BUTTON_WIDTH, 6],
                          clickable: true,
                          visible: true,
                          components: [
                              {type:"box", position: [0, 0, 100, 100], fill: "#24242450",stroke:"#FFFFFF50",width:3},
                              {type: "text",position: [5,0,90,100],color: "#FFF",value: BUTTONS[i].label,align:"center"},
                          ]
                  })
              }
              ship.setUIComponent({
                  id:"mainControlsBackground",
                  position:[25, 0, BACKGROUND_WIDTH, 8],
                  clickable: false,
                  visible: true,
                  components: [
                      {type:"box", position: [0, 0, 100, 100], fill: "#24242450"},
                      {type:"box", position: [0, 98, 100, 2], fill: "#FFFFFF50"}
                  ]
              })
              ship.setUIComponent({
                  id:"expandButton",
                  position:[71,8.5,4,4],
                  clickable: true,
                  shortcut: "X",
                  visible: true,
                  components: [
                    { type:"box",position:[0,0,100,100],fill:"#24242450",stroke:"#FFFFFF50",width:3},
                    { type: "text",position: [0,15,100,70],color: "#FFF",value: "↑"},
                  ]
              })
              break
      }
      
  }
  
  const renderRetractedMenu = (ship) => {
      ship.isUIExpanded = false
      for (let id of staticMemory.retractableComponentIDs) {
          ship.setUIComponent({id, visible: false})
      }
      ship.setUIComponent({
          id:"expandButton",
          position:[71,1,4,4],
          clickable: true,
          shortcut: "X",
          visible: true,
          components: [
            { type:"box",position:[0,0,100,100],fill:"#24242450",stroke:"#FFFFFF50",width:3},
            { type: "text",position: [0,15,100,70],color: "#FFF",value: "↓"},
          ]
      })
  }