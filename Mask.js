const request = require("request");
const fs = require("fs");
const Discord = require("discord.js");
const client = new Discord.Client();
const options_mask = require("./Temp/Mask/options.json");
const options_map = require("./Temp/Mask/map.json");
const options_mapr = require("./Temp/Mask/map_r.json");
const Token = require("./Token/Mask.json");
const prefix = "!";
var queue = [];
client.login(Token.token);
client.on("ready", () => {
    client.user.setPresence({activity:{name:`${client.guilds.cache.size}개의 서버와 함께 `},status:"online"})
    console.log("봇 준비 완료..\n\n");
    console.log(`접속중인 봇 (유저) : ${client.user.tag} (${client.user.id})\n\n`);
    fs.writeFileSync("./Temp/Mask/queue.json", JSON.stringify({
        "messages": []
    }));
    client.guilds.cache.forEach(a=>console.log(a.name));
});
client.on("message", (msg) => {
    var embed = new Discord.MessageEmbed;
    embed.setAuthor("마스크 현황봇", client.user.avatarURL());
    if (!msg.author.bot) {
        arg = msg.content.split(" ");
        command = arg[0].replace(prefix, "");
        arg.shift();
        if (command == "마스크") {
            if(arg[0] == "도움말")
            if (arg[0] == "좌표") {
                if (arg.length == 1 || arg.length == 2) {
                    embed.setTitle("사용법")
                    embed.setDescription("!마스크 [x/경도] [y/위도] [page] : 위도,경도를 이용한 위치 3km 주변에 있는 약국을 찾습니다.")
                    msg.channel.send(embed);
                } else {
                    json_mapr = options_mapr;
                    json_mapr.qs.coords = `${arg[1]},${arg[2]}`
                    request(json_mapr, async (e, r, b) => {
                        json = JSON.parse(b);
                        switch (json.status.code) {
                            case 0:
                                area = json.results[0].region;
                                var addr = `${area.area1.name} ${area.area2.name} ${area.area3.name} ${area.area4.name}`;
                                embed.setTitle("마스크 현황")
                                embed.setDescription(`위치 : ${addr}`)
                                b_msg = await msg.channel.send(embed);
                                json_mask = options_mask;
                                json_mask.qs.lat = (area.area4.coords.center.y == 0.0) ? area.area3.coords.center.y : area.area4.coords.center.y
                                json_mask.qs.lng = (area.area4.coords.center.x == 0.0) ? area.area3.coords.center.x : area.area4.coords.center.x
                                console.log(options_mask);
                                console.log(area);
                                await request(json_mask, (e, r, b) => {
                                    json_mask = JSON.parse(b);
                                    var index = (arg.length >= 4) ? arg[3]*1 : 1;
                                    num = (index - 1) * 5 + i;
                                    embed.setTitle(`마스크 현황 ${index}/${Math.ceil(json_mask.count / 5)}`);
                                    for (var i = 0; i < 5; i++) {
                                        num = (index - 1) * 5 + i;
                                        if (num < json_mask.stores.length) {
                                            element = json_mask.stores[num];
                                            switch (element.type) { case "01" : element.type = "약국"; break; 
                                                                    case "02" : element.type = "우체국"; break;
                                                                    case "03" : element.type = "농협"; break; }
                                    embed.addField(element.name, `주소 : ${element.addr}\n이름 : ${element.name}\n판매처 : ${element.type}\n재고 상태: ${element.remain_stat}`);}
                                    b_msg.edit(embed)
                                    b_msg.react("◀️")
                                    b_msg.react("▶️")
                                    b_msg.react("🇽")
                                    o = {
                                        id: b_msg.id,
                                        addr: addr,
                                        stores: json_mask.stores,
                                        author: msg.author,
                                        index: index,
                                        page: Math.ceil(json_mask.count / 5)
                                    }
                                    queue.push(o);
                                    setTimeout(function() {
                                        queue.slice(queue.findIndex(e => e.id == b_msg.id)).then(console.log(`${e.id}의 해당하는 메시지가 타임아웃 되었습니다.`))
                                    }, 30000);}});
                                break;
                            case 3:
                                embed.setTitle("오류")
                                embed.setDescription("찾을 수 없는 위치 입니다.")
                                break;
                        }
                    })
                }
            }
            if (arg[0] == "주소") {
                if (arg.length == 1) {
                    embed.setTitle("사용법")
                    embed.setDescription("!마스크 주소 [주소] : 주소를 이용한 위치 3km 주변에 있는 약국을 찾습니다.")
                    msg.channel.send(embed);
                } else {
                    json_map = options_map;
                    json_map.qs.query = msg.content.replace("!마스크 주소 ", "");
                    request(json_map, async (e, r, b) => {
                        json = JSON.parse(b);
                        if (json.status == "OK" && json.meta.count >= 1) {
                            area = json.addresses[0];
                            var addr = area.roadAddress;
                            embed.setTitle("마스크 현황")
                            embed.setDescription(`위치 : ${addr}`)
                            b_msg = await msg.channel.send(embed);
                            json_mask = options_mask;
                            json_mask.qs.lat = area
                                .y
                            json_mask
                                .qs
                                .lng = area.x
                            console.log(options_mask);
                            console.log(area);
                            await request(json_mask, (e, r, b) => {
                                json_mask = JSON.parse(b);
                                var index = (arg.length >= 4) ?
                                    arg[3] * 1 :
                                    1;
                                num = (index - 1) * 5 + i;
                                embed.setTitle(`마스크 현황 ${index}/${
                        Math.ceil(json_mask.count / 5)
                    }`);
                                for (var i = 0; i < 5; i++) {
                                    num = (index - 1) * 5 + i;
                                    if (num < json_mask.stores.length) {
                                        element = json_mask.stores[num];
                                        switch (element.type) {
                                            case "01":
                                                element.type = "약국"
                                                break;
                                            case "02":
                                                element.type = "우체국"
                                                break;
                                            case "03":
                                                element.type = "농협"
                                                break;
                                        }
                                        embed.addField(element.name, `주소 : ${
                                element.addr
                            }\n이름 : ${
                                element.name
                            }\n판매처 : ${
                                element.type
                            }\n재고 상태: ${
                                element.remain_stat
                            }`);
                                    };
                                }
                                b_msg
                                    .edit(embed)
                                b_msg
                                    .react("◀️")
                                b_msg
                                    .react("▶️")
                                b_msg
                                    .react("🇽")
                                o = {
                                    id: b_msg.id,
                                    addr: addr,
                                    stores: json_mask.stores,
                                    author: msg.author,
                                    index: index,
                                    page: Math.ceil(json_mask.count / 5)
                                }
                                queue.push(o);
                                setTimeout(function() {
                                    queue.slice(queue.findIndex(e => e.id == msg.id));
                                    console.log("ㅎㅇ");
                                }, 30000);
                            });
                        } else {
                            embed.setTitle("오류")
                            embed.setDescription("해당 하는 값의 위치를 찾지 못했습니다.")
                            msg.channel.send(embed)
                        }
                    })
                }
            }
        }
    }
});
client.on("messageReactionAdd", (mr, user) => {
    msg = mr.message;
    embed = new Discord.MessageEmbed;
    embed.setAuthor("마스크 현황봇", client.user.avatarURL());
    inform = queue.find(e => e.id == msg.id);
    if (inform) {
        if (inform.author == user) {
            switch (mr.emoji.identifier
                .toString()) { // <
                case "%E2%97%80%EF%B8%8F":
                    if (inform.index == 1) {
                        msg.reactions.removeAll();
                        msg
                            .react("◀️")
                        msg
                            .react("▶️")
                        msg
                            .react("🇽")
                    } else {
                        index = inform.index - 1
                        das = inform.index = index;
                        queue.slice(queue.findIndex(e => e.id = msg.id))
                        queue.push(das);
                        embed
                            .setTitle(`마스크 현황 ${
                    inform.index
                }/${
                    Math.ceil(inform.stores.length / 5)
                }`)
                        for (var i = 0; i < 5; i++) {
                            num = (index - 1) * 5 + i;
                            if (num < inform.stores.length) {
                                element = inform.stores[num];
                                switch (element.type) {
                                    case "01":
                                        element.type = "약국"
                                        break;
                                    case "02":
                                        element.type = "우체국"
                                        break;
                                    case "03":
                                        element.type = "농협"
                                        break;
                                }
                                embed.addField(element.name, `주소 : ${element.addr}\n이름 : ${element.name}\n판매처 : ${element.type}\n재고 상태: ${element.remain_stat}`);
                            };
                        }
                        msg.edit(embed)
                        msg.reactions.removeAll();
                        msg
                            .react("◀️")
                        msg
                            .react("▶️")
                        msg
                            .react("🇽")
                    }
                    break;
                    // >
                case "%E2%96%B6%EF%B8%8F":
                    if (inform.page == inform.index) {
                        msg.reactions.removeAll();
                        msg
                            .react("◀️")
                        msg
                            .react("▶️")
                        msg
                            .react("🇽")
                    } else {
                        index = inform.index + 1
                        das = inform.index = index;
                        queue.slice(queue.findIndex(e => e.id = msg.id))
                        queue.push(das);
                        embed
                            .setTitle(`마스크 현황 ${
                    inform.index
                }/${
                    Math.ceil(inform.stores.length / 5)
                }`)
                        for (var i = 0; i < 5; i++) {
                            num = (index - 1) * 5 + i;
                            if (num < inform.stores.length) {
                                element = inform.stores[num];
                                switch (element.type) {
                                    case "01":
                                        element.type = "약국"
                                        break;
                                    case "02":
                                        element.type = "우체국"
                                        break;
                                    case "03":
                                        element.type = "농협"
                                        break;
                                }
                                embed.addField(element.name, `주소 : ${
                            element.addr
                        }\n이름 : ${
                            element.name
                        }\n판매처 : ${
                            element.type
                        }\n재고 상태: ${
                            element.remain_stat
                        }`);
                            };
                        }
                        msg
                            .edit(embed)
                        msg
                            .reactions
                            .removeAll();
                        msg
                            .react("◀️")
                        msg
                            .react("▶️")
                        msg
                            .react("🇽")
                    }
                    break;
                    // X
                case "%F0%9F%87%BD":
                    break;
            }
        }
    }
})
