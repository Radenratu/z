const { exec } = require("child_process");

module.exports = {
  config: {
    name: "terminal",
    aliases: ["shell", "$"],
    author: "Tokodori × Liane", // Convert To Goat By Tokodori
    role: 2,
    shortDescription: " ",
    longDescription: "asking ",
    category: "ai",
    guide: "{pn}",
  },

    onStart : async ({ event, message, args }) => {
    message.reaction('🚀');
    exec(args.join(" "), (error, stdout, stderr) => {
      let result = "";
      if (error) {
        result += `Error: ${error.message}
`;
      }
      if (stdout) {
        result += `${stdout}

`;
      }
      if (stderr) {
        result += `${stderr}

`;
      }

      message.reply(result);
      message.reaction("✅");
    });
  },
};