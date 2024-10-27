"use strict";
/* global hexo */

const options = Object.assign(
  {
    enable: true,
    inject: true,
    version: "latest",
    className: "lotties-player",
  },
  hexo.theme.lottiesPlayer || {},
  hexo.config.lottiesPlayer || {}
);

function lottiesfile(args, keys) {
  const options = {};

  // Duyệt qua các khóa để tạo đối tượng
  keys.forEach(key => {
    // Tạo biểu thức chính quy để tìm giá trị
    const regex = new RegExp(`(?:^|,)${key}=(.*?)(?:,|$)`);
    let found = false;

    // Duyệt qua từng phần tử trong args
    for (const arg of args) {
      const match = arg.match(regex);
      if (match) {
        options[key] = match[1].trim(); // Lưu giá trị tìm được
        found = true;
        break; // Thoát vòng lặp nếu đã tìm thấy
      }
    }

    // Nếu không tìm thấy giá trị, kiểm tra xem có phải là một flag (như 'loop') không
    if (!found) {
      if (args.includes(key)) {
        options[key] = true; // Gán true nếu key tồn tại trong args
      } else {
        // options[key] = undefined; // Gán là undefined nếu không tìm thấy
      }
    }
  });

  return options;
}


hexo.extend.helper.register("lotties_player", (name) => renderEmoji(name));
hexo.extend.tag.register("lotties_player", (args) => {
  return renderEmoji(args)
});

function removeLeadingU(input) {
  return input.startsWith('u') ? input.substring(1) : input;
}

hexo.extend.tag.register("lotties_emoji", (args) => {
  const defaultConfigs = { 
    width: "1em",
    height: "1em",
    loop: true,
    autoplay: true,
    hover: undefined,
    backward: false,
    speed: 1,
    bounce: false,
    controls: false,
    background: "transparent",
    className: "thiennguyen-lotties-emoji is-inline-block",
    code: "u1f600"
  }
  // get tag config
  const argsList = {...defaultConfigs, ...lottiesfile(args, ["code"])}
  const ucharCode = argsList.code.trim()
  if (!ucharCode) {
    throw new Error("Missing Emoji code")
  }
  // https://fonts.gstatic.com/s/e/notoemoji/latest/${ucharCode}/lottie.json
  // https://fonts.gstatic.com/s/e/notoemoji/latest/1f603/lottie.json
  defaultConfigs.src = `https://fonts.gstatic.com/s/e/notoemoji/latest/${removeLeadingU(ucharCode)}/lottie.json`;
  return renderEmoji(args, defaultConfigs)
});

if (options.inject !== false) {
  hexo.extend.injector.register("head_begin", `<script src="https://unpkg.com/@dotlottie/player-component@latest/dist/dotlottie-player.mjs" type="module"></script>`);
}

function fillProperty(condition, value, fallback = "") {
  if (condition) {
    return value()
  }
  return fallback
}

function renderStyle(width, height) {
  // Sử dụng fillProperty để tạo ra chuỗi style
  return fillProperty(width || height, () => {
    const styles = [];
    if (width) {
      styles.push(`width: ${width};`);
    }
    if (height) {
      styles.push(`height: ${height};`);
    }
    return `style="${styles.join(' ')}"`;
  });
}

function renderEmoji(args, defaultConfig = {}) {
  let argsList = { 
    src: undefined, 
    width: undefined,
    height: undefined,
    loop: undefined,
    autoplay: undefined,
    hover: undefined,
    backward: false,
    speed: 1,
    bounce: false,
    controls: false,
    background: "transparent",
    className: "",
    ...defaultConfig,
  }
  argsList = {...argsList, ...lottiesfile(args, Object.keys(argsList))}

  if (!argsList.src) {
    throw new Error("hexo-lotties-player: Missing src property")
  }
  return `<dotlottie-player class="thiennguyen-lotties-player${fillProperty(argsList.className, ()=>` ${argsList.className}`)}" src="${argsList.src}" background="${argsList.background || "transparent"}" ${renderStyle(argsList.width, argsList.height)} ${fillProperty(argsList.width, ()=>`width="${argsList.width}"`)} ${fillProperty(argsList.height, ()=>`height="${argsList.height}"`)} ${fillProperty(argsList.speed, ()=>{
    let speed = Number(argsList.speed)
    if (speed >= 0) {
      return `speed="${speed}"`
    }
    if (speed < 0) {
      return `speed="0"`
    }
    return `speed="1"`
  }, `speed="1"`)} ${fillProperty(argsList.bounce, ()=>`playMode="bounce"`,`playMode="normal"`)} ${fillProperty(argsList.loop, ()=>"loop")} ${fillProperty(argsList.autoplay, ()=>"autoplay")} ${fillProperty(argsList.hover, ()=>"hover")} ${fillProperty(argsList.backward, ()=>`direction="${argsList.backward?'-1':'1'}"`)} ${fillProperty(argsList.controls, ()=>"controls","")}></dotlottie-player>`
}
