const os = require('os');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
module.exports = {
  config: {
    name: "system",
    aliases: ["s"],
    version: "2.0",
    countDown: 26,
    author: "Rizky Z (hadi)",
    role: 0,
    description: "𝗂𝗇𝖿𝗈𝗋𝗆𝖺𝗌𝗂 𝗌𝗍𝖺𝗍𝗎𝗌 𝖻𝗈𝗍", 
    category:"system",
    guide: {
      en: "{pn}"
    }
  },
  
onStart: async function ({ message, event, usersData, threadsData }) {
     const uptime = process.uptime();
     const startTime = Date.now();
     const jam = Math.floor(uptime / 3600);
     const menit = Math.floor((uptime % 3600) / 60);
     const detik = Math.floor(uptime % 60);
     
     const totalMemory = os.totalmem();
     const freeMemory = os.freemem();
     const usedMemory = totalMemory - freeMemory;

     const arif = `${jam}𝗁 ${menit}𝗆 ${detik}𝗌`;
     
     const diskUsage = await getDiskUsage();
     const edi = `${prettyBytes(diskUsage.used)}/${prettyBytes(diskUsage.total)}`;
     const ucull = `${prettyBytes(os.totalmem() - os.freemem())}/${prettyBytes(totalMemory)}`;
     const veli = os.freemem();
     const saveng = `${prettyBytes(os.totalmem() - os.freemem())}/${prettyBytes(veli)}`;
     const putra = await usersData.getAll();
     const loufi = await threadsData.getAll(); 
     const luxion = `${os.type()} ${os.release()}`;
     const rizky = `${os.cpus()[0].model} (${os.cpus().length} cores)`;

     const versi = require("../../package.json").version;
     const endTime = Date.now();
     const raffa = endTime - startTime;
     
     const hadi = `[${ping(raffa)}] • 𝗦𝗜𝗦𝗧𝗘𝗠 ツ\n`
                 + `\n- 𝖡𝗈𝗍 𝗉𝗂𝗇𝗀: ${raffa}`
                 + `\n- 𝖡𝗈𝗍 𝗏𝖾𝗋𝗌𝗂: ${versi}`
                 + `\n- 𝖳𝗈𝗍𝖺𝗅 𝗎𝗌𝖾𝗋: ${putra.length}`
                 + `\n- 𝖳𝗈𝗍𝖺𝗅 𝗀𝗋𝗎𝗉: ${loufi.length}`
                 + `\n- 𝖴𝗉𝗍𝗂𝗆𝖾: ${arif}`
                 + `\n- 𝖣𝗂𝗌𝗄: ${edi}`
                 + `\n- 𝖱𝖺𝗆: ${ucull}`
                 + `\n- 𝖬𝖾𝗆𝗈𝗋𝗒: ${saveng}` 
                 + `\n- 𝖢𝖯𝖴: ${rizky}`; 

     message.reply({ body: hadi }, event.threadID);
  },
};

async function getDiskUsage() {
  const { stdout } = await exec('df -k /');
  const [_, total, used] = stdout.split('\n')[1].split(/\s+/).filter(Boolean);
  return { total: parseInt(total) * 1024, used: parseInt(used) * 1024 };
}

function prettyBytes(bytes) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    i++;
  }
  return `${bytes.toFixed(2)} ${units[i]}`;
}

function ping(raffa) { 
  if (raffa < 220) {
    return "🟢";
} else if (raffa < 630) {
     return "🟡";
} else if (raffa < 1400) {
     return "🟠";
} else {
     return "🔴";
    }
}